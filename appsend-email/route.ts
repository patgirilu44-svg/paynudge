import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY is not configured')
}

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailRequest {
  to: string
  subject: string
  message: string
  invoiceId: string
  tone?: 'friendly' | 'firm' | 'final'
}

const MAX_SUBJECT_LENGTH = 100
const MAX_MESSAGE_LENGTH = 5000
const ALLOWED_TONES = ['friendly', 'firm', 'final']

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  }
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char)
}

function formatMessageToHtml(message: string): string {
  const escaped = escapeHtml(message)
  return escaped
    .split('\n')
    .reduce((acc: string[], line) => {
      const trimmed = line.trim()
      if (trimmed === '') {
        if (acc[acc.length - 1] !== '<br/>') acc.push('<br/>')
      } else {
        acc.push(`<p style="margin:0 0 12px 0;line-height:1.6;">${trimmed}</p>`)
      }
      return acc
    }, [])
    .join('')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    // Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse with size limit
    let body: unknown
    try {
      const text = await request.text()
      if (text.length > 10 * 1024) {
        return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
      }
      body = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { to, subject, message, invoiceId, tone } = body as Partial<SendEmailRequest>

    // Validate required
    if (!to || !subject || !message || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, message, invoiceId' },
        { status: 400 }
      )
    }

    if (!isValidEmail(to)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    if (subject.length === 0 || subject.length > MAX_SUBJECT_LENGTH) {
      return NextResponse.json(
        { error: `Subject must be 1-${MAX_SUBJECT_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (message.length === 0 || message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message must be 1-${MAX_MESSAGE_LENGTH} characters` },
        { status: 400 }
      )
    }

    if (tone && !ALLOWED_TONES.includes(tone)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be: ${ALLOWED_TONES.join(', ')}` },
        { status: 400 }
      )
    }

    // Verify invoice ownership
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .single()

    if (invoiceError || !invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 })
    }

    // Send email
    const { data, error: sendError } = await resend.emails.send({
      from: 'PayNudge <noreply@paynudge.com>',
      to: [to],
      subject: subject.trim(),
      text: message,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${escapeHtml(subject)}</title>
          </head>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;
                       max-width:600px;margin:0 auto;padding:40px 20px;
                       color:#1A1A1A;background:#F9F8F6;">
            <div style="background:#FFFFFF;border-radius:12px;
                        padding:40px;border:1px solid #E8E4DC;
                        box-shadow:0 1px 2px rgba(0,0,0,0.05);">
              ${formatMessageToHtml(message)}
            </div>
            <p style="text-align:center;font-size:12px;color:#9A9486;margin-top:24px;">
              Sent via PayNudge · Payment Recovery for Freelancers
            </p>
          </body>
        </html>
      `,
    })

    if (sendError) {
      console.error('Resend error:', { code: sendError.statusCode, invoiceId })

      if (sendError.statusCode === 403) {
        return NextResponse.json(
          { error: 'Email domain not verified. Contact support.' },
          { status: 503 }
        )
      }
      if (sendError.statusCode === 429) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait and try again.' },
          { status: 429 }
        )
      }
      throw sendError
    }

    console.info('Email sent:', { messageId: data?.id, invoiceId, userId: user.id })

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      tone: tone || null,
    })

  } catch (error: unknown) {
    console.error('Send email error:', error)

    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'Email service unavailable' },
          { status: 503 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Failed to send email. Please try again.' },
      { status: 500 }
    )
  }
    }
