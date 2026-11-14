// Tunable numbers of the Action Evaluation system. Each has a reason; change here, not in logic.
// All values are PROPOSALS awaiting product approval and calibration against human-labelled data.
export const EVAL = {
  rubricVersion: 'rubric-v1',
  // Quality (0-100) needed for ACCEPTED, and the floor every KEY dimension of a stage must reach.
  acceptQuality: 60,
  keyFloor: 50,
  // Below this confidence the evaluator abstains (INSUFFICIENT_INFORMATION) instead of guessing.
  minConfidence: 0.5,
  // Distinct content words that give the evaluator full confidence (about 2-3 sentences).
  fullConfidenceTokens: 25,
  // A required guided field needs at least this many distinct content words ("At my desk this morning" is a complete answer).
  minFieldTokens: 2,
  // If an external evaluator scores this far above the rule-based baseline they disagree: a human/second review is needed.
  maxDisagreement: 40,
  maxNarrativeChars: 4000,
  // Dimension weights per stage type (each row sums to 1). Spec example for a generic reflective task: 25/25/20/30.
  defaultWeights: { actionSpecificity: 0.25, taskRelevance: 0.25, difficultyAwareness: 0.2, reflectionQuality: 0.3 },
  phases: {
    recognition: { weights: { actionSpecificity: 0.15, taskRelevance: 0.3, difficultyAwareness: 0.25, reflectionQuality: 0.3 }, key: ['taskRelevance', 'difficultyAwareness'] },
    observation: { weights: { actionSpecificity: 0.2, taskRelevance: 0.25, difficultyAwareness: 0.35, reflectionQuality: 0.2 }, key: ['difficultyAwareness'] },
    practice: { weights: { actionSpecificity: 0.4, taskRelevance: 0.25, difficultyAwareness: 0.1, reflectionQuality: 0.25 }, key: ['actionSpecificity'] },
    resistance: { weights: { actionSpecificity: 0.3, taskRelevance: 0.2, difficultyAwareness: 0.3, reflectionQuality: 0.2 }, key: ['difficultyAwareness', 'actionSpecificity'] },
    application: { weights: { actionSpecificity: 0.35, taskRelevance: 0.2, difficultyAwareness: 0.15, reflectionQuality: 0.3 }, key: ['actionSpecificity'] },
    challenge: { weights: { actionSpecificity: 0.3, taskRelevance: 0.15, difficultyAwareness: 0.25, reflectionQuality: 0.3 }, key: ['actionSpecificity', 'reflectionQuality'] },
    trial: { weights: { actionSpecificity: 0.15, taskRelevance: 0.2, difficultyAwareness: 0.25, reflectionQuality: 0.4 }, key: ['reflectionQuality'] },
  },
  // Adaptive difficulty: needs `window` consecutive observations, so one bad (or good) submission never moves it.
  difficulty: { window: 2, strongQuality: 85, weakQuality: 65, scaffoldFactor: 0.5, minScaffoldMinutes: 5 },
  // Candidate ranking weights (sum 1): gate relevance, mastery need, difficulty fit, time fit, recovery fit.
  ranking: { gate: 0.15, need: 0.3, fit: 0.15, time: 0.15, recovery: 0.25 },
}
