import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PayNudge — Stop Chasing Payments',
  description:
    'PayNudge writes professional payment reminders for freelancers. Friendly, firm, or final — just pick a tone and send.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ─── NAV ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-base font-semibold text-gray-900">PayNudge</span>
          </div>

          {/* Nav links */}
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 pt-16 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
          Built for US freelancers
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight tracking-tight mb-4">
          Stop chasing payments.
          <br />
          <span className="text-blue-600">PayNudge follows up for you.</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
          AI-written payment reminders — friendly, firm, or final.
          Pick a tone, review the message, and send in seconds.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            Start for free — no card needed
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              How it works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Get paid in 3 steps
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              No awkward conversations. No manual typing. Just results.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: '1',
                title: 'Add your invoice',
                desc: 'Enter client name, invoice amount, and due date. Takes 30 seconds.',
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: '2',
                title: 'Pick a tone',
                desc: 'Friendly for first reminders. Firm when it\'s been a while. Final when you mean business.',
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                ),
              },
              {
                step: '3',
                title: 'Send or copy',
                desc: 'Send directly via email or copy the message to paste anywhere you need.',
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="bg-white rounded-2xl border border-gray-100 p-6"
              >
                {/* Step number + icon */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{item.step}</span>
                  </div>
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4">
          {/* Section header */}
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Features
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Everything you need to get paid
            </h2>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'AI-Written Messages',
                desc: 'Groq + Gemini generate human, professional reminders that actually get read.',
                iconBg: 'bg-blue-50',
                icon: (
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
              },
              {
                title: '3 Tones',
                desc: 'Friendly, Firm, or Final — the right message for every stage of the conversation.',
                iconBg: 'bg-green-50',
                icon: (
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: 'Send via Email',
                desc: 'Send payment reminders directly from PayNudge to your client\'s inbox.',
                iconBg: 'bg-purple-50',
                icon: (
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                title: 'Client Management',
                desc: 'Keep all your clients and their contact info in one place.',
                iconBg: 'bg-orange-50',
                icon: (
                  <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: 'Invoice Tracking',
                desc: 'Track pending, overdue, and paid invoices — all in one dashboard.',
                iconBg: 'bg-yellow-50',
                icon: (
                  <svg className="w-5 h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                ),
              },
              {
                title: 'Copy Anywhere',
                desc: 'Copy the generated message and paste it into any channel — WhatsApp, LinkedIn, anywhere.',
                iconBg: 'bg-pink-50',
                icon: (
                  <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                ),
              },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all"
              >
                <div className={`w-9 h-9 ${f.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────── */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Get paid faster, starting today.
          </h2>
          <p className="text-blue-100 text-sm mb-6">
            Free to start. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors text-sm"
          >
            Create your free account
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">PayNudge</span>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} PayNudge. Built for freelancers.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
              Sign up
            </Link>
          </div>
        </div>
      </footer>

    </div>
  )
}