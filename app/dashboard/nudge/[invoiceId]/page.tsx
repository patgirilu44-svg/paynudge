'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

// ─── Types ────────────────────────────────────────────────────────────────────

type Client = {
  id: string
  name: string
  email: string | null
  phone: string | null
  company: string | null
}

type Invoice = {
  id: string
  amount: number
  currency: string
  due_date: string
  status: string
  description: string | null
  client: Client | null
}

type Tone = 'friendly' | 'firm' | 'final'
type Channel = 'email' | 'sms' | 'copy'

type SupabaseInvoiceRow = {
  id: string
  amount: number
  currency: string
  due_date: string
  status: string
  description: string | null
  client: Client[] | null
}

// ─── Config ───────────────────────────────────────────────────────────────────

const TONE_CONFIG: Record<Tone, { label: string; desc: string; color: string }> = {
  friendly: { label: 'Friendly', desc: 'Polite reminder', color: 'text-green-600' },
  firm: { label: 'Firm', desc: 'Clear & direct', color: 'text-yellow-600' },
  final: { label: 'Final', desc: 'Last notice', color: 'text-red-600' },
}

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: string }> = {
  email: { label: 'Email', icon: '✉️' },
  sms: { label: 'SMS', icon: '💬' },
  copy: { label: 'Copy', icon: '📋' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NudgePage({ params }: { params: { invoiceId: string } }) {
  const router = useRouter()
  const supabase = createClient()

  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [tone, setTone] = useState<Tone>('friendly')
  const [channel, setChannel] = useState<Channel>('email')
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // ── Fetch invoice ───────────────────────────────────────────────────────────
  const fetchInvoice = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        id, amount, currency, due_date, status, description,
        client:clients(id, name, email, phone, company)
      `)
      .eq('id', params.invoiceId)
      .eq('user_id', user.id)
      .single()

    if (fetchError || !data) {
      setError('Invoice not found')
      setInvoice(null)
    } else {
      const row = data as unknown as SupabaseInvoiceRow
      setInvoice({
        ...row,
        client: Array.isArray(row.client) ? (row.client[0] ?? null) : row.client,
      })
    }
    setLoading(false)
  }, [params.invoiceId, supabase, router])

  useEffect(() => { fetchInvoice() }, [fetchInvoice])

  // Clear success/error when tone or channel changes
  useEffect(() => {
    setError(null)
    setSuccess(null)
  }, [tone, channel])

  // ── Generate ────────────────────────────────────────────────────────────────
  async function generateNudge() {
    if (!invoice || generating) return
    setGenerating(true)
    setError(null)
    setSuccess(null)
    setMessage('')
    setSubject('')

    try {
      const res = await fetch('/api/nudge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone,
          channel,
          invoice: {
            amount: invoice.amount,
            currency: invoice.currency,
            due_date: invoice.due_date,
            description: invoice.description,
            status: invoice.status,
          },
          client: {
            name: invoice.client?.name ?? null,
            company: invoice.client?.company ?? null,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setMessage(data.message ?? '')
      setSubject(data.subject ?? '')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate message')
    } finally {
      setGenerating(false)
    }
  }

  // ── Save nudge to DB ────────────────────────────────────────────────────────
  async function saveNudge(userId: string) {
    if (!invoice || !message) return
    try {
      await supabase.from('nudges').insert({
        user_id: userId,
        invoice_id: invoice.id,
        tone,
        channel: channel === 'copy' ? 'clipboard' : channel,
        content: message,
        subject: channel === 'email' ? subject : null,
        sent_at: new Date().toISOString(),
      })
    } catch (err) {
      console.error('Failed to save nudge:', err)
    }
  }

  // ── Send ────────────────────────────────────────────────────────────────────
  async function handleSend() {
    if (!invoice || !message || sending) return
    setError(null)
    setSuccess(null)

    // Pre-flight checks
    if (channel === 'email' && !invoice.client?.email) {
      setError('Client has no email address. Edit the client to add one.')
      return
    }
    if (channel === 'sms' && !invoice.client?.phone) {
      setError('Client has no phone number. Edit the client to add one.')
      return
    }
    if (channel === 'sms' && message.length > 160) {
      setError(`SMS is too long (${message.length}/160). Please shorten the message.`)
      return
    }

    setSending(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      // Copy
      if (channel === 'copy') {
        const text = subject ? `Subject: ${subject}\n\n${message}` : message
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setSuccess('Copied to clipboard!')
        await saveNudge(user.id)
        setTimeout(() => setCopied(false), 3000)
        return
      }

      // Email
      if (channel === 'email') {
        const res = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: invoice.client?.email,
            subject,
            message,
            invoiceId: invoice.id,
            tone,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send email')
        setSuccess(`Email sent to ${invoice.client?.email}`)
        await saveNudge(user.id)
      }

      // SMS
      if (channel === 'sms') {
        const res = await fetch('/api/send-sms', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: invoice.client?.phone,
            message: message.slice(0, 160),
            invoiceId: invoice.id,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to send SMS')
        setSuccess('SMS sent successfully!')
        await saveNudge(user.id)
      }

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    } finally {
      setSending(false)
    }
  }

  // ── Send button label ───────────────────────────────────────────────────────
  function sendLabel() {
    if (sending) return 'Sending...'
    if (copied) return '✓ Copied!'
    if (channel === 'copy') return 'Copy to clipboard'
    if (channel === 'email') return 'Send email'
    return 'Send SMS'
  }

  // ── Loading / Not found ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-sm text-gray-400">Loading invoice...</p>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-24 max-w-sm mx-auto">
        <p className="text-sm font-medium text-gray-900 mb-1">Invoice not found</p>
        <p className="text-sm text-gray-400 mb-6">This invoice may have been deleted or you don't have access.</p>
        <button
          onClick={() => router.push('/dashboard/invoices')}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to invoices
        </button>
      </div>
    )
  }

  // ── Main ────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-4">

      {/* Back */}
      <button
        onClick={() => router.push('/dashboard/invoices')}
        className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to invoices
      </button>

      {/* Invoice Summary */}
      <div className="rounded-xl border border-gray-100 bg-white p-5">
        <h1 className="text-base font-semibold text-gray-900 mb-3">Send Payment Nudge</h1>
        <div className="space-y-1">
          <p className="text-sm text-gray-900 font-medium">
            {invoice.client?.name || 'Unknown Client'}
            {invoice.client?.company && (
              <span className="text-gray-400 font-normal"> · {invoice.client.company}</span>
            )}
          </p>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">
              {invoice.currency} {Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            {' '}· Due {new Date(invoice.due_date).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric',
            })}
          </p>
          {invoice.description && (
            <p className="text-sm text-gray-400 truncate">{invoice.description}</p>
          )}
        </div>
      </div>

      {/* Tone */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
        <p className="text-sm font-medium text-gray-900">Tone</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(TONE_CONFIG) as Tone[]).map(t => (
            <button
              key={t}
              onClick={() => setTone(t)}
              className={`p-3 rounded-xl border-2 text-left transition-all ${
                tone === t
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <p className={`text-sm font-medium ${TONE_CONFIG[t].color}`}>{TONE_CONFIG[t].label}</p>
              <p className="text-xs text-gray-400 mt-0.5">{TONE_CONFIG[t].desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Channel */}
      <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-3">
        <p className="text-sm font-medium text-gray-900">Channel</p>
        <div className="grid grid-cols-3 gap-2">
          {(Object.keys(CHANNEL_CONFIG) as Channel[]).map(c => (
            <button
              key={c}
              onClick={() => setChannel(c)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                channel === c
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200 bg-white'
              }`}
            >
              <p className="text-lg">{CHANNEL_CONFIG[c].icon}</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{CHANNEL_CONFIG[c].label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generateNudge}
        disabled={generating}
        className="w-full py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {generating ? 'Generating...' : 'Generate message'}
      </button>

      {/* Feedback */}
      {error && (
        <p className="text-sm text-red-600 flex items-start gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {success && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {success}
        </p>
      )}

      {/* Generated Message */}
      {message && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <p className="text-sm font-medium text-gray-900">Generated message</p>

          {channel === 'email' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Subject line</label>
              <input
                type="text"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                placeholder="Email subject line"
              />
            </div>
          )}

          <div>
            {channel === 'sms' && (
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-gray-500">Message</label>
                <span className={`text-xs font-medium ${
                  message.length > 160 ? 'text-red-600' :
                  message.length > 140 ? 'text-yellow-600' : 'text-gray-400'
                }`}>
                  {message.length}/160
                </span>
              </div>
            )}
            <textarea
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[200px] resize-y leading-relaxed"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={generateNudge}
              disabled={generating}
              className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              {generating ? 'Regenerating...' : '↺ Regenerate'}
            </button>
            <button
              onClick={handleSend}
              disabled={sending || !message}
              className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sendLabel()}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}