import { buildDays } from '@/data/dayPath'

export function makeGate(config) {
  const { tasks, boss, ...gate } = config
  return {
    ...gate,
    days: buildDays(gate.id, tasks),
    bossTrial: {
      id: `${gate.id}-boss`,
      ...boss,
    },
  }
}
