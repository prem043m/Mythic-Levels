// Every tunable number of the Gate Mastery Protocol lives here, each with its reason.
// Change values here (not in logic) once the product owner has approved them.
export const GMP = {
  // V2 weights (product proposal): the final trial counts most; application is a first-class dimension. Sum = 1.
  weights: { practice: 0.2, consistency: 0.15, reflection: 0.15, application: 0.2, finalTrial: 0.3 },
  // At most 2 new stages per calendar day: one regular stage plus one catch-up after a missed day. This stops a Gate being
  // rushed in one sitting, and fixes the minimum number of practice days at ceil(7 / 2) = 4 without a separate magic number.
  maxStagesPerDay: 2,
  // A clear majority (4 of 7) of stage reflections must be accepted by the rubric.
  minAcceptedReflections: 4,
  // Stages that must show real-world action, and how many of them must do so.
  applicationPhases: ['resistance', 'application', 'challenge'],
  minAcceptedApplication: 2,
  // The ritual's length comes from each Gate's own trial duration (never one number for all 27).
  ritual: { minFractionOfTarget: 0.8, maxCountedFraction: 1.5 },
}
