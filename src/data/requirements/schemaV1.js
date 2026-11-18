export const REGISTRY_VERSION = 'gate-requirements-v1'

export const REQUIREMENT_CATEGORIES = Object.freeze([
  'AWARENESS',
  'PLANNING',
  'ACTION',
  'RESISTANCE',
  'APPLICATION',
  'LEARNING',
  'EXPRESSION',
])

export const EVIDENCE_TYPES = Object.freeze([
  'situation',
  'action',
  'difficulty',
  'outcome',
  'reflection',
])

export const ACTION_STATUSES = Object.freeze([
  'COMPLETED',
  'ATTEMPTED',
  'NOT_STARTED',
  'SUCCESSFUL_RESISTANCE',
  'UNCLEAR',
])

export const CONDITION_OPERATORS = Object.freeze(['ALL_OF', 'ANY_OF'])

export const ATTEMPT_POLICIES = Object.freeze([
  'DISALLOWED',
  'EVIDENCE_ONLY',
  'SATISFIES_REQUIREMENT',
])

export const RESISTANCE_POLICIES = Object.freeze([
  'SUCCESS_REQUIRED',
  'ATTEMPT_REQUIRED',
  'LEARNING_ONLY',
  'NOT_REQUIRED',
])

export const APPLICABILITY_STATES = Object.freeze([
  'APPLICABLE',
  'NOT_APPLICABLE',
  'UNCLEAR',
])

export const NOT_APPLICABLE_POLICIES = Object.freeze([
  'EXEMPT',
  'UNSATISFIED',
  'ALTERNATIVE_TASK',
])

export const REQUIREMENT_OUTCOMES = Object.freeze([
  'SATISFIED',
  'UNSATISFIED',
  'NOT_APPLICABLE',
  'UNRESOLVED',
])

export const WORD_COUNT_TOKENIZERS = Object.freeze(['unicode-word-v1'])

const isValue = (values, value) => values.includes(value)

export function isRequirementOutcome(value) {
  return isValue(REQUIREMENT_OUTCOMES, value)
}
