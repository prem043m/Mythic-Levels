import { useEffect } from 'react'
import { isAvailableOn } from '@/services/settings/settings'

// Fires a browser notification at the chosen time on the next available practice day.
// Limitation: only works while the app is open in a tab (no push service).
export function useReminder(settings) {
  const on = settings?.reminders
  const time = settings?.reminderTime || '18:00'
  const days = settings?.availableDays?.join(',')
  useEffect(() => {
    if (!on || typeof Notification === 'undefined' || Notification.permission !== 'granted') return undefined
    const [h, m] = time.split(':').map(Number)
    const next = new Date()
    next.setHours(h, m, 0, 0)
    if (next <= new Date()) next.setDate(next.getDate() + 1)
    for (let i = 0; i < 7 && !isAvailableOn(settings, next); i += 1) next.setDate(next.getDate() + 1)
    const id = setTimeout(() => new Notification('Mythic Levels', { body: 'Your practice is waiting.' }), next - new Date())
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [on, time, days])
}
