'use client'

import { useTripStore } from '@/store/tripStore'

interface Props {
  onClose: () => void
}

const TYPE_ICONS: Record<string, string> = {
  info: '💬', alert: '⚠️', deal: '💰', weather: '🌦️'
}

const TYPE_COLORS: Record<string, string> = {
  info: 'badge-green', alert: 'badge-red', deal: 'badge-amber', weather: 'badge-green'
}

export default function NotificationsPanel({ onClose }: Props) {
  const { notifications, markNotifRead } = useTripStore()

  const unread = notifications.filter(n => !n.read)
  const read = notifications.filter(n => n.read)

  return (
    <div className="glass-dark rounded-2xl border border-[var(--border)] shadow-2xl overflow-hidden w-80">
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div>
          <h3 className="font-bold text-sm text-[var(--text-primary)]">🔔 Notifications</h3>
          {unread.length > 0 && (
            <p className="text-xs text-[var(--text-muted)]">{unread.length} unread</p>
          )}
        </div>
        <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-lg">
          ✕
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-3xl mb-2">🔕</div>
            <p className="text-[var(--text-muted)] text-sm">No notifications yet</p>
            <p className="text-[var(--text-muted)] text-xs mt-1">Updates will appear here in real-time</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map(n => (
              <div
                key={n.id}
                className={`p-4 cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors ${!n.read ? 'bg-[rgba(0,194,124,0.03)]' : ''}`}
                onClick={() => markNotifRead(n.id)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{TYPE_ICONS[n.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{n.title}</p>
                      {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--primary)] flex-shrink-0"></span>}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-[0.65rem] text-[var(--text-muted)] mt-1 font-mono">
                      {new Date(n.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[var(--border)] flex items-center gap-2 text-xs text-[var(--text-muted)]">
        <span className="live-dot"></span>
        <span className="font-mono">Real-time updates active</span>
      </div>
    </div>
  )
}
