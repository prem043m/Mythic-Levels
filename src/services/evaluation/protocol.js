// Action Submission Protocol: what a quest asks the player to submit, defined per stage type (data, not UI code).
export const PROTOCOL_VERSION = 'protocol-v1'
export const FIELD_ORDER = ['situation', 'action', 'difficulty', 'outcome', 'reflection']

export const FIELD_DEFS = {
  situation: { label: 'When and where?', hint: 'The moment or setting, in a sentence or two.' },
  action: { label: 'What did you actually do?', hint: 'The concrete steps you took.' },
  difficulty: { label: 'What made it hard, or pulled you away?', hint: 'The resistance or trigger you met.' },
  outcome: { label: 'What happened?', hint: 'The result, including if it did not go as planned.' },
  reflection: { label: 'What did you learn, or what will you change?', hint: 'One honest takeaway.' },
}

const BY_PHASE = {
  recognition: { required: ['situation', 'reflection'], optional: ['difficulty'] },
  observation: { required: ['situation', 'difficulty', 'outcome'], optional: ['reflection'] },
  practice: { required: ['action', 'outcome'], optional: ['situation', 'reflection'] },
  resistance: { required: ['action', 'difficulty', 'outcome'], optional: ['reflection'] },
  application: { required: ['situation', 'action', 'outcome'], optional: ['reflection', 'difficulty'] },
  challenge: { required: ['action', 'difficulty', 'outcome', 'reflection'], optional: ['situation'] },
  trial: { required: ['outcome', 'reflection'], optional: [] },
}

export function protocolFor(day) {
  const p = BY_PHASE[day?.phase] || BY_PHASE.practice
  const fields = FIELD_ORDER.filter((id) => p.required.includes(id) || p.optional.includes(id)).map((id) => ({
    id,
    required: p.required.includes(id),
    ...FIELD_DEFS[id],
    label: id === 'reflection' && day?.prompt ? day.prompt : FIELD_DEFS[id].label, // the Gate's own prompt wins
  }))
  return { version: PROTOCOL_VERSION, mode: 'reflective', fields }
}

export const narrativeOf = (fields = {}) => FIELD_ORDER.map((id) => fields[id]).filter(Boolean).join('\n')

/** Keep only known string fields; `clean` is the caller's sanitizer. Returns null when no guided submission was given. */
export function normalizeFields(submission, clean = (s) => String(s).trim()) {
  if (!submission || typeof submission !== 'object') return null
  const out = {}
  for (const id of FIELD_ORDER) if (typeof submission[id] === 'string' && submission[id].trim()) out[id] = clean(submission[id])
  return out
}
