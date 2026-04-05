import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'

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

const MAX_SMS_LENGTH = 160
const ALLOWED_TONES = ['friendly', 'firm', 'final'] as const
const ALLOWED_CHANNELS = ['email', 'sms', 'copy'] as const

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! })

function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) throw new Error('Invalid due_date format')
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

function sanitizeInput(input: string | null): string {
  if (!input) return ''
  return input.replace(/[<>]/g, '').replace(/[\n\r]/g, ' ').trim().slice(0, 200)
}

function validateSmsLength(message: string): { valid: boolean; message: string } {
  if (message.length <= MAX_SMS_LENGTH) return { valid: true, message }
  return { valid: false, message: message.slice(0, MAX_SMS_LENGTH - 3) + '...' }
}

function buildPrompt(
  tone: string,
  channel: string,
  invoice: NudgeRequest['invoice'],
  client: NudgeRequest['client']
): string {
  const dueDate = formatDueDate(invoice.due_date)
  const amount = `${invoice.currency} ${Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const clientName = sanitizeInput(client.name) || 'there'
  const companyName = sanitizeInput(client.company)
  const projectDesc = invoice.description ? ` for "${sanitizeInput(invoice.description)}"` : ''

  const toneInstructions = {
    friendly: `Write a warm, polite payment reminder. Be understanding and professional. Assume the client may have simply forgotten. Keep it friendly but clear.`,
    firm: `Write a firm, professional payment reminder. Be direct and clear that payment is overdue. Maintain professionalism but make urgency clear.`,
    final: `Write a final payment notice. Be direct and serious. Mention this is the final notice before further action may be taken. Stay professional but firm.`,
  }[tone] ?? ''

  const channelInstructions = {
    email: `Write a professional email body (no subject line). Use proper email formatting with greeting, body paragraphs, and sign-off. Sign off as "The PayNudge Team".`,
    sms: `Write a VERY SHORT SMS message under ${MAX_SMS_LENGTH} characters. Include amount (${amount}) and due date (${dueDate}). Be direct. No greeting. No sign-off.`,
    copy: `Write a professional message with greeting and sign-off that can be sent via any channel.`,
  }[channel] ?? ''

  return `You are a professional payment recovery assistant for freelancers.

Client: ${clientName}${companyName ? ` at ${companyName}` : ''}
Invoice amount: ${amount}${projectDesc}
Due date: ${dueDate}
Status: ${invoice.status}

${toneInstructions}

${channelInstructions}

Return ONLY the message text. No subject line. No explanations. No quotes.`
}

async function refineWithGemini(draft: string, tone: string, channel: string): Promise<string> {
  try {
    const geminiKey = process.env.GOOGLE_GEMINI_API_KEY
    if (!geminiKey) return draft

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are refining a payment reminder message. Keep the same length and all details. Only improve:
1. Human warmth and natural tone
2. ${tone} tone consistency  
3. Flow and readability
4. Make it feel written by a real person, not AI

Channel: ${channel}
Do NOT shorten it. Do NOT add explanations. Return ONLY the refined message.

Original message:
${draft}`
            }]
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 600 }
        })
      }
    )

    if (!response.ok) return draft
    const data = await response.json()
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return refined || draft
  } catch {
    return draft
  }
}

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

    const { tone, channel, invoice, client } = body as Partial<NudgeRequest>

    if (!tone || !channel || !invoice || !client) {
      return NextResponse.json({ error: 'Missing required fields: tone, channel, invoice, client' }, { status: 400 })
    }

    if (!ALLOWED_TONES.includes(tone)) {
      return NextResponse.json({ error: `Invalid tone. Must be one of: ${ALLOWED_TONES.join(', ')}` }, { status: 400 })
    }

    if (!ALLOWED_CHANNELS.includes(channel)) {
      return NextResponse.json({ error: `Invalid channel. Must be one of: ${ALLOWED_CHANNELS.join(', ')}` }, { status: 400 })
    }

    if (typeof invoice.amount !== 'number' || isNaN(invoice.amount) || invoice.amount <= 0) {
      return NextResponse.json({ error: 'Invoice amount must be a positive number' }, { status: 400 })
    }

    if (!invoice.due_date || typeof invoice.due_date !== 'string') {
      return NextResponse.json({ error: 'Invoice due_date is required' }, { status: 400 })
    }

    try {
      formatDueDate(invoice.due_date)
    } catch {
      return NextResponse.json({ error: 'Invalid due_date format. Use YYYY-MM-DD' }, { status: 400 })
    }

    if (!invoice.currency || typeof invoice.currency !== 'string' || invoice.currency.length !== 3) {
      return NextResponse.json({ error: 'Invalid currency code (e.g. USD)' }, { status: 400 })
    }

    const prompt = buildPrompt(tone, channel, invoice, client)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000)

    try {
      if (channel === 'email') {
        const [messageCompletion, subjectCompletion] = await Promise.all([
          groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'You are a professional payment recovery assistant. Return only the message text.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 600,
          }, { signal: controller.signal }),

          groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
              { role: 'system', content: 'Generate email subject lines. Return only the subject line. Max 60 chars.' },
              { role: 'user', content: `Write a ${tone} payment reminder subject line. Amount: ${invoice.currency} ${invoice.amount}. Client: ${sanitizeInput(client.name) || 'Client'}. Return ONLY the subject line.` },
            ],
            temperature: 0.5,
            max_tokens: 60,
          }, { signal: controller.signal }),
        ])

        clearTimeout(timeoutId)

        const rawMessage = messageCompletion.choices[0]?.message?.content?.trim()
        const subject = subjectCompletion.choices[0]?.message?.content?.trim()

        if (!rawMessage) {
          return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
        }

        const message = await refineWithGemini(rawMessage, tone, channel)

        return NextResponse.json({ message, subject: subject || null, tone, channel })
      }

      // SMS or copy
      const completion = await groq.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a professional payment recovery assistant. Return only the message text.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: channel === 'sms' ? 100 : 600,
      }, { signal: controller.signal })

      clearTimeout(timeoutId)

      const rawMessage = completion.choices[0]?.message?.content?.trim()

      if (!rawMessage) {
        return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 })
      }

      let message = channel === 'sms' ? rawMessage : await refineWithGemini(rawMessage, tone, channel)

      if (channel === 'sms') {
        const validation = validateSmsLength(message)
        if (!validation.valid) {
          console.warn(`SMS truncated to ${MAX_SMS_LENGTH} chars`)
          message = validation.message
        }
      }

      return NextResponse.json({ message, subject: null, tone, channel })

    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }

  } catch (error: unknown) {
    console.error('Nudge API error:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ error: 'Request timed out. Please try again.' }, { status: 504 })
      }
      if (error.message.includes('rate limit') || error.message.includes('too many requests')) {
        return NextResponse.json({ error: 'Too many requests. Please wait and try again.' }, { status: 429 })
      }
    }

    return NextResponse.json({ error: 'Failed to generate message. Please try again.' }, { status: 500 })
  }
}