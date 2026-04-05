'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import DashboardNav from './dashboard-nav'
import LogoutButton from './logout-button'

export default function MobileSidebar({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-20"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white z-30 flex flex-col transform transition-transform duration-200 ease-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-modal="true"
        role="dialog"
        aria-label="Navigation menu"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-base font-semibold text-gray-900">PayNudge</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close menu"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto">
          <DashboardNav />
        </div>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-100 flex-shrink-0">
          <p className="text-xs text-gray-400 px-3 mb-2 truncate">{email}</p>
          <LogoutButton />
        </div>
      </div>
    </>
  )
}