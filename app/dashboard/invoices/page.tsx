'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Client = {
  id: string
  name: string
  company: string | null
}

type Invoice = {
  id: string
  amount: number
  currency: string
  due_date: string
  status: 'pending' | 'overdue' | 'paid'
  description: string | null
  created_at: string
  client: Client | null
}

type SupabaseInvoiceResponse = {
  id: string
  amount: number
  currency: string
  due_date: string
  status: 'pending' | 'overdue' | 'paid'
  description: string | null
  created_at: string
  client: Client | null
}

export default function InvoicesPage() {
  const router = useRouter()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'overdue' | 'paid'>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [form, setForm] = useState({
    client_id: '',
    amount: '',
    currency: 'USD',
    due_date: '',
    description: '',
    status: 'pending',
  })

  const supabase = createClient()

  const fetchInvoices = useCallback(async () => {
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
        created_at,
        client:clients(id, name, company)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch invoices error:', fetchError)
      setError('Failed to load invoices. Please refresh the page.')
      setInvoices([])
    } else if (data) {
      setInvoices(data as SupabaseInvoiceResponse[] as Invoice[])
    }
    setLoading(false)
  }, [supabase, router])

  const fetchClients = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error: fetchError } = await supabase
      .from('clients')
      .select('id, name, company')
      .eq('user_id', user.id)
      .order('name')

    if (fetchError) {
      console.error('Fetch clients error:', fetchError)
    } else if (data) {
      setClients(data)
    }
  }, [supabase])

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [fetchInvoices, fetchClients])

  async function handleSubmit() {
    setError(null)
    
    // Validation
    if (!form.client_id) {
      setError('Please select a client')
      return
    }
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }
    if (!form.due_date) {
      setError('Please select a due date')
      return
    }
    
    const selectedDate = new Date(form.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) {
      setError('Due date cannot be in the past')
      return
    }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in to create invoices')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('invoices').insert({
      user_id: user.id,
      client_id: form.client_id,
      amount: parseFloat(form.amount),
      currency: form.currency,
      due_date: form.due_date,
      description: form.description || null,
      status: form.status,
    })

    if (insertError) {
      console.error('Insert invoice error:', insertError)
      setError(insertError.message || 'Failed to create invoice')
      setSubmitting(false)
    } else {
      setForm({ 
        client_id: '', 
        amount: '', 
        currency: 'USD', 
        due_date: '', 
        description: '', 
        status: 'pending' 
      })
      setShowForm(false)
      fetchInvoices()
      setSubmitting(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingStatus(id)
    setError(null)
    
    const { error: updateError } = await supabase
      .from('invoices')
      .update({ status })
      .eq('id', id)

    if (updateError) {
      console.error('Update status error:', updateError)
      setError('Failed to update invoice status')
    } else {
      await fetchInvoices()
    }
    
    setUpdatingStatus(null)
  }

  const filtered = filter === 'all' 
    ? invoices 
    : invoices.filter(i => i.status === filter)

  const badgeClass = (status: string) => {
    if (status === 'paid') return 'badge-paid'
    if (status === 'overdue') return 'badge-overdue'
    return 'badge-pending'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Invoices</h1>
          <p className="text-sm text-muted mt-1">{invoices.length} total invoices</p>
        </div>
        <button onClick={() => {
          setShowForm(!showForm)
          setError(null)
        }} className="btn-primary">
          {showForm ? 'Cancel' : '+ New Invoice'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="card bg-red-50 border border-red-200 p-4">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      {/* Add Invoice Form */}
      {showForm && (
        <div className="card space-y-4">
          <h2 className="font-medium text-foreground">New Invoice</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Client *</label>
              <select
                className="input-base"
                value={form.client_id}
                onChange={e => setForm({ ...form, client_id: e.target.value })}
              >
                <option value="">Select client</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.company ? ` — ${c.company}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Amount *</label>
              <div className="flex gap-2">
                <select
                  className="input-base w-24"
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                >
                  {['USD','EUR','GBP','CAD','AUD'].map(c => <option key={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="input-base flex-1"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Due Date *</label>
              <input
                type="date"
                className="input-base"
                value={form.due_date}
                min={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Status</label>
              <select
                className="input-base"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Website redesign — March 2025"
                className="input-base"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button 
              onClick={() => {
                setShowForm(false)
                setError(null)
              }} 
              className="btn-ghost"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit} 
              disabled={submitting} 
              className="btn-primary disabled:opacity-60"
            >
              {submitting ? 'Saving...' : 'Save Invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-border">
        {(['all', 'pending', 'overdue', 'paid'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoice List */}
      {loading ? (
        <div className="text-center py-12 text-muted">Loading invoices...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted">
          {filter === 'all' ? 'No invoices yet. Create your first one!' : `No ${filter} invoices.`}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(invoice => (
            <div key={invoice.id} className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-foreground">
                    {invoice.client?.name || 'Unknown Client'}
                  </span>
                  {invoice.client?.company && (
                    <span className="text-xs text-muted">{invoice.client.company}</span>
                  )}
                  <span className={badgeClass(invoice.status)}>{invoice.status}</span>
                </div>
                {invoice.description && (
                  <p className="text-sm text-muted mt-0.5 truncate">{invoice.description}</p>
                )}
                <p className="text-xs text-muted mt-1">
                  Due: {new Date(invoice.due_date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-lg font-semibold text-foreground">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </span>
                <select
                  className="input-base text-sm py-1 w-32"
                  value={invoice.status}
                  onChange={e => updateStatus(invoice.id, e.target.value)}
                  disabled={updatingStatus === invoice.id}
                >
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="paid">Paid</option>
                </select>
                {invoice.status !== 'paid' && (
                  <Link
                    href={`/dashboard/nudge/${invoice.id}`}
                    className="btn-primary text-sm whitespace-nowrap"
                  >
                    {updatingStatus === invoice.id ? 'Updating...' : 'Send Nudge'}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
               }
