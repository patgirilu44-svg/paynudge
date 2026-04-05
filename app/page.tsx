import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-semibold text-gray-900">PayNudge</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Sign in
          </Link>
          <Link href="/signup" className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
          Built for US freelancers
        </div>

        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Get paid faster.<br />
          <span className="text-blue-600">Without the awkward follow-ups.</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          PayNudge writes professional payment reminders for you — friendly, firm, or final. 
          Just pick a tone and send.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/signup" className="bg-blue-600 text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-blue-700 transition-colors">
            Start for free
          </Link>
          <Link href="/login" className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-gray-50 transition-colors">
            Sign in
          </Link>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">✉️</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">AI-Written Nudges</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Groq + Gemini generate human, professional payment reminders in seconds.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">🎯</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">3 Tones</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Friendly, Firm, or Final — the right tone for every situation.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-xl">⚡</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Send or Copy</h3>
            <p className="text-sm text-gray-500 leading-relaxed">
              Send via email directly or copy to paste anywhere you need.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} PayNudge. Built for freelancers.
      </footer>
    </div>
  )
}