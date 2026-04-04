import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function isValidPhone(phone: string): boolean {
  return /^\+[1-9]\d{1,14}$/.test(phone)
}

export async function POST(request: NextRequest) {
  try {
    // Auth
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse body
    let body: unknown
    try {
      const text = await request.text()
      if (text.length > 5 * 1024) {
        return NextResponse.json({ error: 'Request body too large' }, { status: 413 })
      }
      body = JSON.parse(text)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { to, message, invoiceId } = body as {
      to?: string
      message?: string
      invoiceId?: string
    }

    // Validate required fields
    if (!to || !message || !invoiceId) {
      return NextResponse.json(
        { error: 'Missing required fields: to, message, invoiceId' },
        { status: 400 }
      )
    }

    // Validate phone format
    if (!isValidPhone(to)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Use E.164 format (e.g. +1234567890)' },
        { status: 400 }
      )
    }

    // Validate message
    const trimmedMessage = message.trim()
    if (trimmedMessage.length === 0) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }
    if (trimmedMessage.length > 160) {
      return NextResponse.json(
        { error: 'SMS message must be 160 characters or less' },
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

    // Log attempt for analytics
    console.info('SMS attempted (coming soon):', {
      invoiceId,
      userId: user.id,
      phonePrefix: to.substring(0, 5),
      messageLength: trimmedMessage.length,
    })

    // Placeholder — Twilio coming soon
    return NextResponse.json(
      {
        error: 'SMS sending coming soon',
        message: 'Email and Copy channels are currently available',
        alternativeChannels: ['email', 'copy'],
      },
      { status: 503 }
    )

  } catch (error: unknown) {
    console.error('Send SMS error:', error)
    return NextResponse.json(
      { error: 'Failed to send SMS. Please try again.' },
      { status: 500 }
    )
  }
      }
