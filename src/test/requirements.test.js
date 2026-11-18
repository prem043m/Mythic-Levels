import { describe, expect, it } from 'vitest'
import { validateRequirementRegistry } from '@/data/requirements/validateRegistry'
import {
  APPLICABILITY_STATES,
  REQUIREMENT_OUTCOMES,
  isRequirementOutcome,
} from '@/data/requirements/schemaV1'
import { MAX_CONDITION_TREE_DEPTH } from '@/data/requirements/validateRegistry'
import { REQUIREMENT_FIXTURES } from './requirementRegistry.fixtures'

const clone = (value) => JSON.parse(JSON.stringify(value))

const validSimpleRegistry = () => ({
  registryVersion: 'gate-requirements-v1',
  requirements: [{
    requirementId: 'beast-01-day-5-focus',
    arcanaId: 'beast',
    gateId: 'beast-01',
    stageId: 'beast-01-day-5',
    category: 'APPLICATION',
    description: 'Complete an ordinary activity without a second screen.',
    required: true,
    condition: {
      conditionId: 'activity-done',
      description: 'Report doing the activity without a second screen.',
      evidenceTypes: ['action', 'outcome'],
      acceptedActionStatuses: ['COMPLETED'],
      attemptPolicy: 'EVIDENCE_ONLY',
      missingEvidenceCodes: ['MISSING_ACTION'],
    },
  }],
})

const errorCodes = (registry) => validateRequirementRegistry(registry).errors.map((error) => error.code)

function deepFreeze(value, seen = new WeakSet()) {
  if (value === null || typeof value !== 'object' || seen.has(value)) return value
  seen.add(value)
  Object.values(value).forEach((child) => deepFreeze(child, seen))
  return Object.freeze(value)
}

describe('static Gate requirement registry schema', () => {
  it('accepts a valid simple requirement and canonical references', () => {
    expect(validateRequirementRegistry(validSimpleRegistry())).toEqual({ valid: true, errors: [] })
  })

  it('accepts a valid ALL_OF requirement', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].condition = {
      operator: 'ALL_OF',
      children: [
        registry.requirements[0].condition,
        {
          conditionId: 'activity-identified',
          description: 'Identify the ordinary activity.',
          evidenceTypes: ['situation'],
          missingEvidenceCodes: ['MISSING_ACTIVITY'],
        },
      ],
    }
    expect(validateRequirementRegistry(registry).valid).toBe(true)
  })

  it('accepts valid nested ANY_OF alternatives', () => {
    const fixture = REQUIREMENT_FIXTURES.find((item) => item.name.startsWith('Sage-02'))
    expect(validateRequirementRegistry(clone(fixture.registry))).toEqual({ valid: true, errors: [] })
  })

  it('rejects an empty condition tree', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].condition = { operator: 'ALL_OF', children: [] }
    expect(errorCodes(registry)).toContain('EMPTY_CONDITION_GROUP')
  })

  it('rejects duplicate requirement IDs', () => {
    const registry = validSimpleRegistry()
    registry.requirements.push(clone(registry.requirements[0]))
    expect(errorCodes(registry)).toContain('DUPLICATE_REQUIREMENT_ID')
  })

  it('rejects duplicate condition IDs within a requirement', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].condition = {
      operator: 'ALL_OF',
      children: [
        registry.requirements[0].condition,
        {
          conditionId: 'activity-done',
          description: 'A second condition with a duplicate ID.',
          evidenceTypes: ['outcome'],
          missingEvidenceCodes: ['MISSING_OUTCOME'],
        },
      ],
    }
    expect(errorCodes(registry)).toContain('DUPLICATE_CONDITION_ID')
  })

  it('rejects invalid Gate and stage references', () => {
    const badGate = validSimpleRegistry()
    badGate.requirements[0].gateId = 'beast-99'
    expect(errorCodes(badGate)).toContain('INVALID_GATE_REFERENCE')

    const badStage = validSimpleRegistry()
    badStage.requirements[0].stageId = 'beast-01-day-99'
    expect(errorCodes(badStage)).toContain('INVALID_STAGE_REFERENCE')
  })

  it('rejects Arcana/Gate mismatches', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].arcanaId = 'sage'
    expect(errorCodes(registry)).toContain('ARCANA_GATE_MISMATCH')
  })

  it('rejects unsupported categories and evidence types', () => {
    const badCategory = validSimpleRegistry()
    badCategory.requirements[0].category = 'COMPLETION'
    expect(errorCodes(badCategory)).toContain('INVALID_CATEGORY')

    const badEvidence = validSimpleRegistry()
    badEvidence.requirements[0].condition.evidenceTypes = ['audio']
    expect(errorCodes(badEvidence)).toContain('INVALID_ENUM_VALUE')
  })

  it('does not allow supporting evidence or outcome values to become condition logic', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].condition.supportingEvidenceTypes = ['reflection']
    expect(errorCodes(registry)).toContain('UNKNOWN_FIELD')

    const badOutcome = validSimpleRegistry()
    badOutcome.requirements[0].outcome = 'ACCEPTED'
    expect(errorCodes(badOutcome)).toContain('UNKNOWN_FIELD')
    expect(isRequirementOutcome('ACCEPTED')).toBe(false)
  })

  it('rejects attempts that conflict with their policy', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].condition.acceptedActionStatuses = ['COMPLETED', 'ATTEMPTED']
    expect(errorCodes(registry)).toContain('ATTEMPT_POLICY_MISMATCH')

    const impossibleStatus = validSimpleRegistry()
    impossibleStatus.requirements[0].condition.acceptedActionStatuses = ['NOT_STARTED']
    expect(errorCodes(impossibleStatus)).toContain('UNSATISFIABLE_ACTION_STATUS')

    const attemptRequirement = validSimpleRegistry()
    attemptRequirement.requirements[0].condition.acceptedActionStatuses = ['ATTEMPTED']
    attemptRequirement.requirements[0].condition.attemptPolicy = 'SATISFIES_REQUIREMENT'
    expect(validateRequirementRegistry(attemptRequirement).valid).toBe(true)
  })

  it('requires successful-resistance evidence and a matching policy', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].condition.acceptedActionStatuses = ['SUCCESSFUL_RESISTANCE']
    expect(errorCodes(registry)).toContain('RESISTANCE_POLICY_MISMATCH')

    registry.requirements[0].condition.resistancePolicy = 'SUCCESS_REQUIRED'
    registry.requirements[0].condition.evidenceTypes = ['difficulty', 'action', 'outcome']
    expect(validateRequirementRegistry(registry).valid).toBe(true)
  })

  it('does not let an unsuccessful attempt satisfy SUCCESS_REQUIRED', () => {
    const registry = validSimpleRegistry()
    const condition = registry.requirements[0].condition
    condition.evidenceTypes = ['difficulty', 'action', 'outcome']
    condition.acceptedActionStatuses = ['SUCCESSFUL_RESISTANCE', 'ATTEMPTED']
    condition.attemptPolicy = 'SATISFIES_REQUIREMENT'
    condition.resistancePolicy = 'SUCCESS_REQUIRED'

    expect(errorCodes(registry)).toContain('ATTEMPT_POLICY_MISMATCH')
  })

  it('preserves valid configurations for other resistance policies', () => {
    const attemptRequired = validSimpleRegistry()
    attemptRequired.requirements[0].condition.acceptedActionStatuses = ['ATTEMPTED']
    attemptRequired.requirements[0].condition.attemptPolicy = 'SATISFIES_REQUIREMENT'
    attemptRequired.requirements[0].condition.resistancePolicy = 'ATTEMPT_REQUIRED'

    const learningOnly = validSimpleRegistry()
    learningOnly.requirements[0].category = 'LEARNING'
    learningOnly.requirements[0].condition.evidenceTypes = ['outcome', 'reflection']
    learningOnly.requirements[0].condition.resistancePolicy = 'LEARNING_ONLY'

    const notRequired = validSimpleRegistry()
    notRequired.requirements[0].condition.resistancePolicy = 'NOT_REQUIRED'

    for (const registry of [attemptRequired, learningOnly, notRequired]) {
      expect(validateRequirementRegistry(registry)).toEqual({ valid: true, errors: [] })
    }
  })

  it('requires a complete alternative task for ALTERNATIVE_TASK policy', () => {
    const registry = validSimpleRegistry()
    registry.requirements[0].applicability = {
      when: 'The trigger occurs.',
      evidenceTypes: ['difficulty'],
      onNotApplicable: 'ALTERNATIVE_TASK',
    }
    expect(errorCodes(registry)).toContain('MISSING_ALTERNATIVE_TASK')

    registry.requirements[0].applicability.alternativeTask = {
      conditionId: 'approved-alternative',
      description: 'Approved alternative condition.',
      evidenceTypes: ['action'],
      acceptedActionStatuses: ['COMPLETED'],
      attemptPolicy: 'EVIDENCE_ONLY',
      missingEvidenceCodes: ['MISSING_ALTERNATIVE'],
    }
    expect(validateRequirementRegistry(registry).valid).toBe(true)
  })

  it('rejects malformed condition children and alternatives without throwing', () => {
    const nonArrayChildren = validSimpleRegistry()
    nonArrayChildren.requirements[0].condition = {
      operator: 'ALL_OF',
      children: {},
    }
    expect(() => validateRequirementRegistry(nonArrayChildren)).not.toThrow()
    expect(errorCodes(nonArrayChildren)).toContain('INVALID_CONDITION_CHILDREN')

    const nullChild = validSimpleRegistry()
    nullChild.requirements[0].condition = { operator: 'ALL_OF', children: [null] }
    expect(() => validateRequirementRegistry(nullChild)).not.toThrow()
    expect(errorCodes(nullChild)).toContain('INVALID_CONDITION_NODE')

    const malformedAlternative = validSimpleRegistry()
    malformedAlternative.requirements[0].applicability = {
      when: 'The condition occurs.',
      evidenceTypes: ['situation'],
      onNotApplicable: 'ALTERNATIVE_TASK',
      alternativeTask: { operator: 'ALL_OF', children: [null] },
    }
    expect(() => validateRequirementRegistry(malformedAlternative)).not.toThrow()
    expect(errorCodes(malformedAlternative)).toContain('INVALID_CONDITION_NODE')
  })

  it('rejects non-array requirements, evidence types, and missing-evidence codes safely', () => {
    const invalidRequirements = validSimpleRegistry()
    invalidRequirements.requirements = {}
    expect(() => validateRequirementRegistry(invalidRequirements)).not.toThrow()
    expect(errorCodes(invalidRequirements)).toContain('INVALID_REQUIREMENTS')

    const invalidEvidenceTypes = validSimpleRegistry()
    invalidEvidenceTypes.requirements[0].condition.evidenceTypes = {}
    invalidEvidenceTypes.requirements[0].condition.wordCount = {
      field: 'action',
      min: 1,
      max: 2,
      tokenizer: 'unicode-word-v1',
    }
    expect(() => validateRequirementRegistry(invalidEvidenceTypes)).not.toThrow()
    expect(errorCodes(invalidEvidenceTypes)).toContain('INVALID_ENUM_ARRAY')

    const invalidMissingEvidenceCodes = validSimpleRegistry()
    invalidMissingEvidenceCodes.requirements[0].condition.missingEvidenceCodes = 'MISSING_ACTION'
    expect(() => validateRequirementRegistry(invalidMissingEvidenceCodes)).not.toThrow()
    expect(errorCodes(invalidMissingEvidenceCodes)).toContain('INVALID_MISSING_EVIDENCE_CODES')
  })

  it('returns structured errors for invalid roots and missing required registry properties', () => {
    for (const value of [null, undefined, 7, 'registry', []]) {
      expect(() => validateRequirementRegistry(value)).not.toThrow()
      expect(errorCodes(value)).toContain('INVALID_REGISTRY')
    }

    const missingRequirements = { registryVersion: 'gate-requirements-v1' }
    expect(errorCodes(missingRequirements)).toContain('INVALID_REQUIREMENTS')
    expect(errorCodes({ requirements: [] })).toContain('MISSING_REGISTRY_VERSION')
  })

  it('rejects sparse requirements, children, evidence types, and missing-evidence codes', () => {
    const sparseRequirements = validSimpleRegistry()
    sparseRequirements.requirements = new Array(1)

    const sparseChildren = validSimpleRegistry()
    sparseChildren.requirements[0].condition = {
      operator: 'ALL_OF',
      children: new Array(1),
    }

    const sparseEvidenceTypes = validSimpleRegistry()
    sparseEvidenceTypes.requirements[0].condition.evidenceTypes = new Array(1)

    const sparseMissingEvidenceCodes = validSimpleRegistry()
    sparseMissingEvidenceCodes.requirements[0].condition.missingEvidenceCodes = new Array(1)

    for (const registry of [
      sparseRequirements,
      sparseChildren,
      sparseEvidenceTypes,
      sparseMissingEvidenceCodes,
    ]) {
      expect(errorCodes(registry)).toContain('SPARSE_ARRAY_ENTRY')
    }
  })

  it('rejects invalid word-count bounds and tokenizer identifiers safely', () => {
    const invalidBounds = [
      { min: -1, max: 10, code: 'INVALID_WORD_COUNT_MIN' },
      { min: 1.5, max: 10, code: 'INVALID_WORD_COUNT_MIN' },
      { min: '1', max: 10, code: 'INVALID_WORD_COUNT_MIN' },
      { min: 1, max: -1, code: 'INVALID_WORD_COUNT_MAX' },
      { min: 1, max: 1.5, code: 'INVALID_WORD_COUNT_MAX' },
      { min: 11, max: 10, code: 'INVALID_WORD_COUNT_MAX' },
      { min: 1, max: Symbol('max'), code: 'INVALID_WORD_COUNT_MAX' },
    ]

    for (const bounds of invalidBounds) {
      const registry = clone(REQUIREMENT_FIXTURES.find((item) => item.name.startsWith('Human-04')).registry)
      Object.assign(registry.requirements[0].condition.wordCount, {
        min: bounds.min,
        max: bounds.max,
      })
      expect(() => validateRequirementRegistry(registry)).not.toThrow()
      expect(errorCodes(registry)).toContain(bounds.code)
    }

    const unsupportedTokenizer = clone(
      REQUIREMENT_FIXTURES.find((item) => item.name.startsWith('Human-04')).registry,
    )
    unsupportedTokenizer.requirements[0].condition.wordCount.tokenizer = 'unsupported-v2'
    expect(errorCodes(unsupportedTokenizer)).toContain('INVALID_WORD_COUNT_TOKENIZER')

    const malformedWordCount = validSimpleRegistry()
    malformedWordCount.requirements[0].condition.wordCount = null
    expect(() => validateRequirementRegistry(malformedWordCount)).not.toThrow()
    expect(errorCodes(malformedWordCount)).toContain('INVALID_WORD_COUNT')
  })

  it('rejects cyclic and excessively deep condition and alternative trees', () => {
    const cyclicRegistry = validSimpleRegistry()
    const cyclicGroup = { operator: 'ALL_OF', children: [] }
    cyclicGroup.children.push(cyclicGroup)
    cyclicRegistry.requirements[0].condition = cyclicGroup
    expect(() => validateRequirementRegistry(cyclicRegistry)).not.toThrow()
    expect(errorCodes(cyclicRegistry)).toContain('CYCLIC_CONDITION_TREE')

    const makeDeepCondition = (depth) => {
      let condition = {
        conditionId: 'deep-leaf',
        description: 'A leaf at the requested depth.',
        evidenceTypes: ['action'],
        missingEvidenceCodes: ['MISSING_ACTION'],
      }
      for (let index = 1; index < depth; index += 1) {
        condition = { operator: 'ALL_OF', children: [condition] }
      }
      return condition
    }

    const maximumDepth = validSimpleRegistry()
    maximumDepth.requirements[0].condition = makeDeepCondition(MAX_CONDITION_TREE_DEPTH)
    expect(validateRequirementRegistry(maximumDepth).valid).toBe(true)

    const tooDeep = validSimpleRegistry()
    tooDeep.requirements[0].condition = makeDeepCondition(MAX_CONDITION_TREE_DEPTH + 1)
    expect(() => validateRequirementRegistry(tooDeep)).not.toThrow()
    expect(errorCodes(tooDeep)).toContain('MAX_CONDITION_DEPTH_EXCEEDED')

    const deepAlternative = validSimpleRegistry()
    deepAlternative.requirements[0].applicability = {
      when: 'The condition occurs.',
      evidenceTypes: ['situation'],
      onNotApplicable: 'ALTERNATIVE_TASK',
      alternativeTask: makeDeepCondition(MAX_CONDITION_TREE_DEPTH + 1),
    }
    expect(errorCodes(deepAlternative)).toContain('MAX_CONDITION_DEPTH_EXCEEDED')
  })

  it('does not mutate the registry being validated', () => {
    const registry = deepFreeze(validSimpleRegistry())
    const before = JSON.stringify(registry)

    expect(validateRequirementRegistry(registry)).toEqual({ valid: true, errors: [] })
    expect(JSON.stringify(registry)).toBe(before)
  })

  it('rejects invalid word-count bounds and field references', () => {
    const registry = clone(REQUIREMENT_FIXTURES.find((item) => item.name.startsWith('Human-04')).registry)
    registry.requirements[0].condition.wordCount.min = 501
    expect(errorCodes(registry)).toContain('INVALID_WORD_COUNT_MAX')

    registry.requirements[0].condition.wordCount = {
      field: 'reflection',
      min: 300,
      max: 500,
      tokenizer: 'unicode-word-v1',
    }
    expect(errorCodes(registry)).toContain('INVALID_WORD_COUNT_FIELD')
  })

  it('does not silently default a missing conditional policy to EXEMPT', () => {
    const fixture = REQUIREMENT_FIXTURES.find((item) => item.name.startsWith('Sage-05'))
    expect(errorCodes(clone(fixture.registry))).toContain('MISSING_NOT_APPLICABLE_POLICY')
  })

  it('checks all six representative fixtures, preserving pending conditional policies', () => {
    expect(REQUIREMENT_FIXTURES).toHaveLength(6)
    for (const fixture of REQUIREMENT_FIXTURES) {
      const result = validateRequirementRegistry(clone(fixture.registry))
      expect(result.valid, fixture.name).toBe(fixture.expectedValid)
      if (fixture.expectedError) {
        expect(result.errors.map((error) => error.code), fixture.name).toContain(fixture.expectedError)
      }
    }
  })

  it('exports applicability and outcome enums without accepting unsupported outcomes', () => {
    expect(APPLICABILITY_STATES).toEqual(['APPLICABLE', 'NOT_APPLICABLE', 'UNCLEAR'])
    expect(REQUIREMENT_OUTCOMES).toEqual(['SATISFIED', 'UNSATISFIED', 'NOT_APPLICABLE', 'UNRESOLVED'])
    expect(isRequirementOutcome('SATISFIED')).toBe(true)
    expect(isRequirementOutcome('ACCEPTED')).toBe(false)
  })
})
