import { ATTRIBUTE_IDS, DIFFICULTY, SCHEMA_VERSION } from '@/config/constants'
import { getGateById, getGateByPosition, getQuest } from '@/data/catalog'
import { createGateProgress, createPlayer, createProgress, createSettings, emptyAttributes } from '@/domain/models'
import { evaluateAchievements, evaluateTitles } from '@/services/progression/achievements'
import { evaluateGateCompletion } from '@/services/progression/mastery'
import { evaluateReflection } from '@/services/progression/reflection'
import { GMP } from '@/config/gmp'
import { applyRitualAction } from '@/services/progression/ritual'
import { applyStreak } from '@/services/progression/streak'
import { nextGatePosition } from '@/services/progression/unlocks'
import { levelFromXp, scaleXp } from '@/services/progression/xp'
import { todayKey } from '@/utils/dates'
import { createId } from '@/utils/ids'
import { sanitizePlainText } from '@/utils/sanitize'

function clone(value) {
  return structuredClone(value)
}

function addAttributes(target, delta = {}) {
  for (const id of ATTRIBUTE_IDS) {
    if (delta[id]) target[id] = Math.min(100, (target[id] || 0) + delta[id])
  }
}

function pushEvent(progress, event) {
  progress.events.unshift({
    id: createId('event'),
    timestamp: new Date().toISOString(),
    ...event,
  })
  progress.events = progress.events.slice(0, 400)
}

function ensureGate(progress, gateId) {
  if (!progress.gates[gateId]) {
    progress.gates[gateId] = createGateProgress(gateId)
  }
  return progress.gates[gateId]
}

function applyRewards(player, rewards = {}, difficulty) {
  const xp = scaleXp(rewards.xp || 0, difficulty)
  player.xp += xp
  player.mp += rewards.mp || 0
  player.sp = Math.max(0, player.sp + (rewards.sp || 0))
  player.ap += rewards.ap || 0
  player.dp += rewards.dp || 0
  player.kp += rewards.kp || 0
  player.cp += rewards.cp || 0
  return { ...rewards, xp }
}

function classifyQuest(type) {
  return {
    knowledge: type === 'knowledge',
    listening: type === 'social',
    observation: type === 'observation',
  }
}

export function createInitialState(awakening) {
  const player = createPlayer(awakening)
  const settings = createSettings(awakening)
  const progress = createProgress()
  const first = getGateByPosition('beast', 1)
  progress.gates[first.id] = createGateProgress(first.id)
  settings.awakeningComplete = true
  return {
    schemaVersion: SCHEMA_VERSION,
    player,
    settings,
    progress,
  }
}

// Applies a COMPLETED decision exactly once (guarded by completedAt), then unlocks, titles and achievements.
function settle(next, gate, gateRecord) {
  const evaluation = evaluateGateCompletion(next, gate.id)
  const { mastery, signals } = evaluation
  const gateFinished = evaluation.status === 'COMPLETED'
  let unlockedGate = null
  let ascension = null
  const context = {}

  if (gateFinished && !gateRecord.completedAt) {
    gateRecord.completedAt = new Date().toISOString()
    context.gateAchievementId = gate.achievementId
    if (next.progress.streak.current >= 7) context.gateCompletedWithStreak = true
    const onward = nextGatePosition(gate.arcana, gate.gateNumber)
    if (onward) {
      const nextGate = getGateByPosition(onward.arcana, onward.gateNumber)
      const nextRecord = ensureGate(next.progress, nextGate.id)
      nextRecord.unlocked = true
      next.player.currentArcana = onward.arcana
      next.player.currentGate = onward.gateNumber
      unlockedGate = nextGate
      if (gate.titleReward && !next.player.titles.includes(gate.titleReward)) {
        next.player.titles.push(gate.titleReward)
      }
      if (onward.arcana !== gate.arcana) {
        if (onward.arcana === 'human' && !next.player.titles.includes('The Seeker')) {
          next.player.titles.push('The Seeker')
        }
        if (onward.arcana === 'sage' && !next.player.titles.includes('The Illuminated')) {
          next.player.titles.push('The Illuminated')
        }
      }
      ascension = {
        kind: onward.arcana !== gate.arcana ? 'arcana' : 'gate',
        from: gate,
        to: nextGate,
        title: gate.titleReward,
        attributes: { ...next.player.attributes },
      }
    } else {
      if (!next.player.titles.includes('The Sage')) next.player.titles.push('The Sage')
      ascension = {
        kind: 'complete',
        from: gate,
        to: null,
        title: 'The Sage',
        attributes: { ...next.player.attributes },
      }
    }
  }

  const newAchievements = evaluateAchievements(next, context)
  next.player.achievements.push(...newAchievements)
  const newTitles = evaluateTitles(next.player, next.progress, newAchievements)
  for (const title of newTitles) {
    if (!next.player.titles.includes(title)) next.player.titles.push(title)
  }

  return { mastery, signals, evaluation, unlockedGate, ascension, newAchievements, newTitles }
}

export function getGateMastery(state, gateId) {
  const evaluation = evaluateGateCompletion(state, gateId)
  return { mastery: evaluation.mastery, signals: evaluation.signals, evaluation }
}

export function completeQuest(state, { questId, gateId, reflection, durationMinutes, dateKey, viaRitual }) {
  const next = clone(state)
  const found = getQuest(gateId, questId)
  if (!found) {
    return { ok: false, error: 'missing-quest', state }
  }
  // Check BEFORE ensureGate: ensureGate would silently create (and unlock) a record for any Gate id.
  if (!state.progress.gates[gateId]?.unlocked) {
    return { ok: false, error: 'locked-gate', state }
  }

  const dayKey = dateKey || todayKey()
  const gateRecord = ensureGate(next.progress, gateId)
  if (!gateRecord.unlocked && gateId !== 'beast-01') {
    return { ok: false, error: 'locked-gate', state }
  }

  const text = sanitizePlainText(reflection || '')
  const minutes = Math.max(0, Number(durationMinutes) || found.quest.durationMinutes || 0)
  const difficulty = next.settings.difficulty || 'standard'

  if (found.kind === 'boss') {
    // The final trial is a ritual (see ritualAction); it cannot be ticked off like a quest.
    if (!viaRitual) return { ok: false, error: 'ritual-required', state }
    if (gateRecord.bossCompletedAt) {
      return { ok: false, error: 'already-complete', state }
    }
    gateRecord.bossCompletedAt = new Date().toISOString()
    if (text) {
      gateRecord.days.boss = {
        completedAt: gateRecord.bossCompletedAt,
        completedDate: dayKey,
        reflection: text,
        phase: 'trial',
      }
    }
  } else {
    const day = found.quest
    if (gateRecord.days[day.day]?.completedAt) {
      return { ok: false, error: 'already-complete', state }
    }
    if (day.day > 1 && !gateRecord.days[day.day - 1]?.completedAt) {
      return { ok: false, error: 'stage-locked', state }
    }
    if (found.gate.days.filter((d) => gateRecord.days[d.day]?.completedDate === dayKey).length >= GMP.maxStagesPerDay) {
      return { ok: false, error: 'daily-stage-limit', state }
    }
    if (!gateRecord.startedAt) gateRecord.startedAt = new Date().toISOString()
    gateRecord.days[day.day] = {
      completedAt: new Date().toISOString(),
      completedDate: dayKey,
      reflection: text,
      phase: day.phase,
      questId: day.id,
      minutes,
      evidence: evaluateReflection(text, { gate: found.gate, phase: day.phase, others: found.gate.days.map((d) => gateRecord.days[d.day]?.reflection || '') }),
    }
  }

  const applied = applyRewards(next.player, found.quest.rewards, difficulty)
  addAttributes(next.player.attributes, found.quest.attributes)
  gateRecord.mp += found.quest.rewards?.mp || 0

  next.progress.questsCompleted += 1
  next.progress.practiceMinutes += minutes
  next.progress.longestFocusMinutes = Math.max(next.progress.longestFocusMinutes, minutes)

  const flags = classifyQuest(found.quest.type)
  if (found.kind === 'boss' && found.gate.relatedAttributes.includes('focus')) {
    next.progress.longestFocusMinutes = Math.max(next.progress.longestFocusMinutes, minutes)
  }
  if (flags.knowledge || found.quest.type === 'knowledge') next.progress.knowledgeQuests += 1
  if (flags.listening || found.gate.characteristic === 'Listening' || found.quest.type === 'social') {
    next.progress.listeningPractices += 1
  }
  if (flags.observation || found.quest.type === 'observation') next.progress.observationQuests += 1

  const streakResult = applyStreak(next.progress.streak, dayKey, next.settings.availableDays)
  next.progress.streak = streakResult.streak
  if (streakResult.kind === 'returned') {
    next.progress.missedThenReturned = true
    next.player.sp += 2
  } else if (streakResult.kind === 'continued' || streakResult.kind === 'started') {
    next.player.sp += 1
  }

  if (text.length >= 12) {
    next.progress.reflections.unshift({
      id: createId('reflection'),
      gateId,
      questId,
      text,
      at: new Date().toISOString(),
      dateKey: dayKey,
    })
  }

  next.player.attributeHistory.push({
    at: new Date().toISOString(),
    attributes: { ...next.player.attributes },
  })
  next.player.attributeHistory = next.player.attributeHistory.slice(-120)

  const { mastery, signals, evaluation, unlockedGate, ascension, newAchievements, newTitles } = settle(next, found.gate, gateRecord)

  const level = levelFromXp(next.player.xp)
  pushEvent(next.progress, {
    type: found.kind === 'boss' ? 'BOSS_COMPLETED' : 'TASK_COMPLETED',
    taskId: questId,
    gateId,
    rewards: applied,
    mastery,
    minutes,
  })

  return {
    ok: true,
    state: next,
    rewards: applied,
    attributes: found.quest.attributes || {},
    mastery,
    signals,
    evaluation,
    unlockedGate,
    achievements: newAchievements,
    titles: newTitles,
    ascension,
    streak: streakResult,
    level,
    interrupted: streakResult.kind === 'returned',
  }
}

export function enterGate(state, gateId) {
  const next = clone(state)
  const gate = getGateById(gateId)
  if (!gate) return { ok: false, error: 'missing-gate', state }
  const record = next.progress.gates[gateId]
  if (!record?.unlocked) return { ok: false, error: 'locked-gate', state }
  if (!record.startedAt) record.startedAt = new Date().toISOString()
  next.player.currentArcana = gate.arcana
  next.player.currentGate = gate.gateNumber
  pushEvent(next.progress, { type: 'GATE_ENTERED', gateId })
  return { ok: true, state: next, gate }
}

export function upsertReflection(state, { id, text, gateId, dateKey }) {
  const next = clone(state)
  const clean = sanitizePlainText(text)
  if (id) {
    const existing = next.progress.reflections.find((item) => item.id === id)
    if (!existing) return { ok: false, error: 'missing-reflection', state }
    existing.text = clean
    existing.updatedAt = new Date().toISOString()
  } else {
    next.progress.reflections.unshift({
      id: createId('reflection'),
      gateId: gateId || null,
      text: clean,
      at: new Date().toISOString(),
      dateKey: dateKey || todayKey(),
    })
  }
  return { ok: true, state: next }
}

export function deleteReflection(state, id) {
  const next = clone(state)
  next.progress.reflections = next.progress.reflections.filter((item) => item.id !== id)
  return { ok: true, state: next }
}

export function saveDailyPlan(state, { dateKey, plan }) {
  const next = clone(state)
  next.progress.dailyPlans[dateKey] = plan
  pushEvent(next.progress, { type: 'PLAN_SAVED', dateKey })
  return { ok: true, state: next }
}

export function validateLoadedState(data) {
  if (!data || data.schemaVersion !== SCHEMA_VERSION) return false
  if (!data.player?.id || !data.player?.name) return false
  if (!data.progress || !data.settings) return false
  if (!data.player.attributes) data.player.attributes = emptyAttributes()
  return true
}

export { DIFFICULTY, levelFromXp }

function resultFrom(next, settled) {
  return {
    ok: true, state: next, rewards: {}, attributes: {}, mastery: settled.mastery, signals: settled.signals, evaluation: settled.evaluation,
    unlockedGate: settled.unlockedGate, achievements: settled.newAchievements, titles: settled.newTitles, ascension: settled.ascension,
    streak: { kind: 'same-day' }, level: levelFromXp(next.player.xp), interrupted: false,
  }
}

/** Revise a stage reflection (evidence “needs revision” → accepted). May complete the Gate; never awards XP. */
export function reviseEvidence(state, { gateId, day, text }) {
  const gate = getGateById(gateId)
  if (!gate || !state.progress.gates[gateId]?.days?.[day]?.completedAt) return { ok: false, error: 'missing-stage', state }
  const next = clone(state)
  const record = next.progress.gates[gateId]
  const stage = gate.days.find((d) => d.day === day)
  const clean = sanitizePlainText(text || '')
  const others = gate.days.filter((d) => d.day !== day).map((d) => record.days[d.day]?.reflection || '')
  record.days[day] = { ...record.days[day], reflection: clean, evidence: evaluateReflection(clean, { gate, phase: stage.phase, others }), revisedAt: new Date().toISOString(), revisedDate: todayKey() }
  const entry = next.progress.reflections.find((r) => r.questId === stage.id)
  if (entry) Object.assign(entry, { text: clean, updatedAt: new Date().toISOString() })
  else if (clean.length >= 12) next.progress.reflections.unshift({ id: createId('reflection'), gateId, questId: stage.id, text: clean, at: new Date().toISOString(), dateKey: todayKey() })
  pushEvent(next.progress, { type: 'REFLECTION_REVISED', gateId, day })
  return { ...resultFrom(next, settle(next, gate, record)), evidence: record.days[day].evidence }
}

/**
 * One entry point for the final ritual (prepare/start/pause/resume/abandon/finish).
 * The first valid finish pays out exactly once through the normal boss path; a later, better attempt only improves the score.
 */
export function ritualAction(state, { gateId, action, payload = {}, now = Date.now(), dateKey }) {
  const gate = getGateById(gateId)
  if (!gate) return { ok: false, error: 'missing-gate', state }
  if (!state.progress.gates[gateId]?.unlocked) return { ok: false, error: 'locked-gate', state }
  const next = clone(state)
  const record = ensureGate(next.progress, gateId)
  const safe = { ...payload }
  for (const k of ['task', 'intention', 'note', 'reflection']) if (k in safe) safe[k] = sanitizePlainText(safe[k] || '')
  const r = applyRitualAction(record, gate, action, safe, now)
  if (!r.ok) return { ...r, state }
  pushEvent(next.progress, { type: `RITUAL_${action.toUpperCase()}`, gateId })
  if (action !== 'finish') return { ok: true, state: next }
  if (!record.bossCompletedAt) {
    return completeQuest(next, { gateId, questId: gate.bossTrial.id, reflection: r.attempt.reflection, durationMinutes: r.attempt.activeMinutes, dateKey, viaRitual: true })
  }
  return resultFrom(next, settle(next, gate, record))
}
