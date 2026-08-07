'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { 
  MessageSquare, 
  Mail, 
  PhoneCall, 
  Send, 
  X, 
  HelpCircle, 
  Bot, 
  AlertTriangle, 
  ChevronDown, 
  Sparkles,
  Phone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react'

const FAQS = [
  { q: 'How does TripSage generate itineraries?', a: 'TripSage uses an advanced AI planner to analyze your budget, travel style, group type, and preferences to generate personalized day-by-day itineraries in real-time.' },
  { q: 'Are the hotel prices real?', a: 'Yes! Prices are fetched in real-time from travel APIs. However, prices can change frequently, so we recommend booking quickly when you find a good deal.' },
  { q: 'How does booking work?', a: 'TripSage supports direct hotel bookings processed on our platform. Ground transport options provide direct routing or links to partner sites.' },
  { q: 'Is my data stored?', a: 'TripSage follows a minimal data storage policy. Your trip preferences are stored in your session for real-time optimization. We do not resell personal data.' },
  { q: 'What if weather alerts or notifications are wrong?', a: 'Weather data is sourced from live APIs and updated regularly. While we aim for accuracy, always verify critical information from official sources before traveling.' },
  { q: 'Can I export my itinerary?', a: 'Yes! From the Itinerary tab, you can export your day-by-day plan as a PDF or share it with your travel group via a link.' },
]

const BOT_RESPONSES: Record<string, string> = {
  default: "Thanks for reaching out! Our team typically replies within a few minutes. How can I help you with your trip today?",
  hotel: "For hotel queries, share your booking ID and check-in date. We'll coordinate directly with the property.",
  refund: "Refund requests are handled by the third-party provider you booked through (e.g. Booking.com). We can help you find the right contact.",
  itinerary: "AI itineraries can be regenerated anytime! Go to the Plan tab and click Refresh. Need a custom change? Describe what you'd like.",
  cancel: "Cancellation policies depend on the booking platform. We recommend checking the booking confirmation email for your provider's policy.",
  hi: "Hey there! I'm the TripSage support bot. Ask me anything about your trip, bookings, or the app!",
  hello: "Hello! How can I assist your travel journey today?",
  help: "I can help with: Hotels · Trains · Buses · Itineraries · Refunds · Cancellations · Weather. What do you need?",
}

function getBotReply(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('hotel') || lower.includes('room')) return BOT_RESPONSES.hotel
  if (lower.includes('refund') || lower.includes('money')) return BOT_RESPONSES.refund
  if (lower.includes('itinerary') || lower.includes('plan')) return BOT_RESPONSES.itinerary
  if (lower.includes('cancel')) return BOT_RESPONSES.cancel
  if (lower.match(/^hi+$|^hello+$/)) return BOT_RESPONSES.hi
  if (lower.includes('help')) return BOT_RESPONSES.help
  return BOT_RESPONSES.default
}

interface ChatMsg { role: 'user' | 'bot'; text: string; time: string }

export default function SupportClient() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sending, setSending] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMsgs, setChatMsgs] = useState<ChatMsg[]>([
    { role: 'bot', text: "Hi! I'm the TripSage support bot. Ask me anything about flights, hotels, or your itinerary!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  ])
  const [botTyping, setBotTyping] = useState(false)
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Handle hash scrolling for #contact or ?contact=true
  useEffect(() => {
    const handleScrollToContact = () => {
      if (window.location.hash === '#contact' || window.location.search.includes('contact=true')) {
        const element = document.getElementById('contact')
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }
    }

    handleScrollToContact()
    window.addEventListener('hashchange', handleScrollToContact)
    return () => window.removeEventListener('hashchange', handleScrollToContact)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatMsgs, botTyping])

  const sendChat = (directText?: string) => {
    const text = (directText || chatInput).trim()
    if (!text) return
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    setChatMsgs(prev => [...prev, { role: 'user', text, time }])
    setChatInput('')
    setBotTyping(true)
    setTimeout(() => {
      setBotTyping(false)
      setChatMsgs(prev => [...prev, { role: 'bot', text: getBotReply(text), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }])
    }, 800)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    const subject = encodeURIComponent(form.subject || 'TripSage Support Request')
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.location.href = `mailto:rana@tripsage.in?subject=${subject}&body=${body}`
    await new Promise(r => setTimeout(r, 600))
    toast.success('Opening your email client...')
    setForm({ name: '', email: '', subject: '', message: '' })
    setSending(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFBF7] text-[#1A1A1A]">
      <Navbar />

      <main className="flex-grow max-w-5xl mx-auto px-4 sm:px-6 py-10 w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] text-xs font-bold mb-3">
            <HelpCircle size={14} />
            <span>24/7 Support Center</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1A1A] tracking-tight mb-2">
            How can we help you?
          </h1>
          <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
            Get instant answers, chat with our AI assistant, or reach out to our dedicated support team.
          </p>
        </div>

        {/* Quick Help Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {/* Live Chat */}
          <div className="bg-white border border-[#E8E0D8] rounded-3xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-[#EA580C] mb-4">
              <MessageSquare size={26} />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-lg mb-1">Live Chat</h3>
            <p className="text-slate-500 text-xs mb-3">Chat with our support bot in real-time</p>
            <div className="flex items-center justify-center gap-1.5 mb-5">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs text-green-700 font-bold">Online Now</span>
            </div>
            <button
              onClick={() => setShowChat(true)}
              className="mt-auto w-full py-3 px-4 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Sparkles size={14} />
              <span>Start Live Chat</span>
            </button>
          </div>

          {/* Email Support */}
          <div className="bg-white border border-[#E8E0D8] rounded-3xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 mb-4">
              <Mail size={26} />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-lg mb-1">Email Support</h3>
            <p className="text-slate-500 text-xs mb-1">rana@tripsage.in</p>
            <p className="text-slate-400 text-[11px] mb-5">Responses within 24 hours</p>
            <a
              href="mailto:rana@tripsage.in?subject=TripSage Support Request"
              className="mt-auto w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <Mail size={14} />
              <span>Send Email</span>
            </a>
          </div>

          {/* Emergency Hotline */}
          <div className="bg-white border border-red-200/80 rounded-3xl p-6 flex flex-col items-center text-center shadow-xs hover:shadow-md transition-all bg-gradient-to-b from-white to-red-50/20">
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle size={26} />
            </div>
            <h3 className="font-extrabold text-[#1A1A1A] text-lg mb-1">Emergency 24/7</h3>
            <p className="text-slate-500 text-xs mb-1">Urgent travel assistance</p>
            <p className="text-slate-400 text-[11px] mb-5">For lost items, delays, or safety</p>
            <button
              onClick={() => setShowEmergency(true)}
              className="mt-auto w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all cursor-pointer shadow-sm flex items-center justify-center gap-2"
            >
              <PhoneCall size={14} />
              <span>Get Immediate Help</span>
            </button>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <HelpCircle className="text-[#EA580C]" size={20} />
            <h2 className="text-2xl font-extrabold text-[#1A1A1A]">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white border border-[#E8E0D8] rounded-2xl overflow-hidden transition-all">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-sm text-[#1A1A1A] hover:text-[#EA580C] transition-colors"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180 text-[#EA580C]' : ''}`}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form — with #contact anchor ID */}
        <div id="contact" className="bg-white border border-[#E8E0D8] rounded-3xl p-6 sm:p-8 shadow-sm scroll-mt-28">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="text-[#EA580C]" size={20} />
            <h2 className="text-2xl font-extrabold text-[#1A1A1A]">Contact Us</h2>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mb-6">
            Fill in your details below. Submitting will pre-fill your email client directly.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 block">Your Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Enter your name"
                  required
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 block">Your Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="yourname@gmail.com"
                  required
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 block">Subject</label>
              <input
                type="text"
                className="input-field"
                placeholder="How can we help?"
                required
                value={form.subject}
                onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-1.5 block">Message</label>
              <textarea
                className="input-field min-h-[120px] resize-none"
                placeholder="Describe your question or issue in detail..."
                required
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              />
            </div>

            <button
              type="submit"
              disabled={sending}
              className="btn-primary py-3.5 px-8 text-xs font-extrabold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>{sending ? 'Opening email client...' : 'Send Message'}</span>
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </main>

      {/* ── LIVE CHAT MODAL ── */}
      {showChat && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:justify-end p-0 sm:p-6 bg-black/50 backdrop-blur-xs" onClick={() => setShowChat(false)}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl border border-[#E8E0D8] shadow-2xl w-full max-w-sm flex flex-col overflow-hidden h-[85vh] sm:h-[520px]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[#EA580C] text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                  <Bot size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-white text-sm">TripSage Support Bot</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
                    <span className="text-white/90 text-[10px] font-bold">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#FFFBF7]">
              {chatMsgs.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#EA580C] text-white rounded-tr-xs'
                      : 'bg-white border border-[#E8E0D8] text-slate-800 shadow-2xs rounded-tl-xs'
                  }`}>
                    <p>{msg.text}</p>
                    <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/70 text-right' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}

              {botTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-[#E8E0D8] rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 rounded-full bg-[#EA580C] animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick replies */}
            <div className="px-3 py-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto hide-scrollbar">
              {['Refund help', 'Flight issue', 'Hotel query', 'Itinerary'].map(q => (
                <button
                  key={q}
                  onClick={() => sendChat(q)}
                  className="shrink-0 text-[11px] font-bold px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#EA580C] hover:bg-[#EA580C] hover:text-white transition-all cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-[#E8E0D8] flex gap-2">
              <input
                className="input-field text-xs py-2 flex-1"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendChat()}
              />
              <button
                onClick={() => sendChat()}
                disabled={!chatInput.trim()}
                className="p-2.5 rounded-xl bg-[#EA580C] text-white hover:bg-[#C2410C] disabled:opacity-40 transition-all cursor-pointer"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EMERGENCY MODAL ── */}
      {showEmergency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs" onClick={() => setShowEmergency(false)}>
          <div className="bg-white rounded-3xl border border-red-200 shadow-2xl w-full max-w-md p-6 sm:p-8 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mx-auto mb-3">
                <AlertTriangle size={32} />
              </div>
              <h2 className="font-extrabold text-xl text-slate-900 mb-1">Emergency Support 24/7</h2>
              <p className="text-slate-500 text-xs">Immediate help for critical travel emergencies</p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { label: 'Emergency Phone Hotline', value: '+91 6301158175', icon: <Phone size={18} className="text-red-600" />, href: 'tel:+916301158175' },
                { label: 'WhatsApp Emergency Support', value: '+91 6301158175', icon: <MessageSquare size={18} className="text-green-600" />, href: 'https://wa.me/916301158175?text=Emergency%20Travel%20Support' },
                { label: 'Urgent Email', value: 'rana@tripsage.in', icon: <Mail size={18} className="text-blue-600" />, href: 'mailto:rana@tripsage.in?subject=URGENT: Travel Emergency' },
              ].map(c => (
                <a
                  key={c.label}
                  href={c.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 bg-slate-50 rounded-2xl p-4 hover:border-red-300 border border-slate-200 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-2xs shrink-0">
                    {c.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{c.label}</p>
                    <p className="font-extrabold text-slate-800 text-xs sm:text-sm truncate group-hover:text-red-600 transition-colors">{c.value}</p>
                  </div>
                  <ArrowRight size={14} className="text-slate-400 group-hover:text-red-600 transition-colors shrink-0" />
                </a>
              ))}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-xs text-red-700 mb-5 leading-relaxed">
              <span className="font-extrabold">Note:</span> For medical emergencies or immediate physical danger, please contact local emergency services (112 in India) first.
            </div>

            <button
              onClick={() => setShowEmergency(false)}
              className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
