import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PayNudge — Stop Chasing Payments',
  description:
    'AI-written payment reminders for freelancers. Friendly, firm, or final. Get paid without the awkward follow-ups.',
  openGraph: {
    title: 'PayNudge — Stop Chasing Payments',
    description: 'AI-written payment reminders for freelancers.',
    url: 'https://paynudge.com',
    siteName: 'PayNudge',
  },
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-base font-semibold text-gray-900">PayNudge</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-semibold bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
              Built for US freelancers
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight mb-4">
              Stop chasing<br />
              <span className="text-blue-600">payments.</span>
            </h1>
            <p className="text-lg text-gray-500 leading-relaxed mb-8">
              AI writes professional payment reminders for you —
              friendly, firm, or final. Pick a tone and send in seconds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 active:bg-blue-800 transition-colors text-sm"
              >
                Start free — no card needed
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center border border-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Sign in
              </Link>
            </div>
            <p className="text-xs text-gray-400 mt-4">
              Free plan includes 3 nudges/month. No credit card required.
            </p>
          </div>

          {/* Right — Mock UI */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-5">
            <div className="flex gap-1.5 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <div className="space-y-3">
              <div className="p-2.5 bg-gray-50 rounded-lg text-sm text-gray-700 font-medium">
                John Smith · Invoice $5,000 · Overdue 14 days
              </div>
              <div className="flex gap-2">
                <div className="flex-1 py-2 bg-blue-600 text-white text-center rounded-lg text-xs font-semibold">
                  Friendly ✓
                </div>
                <div className="flex-1 py-2 bg-gray-100 text-gray-400 text-center rounded-lg text-xs">
                  Firm
                </div>
                <div className="flex-1 py-2 bg-gray-100 text-gray-400 text-center rounded-lg text-xs">
                  Final
                </div>
              </div>
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-md font-medium">
                  AI Generated
                </span>
                <p className="mt-2.5 text-sm text-gray-700 leading-relaxed">
                  Hi John, hope you&apos;re well! Just a friendly follow-up on the $5,000 invoice — could you share an update on the payment status? Happy to help if anything&apos;s unclear.
                </p>
              </div>
              <button className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">
                Send Email →
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">How it works</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Get paid in 3 steps</h2>
            <p className="text-gray-500 text-sm mt-2">No awkward conversations. No manual typing.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-5">
            {[
              {
                n: '1',
                title: 'Add your invoice',
                desc: 'Enter client name, amount, and due date. Takes 30 seconds.',
              },
              {
                n: '2',
                title: 'Pick a tone',
                desc: 'Friendly for first reminders. Firm when overdue. Final when serious.',
              },
              {
                n: '3',
                title: 'Send & get paid',
                desc: 'Send via email directly or copy to paste into any app.',
              },
            ].map((s) => (
              <div key={s.n} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-white font-bold text-sm">{s.n}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Features</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Everything you need to get paid</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                bg: 'bg-blue-50', color: 'text-blue-600',
                title: 'AI-Written Messages',
                desc: 'Groq + Gemini generate human, professional reminders in seconds.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />,
              },
              {
                bg: 'bg-green-50', color: 'text-green-600',
                title: '3 Tones',
                desc: 'Friendly, Firm, or Final — the right message for every situation.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />,
              },
              {
                bg: 'bg-purple-50', color: 'text-purple-600',
                title: 'Send via Email',
                desc: 'Send reminders directly from PayNudge to your client\'s inbox.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />,
              },
              {
                bg: 'bg-orange-50', color: 'text-orange-600',
                title: 'Client Management',
                desc: 'All your clients and contact info organized in one place.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
              },
              {
                bg: 'bg-yellow-50', color: 'text-yellow-600',
                title: 'Invoice Tracking',
                desc: 'Track pending, overdue, and paid invoices at a glance.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
              },
              {
                bg: 'bg-pink-50', color: 'text-pink-600',
                title: 'Copy Anywhere',
                desc: 'Copy your nudge and paste into WhatsApp, LinkedIn, or anywhere.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />,
              },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-5 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-9 h-9 ${f.bg} rounded-xl flex items-center justify-center mb-3`}>
                  <svg className={`w-5 h-5 ${f.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {f.icon}
                  </svg>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">Pricing</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Simple, honest pricing</h2>
            <p className="text-gray-500 text-sm mt-2">No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">

            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <p className="text-sm font-semibold text-gray-500 mb-1">Free</p>
              <p className="text-3xl font-bold text-gray-900 mb-1">$0</p>
              <p className="text-xs text-gray-400 mb-6">Forever free</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  '3 nudges per month',
                  'All 3 tones',
                  'Email & copy channel',
                  'Client & invoice tracking',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center w-full py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Get started free
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-blue-600 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="bg-white/20 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  Coming soon
                </span>
              </div>
              <p className="text-sm font-semibold text-blue-200 mb-1">Pro</p>
              <p className="text-3xl font-bold text-white mb-1">$12</p>
              <p className="text-xs text-blue-200 mb-6">per month</p>
              <ul className="space-y-2.5 mb-6">
                {[
                  'Unlimited nudges',
                  'All 3 tones',
                  'Email, SMS & copy',
                  'Priority AI generation',
                  'Nudge history',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white">
                    <svg className="w-4 h-4 text-blue-200 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="block text-center w-full py-2.5 bg-white/20 text-white font-medium rounded-xl text-sm cursor-default">
                Coming soon
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-blue-600 py-16">
        <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Get paid faster, starting today.
          </h2>
          <p className="text-blue-100 text-sm mb-6">
            Free to start. No credit card required.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-600 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 active:bg-blue-100 transition-colors text-sm"
          >
            Create your free account →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
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
            <Link href="/login" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Sign in</Link>
            <Link href="/signup" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>

    </div>
  )
}