const PHASES = [
  { day: 1, phase: 'recognition', title: 'Recognition', type: 'observation', xp: 22 },
  { day: 2, phase: 'observation', title: 'Observation', type: 'observation', xp: 24 },
  { day: 3, phase: 'practice', title: 'Practice', type: 'practice', xp: 30 },
  { day: 4, phase: 'resistance', title: 'Resistance', type: 'practice', xp: 32 },
  { day: 5, phase: 'application', title: 'Application', type: 'daily', xp: 34 },
  { day: 6, phase: 'challenge', title: 'Challenge', type: 'practice', xp: 40 },
  { day: 7, phase: 'trial', title: 'Reflection & Trial', type: 'reflection', xp: 36 },
]

export function buildDays(gateId, entries, extra = {}) {
  return PHASES.map((phase, index) => {
    const entry = entries[index]
    return {
      id: `${gateId}-day-${phase.day}`,
      day: phase.day,
      phase: phase.phase,
      title: phase.title,
      type: entry.type || phase.type,
      objective: entry.objective,
      explanation: entry.explanation,
      task: entry.task,
      durationMinutes: entry.durationMinutes,
      xp: entry.xp || phase.xp,
      rewards: entry.rewards,
      attributes: entry.attributes,
      prompt: entry.prompt,
      ...extra,
    }
  })
}
