'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit() {
    setError(null)

    if (!form.name.trim()) { setError('Client name is required'); return }
    if (!form.email.trim()) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { setError('Please enter a valid email'); return }
    if (form.phone && !/^\+?[\d\s\-().]{7,15}$/.test(form.phone)) { setError('Please enter a valid phone number'); return }

    setSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be logged in')
      setSubmitting(false)
      return
    }

    const { error: insertError } = await supabase.from('clients').insert({
      user_id: user.id,
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim() || null,
      company: form.company.trim() || null,
    })

    if (insertError) {
      setError(insertError.message || 'Failed to add client')
      setSubmitting(false)
    } else {
      router.push('/dashboard/clients')
      router.refresh()
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <Link href="/dashboard/clients" className="text-sm text-muted hover:text-foreground transition-colors">
          ← Back to Clients
        </Link>
      </div>

      <div className="card p-6 space-y-5">
        <div>
          <h1 className="text-xl font-semibold text-foreground">Add New Client</h1>
          <p className="text-sm text-muted mt-1">Add a client to start sending payment nudges</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="Sarah Johnson"
              className="input-base"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Email *
            </label>
            <input
              type="email"
              placeholder="sarah@company.com"
              className="input-base"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Phone <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="input-base"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
              disabled={submitting}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Company <span className="text-muted font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Acme Inc."
              className="input-base"
              value={form.company}
              onChange={e => setForm({ ...form, company: e.target.value })}
              disabled={submitting}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/dashboard/clients" className="btn-ghost flex-1 text-center">
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add Client'}
          </button>
        </div>
      </div>
    </div>
  )
}