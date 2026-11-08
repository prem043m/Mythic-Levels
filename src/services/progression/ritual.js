import { GMP } from '@/config/gmp'
import { evaluateReflection } from '@/services/progression/reflection'
import { createId } from '@/utils/ids'
import { toDateKey } from '@/utils/dates'

// The final ritual is a recoverable state machine:
//   preparing → active ⇄ paused → completed        (abandoned is a recoverable dead end; a new attempt may begin)
// Time is the sum of recorded segments, so a reload or an interruption never loses progress. A browser timer is
// never proof of a real-world act; completion also needs attestation, an observation record and an accepted reflection.
export const LIVE = ['preparing', 'active', 'paused']

export function ritualSpec(gate) {
  const t = gate.bossTrial
  const target = t.durationMinutes
  return {
    name: t.title,
    trial: t.name,
    objective: t.description,
    targetMinutes: target,
    minMinutes: Math.max(1, Math.round(target * GMP.ritual.minFractionOfTarget)),
    maxCountedMinutes: Math.round(target * GMP.ritual.maxCountedFraction),
    preparation: [
      'I have read the trial and I understand what it asks.',
      'I have chosen the real task or situation where I will do it.',
      'I have removed what I know will pull me away.',
      'I am ready to record honestly what happens, including failure.',
    ],
    prompts: [
      'What pulled you away most strongly, and what triggered it?',
      'How did you respond in the moment?',
      'What was different compared with your earlier attempts?',
      'What will you change next time?',
    ],
  }
}

export const liveAttempt = (ritual) => ritual?.attempts?.find((a) => LIVE.includes(a.status)) || null
export const activeMs = (a, nowMs) => (a?.segments || []).reduce((s, g) => s + Math.max(0, (g.end ?? nowMs) - g.start), 0)
export const activeMinutes = (a, nowMs) => Math.floor(activeMs(a, nowMs) / 60000)

export function ritualResult(record) {
  const done = (record.ritual?.attempts || []).filter((a) => a.status === 'completed')
  if (done.length) return { done: true, score: Math.max(...done.map((a) => a.score)) }
  // Gates whose trial was finished under the previous rules keep full credit (never punish earlier progress).
  if (record.bossCompletedAt && !record.ritual) return { done: true, score: 1, legacy: true }
  return { done: false, score: 0 }
}

const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim()

/** Mutates `record` (a clone owned by the caller). Returns { ok } or { ok:false, error, ... } and leaves state untouched on failure. */
export function applyRitualAction(record, gate, action, p = {}, nowMs = Date.now()) {
  const spec = ritualSpec(gate)
  const ritual = (record.ritual ||= { attempts: [] })
  const live = liveAttempt(ritual)
  const last = (live?.segments || []).reduce((m, g) => Math.max(m, g.start, g.end || 0), 0)
  const t = Math.max(nowMs, last) // a clock that moves backwards can never shorten or lengthen the record
  const fail = (error, extra = {}) => ({ ok: false, error, ...extra })
  const closeOpen = () => { const s = live.segments.at(-1); if (s && s.end == null) s.end = t }

  switch (action) {
    case 'prepare': {
      if (live) return fail('ritual-in-progress')
      if (record.completedAt) return fail('already-complete')
      if (!gate.days.every((d) => record.days[d.day]?.completedAt)) return fail('stages-incomplete')
      const task = clean(p.task)
      const intention = clean(p.intention)
      if (task.length < 3 || intention.length < 3) return fail('intention-missing')
      if ((Number(p.checked) || 0) < spec.preparation.length) return fail('preparation-incomplete')
      ritual.attempts.push({ id: createId('ritual'), status: 'preparing', task, intention, segments: [], interruptions: [], createdAt: new Date(t).toISOString() })
      return { ok: true }
    }
    case 'start':
      if (live?.status !== 'preparing') return fail('invalid-state')
      live.status = 'active'; live.segments.push({ start: t, end: null })
      return { ok: true }
    case 'pause':
      if (live?.status !== 'active') return fail('invalid-state')
      closeOpen(); live.status = 'paused'
      if (clean(p.note)) live.interruptions.push({ at: t, note: clean(p.note).slice(0, 280) })
      return { ok: true }
    case 'resume':
      if (live?.status !== 'paused') return fail('invalid-state')
      live.status = 'active'; live.segments.push({ start: t, end: null })
      return { ok: true }
    case 'abandon':
      if (!live) return fail('invalid-state')
      closeOpen(); live.status = 'abandoned'; live.abandonedAt = new Date(t).toISOString()
      return { ok: true }
    case 'finish': {
      if (live?.status !== 'active' && live?.status !== 'paused') return fail('invalid-state')
      const ms = activeMs(live, t)
      if (ms < spec.minMinutes * 60000) return fail('too-short', { minutes: Math.floor(ms / 60000), needed: spec.minMinutes })
      const attested = live.interruptions.length > 0 || p.noInterruptions === true
      if (!attested) return fail('observation-missing')
      if (!['yes', 'partly', 'no'].includes(p.outcome)) return fail('outcome-missing')
      const rating = Number(p.selfRating)
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return fail('self-assessment-missing')
      const others = Object.values(record.days).map((d) => d.reflection || '')
      const ev = evaluateReflection(p.reflection, { gate, phase: 'ritual', others })
      if (ev.status !== 'accepted') return fail('reflection-needs-revision', { feedback: ev.feedback })
      closeOpen()
      const counted = Math.min(ms, spec.maxCountedMinutes * 60000) / 60000
      const objective = { yes: 1, partly: 0.5, no: 0 }[p.outcome]
      // Five equally weighted, individually visible parts: time, self-reported objective, observation, reflection, self-assessment.
      const score = (Math.min(1, counted / spec.targetMinutes) + objective + 1 + ev.score + 1) / 5
      Object.assign(live, { status: 'completed', finishedAt: new Date(t).toISOString(), finishedDate: toDateKey(new Date(t)), outcome: p.outcome, selfRating: rating, reflection: String(p.reflection).trim(), evidence: ev, activeMinutes: Math.floor(ms / 60000), score })
      return { ok: true, attempt: live }
    }
    default:
      return fail('unknown-action')
  }
}
