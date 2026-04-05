import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { to, subject, message, invoiceId, tone } = body as {
      to: string
      subject: string
      message: string
      invoiceId: string
      tone: string
    }

    if (!to || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, message' }, { status: 400 })
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const { data: senderData } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single()

    const senderName = senderData?.full_name || user.email?.split('@')[0] || 'Your Freelancer'

    const htmlMessage = message
      .split('\n')
      .map(line => line.trim() === '' ? '<br/>' : `<p style="margin:0 0 12px 0">${line}</p>`)
      .join('')

    const { error: sendError } = await resend.emails.send({
      from: 'PayNudge <onboarding@resend.dev>',
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"/></head>
          <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f9fafb;margin:0;padding:40px 20px;">
            <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:40px;border:1px solid #e5e7eb;">
              <div style="margin-bottom:32px;">
                <div style="width:32px;height:32px;background:#2563eb;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
                  <span style="color:white;font-weight:700;font-size:14px;">P</span>
                </div>
              </div>
              <div style="color:#111827;font-size:15px;line-height:1.7;">
                ${htmlMessage}
              </div>
              <div style="margin-top:32px;padding-top:24px;border-top:1px solid #f3f4f6;">
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                  Sent via <a href="https://paynudge-khaki.vercel.app" style="color:#2563eb;text-decoration:none;">PayNudge</a> · Payment reminder tool for freelancers
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (sendError) {
      console.error('Resend error:', sendError)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (error: unknown) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}