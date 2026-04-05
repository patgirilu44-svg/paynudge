import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PayNudge — Get Paid 11 Days Faster',
  description: 'AI-written payment reminders for freelancers. Friendly, firm, or final tones. Get paid 11 days faster without awkward follow-ups.',
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      
      {/* NAV */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">P</span>
            </div>
            <span className="font-bold text-gray-900">PayNudge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">Sign in</Link>
            <Link href="/signup" className="text-sm bg-emerald-500 text-white px-5 py-2 rounded-lg hover:bg-emerald-600">Get started</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -translate-y-1/2" />
        
        <div className="max-w-6xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full mb-4">Built for US freelancers</span>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Get paid <span className="text-emerald-500">11 days faster.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-6">AI writes professional payment reminders — friendly, firm, or final.</p>
            <div className="flex gap-3">
              <Link href="/signup" className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-600">Create free reminder →</Link>
              <button className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl">Watch demo</button>
            </div>
          </div>
          
          {/* Mock UI */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg text-sm">Client: John Smith</div>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">Amount: $5,000</div>
              <div className="flex gap-2">
                <span className="flex-1 py-2 bg-emerald-100 text-emerald-700 text-center rounded-lg text-sm">😊 Friendly</span>
                <span className="flex-1 py-2 bg-gray-100 text-gray-500 text-center rounded-lg text-sm">😐 Firm</span>
              </div>
              <div className="p-4 bg-emerald-50 rounded-lg text-sm">
                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded">AI Generated</span>
                <p className="mt-2 text-gray-700">Hi John, just checking in on the $5,000 invoice...</p>
              </div>
              <button className="w-full py-2 bg-emerald-500 text-white rounded-lg">Send Email</button>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="border-y border-gray-100 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-8">
            <div>
              <div className="text-3xl font-bold text-emerald-500">$2.4M+</div>
              <div className="text-sm text-gray-500">Recovered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500">11 days</div>
              <div className="text-sm text-gray-500">Faster</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500">10K+</div>
              <div className="text-sm text-gray-500">Freelancers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-500">4.9/5</div>
              <div className="text-sm text-gray-500">Rating</div>
            </div>
          </div>
          <div className="flex justify-center gap-8 text-gray-400 font-bold">
            <span>Upwork</span>
            <span>Fiverr</span>
            <span>Toptal</span>
            <span>Freelancer</span>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-12">Get paid in 3 steps</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow border hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-500 text-white rounded-xl flex items-center justify-center mb-4 text-xl font-bold">1</div>
              <h3 className="font-bold mb-2">Add invoice</h3>
              <p className="text-gray-500 text-sm">Enter client, amount, and due date</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow border hover:shadow-lg transition">
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-xl flex items-center justify-center mb-4 text-xl font-bold">2</div>
              <h3 className="font-bold mb-2">Pick tone</h3>
              <p className="text-gray-500 text-sm">Friendly, Firm, or Final</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow border hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-500 text-white rounded-xl flex items-center justify-center mb-4 text-xl font-bold">3</div>
              <h3 className="font-bold mb-2">Send & get paid</h3>
              <p className="text-gray-500 text-sm">Email or copy anywhere</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Loved by freelancers</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="text-amber-400 mb-3">★★★★★</div>
              <p className="text-gray-700 mb-4 text-sm">"PayNudge saved my $50K client relationship. Perfect tone!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">S</div>
                <div>
                  <div className="font-bold text-sm">Sarah Chen</div>
                  <div className="text-xs text-gray-500">UI/UX Designer</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow border-2 border-emerald-400">
              <div className="text-amber-400 mb-3">★★★★★</div>
              <p className="text-gray-700 mb-4 text-sm">"3 tones are brilliant. Never think about wording again."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold">M</div>
                <div>
                  <div className="font-bold text-sm">Marcus Johnson</div>
                  <div className="text-xs text-gray-500">Full Stack Dev</div>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow">
              <div className="text-amber-400 mb-3">★★★★★</div>
              <p className="text-gray-700 mb-4 text-sm">"2 hours → 2 clicks every week. Game changer!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">P</div>
                <div>
                  <div className="font-bold text-sm">Priya Sharma</div>
                  <div className="text-xs text-gray-500">Content Writer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { emoji: '🤖', title: 'AI-Written', desc: 'Groq + Gemini powered', color: 'bg-blue-100 text-blue-600' },
              { emoji: '🎭', title: '3 Tones', desc: 'Friendly, Firm, Final', color: 'bg-emerald-100 text-emerald-600' },
              { emoji: '📧', title: 'Send Email', desc: 'Direct to inbox', color: 'bg-purple-100 text-purple-600' },
              { emoji: '👥', title: 'Client Management', desc: 'Organized contacts', color: 'bg-orange-100 text-orange-600' },
              { emoji: '📊', title: 'Invoice Tracking', desc: 'Pending to paid', color: 'bg-amber-100 text-amber-600' },
              { emoji: '📋', title: 'Copy Anywhere', desc: 'WhatsApp, LinkedIn', color: 'bg-pink-100 text-pink-600' },
            ].map((f) => (
              <div key={f.title} className="bg-white p-6 rounded-2xl border hover:shadow-lg transition">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-3 ${f.color}`}>{f.emoji}</div>
                <h3 className="font-bold mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Simple pricing</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-2xl border-2 border-gray-100">
              <div className="text-sm font-bold text-gray-500 uppercase mb-2">Free</div>
              <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> 3 reminders/month</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> All tones</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Copy & paste</li>
              </ul>
              <button className="w-full py-3 border-2 border-gray-200 rounded-xl font-semibold hover:border-emerald-500">Get started</button>
            </div>
            <div className="bg-white p-8 rounded-2xl border-2 border-emerald-500 shadow-lg relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
              <div className="text-sm font-bold text-emerald-600 uppercase mb-2">Pro</div>
              <div className="text-4xl font-bold mb-6">$12<span className="text-lg text-gray-400">/month</span></div>
              <ul className="space-y-3 mb-6 text-sm">
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Unlimited reminders</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Direct email</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Read receipts</li>
                <li className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Priority support</li>
              </ul>
              <button className="w-full py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600">Upgrade to Pro</button>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 bg-emerald-600">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to get paid faster?</h2>
          <p className="text-emerald-100 mb-8">Join 10,000+ freelancers today.</p>
          <Link href="/signup" className="inline-block bg-white text-emerald-600 px-8 py-4 rounded-xl font-bold hover:bg-emerald-50">Create free account →</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="text-white font-bold text-lg">PayNudge</span>
          </div>
          <p className="text-sm mb-6">AI-powered payment reminders for freelancers.</p>
          <div className="flex justify-center gap-6 text-sm">
            <Link href="#" className="hover:text-white">Privacy</Link>
            <Link href="#" className="hover:text-white">Terms</Link>
          </div>
          <p className="mt-6 text-xs">© 2026 PayNudge</p>
        </div>
      </footer>

    </div>
  )
}
