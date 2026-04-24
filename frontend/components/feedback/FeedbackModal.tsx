'use client'

import { useState } from 'react'
import { useTripStore } from '@/store/tripStore'
import toast from 'react-hot-toast'

const TAGS = ['Transport', 'Hotel', 'Activities', 'Food', 'Safety', 'Value for Money', 'AI Itinerary']

interface Props {
  onClose: () => void
}

export default function FeedbackModal({ onClose }: Props) {
  const { submitFeedback, tripContext, addNotification } = useTripStore()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  const toggleTag = (tag: string) =>
    setTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please give a star rating'); return }
    if (!feedback.trim()) { toast.error('Please share your experience'); return }
    if (tags.length === 0) { toast.error('Select at least one experience tag'); return }

    setSubmitting(true)
    await new Promise(r => setTimeout(r, 800))

    submitFeedback({ rating, feedback, experienceTags: tags })

    addNotification({
      id: Date.now().toString(), type: 'info',
      title: '💬 Feedback Submitted',
      message: `${rating}⭐ — Thank you for your review of ${tripContext.destination}!`,
      timestamp: new Date().toISOString(), read: false,
    })

    toast.success('Thank you for your feedback! 🙏')
    setSubmitting(false)
    onClose()
  }

  const labels = ['', 'Terrible', 'Poor', 'Okay', 'Great', 'Amazing!']
  const colors = ['', 'text-red-400', 'text-orange-400', 'text-yellow-400', 'text-blue-400', 'text-green-400']

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="glass-dark rounded-2xl border border-[var(--border)] shadow-2xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="p-6 border-b border-[var(--border)] text-center">
          <div className="text-4xl mb-2">🌟</div>
          <h2 className="font-bold text-xl text-[var(--text-primary)]">How was your trip?</h2>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            {tripContext.destination && `Rate your experience in ${tripContext.destination}`}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Star rating */}
          <div className="text-center">
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3 font-mono">Your Rating</p>
            <div className="flex items-center justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map(s => (
                <button
                  key={s}
                  onMouseEnter={() => setHovered(s)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(s)}
                  className="text-4xl transition-transform hover:scale-125"
                >
                  <span className={s <= (hovered || rating) ? 'text-yellow-400' : 'text-[var(--border)]'}>★</span>
                </button>
              ))}
            </div>
            {(hovered || rating) > 0 && (
              <p className={`text-sm font-semibold ${colors[hovered || rating]}`}>
                {labels[hovered || rating]}
              </p>
            )}
          </div>

          {/* Experience tags */}
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-3 font-mono">What stood out? (select all that apply)</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map(tag => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    tags.includes(tag)
                      ? 'bg-[var(--primary)] text-white border-[var(--primary)]'
                      : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--primary)] hover:text-[var(--primary)]'
                  }`}
                >
                  {tags.includes(tag) ? '✓ ' : ''}{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Feedback text */}
          <div>
            <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-2 font-mono">Share your experience</p>
            <textarea
              className="input-field min-h-[100px] resize-none text-sm"
              placeholder="Tell us what you loved, what could be improved, and anything else about your trip..."
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
            />
            <p className="text-[0.65rem] text-[var(--text-muted)] mt-1">{feedback.length}/500 characters</p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-primary flex-1 py-3 disabled:opacity-50"
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Submitting...
                </span>
              ) : '🚀 Submit Feedback'}
            </button>
            <button onClick={onClose} className="btn-outline py-3 px-5 text-sm">
              Skip
            </button>
          </div>

          <p className="text-[0.65rem] text-[var(--text-muted)] text-center">
            Your feedback helps us improve future recommendations. No anonymous submissions.
          </p>
        </div>
      </div>
    </div>
  )
}
