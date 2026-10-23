import { Metadata } from 'next'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Sparkles, Zap, Map, PiggyBank, HeadphonesIcon, BellRing, CheckCircle, ChevronDown } from 'lucide-react'

export const metadata: Metadata = {
  title: 'How TripSage Works | TripSage',
  description: 'Learn how TripSage uses AI to generate personalized itineraries, find the best deals, and orchestrate your entire travel experience.',
  alternates: {
    canonical: 'https://www.tripsage.in/learn-more'
  }
}

export default function LearnMorePage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 md:px-6 overflow-hidden bg-white">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 mb-6">
            How <span className="text-blue-600">TripSage</span> Works
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            An AI draft for one route: a day-by-day plan, a rupee estimate, and visa notes for Indian passports.
          </p>
        </div>
      </section>

      {/* What is TripSage */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-slate-100">
            <h2 className="text-3xl font-bold text-slate-900 mb-6 text-center">What is TripSage?</h2>
            <p className="text-lg text-slate-600 leading-relaxed text-center max-w-4xl mx-auto">
              TripSage drafts a day-by-day plan for one departure city and one destination, with rupee estimates and visa notes for Indian passports. It does not search live flights or hotels, and it does not book travel.
            </p>
          </div>
        </div>
      </section>

      {/* 4 Step Process */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-16 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
            {[
              { step: '1', title: 'Tell us your plan', desc: 'Enter your destination, dates, budget, and travel style.' },
              { step: '2', title: 'AI Generation', desc: 'Our AI analyzes millions of data points to craft your ideal itinerary.' },
              { step: '3', title: 'Customize', desc: 'Review, tweak, and perfect your plan with our interactive maps and tools.' },
              { step: '4', title: 'Book yourself', desc: 'Use the draft as a starting point, then book flights and hotels on the airline or hotel site.' },
            ].map((s, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-sm border border-blue-100">
                  {s.step}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-600">{s.desc}</p>
                {i < 3 && <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-blue-50 -z-10"></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Features Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Sparkles, title: 'AI Personalization', desc: 'Tailored itineraries matching your exact vibe and budget.' },
              { icon: Zap, title: 'Rupee estimates', desc: 'Cost figures in the draft are estimates, not live fares.' },
              { icon: Map, title: 'Smart Maps', desc: 'Interactive routing and visual day-by-day exploration.' },
              { icon: PiggyBank, title: 'Budget Optimization', desc: 'Smart algorithms to maximize value for every dollar spent.' },
              { icon: BellRing, title: 'No fare alerts', desc: 'TripSage does not watch fares or send price-drop alerts.' },
              { icon: HeadphonesIcon, title: 'Support', desc: 'Questions about the planner can go through the support page.' },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition-all hover:shadow-md">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                  <f.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why TripSage Comparison */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Why TripSage?</h2>
          <div className="overflow-x-auto rounded-[2rem] border border-slate-100 shadow-sm">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="py-6 px-8 text-lg font-bold text-slate-900">Feature</th>
                  <th className="py-6 px-8 text-lg font-bold text-blue-600 bg-blue-50/50">TripSage</th>
                  <th className="py-6 px-8 text-lg font-bold text-slate-500">Others</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {[
                  ['Instant AI Itineraries', true, false],
                  ['Rupee cost estimates', true, false],
                  ['Interactive Maps', true, true],
                  ['Budget Optimization', true, false],
                  ['Personalized Style Matching', true, false],
                ].map((row, i) => (
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-8 text-slate-700 font-medium">{row[0]}</td>
                    <td className="py-5 px-8 bg-blue-50/20">
                      {row[1] ? <CheckCircle className="text-blue-500 w-6 h-6" /> : <span className="text-slate-300 font-bold">-</span>}
                    </td>
                    <td className="py-5 px-8">
                      {row[2] ? <CheckCircle className="text-slate-400 w-6 h-6" /> : <span className="text-slate-300 font-bold">-</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Is TripSage free to use?', a: 'Yes. TripSage is free to use.' },
              { q: 'How does the AI create itineraries?', a: 'The planner writes a day-by-day draft from one departure city, one destination, and your dates. It does not use live flight or hotel prices.' },
              { q: 'Can I book flights and hotels directly?', a: 'Not on TripSage. Book on the airline or hotel site. The planner does not take payment.' },
              { q: 'Can I share my itinerary with friends?', a: 'A share action copies a link to the planner. It does not send your personal itinerary to someone else.' },
              { q: 'What happens if my plans change?', a: 'TripSage itineraries are fully customizable. You can adjust dates, swap activities, or regenerate specific days at any time.' },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-slate-900 text-lg">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  </span>
                </summary>
                <div className="text-slate-600 p-6 pt-0 leading-relaxed text-[15px]">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 md:px-6 bg-white text-center flex-grow flex flex-col justify-center">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-8">Ready to plan your next adventure?</h2>
          <Link href="/">
            <button className="btn-primary py-4 px-10 text-xl font-bold rounded-full transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/30">
              Start Planning Free
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
