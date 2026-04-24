'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import toast from 'react-hot-toast'

const FAQS = [
  { q: 'How does TripSage generate itineraries?', a: 'TripSage uses Groq\'s LLaMA3-70B model to analyze your budget, travel style, group type, and preferences to generate personalized day-by-day itineraries in real-time.' },
  { q: 'Are the flight and hotel prices real?', a: 'Yes! Prices are fetched in real-time from travel APIs via RapidAPI. However, prices can change frequently, so we recommend booking quickly when you find a good deal.' },
  { q: 'How does booking work?', a: 'TripSage uses affiliate deep links that redirect you to trusted third-party booking platforms like Booking.com, Skyscanner, and Viator. All bookings are completed on those platforms.' },
  { q: 'Is my data stored?', a: 'TripSage follows a minimal data storage policy. Your trip preferences are stored in your session for real-time optimization. We do not resell personal data.' },
  { q: 'What if weather alerts or notifications are wrong?', a: 'Weather data is sourced from live APIs and updated regularly. While we aim for accuracy, always verify critical information from official sources before traveling.' },
  { q: 'Can I export my itinerary?', a: 'Yes! From the Itinerary tab, you can export your day-by-day plan as a PDF or share it with your travel group via a link.' },
]

const BOT_RESPONSES: Record<string, string> = {
  default: "Thanks for reaching out! Our team typically replies within a few minutes. How can I help you with your trip today?",
  flight: "For flight issues, please share your booking reference and departure date. We'll check the latest status with our travel partners.",
  hotel: "For hotel queries, share your booking ID and check-in date. We'll coordinate directly with the property.",
  refund: "Refund requests are handled by the third-party provider you booked through (e.g. Booking.com, Skyscanner). We can help you find the right contact.",
  itinerary: "AI itineraries can be regenerated anytime! Go to the Plan tab and click 🔄 Refresh. Need a custom change? Describe what you'd like.",
  cancel: "Cancellation policies depend on the booking platform. We recommend checking the booking confirmation email for your provider's policy.",
  hi: "Hey there! 👋 I'm the TripSage support bot. Ask me anything about your trip, bookings, or the app!",
  hello: "Hello! 👋 How can I assist your travel journey today?",
  help: "I can help with: ✈️ Flights · 🏨 Hotels · 📅 Itineraries · 💰 Refunds · ❌ Cancellations · 🌦️ Weather. What do you need?",
}

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('flight')) return BOT_RESPONSES.flight
  if (lower.includes('hotel') || lower.includes('room')) return BOT_RESPONSES.hotel
  if (lower.includes('refund') || lower.includes('money')) return BOT_RESPONSES.refund
  if (lower.includes('itinerary') || lower.includes('plan')) return BOT_RESPONSES.itinerary
  if (lower.includes('cancel')) return BOT_RESPONSES.cancel
  if (lower.match(/^hi+$|^hello+$/)) return BOT_RESPONSES.hi
  if (lower.includes('help')) return BOT_RESPONSES.help
  return BOT_RESPONSES.default
}

interface ChatMsg { role: 'user' | 'bot'; text: string; time: string }

export default function SupportPage() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'bot', text: "Hi! 👋 I'm the TripSage support bot. Ask me anything about flights, hotels, or your itinerary!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [botTyping, setBotTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs, botTyping])

  const sendChat = () => {
    const text = chatInput.trim()
    if (!text) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatMsgs(prev => [...prev, { role: 'user', text, time }])
    setChatInput('')
    setBotTyping(true)
    setTimeout(() => {
      setBotTyping(false)
      setChatMsgs(prev => [...prev, { role: 'bot', text: getBotReply(text), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 900 + Math.random() * 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    // Open mailto with form data prefilled
    const subject = encodeURIComponent(form.subject || 'TripSage Support Request')
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.open(`mailto:rana@tripsage.in?subject=${subject}&body=${body}`)
    await new Promise(r => setTimeout(r, 800))
    toast.success('Opening your email client...')
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div className="min-h-screen bg-grid">
      {/* NAV */}
      <nav className="glass-dark sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Image src="https://res.cloudinary.com/dob5llmb2/image/upload/v1774999435/LOGO_xbwcwe.png"
            alt="TripSage" width={36} height={36} className="rounded-xl" unoptimized />
          <span className="font-bold text-[var(--primary)]">TripSage</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowChat(true)} className="btn-outline py-2 px-4 text-sm">💬 Live Chat</button>
          <Link href="/plan" className="btn-primary py-2 px-5 text-sm inline-block">Plan Trip →</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="section-title mb-3">📞 Support Center</h1>
          <p className="section-subtitle">We're here to help you travel smarter</p>
        </div>

        {/* Quick help cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {/* Live Chat */}
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">💬</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-1">Live Chat</h3>
            <p className="text-[var(--text-muted)] text-sm mb-2">Chat with our support bot in real-time</p>
            <div className="flex items-center justify-center gap-1 mb-4">
              <span className="live-dot"></span>
              <span className="text-xs text-[var(--primary)] font-mono">Online now</span>
            </div>
            <button
              className="btn-primary py-2 px-5 text-sm w-full"
              onClick={() => setShowChat(true)}
            >
              Start Chat
            </button>
          </div>

          {/* Email Support */}
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">📧</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-1">Email Support</h3>
            <p className="text-[var(--text-muted)] text-sm mb-1">rana@tripsage.in</p>
            <p className="text-[var(--text-muted)] text-xs mb-4">Reply within 24 hours</p>
            <a
              href="mailto:rana@tripsage.in?subject=TripSage Support"
              className="btn-primary py-2 px-5 text-sm w-full block text-center"
              style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-dark))' }}
            >
              Send Email
            </a>
          </div>

          {/* Emergency */}
          <div className="card p-6 text-center hover:scale-105 transition-transform">
            <div className="text-4xl mb-3">🚨</div>
            <h3 className="font-bold text-[var(--text-primary)] mb-1">Emergency</h3>
            <p className="text-[var(--text-muted)] text-sm mb-1">24/7 travel emergency hotline</p>
            <p className="text-[var(--text-muted)] text-xs mb-4">For lost documents, medical, or safety issues</p>
            <button
              className="btn-primary py-2 px-5 text-sm w-full"
              style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)' }}
              onClick={() => setShowEmergency(true)}
            >
              Get Help Now
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <h2 className="section-title text-2xl mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-5 flex items-center justify-between text-left"
                >
                  <span className="font-semibold text-[var(--text-primary)] pr-4">{faq.q}</span>
                  <span className={`text-[var(--primary)] transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-[var(--text-muted)] text-sm leading-relaxed border-t border-[var(--border)] pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
        <div className="card p-8">
          <h2 className="section-title text-2xl mb-2">Send a Message</h2>
          <p className="text-[var(--text-muted)] text-sm mb-6">Fills and opens your email client automatically</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Name</label>
                <input className="input-field" placeholder="Your name" required
                  value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Email</label>
                <input className="input-field" type="email" placeholder="your@email.com" required
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Subject</label>
              <input className="input-field" placeholder="How can we help?" required
                value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Message</label>
              <textarea className="input-field min-h-[120px] resize-none" placeholder="Describe your issue or question..."
                required value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            </div>
            <button type="submit" className="btn-primary py-3 px-8" disabled={sending}>
              {sending ? 'Opening email...' : '📧 Send Message →'}
            </button>
          </form>
        </div>
      </div>

      {/* ── LIVE CHAT MODAL ── */}
      {showChat && (
        <div className="fixed inset-0 z-[100] flex items-end justify-end p-6" onClick={() => setShowChat(false)}>
          <div
            className="glass-dark rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-sm flex flex-col overflow-hidden animate-slide-up"
            style={{ height: '520px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-lg">🤖</div>
                <div>
                  <p className="font-bold text-white text-sm">TripSage Support</p>
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                    <span className="text-white/80 text-[0.65rem] font-mono">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowChat(false)} className="text-white/70 hover:text-white text-xl transition-colors">✕</button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {chatMsgs.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.role === 'user'
                    ? 'bg-[var(--primary)] text-white rounded-tr-sm'
                    : 'bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-tl-sm'
                    }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[0.6rem] mt-1 ${msg.role === 'user' ? 'text-white/60 text-right' : 'text-[var(--text-muted)]'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              {botTyping && (
                <div className="flex justify-start">
                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: `${i * 0.2}s` }}></div>
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-3 pb-2 flex gap-2 overflow-x-auto">
              {['Refund help', 'Flight issue', 'Hotel query', 'Itinerary'].map(q => (
                <button key={q} onClick={() => { setChatInput(q); setTimeout(sendChat, 0) }}
                  className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full glass border border-[var(--border)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white transition-all">
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--border)] flex gap-2">
              <input
                className="input-field text-sm py-2.5 flex-1"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim()}
                className="btn-primary py-2 px-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EMERGENCY MODAL ── */}
      {showEmergency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowEmergency(false)}>
          <div className="glass-dark rounded-2xl border border-red-500/30 shadow-2xl w-full max-w-md p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3 animate-bounce">🚨</div>
              <h2 className="font-bold text-xl text-red-400 mb-1">Emergency Support</h2>
              <p className="text-[var(--text-muted)] text-sm">Available 24/7 for urgent travel issues</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Emergency Hotline', value: '+91-800-TRIPSAGE', icon: '📞', href: 'tel:+916301158175' },
                { label: 'WhatsApp', value: '+91 6301158175', icon: '📱', href: 'https://wa.me/916301158175?text=Emergency%20Travel%20Support' },
                { label: 'Email (Urgent)', value: 'rana@tripsage.in', icon: '📧', href: 'mailto:rana@tripsage.in?subject=URGENT: Travel Emergency' },
              ].map(c => (
                <a key={c.label} href={c.href} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-4 glass rounded-xl p-4 hover:border-red-500/40 border border-[var(--border)] transition-all group">
                  <span className="text-2xl">{c.icon}</span>
                  <div className="flex-1">
                    <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{c.label}</p>
                    <p className="font-bold text-[var(--text-primary)] group-hover:text-red-400 transition-colors">{c.value}</p>
                  </div>
                  <span className="text-[var(--text-muted)] group-hover:text-red-400 transition-colors">→</span>
                </a>
              ))}
            </div>

            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-xs text-red-400 mb-4 leading-relaxed">
              ⚠️ For medical emergencies, always call your local emergency services (112 in India) first.
            </div>

            <button onClick={() => setShowEmergency(false)} className="btn-outline w-full py-2.5 border-red-500/50 text-red-400 hover:bg-red-500/10">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
