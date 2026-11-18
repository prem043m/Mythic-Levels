# Human Evaluation Results — V1

## Run status

- **Status:** Not run.
- **Harness:** Development-only Human Evaluation Lab (`http://localhost:5173/#/evaluation-test`); evaluator-only, no persistence or rewards.
- **Run date:** —
- **Evaluation configuration/version:** —

Do not enter the cases into the existing Compass Gate as a substitute. Complete the blind human labels before opening the reference-label section below. The lab does not test progression rewards; record full-pipeline checks separately and only against disposable data.

## Per-case results

Record human scores as 0–4 and engine dimensions as 0–100. Convert human dimension scores to 0–100 for metric calculations; engine quality is recorded separately from its four dimensions.

| ID | Human decision | A 0–4 | R 0–4 | D 0–4 | F 0–4 | Engine decision | Engine quality | Confidence | Engine A/R/D/F | Missing criteria / feedback | XP / attribute / mastery changes | Match? | Notes |
|---|---|---:|---:|---:|---:|---|---:|---:|---|---|---|---|---|
| H01 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H02 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H03 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H04 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H05 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H06 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H07 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H08 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H09 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H10 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H11 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H12 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H13 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H14 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H15 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H16 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H17 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H18 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H19 |  |  |  |  |  |  |  |  |  |  |  |  |  |
| H20 |  |  |  |  |  |  |  |  |  |  |  |  |  |

## Pilot measurements

Leave blank until all valid cases have been recorded.

| Metric | Result | Numerator / denominator | Notes |
|---|---:|---:|---|
| Decision agreement |  |  |  |
| False acceptance rate |  |  |  |
| False rejection rate |  |  |  |
| Human/engine review-rate difference |  |  |  |
| Mean absolute difference — Action |  |  |  |
| Mean absolute difference — Relevance |  |  |  |
| Mean absolute difference — Difficulty |  |  |  |
| Mean absolute difference — Reflection |  |  |  |
| Invalid/missing-field detection |  |  |  |

## Additional safety and duplicate tests

Run only against an isolated, restorable test profile/database. Record evidence or a short result for each test.

| Test | Result | Evidence / notes |
|---|---|---|
| Exact duplicate — no second XP payout | Not run |  |
| Slightly reworded duplicate | Not run |  |
| Same answer submitted to another Gate | Not run |  |
| Very long response | Not run |  |
| Empty response | Not run |  |
| Contradictory response | Not run |  |
| Repeated revision — no reward farming | Not run |  |
| Edit accepted evidence — no second payout | Not run |  |
| Evaluator unavailable — safe fallback | Not run |  |
| Invalid evaluator output — no reward | Not run |  |

## Existing automated safety coverage (not a V1 dataset run)

The repository already has isolated automated tests for general progression behavior. These do not replace the human-labelled V1 run or test its full challenge fixture:

- Duplicate completion does not award a quest twice: [engine.test.js](../../src/test/engine.test.js) and [evaluation.test.js](../../src/test/evaluation.test.js).
- Malformed evaluator proposals cannot grant acceptance/rewards: [evaluation.test.js](../../src/test/evaluation.test.js).
- Revising accepted evidence does not re-award XP: [gmp.test.js](../../src/test/gmp.test.js).

<details>
<summary>Suggested reference labels — expand only after recording the blind human labels</summary>

These are suggested human judgements for this specific quest, not engine results or authoritative ground truth.

| ID | A | R | D | F | Suggested human decision | Reason |
|---|---:|---:|---:|---:|---|---|
| H01 | 4 | 4 | 4 | 4 | ACCEPTED | Specific action and meaningful reflection |
| H02 | 4 | 4 | 3 | 4 | ACCEPTED | Relevant action and clear learning |
| H03 | 4 | 4 | 4 | 4 | ACCEPTED | Describes action, resistance, and adjustment |
| H04 | 4 | 4 | 3 | 4 | ACCEPTED | Strong completion and reflection |
| H05 | 4 | 4 | 4 | 4 | ACCEPTED | Specific action and useful learning |
| H06 | 1 | 3 | 1 | 1 | NEEDS_REVISION | Too vague |
| H07 | 1 | 3 | 2 | 2 | NEEDS_REVISION | Attempt described, but task not completed |
| H08 | 3 | 3 | 0 | 0 | INSUFFICIENT_INFORMATION | Missing required information |
| H09 | 2 | 4 | 1 | 1 | NEEDS_REVISION | Minimal reflection |
| H10 | 1 | 2 | 1 | 1 | NEEDS_REVISION | No meaningful description |
| H11 | 4 | 0 | 3 | 3 | REVIEW_REQUIRED | Cooking is unrelated to the study quest |
| H12 | 4 | 1 | 3 | 2 | REVIEW_REQUIRED | Exercise does not satisfy the study objective |
| H13 | 2 | 1 | 2 | 2 | REVIEW_REQUIRED | Watching content is not the requested activity |
| H14 | 3 | 1 | 2 | 2 | REVIEW_REQUIRED | File organization is unrelated to the quest |
| H15 | 4 | 4 | 3 | 3 | ACCEPTED | Valid completion; no difficulty is not automatically a failure |
| H16 | 4 | 4 | 3 | 2 | REVIEW_REQUIRED | Contradictory account requires review |
| H17 | 1 | 3 | 1 | 1 | NEEDS_REVISION | Insufficient action detail |
| H18 | 4 | 4 | 3 | 3 | ACCEPTED | Meets the task and reflection requirements |
| H19 | 1 | 3 | 4 | 3 | NEEDS_REVISION | No actual task completion |
| H20 | 4 | 4 | 3 | 1 | NEEDS_REVISION | Action is adequate, reflection is weak |

</details>
