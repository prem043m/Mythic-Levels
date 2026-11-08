import { ACHIEVEMENTS, TITLES } from '@/data/achievements'
import { getGateById, getGateByPosition } from '@/data/catalog'

function has(player, id) {
  return player.achievements.includes(id)
}

export function evaluateAchievements(state, context = {}) {
  const unlocked = []
  const { player, progress } = state

  const checks = {
    'first-flame': () => progress.questsCompleted >= 1,
    'the-return': () => progress.missedThenReturned,
    'silent-hour': () => progress.longestFocusMinutes >= 60,
    'the-listener': () => progress.listeningPractices >= 10,
    'the-scholar': () => progress.knowledgeQuests >= 20,
    'the-forge': () => Boolean(context.gateCompletedWithStreak),
    'the-ascent': () => Boolean(progress.gates['beast-09']?.completedAt),
    watcher: () => progress.observationQuests >= 7,
    'first-reflection': () => progress.reflections.length >= 1,
    'week-keeper': () => progress.streak.current >= 7 || progress.streak.longest >= 7,
    'beast-complete': () => Boolean(progress.gates['beast-09']?.completedAt),
    'human-complete': () => Boolean(progress.gates['human-09']?.completedAt),
    'sage-complete': () => Boolean(progress.gates['sage-09']?.completedAt),
    'gremlin-mastered': () => Boolean(progress.gates['beast-01']?.bossCompletedAt),
    'troll-mastered': () => Boolean(progress.gates['beast-02']?.bossCompletedAt),
    'twenty-quests': () => progress.questsCompleted >= 20,
    'hundred-minutes': () => progress.practiceMinutes >= 100,
  }

  for (const achievement of ACHIEVEMENTS) {
    const test = checks[achievement.id]
    if (test && test() && !has(player, achievement.id)) {
      unlocked.push(achievement.id)
    }
  }

  if (context.gateAchievementId && !has(player, context.gateAchievementId) && !unlocked.includes(context.gateAchievementId)) {
    unlocked.push(context.gateAchievementId)
  }

  return unlocked
}

export function evaluateTitles(player, progress, newAchievements = []) {
  const owned = new Set(player.titles)
  const unlocked = []
  const achievements = new Set([...player.achievements, ...newAchievements])

  const humanStarted = Boolean(progress.gates['human-01']?.unlocked || progress.gates['beast-09']?.completedAt)

  for (const title of TITLES) {
    if (owned.has(title.name)) continue
    let ok = false
    if (title.id === 'the-awakening' || title.id === 'the-human') ok = true
    if (title.achievementId && achievements.has(title.achievementId)) ok = true
    if (title.id === 'the-seeker' && humanStarted) ok = true
    if (title.id === 'the-wanderer' && (progress.gates['beast-06']?.completedAt || progress.gates['human-06']?.completedAt)) {
      ok = true
    }
    if (ok) unlocked.push(title.name)
  }
  return unlocked
}

export function currentGateRecord(state) {
  const gate = getGateByPosition(state.player.currentArcana, state.player.currentGate)
  return gate
}

export function gateTitle(gateId) {
  return getGateById(gateId)?.titleReward || null
}
