import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

// Type definitions
interface NudgeRequest {
  tone: 'friendly' | 'firm' | 'final'
  channel: 'email' | 'sms' | 'copy'
  invoice: {
    amount: number
    currency: string
    due_date: string
    description: string | null
    status: string
  }
  client: {
    name: string | null
    company: string | null
  }
}

// Constants
const MAX_SMS_LENGTH = 160
const ALLOWED_TONES = ['friendly', 'firm', 'final'] as const
const ALLOWED_CHANNELS = ['email', 'sms', 'copy'] as const

// Initialize Groq with validation
if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not configured')
}

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
})

// Helper: Validate and format date
function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) {
    throw new Error('Invalid due_date format')
  }
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

// Helper: Sanitize input to prevent prompt injection
function sanitizeInput(input: string | null): string {
  if (!input) return ''
  // Remove potential injection patterns
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[\n\r]/g, ' ') // Replace newlines with spaces
    .trim()
    .slice(0, 200) // Limit length
}

// Helper: Validate SMS length and truncate if needed
function validateSmsLength(message: string): { valid: boolean; message: string } {
  if (message.length <= MAX_SMS_LENGTH) {
    return { valid: true, message }
  }
  // Truncate and add ellipsis
  const truncated = message.slice(0, MAX_SMS_LENGTH - 3) + '...'
  return { valid: false, message: truncated }
}

function buildPrompt(
  tone: string,
  channel: string,
  invoice: NudgeRequest['invoice'],
  client: NudgeRequest['client']
): string {
  // Sanitize all inputs
  const dueDate = formatDueDate(invoice.due_date)
  const amount = `${invoice.currency} ${Number(invoice.amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
  })}`
  const clientName = sanitizeInput(client.name) || 'there'
  const companyName = sanitizeInput(client.company)
  const projectDesc = invoice.description ? ` for "${sanitizeInput(invoice.description)}"` : ''

  const toneInstructions = {
    friendly: `Write a warm, polite payment reminder. Be understanding and professional. 
    Assume the client may have simply forgotten. Keep it brief and friendly.`,
    firm: `Write a firm, professional payment reminder. Be direct and clear that payment 
    is overdue. Maintain professionalism but make urgency clear.`,
    final: `Write a final payment notice. Be direct and serious. Mention this is the final 
    notice before further action may be taken. Stay professional but firm.`,
  }[tone] || ''

  const channelInstructions = {
    email: `Write a professional email body (no subject line). Use proper email formatting 
    with greeting, body paragraphs, and sign-off. Sign off as "The PayNudge Team".`,
    sms: `Write a VERY SHORT SMS message that MUST be under ${MAX_SMS_LENGTH} characters total.
    Count every character including spaces and punctuation.
    Include the amount (${amount}) and due date (${dueDate}).
    Be direct. No greeting needed. No sign-off.
    Format example: "Hi ${clientName}, your invoice of ${amount} was due on ${dueDate}. Please pay at your earliest convenience."`,
    copy: `Write a professional message that can be sent via any channel. Use proper 
    formatting with greeting and sign-off.`,
  }[channel] || ''

  return `You are a professional payment recovery assistant for freelancers.

Client: ${clientName}${companyName ? ` at ${companyName}` : ''}
Invoice amount: ${amount}${projectDesc}
Due date: ${dueDate}
Status: ${invoice.status}

${toneInstructions}

${channelInstructions}

Return ONLY the message text. No subject line. No explanations. No quotes around the message.
IMPORTANT: Do NOT include any instructions, meta-commentary, or additional text.`
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authentication check
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Rate limiting check (simplified - implement with Redis/Upstash in production)
    // For now, just log; implement proper rate limiting middleware

    // 3. Parse and validate request body
    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON body' },
        { status: 400 }
      )
    }

    const { tone, channel, invoice, client } = body as Partial<NudgeRequest>

    // Validate required fields
    if (!tone || !channel || !invoice || !client) {
      return NextResponse.json(
        { error: 'Missing required fields: tone, channel, invoice, client' },
        { status: 400 }
      )
    }

    // Validate tone
    if (!ALLOWED_TONES.includes(tone)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${ALLOWED_TONES.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate channel
    if (!ALLOWED_CHANNELS.includes(channel)) {
      return NextResponse.json(
        { error: `Invalid channel. Must be one of: ${ALLOWED_CHANNELS.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate invoice data
    if (typeof invoice.amount !== 'number' || isNaN(invoice.amount) || invoice.amount <= 0) {
      return NextResponse.json(
        { error: 'Invoice amount must be a positive number' },
        { status: 400 }
      )
    }

    if (!invoice.due_date || typeof invoice.due_date !== 'string') {
      return NextResponse.json(
        { error: 'Invoice due_date is required and must be a string' },
        { status: 400 }
      )
    }

    // Validate due_date format
    try {
      formatDueDate(invoice.due_date)
    } catch {
      return NextResponse.json(
        { error: 'Invalid due_date format. Use ISO date string (YYYY-MM-DD)' },
        { status: 400 }
      )
    }

    if (!invoice.currency || typeof invoice.currency !== 'string' || invoice.currency.length !== 3) {
      return NextResponse.json(
        { error: 'Invalid currency code (must be 3 characters like USD, EUR)' },
        { status: 400 }
      )
    }

    // Build prompt
    const prompt = buildPrompt(tone, channel, invoice, client)

    // 4. Generate message (with timeout)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      // For email, run both requests in parallel
      if (channel === 'email') {
        const [messageCompletion, subjectCompletion] = await Promise.all([
          groq.chat.completions.create(
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional payment recovery assistant. Generate concise, effective payment reminder messages. Return only the message text, nothing else.',
                },
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              temperature: 0.7,
              max_tokens: 500,
            },
            { signal: controller.signal }
          ),
          groq.chat.completions.create(
            {
              model: 'llama-3.3-70b-versatile',
              messages: [
                {
                  role: 'system',
                  content: 'You are a professional email subject line writer. Generate short, effective subject lines. Return only the subject line text.',
                },
                {
                  role: 'user',
                  content: `Generate a short, professional email subject line for a ${tone} payment reminder. 
                  Amount: ${invoice.currency} ${invoice.amount}. 
                  Client: ${sanitizeInput(client.name) || 'Client'}.
                  Return ONLY the subject line text, nothing else. No quotes. Max 60 characters.`,
                },
              ],
              temperature: 0.5,
              max_tokens: 60,
            },
            { signal: controller.signal }
          ),
        ])

        clearTimeout(timeoutId)

        const message = messageCompletion.choices[0]?.message?.content?.trim()
        const subject = subjectCompletion.choices[0]?.message?.content?.trim()

        if (!message) {
          return NextResponse.json(
            { error: 'Failed to generate message' },
            { status: 500 }
          )
        }

        // Validate SMS length if channel is sms (shouldn't happen for email, but just in case)
        let finalMessage = message
        if (channel === 'sms') {
          const validation = validateSmsLength(message)
          if (!validation.valid) {
            console.warn(`SMS message exceeded ${MAX_SMS_LENGTH} chars, truncated`)
            finalMessage = validation.message
          }
        }

        return NextResponse.json({
          message: finalMessage,
          subject: subject || null,
          tone,
          channel,
        })
      }

      // For SMS and copy, just generate message
      const completion = await groq.chat.completions.create(
        {
          model: 'llama-3.3-70b-versatile',
          messages: [
            {
              role: 'system',
              content: 'You are a professional payment recovery assistant. Generate concise, effective payment reminder messages. Return only the message text, nothing else.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: channel === 'sms' ? 100 : 500,
        },
        { signal: controller.signal }
      )

      clearTimeout(timeoutId)

      let message = completion.choices[0]?.message?.content?.trim()

      if (!message) {
        return NextResponse.json(
          { error: 'Failed to generate message' },
          { status: 500 }
        )
      }

      // Validate SMS length
      if (channel === 'sms') {
        const validation = validateSmsLength(message)
        if (!validation.valid) {
          console.warn(`SMS message exceeded ${MAX_SMS_LENGTH} chars, truncated`)
          message = validation.message
        }
      }

      return NextResponse.json({
        message,
        subject: null,
        tone,
        channel,
      })
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  } catch (error: unknown) {
    console.error('Nudge API error:', error)

    // Handle specific error types
    if (error instanceof Error) {
      // Timeout error
      if (error.name === 'AbortError') {
        return NextResponse.json(
          { error: 'Request timed out. Please try again.' },
          { status: 504 }
        )
      }

      // API key errors
      if (error.message.includes('API key') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Service temporarily unavailable. Please try again later.' },
          { status: 503 }
        )
      }

      // Rate limiting
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait a moment and try again.' },
          { status: 429 }
        )
      }

      // Token limit
      if (error.message.includes('token') || error.message.includes('context length')) {
        return NextResponse.json(
          { error: 'Message too long. Please try again with simpler request.' },
          { status: 400 }
        )
      }

      // Network errors
      if (error.message.includes('network') || error.message.includes('fetch')) {
        return NextResponse.json(
          { error: 'Network error. Please check your connection and try again.' },
          { status: 503 }
        )
      }
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to generate message. Please try again.' },
      { status: 500 }
    )
  }
  }
