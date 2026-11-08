import { getGateByPosition } from '@/data/catalog'
import { todayKey, addDays } from '@/utils/dates'

export function generateDailyPlan(state, dateKey = todayKey()) {
  const existing = state.progress.dailyPlans[dateKey]
  if (existing) return existing

  const gate = getGateByPosition(state.player.currentArcana, state.player.currentGate)
  const record = state.progress.gates[gate.id] || { days: {} }
  const nextDay = gate.days.find((day) => !record.days[day.day]?.completedAt)
  const duration = state.settings.dailyDuration || 25

  const main = nextDay
    ? {
        id: nextDay.id,
        title: `Day ${nextDay.day} — ${nextDay.title}`,
        task: nextDay.task,
        minutes: Math.min(duration, nextDay.durationMinutes),
        kind: 'main',
      }
    : record.bossCompletedAt
      ? null
      : {
          id: gate.bossTrial.id,
          title: gate.bossTrial.title,
          task: gate.bossTrial.description,
          minutes: Math.min(Math.max(duration, 40), gate.bossTrial.durationMinutes),
          kind: 'boss',
        }

  return {
    dateKey,
    morning: main,
    afternoon: {
      title: 'Secondary Quest',
      task: 'Notice one live example of this Gate’s weakness in the wild. Do not lecture it. Record it later.',
      minutes: Math.max(10, Math.round(duration * 0.4)),
      kind: 'secondary',
    },
    evening: {
      title: 'Reflection',
      task: gate.days[6]?.prompt || 'What did today’s practice reveal?',
      minutes: 10,
      kind: 'reflection',
    },
  }
}

export function defaultTomorrowDraft(state) {
  return generateDailyPlan(state, addDays(todayKey(), 1))
}
