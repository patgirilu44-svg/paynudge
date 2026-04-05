'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_REGEX = /^\+?[\d\s\-(). ]{7,20}$/

const DEFAULT_FORM = {
  name: '',
  email: '',
  phone: '',
  company: '',
}

export default function NewClientPage() {
  const router = useRouter()
  const supabase = createClient()
  const nameRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState(DEFAULT_FORM)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<Partial<typeof DEFAULT_FORM>>({})
  const [submitting, setSubmitting] = useState(false)

  function validate(): boolean {
    const errors: Partial<typeof DEFAULT_FORM> = {}

    if (!form.name.trim()) errors.name = 'Name is required'
    if (!form.email.trim()) {
      errors.email = 'Email is required'
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Enter a valid email address'
    }
    if (form.phone.trim() && !PHONE_REGEX.test(form.phone.trim())) {
      errors.phone = 'Enter a valid phone number'
    }

    setFieldError(errors)
    return Object.keys(errors).length === 0
  }

  async function handleSubmit() {
    setError(null)
    if (!validate()) return

    setSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('You must be logged in')
        return
      }

      // Check for duplicate email
      const { data: existing } = await supabase
        .from('clients')
        .select('id')
        .eq('user_id', user.id)
        .eq('email', form.email.trim().toLowerCase())
        .maybeSingle()

      if (existing) {
        setFieldError({ email: 'A client with this email already exists' })
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
        return
      }

      router.push('/dashboard/clients')
      router.refresh()

    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !submitting) handleSubmit()
  }

  function updateField(field: keyof typeof DEFAULT_FORM, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
    if (fieldError[field]) {
      setFieldError(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="max-w-lg mx-auto">

      {/* Back */}
      <div className="mb-6">
        <Link
          href="/dashboard/clients"
          className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to clients
        </Link>
      </div>

      <div className="rounded-xl border border-gray-100 bg-white p-6 space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Add new client</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Add a client to start sending payment nudges
          </p>
        </div>

        {/* Global error */}
        {error && (
          <p className="text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}

        {/* Fields */}
        <div className="space-y-4" onKeyDown={handleKeyDown}>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              ref={nameRef}
              type="text"
              placeholder="Sarah Johnson"
              autoComplete="name"
              autoFocus
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                fieldError.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              disabled={submitting}
            />
            {fieldError.name && (
              <p className="text-xs text-red-600 mt-1">{fieldError.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              placeholder="sarah@company.com"
              autoComplete="email"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                fieldError.email ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              value={form.email}
              onChange={e => updateField('email', e.target.value)}
              disabled={submitting}
            />
            {fieldError.email && (
              <p className="text-xs text-red-600 mt-1">{fieldError.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Phone{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              autoComplete="tel"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors ${
                fieldError.phone ? 'border-red-300 bg-red-50' : 'border-gray-200'
              }`}
              value={form.phone}
              onChange={e => updateField('phone', e.target.value)}
              disabled={submitting}
            />
            {fieldError.phone && (
              <p className="text-xs text-red-600 mt-1">{fieldError.phone}</p>
            )}
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Company{' '}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="Acme Inc."
              autoComplete="organization"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
              value={form.company}
              onChange={e => updateField('company', e.target.value)}
              disabled={submitting}
            />
          </div>

        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Link
            href="/dashboard/clients"
            className="flex-1 py-2 text-sm font-medium text-center text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Adding...' : 'Add client'}
          </button>
        </div>

      </div>
    </div>
  )
}