import { ATTRIBUTE_IDS } from '@/config/constants'
import { createId } from '@/utils/ids'

export function emptyAttributes() {
  return ATTRIBUTE_IDS.reduce((acc, id) => {
    acc[id] = 0
    return acc
  }, {})
}

export function createPlayer(input) {
  const now = new Date().toISOString()
  return {
    id: createId('player'),
    name: input.name.trim(),
    title: (input.title || 'The Human').trim(),
    createdAt: now,
    currentArcana: 'beast',
    currentGate: 1,
    xp: 0,
    mp: 0,
    sp: 0,
    ap: 0,
    dp: 0,
    kp: 0,
    cp: 0,
    attributes: emptyAttributes(),
    attributeHistory: [{ at: now, attributes: emptyAttributes() }],
    achievements: [],
    titles: ['The Awakening'],
    avatar: input.avatar || 'lantern',
    primaryGoal: input.primaryGoal || '',
    currentRoutine: input.currentRoutine || '',
    improveAreas: input.improveAreas || [],
  }
}

export function createSettings(input = {}) {
  return {
    difficulty: input.difficulty || 'standard',
    dailyDuration: Number(input.dailyDuration) || 25,
    availableDays: input.availableDays?.length
      ? input.availableDays
      : ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
    reminders: Boolean(input.reminders),
    masteryThreshold: 0.7,
    soundEnabled: false,
    awakeningComplete: false,
    ceremonySkipped: false,
  }
}

export function createProgress() {
  return {
    gates: {},
    questsCompleted: 0,
    knowledgeQuests: 0,
    listeningPractices: 0,
    observationQuests: 0,
    longestFocusMinutes: 0,
    practiceMinutes: 0,
    reflections: [],
    events: [],
    dailyPlans: {},
    streak: {
      current: 0,
      longest: 0,
      lastActiveDate: null,
      interrupted: false,
    },
    missedThenReturned: false,
  }
}

export function createGateProgress(gateId) {
  return {
    gateId,
    unlocked: true,
    startedAt: null,
    completedAt: null,
    days: {},
    bossCompletedAt: null,
    mp: 0,
  }
}
