import Link from 'next/link'

const CURRENT_YEAR = 2026

const features = [
  {
    icon: '✉️',
    title: 'AI-Written Nudges',
    description:
      'Groq + Gemini generate professional payment reminders in seconds.',
    iconBg: 'from-green-100 to-green-50',
    iconColor: 'text-green-700',
  },
  {
    icon: '🎯',
    title: '3 Tones',
    description:
      'Friendly, firm, or final — the right tone for every payment situation.',
    iconBg: 'from-blue-100 to-blue-50',
    iconColor: 'text-blue-700',
  },
  {
    icon: '⚡',
    title: 'Send or Copy',
    description:
      'Send by email directly or copy your reminder anywhere you need.',
    iconBg: 'from-purple-100 to-purple-50',
    iconColor: 'text-purple-700',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navbar - improved spacing and focus states */}
      <nav
        aria-label="Primary"
        className="sticky top-0 z-50 mx-auto flex max-w-6xl items-center justify-between bg-white/80 px-6 py-4 backdrop-blur-sm"
      >
        <Link
          href="/"
          aria-current="page"
          className="group flex items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-sm transition-all duration-200 group-hover:shadow-md group-hover:shadow-blue-200">
            <span className="text-sm font-bold text-white">P</span>
          </div>
          <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-xl font-semibold text-transparent">
            PayNudge
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 transition-all hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md hover:shadow-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl px-6 pb-28 pt-12 text-center md:pt-20">
        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 ring-1 ring-blue-100">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-600 motion-safe:animate-pulse" />
          Built for US freelancers
        </div>

        {/* Hero Heading */}
        <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
          Get paid faster.
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Without the awkward follow-ups.
          </span>
        </h1>

        {/* Subheading */}
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
          PayNudge writes professional payment reminders for you — friendly,
          firm, or final. Just pick a tone and send.
        </p>

        {/* CTA Buttons */}
        <div className="mb-20 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="group relative rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-3.5 text-base font-semibold text-white shadow-md transition-all hover:shadow-lg hover:shadow-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 motion-safe:hover:scale-[1.02]"
          >
            Start for free
            <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Sign in
          </Link>
        </div>

        {/* Features Grid */}
        <section
          aria-labelledby="features-heading"
          className="grid grid-cols-1 gap-6 text-left md:grid-cols-3"
        >
          <h2 id="features-heading" className="sr-only">
            Features
          </h2>

          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="group rounded-2xl border border-gray-100 bg-gray-50/40 p-6 transition-all duration-300 hover:border-gray-200 hover:bg-white hover:shadow-lg hover:shadow-blue-500/5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.iconBg} transition-all duration-300 group-hover:scale-110 group-hover:shadow-md`}
              >
                <span className="text-2xl" aria-hidden="true">
                  {feature.icon}
                </span>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed text-gray-600">
                {feature.description}
              </p>
            </article>
          ))}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50/30 py-8 text-center">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-sm text-gray-400">
            © {CURRENT_YEAR} PayNudge. Built for freelancers, by freelancers.
          </p>
        </div>
      </footer>
    </div>
  )
}