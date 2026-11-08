export const STORAGE_KEY = 'mythic-levels:v1'
export const SCHEMA_VERSION = 1

export const ARCANA_ORDER = ['beast', 'human', 'sage']

export const ATTRIBUTES = [
  { id: 'focus', label: 'Focus' },
  { id: 'discipline', label: 'Discipline' },
  { id: 'awareness', label: 'Awareness' },
  { id: 'knowledge', label: 'Knowledge' },
  { id: 'communication', label: 'Communication' },
  { id: 'emotionalBalance', label: 'Emotional Balance' },
  { id: 'perspective', label: 'Perspective' },
  { id: 'connection', label: 'Connection' },
  { id: 'wisdom', label: 'Wisdom' },
]

export const ATTRIBUTE_IDS = ATTRIBUTES.map((item) => item.id)

export const DEFAULT_MASTERY_THRESHOLD = 0.7

export const MASTERY_WEIGHTS = {
  practice: 0.4,
  consistency: 0.2,
  reflection: 0.15,
  boss: 0.25,
}

export const DIFFICULTY = {
  gentle: { label: 'Gentle', xpMul: 0.9, durationMul: 0.75 },
  standard: { label: 'Standard', xpMul: 1, durationMul: 1 },
  austere: { label: 'Austere', xpMul: 1.15, durationMul: 1.25 },
}

export const AVATARS = [
  { id: 'lantern', label: 'Lantern', glyph: '✦' },
  { id: 'beast', label: 'Sigil of the Beast', glyph: '☽' },
  { id: 'human', label: 'Sigil of the Human', glyph: '☉' },
  { id: 'sage', label: 'Sigil of the Sage', glyph: '✧' },
  { id: 'quill', label: 'Quill', glyph: '✐' },
  { id: 'compass', label: 'Compass', glyph: '🧭' },
]
