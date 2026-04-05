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

type SupabaseInvoiceRow = {
  id: string
  amount: number
  currency: string
  due_date: string
  status: 'pending' | 'overdue' | 'paid'
  description: string | null
  created_at: string
  client: Client[] | null
}

type FilterType = 'all' | 'pending' | 'overdue' | 'paid'

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']
const FILTERS: FilterType[] = ['all', 'pending', 'overdue', 'paid']

const DEFAULT_FORM = {
  client_id: '',
  amount: '',
  currency: 'USD',
  due_date: '',
  description: '',
  status: 'pending',
}

export default function InvoicesPage() {
  const router = useRouter()
  const supabase = createClient()

  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filter, setFilter] = useState<FilterType>('all')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [form, setForm] = useState(DEFAULT_FORM)

  // ── Fetch invoices ──────────────────────────────────────────────────────────
  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { data, error: fetchError } = await supabase
      .from('invoices')
      .select(`
        id, amount, currency, due_date, status, description, created_at,
        client:clients(id, name, company)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Fetch invoices error:', fetchError)
      setError('Failed to load invoices. Please refresh.')
      setInvoices([])
    } else if (data) {
      const normalized: Invoice[] = (data as unknown as SupabaseInvoiceRow[]).map(row => ({
        ...row,
        client: Array.isArray(row.client) ? (row.client[0] ?? null) : row.client,
      }))
      setInvoices(normalized)
    }
    setLoading(false)
  }, [supabase, router])

  // ── Fetch clients ───────────────────────────────────────────────────────────
  const fetchClients = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('clients')
      .select('id, name, company')
      .eq('user_id', user.id)
      .order('name')

    if (data) setClients(data)
  }, [supabase])

  useEffect(() => {
    fetchInvoices()
    fetchClients()
  }, [fetchInvoices, fetchClients])

  // ── Submit new invoice ──────────────────────────────────────────────────────
  async function handleSubmit() {
    setError(null)
    setSuccessMsg(null)

    if (!form.client_id) { setError('Please select a client'); return }
    if (!form.amount || parseFloat(form.amount) <= 0) { setError('Please enter a valid amount'); return }
    if (!form.due_date) { setError('Please select a due date'); return }

    const selectedDate = new Date(form.due_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (selectedDate < today) { setError('Due date cannot be in the past'); return }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('invoices').insert({
      user_id: user.id,
      client_id: form.client_id,
      amount: parseFloat(form.amount),
      currency: form.currency,
      due_date: form.due_date,
      description: form.description.trim() || null,
      status: form.status,
    })

    if (insertError) {
      console.error('Insert invoice error:', insertError)
      setError(insertError.message || 'Failed to create invoice')
      setSubmitting(false)
    } else {
      setForm(DEFAULT_FORM)
      setShowForm(false)
      setSuccessMsg('Invoice created successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
      await fetchInvoices()
      setSubmitting(false)
    }
  }

  // ── Update status ───────────────────────────────────────────────────────────
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

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  const counts = {
    all: invoices.length,
    pending: invoices.filter(i => i.status === 'pending').length,
    overdue: invoices.filter(i => i.status === 'overdue').length,
    paid: invoices.filter(i => i.status === 'paid').length,
  }

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: 'bg-green-100 text-green-700',
      overdue: 'bg-red-100 text-red-700',
      pending: 'bg-yellow-100 text-yellow-700',
    }
    return `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-gray-100 text-gray-600'}`
  }

  const formatCurrency = (amount: number, currency: string) =>
    `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const today = new Date().toISOString().split('T')[0]

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {invoices.length === 0 ? 'No invoices yet' : `${invoices.length} invoice${invoices.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setError(null) }}
          className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New invoice
            </>
          )}
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}
      {successMsg && (
        <p className="text-sm text-green-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {successMsg}
        </p>
      )}

      {/* New Invoice Form */}
      {showForm && (
        <div className="rounded-xl border border-gray-100 bg-white p-5 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">New Invoice</h2>

          {clients.length === 0 && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-100 px-4 py-3">
              <p className="text-sm text-yellow-700">
                No clients yet.{' '}
                <Link href="/dashboard/clients/new" className="font-medium underline">
                  Add a client first
                </Link>
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Client *</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
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
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Amount *</label>
              <div className="flex gap-2">
                <select
                  className="w-20 px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                  value={form.currency}
                  onChange={e => setForm({ ...form, currency: e.target.value })}
                >
                  {CURRENCIES.map(c => <option key={c}>{c}</option>)}
                </select>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Due Date *</label>
              <input
                type="date"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={form.due_date}
                min={today}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Status</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Description <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Website redesign — March 2025"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={() => { setShowForm(false); setError(null); setForm(DEFAULT_FORM) }}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || clients.length === 0}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Saving...' : 'Save invoice'}
            </button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-100">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${
              filter === f
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-400 hover:text-gray-700'
            }`}
          >
            {f}
            {counts[f] > 0 && (
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                filter === f ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {counts[f]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-16 text-sm text-gray-400">Loading invoices...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-16 text-center">
          {filter === 'all' ? (
            <>
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">No invoices yet</h3>
              <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                Create your first invoice to start sending payment nudges to clients.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-1.5 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create invoice
              </button>
            </>
          ) : (
            <p className="text-sm text-gray-400">No {filter} invoices.</p>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-gray-100 bg-white overflow-hidden">
          {filtered.map((invoice, index) => (
            <div
              key={invoice.id}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-gray-50 transition-colors ${
                index !== filtered.length - 1 ? 'border-b border-gray-100' : ''
              }`}
            >
              {/* Left */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">
                    {invoice.client?.name || 'Unknown Client'}
                  </span>
                  {invoice.client?.company && (
                    <span className="text-xs text-gray-400">{invoice.client.company}</span>
                  )}
                  <span className={statusBadge(invoice.status)}>{invoice.status}</span>
                </div>
                {invoice.description && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{invoice.description}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">
                  Due {new Date(invoice.due_date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>

              {/* Right */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(invoice.amount, invoice.currency)}
                </span>
                <select
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
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
                    className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
                  >
                    {updatingStatus === invoice.id ? '...' : 'Send nudge'}
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