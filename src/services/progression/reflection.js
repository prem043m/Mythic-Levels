import { listGates } from '@/data/catalog'
import { tokenize, jaccard } from '@/utils/text'

// Deterministic, explainable rubric. It checks the STRUCTURE of a reflection (a concrete moment, a named
// pattern, an action taken, something learned, on-topic). It cannot verify that the events were true.
export const CRITERIA = ['specificity', 'relevance', 'awareness', 'application', 'learning']

// The three criteria that matter most at each stage. Accepted = on-topic AND at least 2 of the stage's 3 key criteria.
export const PHASE_KEY = {
  recognition: ['relevance', 'specificity', 'awareness'],
  observation: ['specificity', 'awareness', 'relevance'],
  practice: ['specificity', 'application', 'relevance'],
  resistance: ['awareness', 'application', 'specificity'],
  application: ['specificity', 'application', 'learning'],
  challenge: ['application', 'learning', 'awareness'],
  trial: ['learning', 'awareness', 'relevance'],
  ritual: ['specificity', 'awareness', 'learning'],
}

export const HINTS = {
  specificity: 'Describe one specific moment: when and where it happened, and what you did.',
  relevance: 'Connect it to this Gate’s theme; your text does not seem to touch the ideas this Gate trains.',
  awareness: 'Name what triggered it, or a pattern you noticed (“because…”, “every time…”).',
  application: 'Say what you actually did, as an action you took (“I turned off…”, “I wrote…”).',
  learning: 'Say what you learned or what you will do differently next time.',
}

const TIME = /\b(today|yesterday|tonight|this (?:morning|afternoon|evening|week)|last (?:night|week)|monday|tuesday|wednesday|thursday|friday|saturday|sunday|morning|afternoon|evening|noon|midnight|at \d{1,2}(?::\d{2})?\s?(?:am|pm)?|\d+\s?(?:min|mins|minutes|hours?|seconds?)|during|while|after|before)\b/i
const CAUSE = /\b(because|trigger(?:ed|s)?|every time|each time|whenever|pattern|usually|always|tends? to|urge|impulse|noticed (?:that|how|when)|right when)\b/i
const LEARN = /\b(learn(?:ed|t)|realiz(?:ed|e)|realis(?:ed|e)|discover(?:ed)?|next time|will (?:try|change|do|start|stop|keep|put|turn|set)|i'll|differently|instead|helped|worked|didn't work|improved|insight)\b/i
const MENTAL = new Set(['felt', 'noticed', 'realized', 'realised', 'thought', 'wanted', 'wished', 'hoped', 'knew', 'learned', 'discovered', 'needed', 'liked', 'loved', 'hated', 'enjoyed', 'expected', 'decided'])
const IRREGULAR = new Set('put set left took wrote chose sat stood went ran made gave kept began said spoke got came drank ate woke slept told held read shut cut hung lit paid found built did'.split(' '))
const GENERIC = new Set(['minute', 'day', 'task', 'write', 'today', 'tomorrow', 'session', 'time', 'real', 'one', 'new'])

const vocabCache = new WeakMap()
export function gateVocabulary(gate) {
  if (!gate) return new Set()
  if (vocabCache.has(gate)) return vocabCache.get(gate)
  const out = []
  const walk = (v) => {
    if (typeof v === 'string') out.push(v)
    else if (Array.isArray(v)) v.forEach(walk)
    else if (v && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(gate)
  const own = new Set(tokenize(out.join(' ')).filter((t) => !GENERIC.has(t)))
  // Only words SPECIFIC to this Gate count as evidence of relevance: a word found in more than a third of all
  // Gates ("because", "next", "stay") says nothing about this Gate's theme. Derived from the curriculum, not hand-picked.
  const vocab = new Set([...own].filter((t) => documentFrequency(t) <= Math.floor(allGates().length / 3)))
  vocabCache.set(gate, vocab)
  return vocab
}

let gateTokenSets
const allGates = () => listGates()
function documentFrequency(token) {
  gateTokenSets ||= allGates().map((g) => {
    const parts = []
    ;(function walk(v) { if (typeof v === 'string') parts.push(v); else if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v === 'object') Object.values(v).forEach(walk) })(g)
    return new Set(tokenize(parts.join(' ')))
  })
  return gateTokenSets.filter((s) => s.has(token)).length
}

function actionVerbs(text) {
  const found = []
  for (const m of text.matchAll(/\bI\s+(?:(?:then|just|also|immediately|quickly|finally|simply)\s+)?([a-z]+)\b/gi)) {
    const v = m[1].toLowerCase()
    if (!MENTAL.has(v) && (IRREGULAR.has(v) || (v.endsWith('ed') && v.length > 3))) found.push(v)
  }
  return found
}

export function evaluateReflection(text, { gate, phase = 'practice', others = [] } = {}) {
  const clean = String(text || '').trim()
  const keys = PHASE_KEY[phase] || PHASE_KEY.practice
  if (!clean) return { status: 'none', score: 0, criteria: {}, feedback: [], keys }

  const tokens = tokenize(clean)
  const unique = new Set(tokens)
  const acts = actionVerbs(clean)
  const overlap = [...unique].filter((t) => gateVocabulary(gate).has(t)).length
  const duplicate = others.some((o) => o && jaccard(tokens, tokenize(o)) >= 0.8) // copy-paste guard

  const criteria = {
    specificity: !duplicate && unique.size >= 8 && (TIME.test(clean) || acts.length > 0),
    // Advisory: word overlap cannot judge subtle relevance, so it only rejects text with NO connection to the Gate's own vocabulary.
    relevance: unique.size >= 4 && overlap >= 1,
    awareness: CAUSE.test(clean),
    application: unique.size >= 6 && acts.length > 0,
    learning: LEARN.test(clean),
  }
  const met = CRITERIA.filter((c) => criteria[c]).length
  const accepted = criteria.relevance && keys.filter((c) => criteria[c]).length >= 2
  const feedback = []
  if (duplicate) feedback.push('This looks almost the same as another reflection. Describe what was different this time.')
  for (const c of [...keys, 'relevance']) if (!criteria[c] && !feedback.includes(HINTS[c]) && !(duplicate && c === 'specificity')) feedback.push(HINTS[c])
  return { status: accepted ? 'accepted' : 'needs-revision', score: met / CRITERIA.length, criteria, feedback: accepted ? [] : feedback, keys }
}
