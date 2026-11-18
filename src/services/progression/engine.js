import { ATTRIBUTE_IDS, AVATARS, DIFFICULTY, SCHEMA_VERSION } from '@/config/constants'
import { getArcana, getGateById, getGateByPosition, getQuest } from '@/data/catalog'
import { createGateProgress, createPlayer, createProgress, createSettings, emptyAttributes } from '@/domain/models'
import { evaluateAchievements, evaluateTitles } from '@/services/progression/achievements'
import { evaluateGateCompletion } from '@/services/progression/mastery'
import { evaluateSubmission, toEvidence, scaleAttributes, summarize, DECISION } from '@/services/evaluation/engine'
import { normalizeFields, narrativeOf } from '@/services/evaluation/protocol'
import { EVAL } from '@/config/evaluation'
import { GMP } from '@/config/gmp'
import { applyRitualAction } from '@/services/progression/ritual'
import { applyStreak } from '@/services/progression/streak'
import { nextGatePosition } from '@/services/progression/unlocks'
import { levelFromXp, scaleXp } from '@/services/progression/xp'
import { DAY_IDS } from '@/services/settings/settings'
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

export function completeQuest(state, { questId, gateId, reflection, submission, proposal, durationMinutes, dateKey }) {
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

  let text = sanitizePlainText(reflection || '')
  let stageEval = null
  const minutes = Math.max(0, Number(durationMinutes) || found.quest.durationMinutes || 0)
  const difficulty = next.settings.difficulty || 'standard'

  if (found.kind === 'boss') {
    // The final trial is a ritual (see ritualAction); it cannot be ticked off like a quest.
    if (gateRecord.bossCompletedAt) {
      return { ok: false, error: 'already-complete', state }
    }
    if (!Array.isArray(gateRecord.ritual?.attempts) || !gateRecord.ritual.attempts.some((attempt) => attempt?.status === 'completed')) {
      return { ok: false, error: 'ritual-required', state }
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
    // Evaluate BEFORE any reward or progress is applied. Only an ACCEPTED evaluation completes the stage.
    const fields = normalizeFields(submission, sanitizePlainText)
    const others = found.gate.days.filter((d) => d.day !== day.day).map((d) => gateRecord.days[d.day]?.reflection || '')
    stageEval = evaluateSubmission({ gate: found.gate, day, fields: fields || { reflection: text }, legacy: !fields, others, proposal })
    if (stageEval.decision !== DECISION.ACCEPTED) {
      const prev = gateRecord.drafts?.[day.day]
      ;(gateRecord.drafts ||= {})[day.day] = { fields: fields || { reflection: text }, evaluation: summarize(stageEval), attempts: (prev?.attempts || 0) + 1, updatedAt: new Date().toISOString() }
      pushEvent(next.progress, { type: 'SUBMISSION_EVALUATED', gateId, day: day.day, decision: stageEval.decision, quality: stageEval.qualityScore, confidence: stageEval.confidence })
      recordHistory(next.progress, { gateId, day: day.day, phase: day.phase, outcome: 'draft', attempts: (prev?.attempts || 0) + 1 }, stageEval)
      return { ok: false, error: 'not-accepted', decision: stageEval.decision, evaluation: summarize(stageEval), state: next }
    }
    text = stageEval.narrative
    const attempts = (gateRecord.drafts?.[day.day]?.attempts || 0) + 1
    if (gateRecord.drafts) delete gateRecord.drafts[day.day]
    recordHistory(next.progress, { gateId, day: day.day, phase: day.phase, outcome: 'accepted', attempts }, stageEval)
    if (!gateRecord.startedAt) gateRecord.startedAt = new Date().toISOString()
    gateRecord.days[day.day] = {
      completedAt: new Date().toISOString(),
      completedDate: dayKey,
      reflection: text,
      phase: day.phase,
      questId: day.id,
      minutes,
      evidence: toEvidence(stageEval),
      attempts,
      ...(fields ? { submission: fields } : {}),
    }
  }

  const applied = applyRewards(next.player, found.quest.rewards, difficulty)
  // Attribute development follows demonstrated quality; XP and resources stay participation-based.
  addAttributes(next.player.attributes, stageEval ? scaleAttributes(found.quest.attributes, stageEval.qualityScore) : found.quest.attributes)
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
    submissionEvaluation: stageEval && summarize(stageEval),
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

const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)
const isString = (value, allowEmpty = true) => typeof value === 'string' && (allowEmpty || value.trim().length > 0)
const isNumber = (value, min = -Infinity, max = Infinity) => typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max
const isInteger = (value, min = 0) => Number.isSafeInteger(value) && value >= min
const isRecord = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  try {
    const prototype = Object.getPrototypeOf(value)
    return prototype === Object.prototype || prototype === null
  } catch {
    return false
  }
}
const isOptional = (record, key, check) => !hasOwn(record, key) || check(record[key])
const isDateKey = (value) => {
  if (!isString(value) || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const timestamp = Date.parse(`${value}T00:00:00.000Z`)
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === value
}
const isTimestamp = (value) => isString(value) && /^\d{4}-\d{2}-\d{2}T/.test(value) && Number.isFinite(Date.parse(value))
const isNullableTimestamp = (value) => value === null || isTimestamp(value)
const isStringArray = (value) => Array.isArray(value)
  && Array.from({ length: value.length }, (_, i) => hasOwn(value, i) && isString(value[i])).every(Boolean)
const isNumericRecord = (value, min = -Infinity, max = Infinity) => isRecord(value)
  && Object.values(value).every((item) => isNumber(item, min, max))

function validAttributes(value) {
  return isRecord(value) && Object.entries(value).every(([id, score]) => ATTRIBUTE_IDS.includes(id) && isInteger(score, 0) && score <= 100)
}

function validEvidence(value) {
  if (!isRecord(value) || !['accepted', 'sealed', 'needs-revision', 'none'].includes(value.status)) return false
  if (!isOptional(value, 'score', (score) => isNumber(score, 0, 1))) return false
  if (!isOptional(value, 'quality', (quality) => isNumber(quality, 0, 100))) return false
  if (!isOptional(value, 'confidence', (confidence) => isNumber(confidence, 0, 1))) return false
  if (!isOptional(value, 'criteria', (criteria) => isRecord(criteria) && Object.values(criteria).every((item) => typeof item === 'boolean'))) return false
  if (!isOptional(value, 'dimensions', (dimensions) => isNumericRecord(dimensions, 0, 100))) return false
  if (!isOptional(value, 'feedback', isStringArray) || !isOptional(value, 'keys', isStringArray)) return false
  if (!isOptional(value, 'verification', (verification) => ['self-reported', 'self-reported-sealed'].includes(verification))) return false
  if (!isOptional(value, 'protocolVersion', (version) => isString(version, false))) return false
  for (const key of ['rubric', 'evaluator']) {
    if (!isOptional(value, key, (meta) => isRecord(meta)
      && Object.values(meta).every((item) => isString(item)))) return false
  }
  return true
}

function validEvaluationSummary(value) {
  if (!isRecord(value)) return false
  if (!isOptional(value, 'decision', (decision) => [...Object.values(DECISION), 'SEALED'].includes(decision))) return false
  if (!isOptional(value, 'qualityScore', (score) => isNumber(score, 0, 100))) return false
  if (!isOptional(value, 'confidence', (confidence) => isNumber(confidence, 0, 1))) return false
  if (!isOptional(value, 'dimensions', (dimensions) => isNumericRecord(dimensions, 0, 100))) return false
  if (!isOptional(value, 'missingCriteria', (items) => Array.isArray(items) && items.every((item) => isRecord(item)
    && isString(item.id, false) && isOptional(item, 'reason', (reason) => isString(reason, false))))) return false
  if (!isOptional(value, 'feedback', isStringArray) || !isOptional(value, 'verification', (item) => isString(item))) return false
  if (!isOptional(value, 'evaluator', (meta) => isRecord(meta) && Object.values(meta).every((item) => isString(item)))) return false
  return true
}

function validSubmission(value) {
  return isRecord(value) && Object.values(value).every((item) => isString(item))
}

function validReflectionEvidence(value) {
  return isRecord(value)
    && value.status === 'accepted'
    && isNumber(value.score, 0, 1)
    && isRecord(value.criteria)
    && Object.values(value.criteria).every((item) => typeof item === 'boolean')
    && isStringArray(value.feedback)
    && isStringArray(value.keys)
    && isOptional(value, 'signals', (signals) => isRecord(signals)
      && Object.entries(signals).every(([key, item]) => isString(key, false) && isNumber(item, 0)))
}

function validStageRecord(value, gate, day) {
  if (!isRecord(value) || !isTimestamp(value.completedAt) || !isDateKey(value.completedDate)) return false
  if (!isOptional(value, 'phase', (phase) => phase === day.phase)) return false
  if (!isOptional(value, 'questId', (questId) => questId === day.id)) return false
  if (!isOptional(value, 'reflection', isString) || !isOptional(value, 'minutes', (minutes) => isNumber(minutes, 0))) return false
  if (!isOptional(value, 'attempts', (attempts) => isInteger(attempts, 0))) return false
  if (!isOptional(value, 'sealed', (sealed) => typeof sealed === 'boolean')) return false
  if (!isOptional(value, 'revisedAt', isTimestamp) || !isOptional(value, 'revisedDate', isDateKey)) return false
  if (!isOptional(value, 'recoverySealedDate', isDateKey)) return false
  if (!isOptional(value, 'submission', validSubmission)) return false
  if (!isOptional(value, 'evidence', validEvidence)) return false
  if (!isOptional(value, 'deferred', (deferred) => isRecord(deferred) && isOptional(deferred, 'difficulty', (difficulty) => hasOwn(DIFFICULTY, difficulty)))) return false
  if (value.sealed === true && value.evidence && value.evidence.status !== 'sealed') return false
  if (value.evidence?.status === 'sealed' && value.sealed === false) return false
  return true
}

function validBossRecord(value, gate) {
  if (!isRecord(value) || !isTimestamp(value.completedAt) || !isDateKey(value.completedDate)) return false
  if (!isOptional(value, 'phase', (phase) => phase === 'trial')) return false
  if (!isOptional(value, 'questId', (questId) => questId === gate.bossTrial.id)) return false
  return isOptional(value, 'reflection', isString) && isOptional(value, 'minutes', (minutes) => isNumber(minutes, 0))
}

function validDraft(value) {
  return isRecord(value)
    && isRecord(value.fields)
    && validSubmission(value.fields)
    && validEvaluationSummary(value.evaluation)
    && isInteger(value.attempts, 1)
    && isTimestamp(value.updatedAt)
}

function validRitualAttempt(value) {
  const statuses = ['preparing', 'active', 'paused', 'abandoned', 'completed']
  if (!isRecord(value) || !isString(value.id, false) || !statuses.includes(value.status)) return false
  if (!isString(value.task) || !isString(value.intention) || !isTimestamp(value.createdAt)) return false
  if (!Array.isArray(value.segments) || !value.segments.every((segment) => isRecord(segment)
    && isNumber(segment.start, 0) && (segment.end === null || (isNumber(segment.end, 0) && segment.end >= segment.start)))) return false
  if (!Array.isArray(value.interruptions) || !value.interruptions.every((item) => isRecord(item)
    && isNumber(item.at, 0) && isString(item.note))) return false
  if (!isOptional(value, 'abandonedAt', isTimestamp)) return false
  if (value.status !== 'completed') return true
  return isTimestamp(value.finishedAt)
    && isDateKey(value.finishedDate)
    && ['yes', 'partly', 'no'].includes(value.outcome)
    && isInteger(value.selfRating, 1)
    && value.selfRating <= 5
    && isString(value.reflection)
    && isNumber(value.activeMinutes, 0)
    && isNumber(value.score, 0, 1)
    && validReflectionEvidence(value.evidence)
}

function validGateRecord(value, gateId) {
  const gate = getGateById(gateId)
  if (!gate || !isRecord(value) || typeof value.unlocked !== 'boolean' || !isRecord(value.days)) return false
  if (!isOptional(value, 'gateId', (id) => id === gateId)) return false
  if (!isOptional(value, 'startedAt', isNullableTimestamp)
    || !isOptional(value, 'completedAt', isNullableTimestamp)
    || !isOptional(value, 'bossCompletedAt', isNullableTimestamp)) return false
  if (!isNumber(value.mp, 0)) return false
  for (const [stageKey, stage] of Object.entries(value.days)) {
    if (stageKey === 'boss') {
      if (!validBossRecord(stage, gate)) return false
      continue
    }
    if (!/^[1-9]\d*$/.test(stageKey)) return false
    const day = gate.days.find((item) => item.day === Number(stageKey))
    if (!day || !validStageRecord(stage, gate, day)) return false
  }
  if (!isOptional(value, 'drafts', (drafts) => isRecord(drafts) && Object.entries(drafts).every(([dayKey, draft]) => {
    if (!/^[1-9]\d*$/.test(dayKey) || !gate.days.some((day) => day.day === Number(dayKey))) return false
    return validDraft(draft)
  }))) return false
  if (!isOptional(value, 'ritual', (ritual) => isRecord(ritual) && Array.isArray(ritual.attempts)
    && ritual.attempts.every(validRitualAttempt))) return false
  return true
}

function validReflection(value) {
  if (!isRecord(value) || !isString(value.id, false) || !isString(value.text) || !isTimestamp(value.at) || !isDateKey(value.dateKey)) return false
  if (!isOptional(value, 'gateId', (gateId) => gateId === null || Boolean(getGateById(gateId)))) return false
  if (!isOptional(value, 'questId', (questId) => isString(questId, false)
    && (!value.gateId || Boolean(getQuest(value.gateId, questId))))) return false
  return true
}

function validPlanTask(value) {
  return isRecord(value)
    && isOptional(value, 'id', (id) => isString(id, false))
    && isOptional(value, 'title', isString)
    && isOptional(value, 'task', isString)
    && isOptional(value, 'minutes', (minutes) => isNumber(minutes, 0))
    && isOptional(value, 'kind', (kind) => ['main', 'boss', 'secondary', 'reflection'].includes(kind))
}

function validDailyPlans(value) {
  return isRecord(value) && Object.entries(value).every(([dateKey, plan]) => {
    if (!isDateKey(dateKey) || !isRecord(plan)) return false
    if (!isOptional(plan, 'dateKey', (key) => key === dateKey)) return false
    for (const key of ['morning', 'afternoon', 'evening']) {
      if (hasOwn(plan, key) && plan[key] !== null && !validPlanTask(plan[key])) return false
    }
    return true
  })
}

function validEvent(value) {
  return isRecord(value)
    && isString(value.id, false)
    && isString(value.type, false)
    && isTimestamp(value.timestamp)
    && isOptional(value, 'gateId', (gateId) => Boolean(getGateById(gateId)))
}

function validHistoryEntry(value) {
  if (!isRecord(value) || !isString(value.id, false) || !isTimestamp(value.at)) return false
  if (!isOptional(value, 'gateId', (gateId) => Boolean(getGateById(gateId)))) return false
  if (!isOptional(value, 'day', (day) => isInteger(day, 1) && Boolean(value.gateId && getGateById(value.gateId)?.days.some((item) => item.day === day)))) return false
  if (!isOptional(value, 'outcome', (outcome) => ['draft', 'accepted', 'sealed', 'released', 'revised'].includes(outcome))) return false
  if (!isOptional(value, 'attempts', (attempts) => isInteger(attempts, 0))) return false
  if (!isOptional(value, 'decision', (decision) => [...Object.values(DECISION), 'SEALED'].includes(decision))) return false
  if (!isOptional(value, 'quality', (quality) => quality === null || isNumber(quality, 0, 100))) return false
  if (!isOptional(value, 'confidence', (confidence) => confidence === null || isNumber(confidence, 0, 1))) return false
  if (!isOptional(value, 'dimensions', (dimensions) => dimensions === null || isNumericRecord(dimensions, 0, 100))) return false
  return isOptional(value, 'evaluator', (evaluator) => evaluator === null || (isRecord(evaluator) && Object.values(evaluator).every(isString)))
}

function validStreak(value) {
  return isRecord(value)
    && isInteger(value.current, 0)
    && isInteger(value.longest, value.current)
    && (value.lastActiveDate === null || isDateKey(value.lastActiveDate))
    && typeof value.interrupted === 'boolean'
}

function validPlayer(value) {
  if (!isRecord(value) || !isString(value.id, false) || !isString(value.name, false) || value.name.trim().length > 40) return false
  if (!isString(value.currentArcana, false) || !getArcana(value.currentArcana)
    || !isInteger(value.currentGate, 1) || !getGateByPosition(value.currentArcana, value.currentGate)) return false
  for (const key of ['xp', 'mp', 'sp', 'ap', 'dp', 'kp', 'cp']) {
    if (!isNumber(value[key], 0)) return false
  }
  if (!isOptional(value, 'level', (level) => isInteger(level, 1))) return false
  if (!isOptional(value, 'title', isString)
    || !isOptional(value, 'createdAt', isTimestamp)
    || !isOptional(value, 'avatar', (avatar) => AVATARS.some((item) => item.id === avatar))) return false
  if (!isOptional(value, 'primaryGoal', isString)
    || !isOptional(value, 'currentRoutine', isString)
    || !isOptional(value, 'improveAreas', isStringArray)) return false
  if (!Array.isArray(value.achievements) || !isStringArray(value.achievements)
    || !Array.isArray(value.titles) || !isStringArray(value.titles)) return false
  if (!isOptional(value, 'attributes', validAttributes)) return false
  if (!Array.isArray(value.attributeHistory) || !value.attributeHistory.every((entry) => isRecord(entry)
    && isTimestamp(entry.at) && validAttributes(entry.attributes))) return false
  return true
}

function validSettings(value) {
  if (!isRecord(value)) return false
  if (!hasOwn(DIFFICULTY, value.difficulty)
    || !isNumber(value.dailyDuration, 10, 120)
    || !Array.isArray(value.availableDays)
    || !value.availableDays.length
    || !isStringArray(value.availableDays)
    || value.availableDays.some((day) => !DAY_IDS.includes(day))
    || new Set(value.availableDays).size !== value.availableDays.length) return false
  for (const key of ['reminders', 'soundEnabled', 'awakeningComplete', 'ceremonySkipped']) {
    if (!isOptional(value, key, (setting) => typeof setting === 'boolean')) return false
  }
  if (!isOptional(value, 'masteryThreshold', (threshold) => isNumber(threshold, 0, 1))) return false
  if (!isOptional(value, 'reminderTime', (time) => typeof time === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(time))) return false
  return true
}

function validProgress(value) {
  if (!isRecord(value) || !isRecord(value.gates)) return false
  if (!isInteger(value.questsCompleted, 0)
    || !isInteger(value.knowledgeQuests, 0)
    || !isInteger(value.listeningPractices, 0)
    || !isInteger(value.observationQuests, 0)
    || !isNumber(value.practiceMinutes, 0)
    || !isNumber(value.longestFocusMinutes, 0)
    || !validStreak(value.streak)
    || typeof value.missedThenReturned !== 'boolean') return false
  if (!Array.isArray(value.reflections) || !value.reflections.every(validReflection)
    || !Array.isArray(value.events) || !value.events.every(validEvent)
    || !validDailyPlans(value.dailyPlans)) return false
  if (!isOptional(value, 'history', (history) => Array.isArray(history) && history.every(validHistoryEntry))) return false
  return Object.entries(value.gates).every(([gateId, gate]) => validGateRecord(gate, gateId))
}

export function validateLoadedState(data) {
  return isRecord(data)
    && data.schemaVersion === SCHEMA_VERSION
    && validPlayer(data.player)
    && validSettings(data.settings)
    && validProgress(data.progress)
}

export function normalizeLoadedState(data) {
  return {
    ...data,
    player: {
      ...data.player,
      attributes: { ...emptyAttributes(), ...data.player.attributes },
    },
  }
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
  const stage = gate.days.find((d) => d.day === day)
  const clean = sanitizePlainText(text || '')
  const others = gate.days.filter((d) => d.day !== day).map((d) => state.progress.gates[gateId].days[d.day]?.reflection || '')
  const result = evaluateSubmission({ gate, day: stage, fields: { reflection: clean }, legacy: true, others })
  if (result.decision !== DECISION.ACCEPTED) return { ok: false, error: 'not-accepted', decision: result.decision, evaluation: summarize(result), state }
  const next = clone(state)
  const record = next.progress.gates[gateId]
  const deferred = record.days[day].deferred
  record.days[day] = {
    ...record.days[day],
    ...(deferred ? { recoverySealedDate: record.days[day].completedDate } : {}),
    reflection: result.narrative,
    evidence: toEvidence(result),
    revisedAt: new Date().toISOString(),
    revisedDate: todayKey(),
    sealed: false,
  }
  delete record.days[day].deferred
  let released = {}
  if (deferred) {
    // Rewards held back by the recovery seal are released exactly once, on the first accepted version.
    released = applyRewards(next.player, stage.rewards, deferred.difficulty)
    addAttributes(next.player.attributes, scaleAttributes(stage.attributes, result.qualityScore))
    record.mp += stage.rewards?.mp || 0
    countActivity(next, gate, stage)
    next.player.attributeHistory.push({ at: new Date().toISOString(), attributes: { ...next.player.attributes } })
    next.player.attributeHistory = next.player.attributeHistory.slice(-120)
  }
  recordHistory(next.progress, { gateId, day, phase: stage.phase, outcome: deferred ? 'released' : 'revised', attempts: record.days[day].attempts || 1 }, result)
  const entry = next.progress.reflections.find((r) => r.questId === stage.id)
  if (entry) Object.assign(entry, { text: result.narrative, updatedAt: new Date().toISOString() })
  pushEvent(next.progress, { type: 'REFLECTION_REVISED', gateId, day, quality: result.qualityScore })
  return { ...resultFrom(next, settle(next, gate, record)), rewards: released, evidence: record.days[day].evidence, submissionEvaluation: summarize(result) }
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
    return completeQuest(next, { gateId, questId: gate.bossTrial.id, reflection: r.attempt.reflection, durationMinutes: r.attempt.activeMinutes, dateKey })
  }
  return resultFrom(next, settle(next, gate, record))
}

/** Compact, text-free record of every evaluated submission: the durable basis for trends and audits. */
function recordHistory(progress, entry, evaluation) {
  const list = (progress.history ||= [])
  list.unshift({
    id: createId('eval'), at: new Date().toISOString(), ...entry,
    decision: evaluation.decision ?? 'ACCEPTED', quality: evaluation.qualityScore ?? null, confidence: evaluation.confidence ?? null,
    dimensions: evaluation.dimensions ?? null, evaluator: evaluation.evaluator ?? null, // never the player's text
  })
  if (list.length > EVAL.history.max) list.length = EVAL.history.max
}

// Activity counters that feed achievements; counted when a stage's evidence is accepted.
function countActivity(next, gate, quest) {
  const flags = classifyQuest(quest.type)
  if (flags.knowledge || quest.type === 'knowledge') next.progress.knowledgeQuests += 1
  if (flags.listening || gate.characteristic === 'Listening' || quest.type === 'social') next.progress.listeningPractices += 1
  if (flags.observation || quest.type === 'observation') next.progress.observationQuests += 1
}

/**
 * Recovery seal: after repeated non-accepted attempts the player can seal the stage as self-reported, so honest players
 * are never trapped. It continues the streak and unlocks the next stage, but holds back XP, resources and attributes
 * and earns no mastery credit; the held rewards are released once if the reflection is later improved to ACCEPTED.
 */
export function sealStage(state, { gateId, questId, durationMinutes, dateKey }) {
  const found = getQuest(gateId, questId)
  if (!found || found.kind === 'boss') return { ok: false, error: 'missing-quest', state }
  if (!state.progress.gates[gateId]?.unlocked) return { ok: false, error: 'locked-gate', state }
  const day = found.quest
  const gate = found.gate
  const dayKey = dateKey || todayKey()
  const next = clone(state)
  const record = ensureGate(next.progress, gateId)
  if (record.days[day.day]?.completedAt) return { ok: false, error: 'already-complete', state }
  if (day.day > 1 && !record.days[day.day - 1]?.completedAt) return { ok: false, error: 'stage-locked', state }
  if (gate.days.filter((d) => record.days[d.day]?.completedDate === dayKey).length >= GMP.maxStagesPerDay) return { ok: false, error: 'daily-stage-limit', state }
  const draft = record.drafts?.[day.day]
  if (!draft || draft.attempts < EVAL.recovery.attemptsBeforeSeal) return { ok: false, error: 'seal-not-available', needed: EVAL.recovery.attemptsBeforeSeal, attempts: draft?.attempts || 0, state }

  const minutes = Math.max(0, Number(durationMinutes) || day.durationMinutes || 0)
  const ev = draft.evaluation
  if (!record.startedAt) record.startedAt = new Date().toISOString()
  record.days[day.day] = {
    completedAt: new Date().toISOString(), completedDate: dayKey, reflection: narrativeOf(draft.fields), phase: day.phase, questId: day.id, minutes,
    evidence: { status: 'sealed', score: 0, criteria: {}, feedback: ev.feedback || [], keys: [], quality: ev.qualityScore, confidence: ev.confidence, verification: 'self-reported-sealed', rubric: ev.evaluator },
    attempts: draft.attempts, sealed: true, deferred: { difficulty: next.settings.difficulty || 'standard' }, submission: draft.fields,
  }
  delete record.drafts[day.day]
  next.progress.questsCompleted += 1
  next.progress.practiceMinutes += minutes
  next.progress.streak = applyStreak(next.progress.streak, dayKey, next.settings.availableDays).streak
  pushEvent(next.progress, { type: 'STAGE_SEALED', gateId, day: day.day })
  recordHistory(next.progress, { gateId, day: day.day, phase: day.phase, outcome: 'sealed', attempts: draft.attempts }, { decision: 'SEALED', qualityScore: ev.qualityScore, confidence: ev.confidence, dimensions: ev.dimensions, evaluator: ev.evaluator })
  return { ...resultFrom(next, settle(next, gate, record)), sealed: true }
}
