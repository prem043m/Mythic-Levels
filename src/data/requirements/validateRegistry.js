import { getArcana, getGateById } from '@/data/catalog'
import {
  ACTION_STATUSES,
  ATTEMPT_POLICIES,
  CONDITION_OPERATORS,
  EVIDENCE_TYPES,
  NOT_APPLICABLE_POLICIES,
  REGISTRY_VERSION,
  REQUIREMENT_CATEGORIES,
  RESISTANCE_POLICIES,
  WORD_COUNT_TOKENIZERS,
} from '@/data/requirements/schemaV1'

const REGISTRY_KEYS = new Set(['registryVersion', 'requirements'])
const REQUIREMENT_KEYS = new Set([
  'requirementId',
  'arcanaId',
  'gateId',
  'stageId',
  'category',
  'description',
  'required',
  'condition',
  'applicability',
  'supportingEvidenceTypes',
])
const GROUP_KEYS = new Set(['operator', 'children'])
const CONDITION_KEYS = new Set([
  'conditionId',
  'description',
  'evidenceTypes',
  'acceptedActionStatuses',
  'attemptPolicy',
  'resistancePolicy',
  'missingEvidenceCodes',
  'wordCount',
])
const APPLICABILITY_KEYS = new Set([
  'when',
  'evidenceTypes',
  'onNotApplicable',
  'alternativeTask',
])

// Counts every condition node on a path, including the root node.
export const MAX_CONDITION_TREE_DEPTH = 32

const isRecord = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0
const hasOwn = (value, key) => Object.prototype.hasOwnProperty.call(value, key)

function addError(errors, code, path) {
  errors.push({ code, path })
}

function checkUnknownKeys(value, allowed, errors, path) {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) addError(errors, 'UNKNOWN_FIELD', `${path}.${key}`)
  }
}

function validateEnumArray(value, allowed, errors, path, { required = true } = {}) {
  if (value === undefined && !required) return
  if (!Array.isArray(value) || (required && value.length === 0)) {
    addError(errors, 'INVALID_ENUM_ARRAY', path)
    return
  }
  const seen = new Set()
  for (let index = 0; index < value.length; index += 1) {
    if (!hasOwn(value, index)) {
      addError(errors, 'SPARSE_ARRAY_ENTRY', `${path}[${index}]`)
      continue
    }
    const item = value[index]
    if (!allowed.includes(item)) addError(errors, 'INVALID_ENUM_VALUE', `${path}[${index}]`)
    if (seen.has(item)) addError(errors, 'DUPLICATE_ENUM_VALUE', `${path}[${index}]`)
    seen.add(item)
  }
}

function validateWordCount(wordCount, evidenceTypes, errors, path) {
  if (!isRecord(wordCount)) {
    addError(errors, 'INVALID_WORD_COUNT', path)
    return
  }
  checkUnknownKeys(wordCount, new Set(['field', 'min', 'max', 'tokenizer']), errors, path)
  if (!EVIDENCE_TYPES.includes(wordCount.field)
    || !Array.isArray(evidenceTypes)
    || !evidenceTypes.includes(wordCount.field)) {
    addError(errors, 'INVALID_WORD_COUNT_FIELD', `${path}.field`)
  }

  const validMin = typeof wordCount.min === 'number'
    && Number.isInteger(wordCount.min)
    && wordCount.min >= 0
  const validMax = typeof wordCount.max === 'number'
    && Number.isInteger(wordCount.max)
    && wordCount.max >= 0

  if (!validMin) {
    addError(errors, 'INVALID_WORD_COUNT_MIN', `${path}.min`)
  }
  if (!validMax || (validMin && wordCount.max < wordCount.min)) {
    addError(errors, 'INVALID_WORD_COUNT_MAX', `${path}.max`)
  }
  if (!WORD_COUNT_TOKENIZERS.includes(wordCount.tokenizer)) {
    addError(errors, 'INVALID_WORD_COUNT_TOKENIZER', `${path}.tokenizer`)
  }
}

function validateConditionNode(node, context) {
  const { errors, path, activeNodes, depth } = context
  if (!isRecord(node)) {
    addError(errors, 'INVALID_CONDITION_NODE', path)
    return
  }
  if (activeNodes.has(node)) {
    addError(errors, 'CYCLIC_CONDITION_TREE', path)
    return
  }
  if (depth > MAX_CONDITION_TREE_DEPTH) {
    addError(errors, 'MAX_CONDITION_DEPTH_EXCEEDED', path)
    return
  }

  activeNodes.add(node)
  try {
    validateConditionNodeContents(node, context)
  } finally {
    activeNodes.delete(node)
  }
}

function validateConditionNodeContents(node, context) {
  const { errors, path, conditionIds, category } = context

  if (hasOwn(node, 'operator')) {
    checkUnknownKeys(node, GROUP_KEYS, errors, path)
    if (!CONDITION_OPERATORS.includes(node.operator)) {
      addError(errors, 'INVALID_OPERATOR', `${path}.operator`)
    }
    if (!Array.isArray(node.children)) {
      addError(errors, 'INVALID_CONDITION_CHILDREN', `${path}.children`)
      return
    }
    if (node.children.length === 0) {
      addError(errors, 'EMPTY_CONDITION_GROUP', `${path}.children`)
      return
    }
    if (node.operator === 'ANY_OF' && node.children.length < 2) {
      addError(errors, 'ANY_OF_REQUIRES_ALTERNATIVES', `${path}.children`)
    }
    for (let index = 0; index < node.children.length; index += 1) {
      if (!hasOwn(node.children, index)) {
        addError(errors, 'SPARSE_ARRAY_ENTRY', `${path}.children[${index}]`)
        continue
      }
      const child = node.children[index]
      validateConditionNode(child, {
        ...context,
        path: `${path}.children[${index}]`,
        depth: context.depth + 1,
      })
    }
    return
  }

  checkUnknownKeys(node, CONDITION_KEYS, errors, path)
  if (!isNonEmptyString(node.conditionId)) {
    addError(errors, 'MISSING_CONDITION_ID', `${path}.conditionId`)
  } else if (conditionIds.has(node.conditionId)) {
    addError(errors, 'DUPLICATE_CONDITION_ID', `${path}.conditionId`)
  } else {
    conditionIds.add(node.conditionId)
  }
  if (!isNonEmptyString(node.description)) {
    addError(errors, 'MISSING_CONDITION_DESCRIPTION', `${path}.description`)
  }

  validateEnumArray(node.evidenceTypes, EVIDENCE_TYPES, errors, `${path}.evidenceTypes`)
  if (node.acceptedActionStatuses !== undefined) {
    validateEnumArray(node.acceptedActionStatuses, ACTION_STATUSES, errors, `${path}.acceptedActionStatuses`)
  }
  if (node.missingEvidenceCodes !== undefined) {
    if (!Array.isArray(node.missingEvidenceCodes) || node.missingEvidenceCodes.length === 0) {
      addError(errors, 'INVALID_MISSING_EVIDENCE_CODES', `${path}.missingEvidenceCodes`)
    } else {
      let validCodes = true
      for (let index = 0; index < node.missingEvidenceCodes.length; index += 1) {
        if (!hasOwn(node.missingEvidenceCodes, index)) {
          addError(errors, 'SPARSE_ARRAY_ENTRY', `${path}.missingEvidenceCodes[${index}]`)
          validCodes = false
        } else if (!isNonEmptyString(node.missingEvidenceCodes[index])) {
          validCodes = false
        }
      }
      if (!validCodes) {
        addError(errors, 'INVALID_MISSING_EVIDENCE_CODES', `${path}.missingEvidenceCodes`)
      }
    }
  } else {
    addError(errors, 'MISSING_EVIDENCE_CODES', `${path}.missingEvidenceCodes`)
  }

  const statuses = Array.isArray(node.acceptedActionStatuses) ? node.acceptedActionStatuses : []
  if (statuses.includes('NOT_STARTED') || statuses.includes('UNCLEAR')) {
    addError(errors, 'UNSATISFIABLE_ACTION_STATUS', `${path}.acceptedActionStatuses`)
  }
  if (node.attemptPolicy !== undefined && !ATTEMPT_POLICIES.includes(node.attemptPolicy)) {
    addError(errors, 'INVALID_ATTEMPT_POLICY', `${path}.attemptPolicy`)
  }
  if (statuses.length && node.attemptPolicy === undefined) {
    addError(errors, 'MISSING_ATTEMPT_POLICY', `${path}.attemptPolicy`)
  }
  if (node.attemptPolicy === 'DISALLOWED' && statuses.includes('ATTEMPTED')) {
    addError(errors, 'ATTEMPT_POLICY_MISMATCH', `${path}.attemptPolicy`)
  }
  if (node.attemptPolicy === 'EVIDENCE_ONLY' && statuses.includes('ATTEMPTED')) {
    addError(errors, 'ATTEMPT_POLICY_MISMATCH', `${path}.attemptPolicy`)
  }
  if (node.attemptPolicy === 'SATISFIES_REQUIREMENT' && !statuses.includes('ATTEMPTED')) {
    addError(errors, 'ATTEMPT_POLICY_MISMATCH', `${path}.acceptedActionStatuses`)
  }

  if (node.resistancePolicy !== undefined && !RESISTANCE_POLICIES.includes(node.resistancePolicy)) {
    addError(errors, 'INVALID_RESISTANCE_POLICY', `${path}.resistancePolicy`)
  }
  if (statuses.includes('SUCCESSFUL_RESISTANCE') && node.resistancePolicy !== 'SUCCESS_REQUIRED') {
    addError(errors, 'RESISTANCE_POLICY_MISMATCH', `${path}.resistancePolicy`)
  }
  if (node.resistancePolicy === 'SUCCESS_REQUIRED') {
    if (!statuses.includes('SUCCESSFUL_RESISTANCE')) {
      addError(errors, 'RESISTANCE_POLICY_MISMATCH', `${path}.acceptedActionStatuses`)
    }
    if (statuses.includes('ATTEMPTED') || node.attemptPolicy === 'SATISFIES_REQUIREMENT') {
      addError(errors, 'ATTEMPT_POLICY_MISMATCH', `${path}.attemptPolicy`)
    }
    for (const type of ['difficulty', 'action', 'outcome']) {
      if (!Array.isArray(node.evidenceTypes) || !node.evidenceTypes.includes(type)) {
        addError(errors, 'RESISTANCE_EVIDENCE_INCOMPLETE', `${path}.evidenceTypes`)
        break
      }
    }
  }
  if (node.resistancePolicy === 'ATTEMPT_REQUIRED'
    && (!statuses.includes('ATTEMPTED') || node.attemptPolicy !== 'SATISFIES_REQUIREMENT')) {
    addError(errors, 'RESISTANCE_POLICY_MISMATCH', `${path}.resistancePolicy`)
  }
  if (node.resistancePolicy === 'LEARNING_ONLY') {
    if (category !== 'LEARNING' || statuses.includes('SUCCESSFUL_RESISTANCE')) {
      addError(errors, 'RESISTANCE_POLICY_MISMATCH', `${path}.resistancePolicy`)
    }
    if (!Array.isArray(node.evidenceTypes)
      || !node.evidenceTypes.some((type) => type === 'outcome' || type === 'reflection')) {
      addError(errors, 'LEARNING_EVIDENCE_REQUIRED', `${path}.evidenceTypes`)
    }
  }
  if (node.resistancePolicy === 'NOT_REQUIRED' && statuses.includes('SUCCESSFUL_RESISTANCE')) {
    addError(errors, 'RESISTANCE_POLICY_MISMATCH', `${path}.resistancePolicy`)
  }

  if (node.wordCount !== undefined) {
    validateWordCount(node.wordCount, node.evidenceTypes, errors, `${path}.wordCount`)
  }
}

function validateApplicability(applicability, context) {
  const { errors, path } = context
  if (!isRecord(applicability)) {
    addError(errors, 'INVALID_APPLICABILITY', path)
    return
  }
  checkUnknownKeys(applicability, APPLICABILITY_KEYS, errors, path)
  if (!isNonEmptyString(applicability.when)) {
    addError(errors, 'MISSING_APPLICABILITY_CONDITION', `${path}.when`)
  }
  validateEnumArray(applicability.evidenceTypes, EVIDENCE_TYPES, errors, `${path}.evidenceTypes`)

  if (applicability.onNotApplicable === undefined) {
    addError(errors, 'MISSING_NOT_APPLICABLE_POLICY', `${path}.onNotApplicable`)
    return
  }
  if (!NOT_APPLICABLE_POLICIES.includes(applicability.onNotApplicable)) {
    addError(errors, 'INVALID_NOT_APPLICABLE_POLICY', `${path}.onNotApplicable`)
    return
  }
  if (applicability.onNotApplicable === 'ALTERNATIVE_TASK') {
    if (applicability.alternativeTask === undefined) {
      addError(errors, 'MISSING_ALTERNATIVE_TASK', `${path}.alternativeTask`)
      return
    }
    validateConditionNode(applicability.alternativeTask, {
      ...context,
      path: `${path}.alternativeTask`,
      depth: 1,
    })
  } else if (applicability.alternativeTask !== undefined) {
    addError(errors, 'UNEXPECTED_ALTERNATIVE_TASK', `${path}.alternativeTask`)
  }
}

export function validateRequirementRegistry(registry) {
  const errors = []
  if (!isRecord(registry)) {
    return { valid: false, errors: [{ code: 'INVALID_REGISTRY', path: '$' }] }
  }

  checkUnknownKeys(registry, REGISTRY_KEYS, errors, '$')
  if (!isNonEmptyString(registry.registryVersion)) {
    addError(errors, 'MISSING_REGISTRY_VERSION', '$.registryVersion')
  } else if (registry.registryVersion !== REGISTRY_VERSION) {
    addError(errors, 'UNSUPPORTED_REGISTRY_VERSION', '$.registryVersion')
  }
  if (!Array.isArray(registry.requirements)) {
    addError(errors, 'INVALID_REQUIREMENTS', '$.requirements')
    return { valid: false, errors }
  }

  const requirementIds = new Set()
  for (let index = 0; index < registry.requirements.length; index += 1) {
    const path = `$.requirements[${index}]`
    if (!hasOwn(registry.requirements, index)) {
      addError(errors, 'SPARSE_ARRAY_ENTRY', path)
      continue
    }
    const requirement = registry.requirements[index]
    if (!isRecord(requirement)) {
      addError(errors, 'INVALID_REQUIREMENT', path)
      continue
    }
    checkUnknownKeys(requirement, REQUIREMENT_KEYS, errors, path)
    if (!isNonEmptyString(requirement.requirementId)) {
      addError(errors, 'MISSING_REQUIREMENT_ID', `${path}.requirementId`)
    } else if (requirementIds.has(requirement.requirementId)) {
      addError(errors, 'DUPLICATE_REQUIREMENT_ID', `${path}.requirementId`)
    } else {
      requirementIds.add(requirement.requirementId)
    }
    if (!REQUIREMENT_CATEGORIES.includes(requirement.category)) {
      addError(errors, 'INVALID_CATEGORY', `${path}.category`)
    }
    if (!isNonEmptyString(requirement.description)) {
      addError(errors, 'MISSING_REQUIREMENT_DESCRIPTION', `${path}.description`)
    }
    if (typeof requirement.required !== 'boolean') {
      addError(errors, 'INVALID_REQUIRED_FLAG', `${path}.required`)
    }

    const arcana = getArcana(requirement.arcanaId)
    const gate = getGateById(requirement.gateId)
    if (!arcana) addError(errors, 'INVALID_ARCANA_REFERENCE', `${path}.arcanaId`)
    if (!gate) {
      addError(errors, 'INVALID_GATE_REFERENCE', `${path}.gateId`)
    } else {
      if (gate.arcana !== requirement.arcanaId) {
        addError(errors, 'ARCANA_GATE_MISMATCH', `${path}.arcanaId`)
      }
      if (!gate.days.some((day) => day.id === requirement.stageId)) {
        addError(errors, 'INVALID_STAGE_REFERENCE', `${path}.stageId`)
      }
    }

    if (requirement.supportingEvidenceTypes !== undefined) {
      validateEnumArray(
        requirement.supportingEvidenceTypes,
        EVIDENCE_TYPES,
        errors,
        `${path}.supportingEvidenceTypes`,
        { required: false },
      )
    }

    const conditionIds = new Set()
    if (requirement.condition === undefined) {
      addError(errors, 'MISSING_CONDITION_TREE', `${path}.condition`)
    } else {
      validateConditionNode(requirement.condition, {
        errors,
        path: `${path}.condition`,
        conditionIds,
        category: requirement.category,
        activeNodes: new WeakSet(),
        depth: 1,
      })
    }
    if (requirement.applicability !== undefined) {
      validateApplicability(requirement.applicability, {
        errors,
        path: `${path}.applicability`,
        conditionIds,
        category: requirement.category,
        activeNodes: new WeakSet(),
      })
    }
  }

  return { valid: errors.length === 0, errors }
}
