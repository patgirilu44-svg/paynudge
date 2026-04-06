import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_SUBJECT_LENGTH = 200
const MAX_MESSAGE_LENGTH = 20000
const ALLOWED_TONES = ['friendly', 'firm', 'final']

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY environment variable is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

function logError(msg: string, err?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error(msg, err)
  } else {
    console.error(msg)
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
}

function messageToHtml(message: string): string {
  return message
    .split('\n')
    .map(line =>
      line.trim() === ''
        ? '<br/>'
        : `<p style="margin:0 0 14px 0;color:#111827;font-size:15px;line-height:1.7;">${escapeHtml(line)}</p>`
    )
    .join('')
}

function buildEmailHtml(htmlMessage: string, senderName: string): string {
  const safeSenderName = escapeHtml(senderName)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://paynudge-khaki.vercel.app'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Payment Reminder</title>
</head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;margin:0;padding:40px 20px;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
    <div style="margin-bottom:28px;">
      <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;">
        <span style="color:white;font-weight:700;font-size:14px;">P</span>
      </div>
    </div>
    <div>${htmlMessage}</div>
    <div style="margin-top:32px;padding-top:20px;border-top:1px solid #f3f4f6;">
      <p style="color:#9ca3af;font-size:12px;margin:0;line-height:1.6;">
        This message was sent on behalf of <strong style="color:#6b7280;">${safeSenderName}</strong>
        via <a href="${baseUrl}" style="color:#2563eb;text-decoration:none;">PayNudge</a>
        &mdash; payment reminder tool for freelancers.
      </p>
    </div>
  </div>
</body>
</html>`
}

function safeTagValue(value: string): string {
  return value.replace(/[^a-zA-Z0-9\-_]/g, '_').slice(0, 256)
}

export async function POST(request: NextRequest) {

  // ── Auth + single Supabase instance ──
  let user
  let supabase
  try {
    supabase = await createClient()
    const { data, error } = await supabase.auth.getUser()
    if (error || !data.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    user = data.user
  } catch {
    return NextResponse.json({ error: 'Authentication error' }, { status: 401 })
  }

  // ── Parse body ──
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { to, subject, message, invoiceId, tone } = body as {
    to?: string
    subject?: string
    message?: string
    invoiceId?: string
    tone?: string
  }

  // ── Validate ──
  if (!to || !subject || !message || !invoiceId) {
    return NextResponse.json(
      { error: 'Missing required fields: to, subject, message, invoiceId' },
      { status: 400 }
    )
  }
  if (typeof to !== 'string' || !EMAIL_REGEX.test(to.trim())) {
    return NextResponse.json({ error: 'Invalid recipient email address' }, { status: 400 })
  }
  if (typeof subject !== 'string' || subject.trim().length === 0) {
    return NextResponse.json({ error: 'Subject cannot be empty' }, { status: 400 })
  }
  if (subject.length > MAX_SUBJECT_LENGTH) {
    return NextResponse.json({ error: `Subject too long (max ${MAX_SUBJECT_LENGTH} characters)` }, { status: 400 })
  }
  if (typeof message !== 'string' || message.trim().length === 0) {
    return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 })
  }
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` }, { status: 400 })
  }
  if (tone && !ALLOWED_TONES.includes(tone)) {
    return NextResponse.json({ error: `Invalid tone. Must be one of: ${ALLOWED_TONES.join(', ')}` }, { status: 400 })
  }

  // ── Verify invoice ownership (reuse supabase instance) ──
  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from('invoices')
      .select('id')
      .eq('id', invoiceId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (invoiceError) {
      logError('Invoice verification error:', invoiceError)
      return NextResponse.json({ error: 'Failed to verify invoice' }, { status: 500 })
    }
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found or access denied' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Failed to verify invoice' }, { status: 500 })
  }

  if (!process.env.RESEND_API_KEY) {
    logError('RESEND_API_KEY not configured')
    return NextResponse.json({ error: 'Email service not configured. Please contact support.' }, { status: 503 })
  }

  // ── Build email ──
  const senderName =
    (typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim())
      ? user.user_metadata.full_name.trim()
      : user.email?.split('@')[0] ?? 'Your Freelancer'

  const cleanSubject = subject.trim().replace(/[\r\n]/g, '')
  const html = buildEmailHtml(messageToHtml(message), senderName)

  // ── Send with proper timeout ──
  try {
    let timedOut = false
    const timeoutId = setTimeout(() => { timedOut = true }, 10000)

    const result = await resend.emails.send({
      from: 'PayNudge <onboarding@resend.dev>',
      to: [to.trim().toLowerCase()],
      subject: cleanSubject,
      html,
      tags: [
        { name: 'tone', value: safeTagValue(tone ?? 'unknown') },
        { name: 'invoice_id', value: safeTagValue(invoiceId) },
      ],
    })

    clearTimeout(timeoutId)

    if (timedOut) {
      return NextResponse.json({ error: 'Email service timed out. Please try again.' }, { status: 504 })
    }

    if (result.error) {
      logError('Resend send error:', result.error)
      return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    logError('Send email error:', error)

    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        return NextResponse.json({ error: 'Too many emails sent. Please wait before trying again.' }, { status: 429 })
      }
      if (error.message.includes('invalid_api_key') || error.message.includes('unauthorized')) {
        return NextResponse.json({ error: 'Email service configuration error. Please contact support.' }, { status: 503 })
      }
    }

    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}