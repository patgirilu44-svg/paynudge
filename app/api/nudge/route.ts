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

interface GroqMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

const MAX_SMS_LENGTH = 160
const TIMEOUT_MS = 20000
const GEMINI_TIMEOUT_MS = 8000
const ALLOWED_TONES = ['friendly', 'firm', 'final'] as const
const ALLOWED_CHANNELS = ['email', 'sms', 'copy'] as const
const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODEL = 'llama-3.1-8b-instant'
const FREE_PLAN_LIMIT = 3
const CURRENCY_REGEX = /^[A-Z]{3}$/

if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY environment variable is not set')
}

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY ?? '' })

function logError(msg: string, err?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.error(msg, err)
  } else {
    console.error(msg)
  }
}

function formatDueDate(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) throw new Error('Invalid due_date format')
  return date.toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
}

function sanitizeInput(input: string | null | undefined): string {
  if (!input) return ''
  return input.replace(/[<>]/g, '').replace(/[\n\r]/g, ' ').trim().slice(0, 200)
}

function validateSmsLength(message: string): { valid: boolean; message: string } {
  if (message.length <= MAX_SMS_LENGTH) return { valid: true, message }
  const truncated = message.slice(0, MAX_SMS_LENGTH - 3)
  const lastSpace = truncated.lastIndexOf(' ')
  return {
    valid: false,
    message: (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...',
  }
}

function isAbortError(err: unknown): boolean {
  if (err instanceof Error) {
    return (
      err.name === 'AbortError' ||
      err.message.includes('aborted') ||
      err.message.includes('abort') ||
      (err as NodeJS.ErrnoException).code === 'ABORT_ERR'
    )
  }
  return false
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

  const toneInstructions: Record<string, string> = {
    friendly: 'Write a warm, polite payment reminder. Be understanding and professional. Assume the client may have simply forgotten. Keep it friendly but clear.',
    firm: 'Write a firm, professional payment reminder. Be direct and clear that payment is overdue. Maintain professionalism but make urgency clear.',
    final: 'Write a final payment notice. Be direct and serious. Mention this is the final notice before further action may be taken. Stay professional but firm.',
  }

  const channelInstructions: Record<string, string> = {
    email: `Write a professional email body (no subject line). Use proper email formatting with greeting, body paragraphs, and sign-off. Sign off as "The PayNudge Team".`,
    sms: `Write a VERY SHORT SMS message under ${MAX_SMS_LENGTH} characters. Include amount (${amount}) and due date (${dueDate}). Be direct. No greeting. No sign-off.`,
    copy: `Write a professional message with greeting and sign-off that can be sent via any channel.`,
  }

  return `You are a professional payment recovery assistant for freelancers.

Client: ${clientName}${companyName ? ` at ${companyName}` : ''}
Invoice amount: ${amount}${projectDesc}
Due date: ${dueDate}
Status: ${invoice.status}

${toneInstructions[tone] ?? ''}

${channelInstructions[channel] ?? ''}

Return ONLY the message text. No subject line. No explanations. No quotes.`
}

async function groqComplete(
  messages: GroqMessage[],
  maxTokens: number,
  signal: AbortSignal,
  temperature = 0.7
): Promise<string> {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not configured')
  }

  try {
    const res = await groq.chat.completions.create(
      { model: PRIMARY_MODEL, messages, temperature, max_tokens: maxTokens },
      { signal }
    )
    const text = res.choices[0]?.message?.content?.trim()
    if (text) return text
    throw new Error('Empty response from primary model')
  } catch (err) {
    if (isAbortError(err)) throw err
    logError(`Primary model (${PRIMARY_MODEL}) failed:`, err)
  }

  try {
    const res = await groq.chat.completions.create(
      { model: FALLBACK_MODEL, messages, temperature, max_tokens: maxTokens },
      { signal }
    )
    const text = res.choices[0]?.message?.content?.trim()
    if (text) return text
    throw new Error('Empty response from fallback model')
  } catch (err) {
    if (isAbortError(err)) throw err
    logError(`Fallback model (${FALLBACK_MODEL}) also failed:`, err)
    throw new Error('AI service temporarily unavailable. Please try again.')
  }
}

async function refineWithGemini(
  draft: string,
  tone: string,
  channel: string,
  aborted: () => boolean
): Promise<string> {
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY
  if (!geminiKey || aborted()) return draft

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are refining a payment reminder message. Keep the same length and all details. Only improve:
1. Human warmth and natural tone
2. ${tone} tone consistency
3. Flow and readability
4. Make it feel written by a real person, not AI

Channel: ${channel}
Do NOT shorten it. Do NOT change any invoice details. Do NOT add explanations.
Return ONLY the refined message.

Original message:
${draft}`,
            }],
          }],
          generationConfig: { temperature: 0.4, maxOutputTokens: 650 },
        }),
      }
    )

    if (!response.ok) return draft
    const data = await response.json()
    const refined = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
    return refined || draft
  } catch {
    return draft
  } finally {
    clearTimeout(timer)
  }
}

function buildFallbackSubject(tone: string, currency: string, amount: number): string {
  const formatted = `${currency} ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  const map: Record<string, string> = {
    friendly: `Friendly reminder: Invoice for ${formatted}`,
    firm: `Payment overdue: ${formatted}`,
    final: `Final notice: ${formatted} payment required`,
  }
  return map[tone] ?? `Invoice reminder: ${formatted}`
}

export async function POST(request: NextRequest) {
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

  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count, error } = await supabase
      .from('nudges')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('sent_at', startOfMonth)

    if (!error && count !== null && count >= FREE_PLAN_LIMIT) {
      return NextResponse.json(
        {
          error: `Free plan limit reached (${FREE_PLAN_LIMIT} nudges/month). Upgrade to Pro for unlimited nudges.`,
          limit_reached: true,
        },
        { status: 403 }
      )
    }
  } catch {
    // Non-blocking
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
  if (!invoice.currency || !CURRENCY_REGEX.test(invoice.currency)) {
    return NextResponse.json({ error: 'Invalid currency code. Use 3-letter ISO code (e.g. USD)' }, { status: 400 })
  }

  const prompt = buildPrompt(tone, channel, invoice, client)
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)
  const isAborted = () => controller.signal.aborted

  try {
    if (channel === 'email') {
      const systemMsg: GroqMessage = {
        role: 'system',
        content: 'You are a professional payment recovery assistant. Return only the message text, nothing else.',
      }

      const [rawMessage, rawSubject] = await Promise.all([
        groqComplete([systemMsg, { role: 'user', content: prompt }], 600, controller.signal),
        groqComplete(
          [
            { role: 'system', content: 'Generate a professional email subject line. Return only the subject line text. Max 60 characters. No quotes.' },
            { role: 'user', content: `Write a ${tone} payment reminder subject line for invoice of ${invoice.currency} ${invoice.amount} from client "${sanitizeInput(client.name) || 'Client'}". Return ONLY the subject line.` },
          ],
          60, controller.signal, 0.5
        ).catch(() => buildFallbackSubject(tone, invoice.currency, invoice.amount)),
      ])

      clearTimeout(timeoutId)
      const message = await refineWithGemini(rawMessage, tone, channel, isAborted)
      const subject = rawSubject.slice(0, 80)
      return NextResponse.json({ message, subject, tone, channel })
    }

    if (channel === 'sms') {
      const rawMessage = await groqComplete(
        [
          { role: 'system', content: 'You are a payment recovery assistant. Return only the SMS text. Under 160 characters.' },
          { role: 'user', content: prompt },
        ],
        100, controller.signal
      )
      clearTimeout(timeoutId)
      const validation = validateSmsLength(rawMessage)
      if (!validation.valid) console.warn(`SMS truncated to ${MAX_SMS_LENGTH} chars`)
      return NextResponse.json({ message: validation.message, subject: null, tone, channel })
    }

    const rawMessage = await groqComplete(
      [
        { role: 'system', content: 'You are a professional payment recovery assistant. Return only the message text.' },
        { role: 'user', content: prompt },
      ],
      600, controller.signal
    )
    clearTimeout(timeoutId)
    const message = await refineWithGemini(rawMessage, tone, channel, isAborted)
    return NextResponse.json({ message, subject: null, tone, channel })

  } catch (error: unknown) {
    clearTimeout(timeoutId)
    logError('Nudge API error:', error)

    if (isAbortError(error)) {
      return NextResponse.json({ error: 'Request timed out. Please try again.' }, { status: 504 })
    }

    if (error instanceof Error) {
      if (error.message.includes('rate limit') || error.message.includes('too many requests') || error.message.includes('429')) {
        return NextResponse.json({ error: 'Too many requests. Please wait a moment and try again.' }, { status: 429 })
      }
      if (error.message.includes('temporarily unavailable')) {
        return NextResponse.json({ error: 'AI service temporarily unavailable. Please try again in a moment.' }, { status: 503 })
      }
      if (error.message.includes('not configured')) {
        return NextResponse.json({ error: 'Service configuration error. Please contact support.' }, { status: 503 })
      }
    }

    return NextResponse.json({ error: 'Failed to generate message. Please try again.' }, { status: 500 })
  }
}