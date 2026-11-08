export const ROUTES = {
  world: '/dashboard',
  journey: '/journey',
  realm: (arcanaId) => `/journey/${arcanaId}`,
  gate: (gateId) => `/gate/${gateId}`,
  ritual: (gateId) => `/ritual/${gateId}`,
  quests: '/quests',
  journal: '/journal',
  coach: '/coach',
  analytics: '/analytics',
  settings: '/settings',
  profile: '/profile',
}

export const LEGACY_ROUTES = {
  arcanas: '/arcanas',
  plan: '/plan',
}

export const ARCANA_IDS = ['beast', 'human', 'sage']

export function isArcanaId(value) {
  return ARCANA_IDS.includes(value)
}
