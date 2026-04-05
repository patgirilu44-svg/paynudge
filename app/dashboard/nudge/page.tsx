'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

  const fetchInvoice = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }

    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        id,
        amount,
        currency,
        due_date,
        status,
        description,
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
      const normalized: Invoice = {
        ...row,
        client: Array.isArray(row.client) ? (row.client[0] ?? null) : row.client,
      }
      setInvoice(normalized)
    }
    setLoading(false)
  }, [params.invoiceId, supabase, router])

  useEffect(() => {
    fetchInvoice()
  }, [fetchInvoice])

  async function generateNudge() {
    if (!invoice) return
    setGenerating(true)
    setError(null)
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
            name: invoice.client?.name,
            company: invoice.client?.company,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')

      setMessage(data.message)
      if (data.subject) setSubject(data.subject)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to generate message')
    }
    setGenerating(false)
  }

  async function saveNudgeToDatabase(userId: string) {
    if (!invoice) return

    const { error: saveError } = await supabase.from('nudges').insert({
      user_id: userId,
      invoice_id: invoice.id,
      tone,
      channel: channel === 'copy' ? 'clipboard' : channel,
      content: message,
      subject: channel === 'email' ? subject : null,
      sent_at: new Date().toISOString(),
    })

    if (saveError) {
      console.error('Failed to save nudge to database:', saveError)
    }
  }

  async function handleSend() {
    if (!invoice || !message) return

    setError(null)
    setSuccess(null)

    if (channel === 'email' && !invoice.client?.email) {
      setError('Client has no email address. Please add an email to continue.')
      return
    }

    if (channel === 'sms' && !invoice.client?.phone) {
      setError('Client has no phone number. Please add a phone number to continue.')
      return
    }

    if (channel === 'sms' && message.length > 160) {
      setError(`SMS message is ${message.length} characters (max 160). Please shorten your message.`)
      return
    }

    setSending(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('You must be logged in')

      if (channel === 'copy') {
        const textToCopy = subject ? `Subject: ${subject}\n\n${message}` : message
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setSuccess('Message copied to clipboard!')
        await saveNudgeToDatabase(user.id)
        setTimeout(() => setCopied(false), 3000)
        setSending(false)
        return
      }

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
        if (!res.ok) throw new Error(data.error || 'Email failed')
        setSuccess('Email sent successfully!')
      }

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
        if (!res.ok) throw new Error(data.error || 'SMS failed')
        setSuccess('SMS sent successfully!')
      }

      await saveNudgeToDatabase(user.id)

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send')
    }
    setSending(false)
  }

  const toneConfig = {
    friendly: { label: 'Friendly', desc: 'Polite reminder', color: 'text-success' },
    firm: { label: 'Firm', desc: 'Clear & direct', color: 'text-warning' },
    final: { label: 'Final', desc: 'Last notice', color: 'text-danger' },
  }

  const channelConfig = {
    email: { label: 'Email', icon: '✉️' },
    sms: { label: 'SMS', icon: '💬' },
    copy: { label: 'Copy', icon: '📋' },
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-muted">Loading invoice...</div>
  )

  if (!invoice) return (
    <div className="text-center py-24">
      <p className="text-danger">Invoice not found.</p>
      <button onClick={() => router.push('/dashboard/invoices')} className="btn-ghost mt-4">
        Back to Invoices
      </button>
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.push('/dashboard/invoices')} className="text-sm text-muted hover:text-foreground transition-colors">
        ← Back to Invoices
      </button>

      <div className="card">
        <h1 className="text-xl font-semibold text-foreground mb-1">Send Payment Nudge</h1>
        <div className="text-sm text-muted space-y-0.5 mt-2">
          <p>
            <span className="font-medium text-foreground">{invoice.client?.name || 'Unknown Client'}</span>
            {invoice.client?.company ? ` · ${invoice.client.company}` : ''}
          </p>
          <p>Amount: <span className="font-semibold text-foreground">
            {invoice.currency} {Number(invoice.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span></p>
          <p>Due: {new Date(invoice.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          {invoice.description && <p className="text-muted">{invoice.description}</p>}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-medium text-foreground">Tone</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(toneConfig) as Tone[]).map(t => (
            <button key={t} onClick={() => setTone(t)} className={`p-3 rounded-lg border-2 text-left transition-all ${tone === t ? 'border-accent bg-accent/5' : 'border-border hover:border-muted'}`}>
              <p className={`font-medium text-sm ${toneConfig[t].color}`}>{toneConfig[t].label}</p>
              <p className="text-xs text-muted mt-0.5">{toneConfig[t].desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-medium text-foreground">Channel</h2>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(channelConfig) as Channel[]).map(c => (
            <button key={c} onClick={() => setChannel(c)} className={`p-3 rounded-lg border-2 text-center transition-all ${channel === c ? 'border-accent bg-accent/5' : 'border-border hover:border-muted'}`}>
              <p className="text-lg">{channelConfig[c].icon}</p>
              <p className="text-sm font-medium text-foreground mt-1">{channelConfig[c].label}</p>
            </button>
          ))}
        </div>
      </div>

      <button onClick={generateNudge} disabled={generating} className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed">
        {generating ? 'Generating...' : '✨ Generate Message'}
      </button>

      {error && (
        <div className="card bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {success && (
        <div className="card bg-green-50 border border-green-200 p-4">
          <p className="text-sm text-success">{success}</p>
        </div>
      )}

      {message && (
        <div className="card space-y-4">
          <h2 className="font-medium text-foreground">Generated Message</h2>

          {channel === 'email' && (
            <div>
              <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-1">Subject</label>
              <input type="text" className="input-base font-medium" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Email subject line" />
            </div>
          )}

          <div>
            {channel === 'sms' && (
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-medium text-muted uppercase tracking-wide">Message</label>
                <span className={`text-xs font-medium ${message.length > 160 ? 'text-danger' : message.length > 140 ? 'text-warning' : 'text-muted'}`}>
                  {message.length}/160 characters
                </span>
              </div>
            )}
            <textarea className="input-base min-h-[160px] resize-y" value={message} onChange={e => setMessage(e.target.value)} placeholder="Generated message will appear here..." />
          </div>

          <div className="flex gap-3">
            <button onClick={generateNudge} disabled={generating} className="btn-ghost flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
              {generating ? 'Regenerating...' : '↺ Regenerate'}
            </button>
            <button onClick={handleSend} disabled={sending} className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed">
              {sending ? 'Sending...' : copied ? '✓ Copied!' : channel === 'copy' ? '📋 Copy' : channel === 'email' ? '✉️ Send Email' : '💬 Send SMS'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}