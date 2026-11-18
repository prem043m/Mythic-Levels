import { REGISTRY_VERSION } from '@/data/requirements/schemaV1'

const leaf = (conditionId, description, evidenceTypes, missingEvidenceCodes, extra = {}) => ({
  conditionId,
  description,
  evidenceTypes,
  acceptedActionStatuses: ['COMPLETED'],
  attemptPolicy: 'EVIDENCE_ONLY',
  missingEvidenceCodes,
  ...extra,
})

const registry = (requirement) => ({
  registryVersion: REGISTRY_VERSION,
  requirements: [requirement],
})

export const REQUIREMENT_FIXTURES = [
  {
    name: 'Beast-01 D1 compound attention task',
    expectedValid: true,
    registry: registry({
      requirementId: 'beast-01-day-1-attention-return',
      arcanaId: 'beast',
      gateId: 'beast-01',
      stageId: 'beast-01-day-1',
      category: 'AWARENESS',
      description: 'Notice attention leaving, name it Gremlin, return, and count returns.',
      required: true,
      condition: {
        operator: 'ALL_OF',
        children: [
          leaf('chosen-task', 'Choose one closed task.', ['situation'], ['MISSING_TASK']),
          leaf('attention-noticed', 'Notice each time attention leaves.', ['reflection'], ['MISSING_NOTICING']),
          leaf('lapse-named', 'Silently name each lapse Gremlin.', ['reflection'], ['MISSING_NAMING']),
          leaf('attention-returned', 'Return to the task after each lapse.', ['reflection'], ['MISSING_RETURN']),
          leaf('returns-counted', 'Count the returns.', ['reflection'], ['MISSING_COUNT']),
          leaf('ten-minute-interval', 'Report the stated ten-minute interval.', ['situation', 'reflection'], ['MISSING_INTERVAL']),
        ],
      },
      supportingEvidenceTypes: ['outcome'],
    }),
  },
  {
    name: 'Beast-02 D4 conditional resistance',
    expectedValid: false,
    expectedError: 'MISSING_NOT_APPLICABLE_POLICY',
    registry: registry({
      requirementId: 'beast-02-day-4-clarify-before-responding',
      arcanaId: 'beast',
      gateId: 'beast-02',
      stageId: 'beast-02-day-4',
      category: 'RESISTANCE',
      description: 'Ask two clarifying questions before stating a position when disagreeing.',
      required: true,
      applicability: {
        when: 'A disagreement occurs today.',
        evidenceTypes: ['difficulty'],
      },
      condition: {
        operator: 'ALL_OF',
        children: [
          leaf('disagreement-described', 'Describe the disagreement.', ['difficulty'], ['MISSING_DISAGREEMENT']),
          leaf(
            'questions-before-position',
            'Ask two clarifying questions before stating a position.',
            ['difficulty', 'action', 'outcome'],
            ['MISSING_QUESTIONS', 'MISSING_ORDER'],
            {
              acceptedActionStatuses: ['SUCCESSFUL_RESISTANCE'],
              resistancePolicy: 'SUCCESS_REQUIRED',
            },
          ),
        ],
      },
    }),
  },
  {
    name: 'Beast-01 D5 ordinary activity and focus',
    expectedValid: true,
    registry: registry({
      requirementId: 'beast-01-day-5-focus-without-second-screen',
      arcanaId: 'beast',
      gateId: 'beast-01',
      stageId: 'beast-01-day-5',
      category: 'APPLICATION',
      description: 'Choose one daily activity and do it without a second screen.',
      required: true,
      condition: {
        operator: 'ALL_OF',
        children: [
          leaf('activity-identified', 'Identify one ordinary activity.', ['situation'], ['MISSING_ACTIVITY']),
          leaf('activity-completed', 'Report doing it without a second screen.', ['action', 'outcome'], ['MISSING_ACTION', 'MISSING_NO_SECOND_SCREEN']),
        ],
      },
      supportingEvidenceTypes: ['reflection', 'difficulty'],
    }),
  },
  {
    name: 'Human-04 D3 300–500 word writing task',
    expectedValid: true,
    registry: registry({
      requirementId: 'human-04-day-3-explain-an-idea',
      arcanaId: 'human',
      gateId: 'human-04',
      stageId: 'human-04-day-3',
      category: 'EXPRESSION',
      description: 'Write 300–500 words explaining one idea as if to an intelligent stranger.',
      required: true,
      condition: {
        conditionId: 'written-explanation',
        description: 'Submit the requested explanation in the word range.',
        evidenceTypes: ['action'],
        acceptedActionStatuses: ['COMPLETED'],
        attemptPolicy: 'EVIDENCE_ONLY',
        wordCount: { field: 'action', min: 300, max: 500, tokenizer: 'unicode-word-v1' },
        missingEvidenceCodes: ['MISSING_EXPLANATION', 'WORD_COUNT_FIELD_MISSING'],
      },
      supportingEvidenceTypes: ['reflection'],
    }),
  },
  {
    name: 'Sage-02 D4 written or self-reported spoken explanation',
    expectedValid: true,
    registry: registry({
      requirementId: 'sage-02-day-4-explain-and-limit-an-idea',
      arcanaId: 'sage',
      gateId: 'sage-02',
      stageId: 'sage-02-day-4',
      category: 'EXPRESSION',
      description: 'Teach the concept in writing or by a self-reported spoken explanation, and include a limit.',
      required: true,
      condition: {
        operator: 'ALL_OF',
        children: [
          {
            operator: 'ANY_OF',
            children: [
              {
                ...leaf('written-explanation', 'Give a 400-word written explanation.', ['action'], ['MISSING_WRITTEN_EXPLANATION']),
                wordCount: { field: 'action', min: 400, max: 400, tokenizer: 'unicode-word-v1' },
              },
              leaf(
                'spoken-explanation',
                'Report giving a five-minute spoken explanation; this is self-reported, not independently verified.',
                ['action', 'outcome'],
                ['MISSING_SPOKEN_EXPLANATION'],
              ),
            ],
          },
          leaf('idea-limitation', 'Include a limit of the idea.', ['action', 'outcome'], ['MISSING_LIMITATION']),
        ],
      },
      supportingEvidenceTypes: ['reflection'],
    }),
  },
  {
    name: 'Sage-05 D5 conditional repair',
    expectedValid: false,
    expectedError: 'MISSING_NOT_APPLICABLE_POLICY',
    registry: registry({
      requirementId: 'sage-05-day-5-non-catastrophic-repair',
      arcanaId: 'sage',
      gateId: 'sage-05',
      stageId: 'sage-05-day-5',
      category: 'ACTION',
      description: 'When something goes wrong, run a 15-minute repair: name, adjust, continue.',
      required: true,
      applicability: {
        when: 'Something goes wrong today.',
        evidenceTypes: ['situation', 'outcome'],
      },
      condition: {
        operator: 'ALL_OF',
        children: [
          leaf('problem-named', 'Name what went wrong.', ['situation', 'outcome'], ['MISSING_NAMING']),
          leaf('adjustment-made', 'Make an adjustment.', ['action'], ['MISSING_ADJUSTMENT']),
          leaf('continued', 'Continue after the adjustment.', ['action', 'outcome'], ['MISSING_CONTINUATION']),
          leaf('repair-duration', 'Report the stated 15-minute repair.', ['action', 'outcome'], ['MISSING_REPAIR_DURATION']),
        ],
      },
    }),
  },
]
