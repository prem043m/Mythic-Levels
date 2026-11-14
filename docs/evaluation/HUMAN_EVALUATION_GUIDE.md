# Human Evaluation Guide — V1

## Purpose

This pilot is intended to measure V5's submission evaluator against an independent human judgement. The human judges the quality and relevance of the submitted account, not whether the player is telling the truth. Evidence remains self-reported.

The existing tuning and held-out examples are implementer-labelled and are not part of this independent pilot. Do not use this dataset to change thresholds or weights before recording the first results.

## Evaluation target

The supplied cases describe this one test quest:

- **Quest:** The First Resistance
- **Gate:** Compass of Discipline
- **Stage:** Challenge
- **Objective:** Complete a focused 20-minute study session without checking your phone.

The test assumes the stage asks for five fields: situation, action, difficulty, outcome, and reflection. Use the same quest, stage, prompt, and current evaluation configuration for every case.

### Isolated evaluation screen

The current V5 interface does not contain this test quest or stage. The existing Compass Gate is `human-03`; its first stage is **“Name your north”**, with a task to write a personal direction and the daily action that proves it. That is not the 20-minute study objective in this dataset. The interface also restricts submissions to the currently open stage.

To avoid evaluating a different quest or touching player progression, V5 now provides a development-only **Human Evaluation Lab** at `http://localhost:5173/#/evaluation-test` when running `npm run dev`. Open that URL directly in a fresh tab. The screen loads the fixture in memory, displays the five editable fields, and calls the same `evaluateSubmission` pipeline used by V5.

The lab deliberately does **not** call the normal Gate completion/reward path. It does not load or update player progress, write to storage, or award XP. It measures evaluator decisions only; it is not evidence that the full Gate/Stage submission and reward pipeline passed. Do not enter these cases into the existing Compass stage as a substitute. Do not change the production evaluator configuration.

The lab's machine-readable input is `src/test/calibration/human-v1/human-evaluation-v1.json`; the Markdown dataset is the human-readable copy. Keep the two synchronized if the cases are edited.

## Human scoring rubric

Score each dimension independently on a 0–4 scale:

| Rating | Meaning |
|---:|---|
| 0 | Missing or completely irrelevant |
| 1 | Very weak or vague |
| 2 | Partially satisfies the criterion |
| 3 | Clearly satisfies the criterion |
| 4 | Strong, specific, and relevant |

| Dimension | Judge |
|---|---|
| **A — Action specificity** | Is an actual action described? |
| **R — Task relevance** | Does the action address the Discipline quest? |
| **D — Difficulty awareness** | Is a real challenge or resistance described? |
| **F — Reflection quality** | Is there meaningful learning or a future adjustment? |

For comparison with the engine's 0–100 dimension scores, convert each rating as:

`dimension score = (human rating / 4) × 100`

Use the four decision labels consistently:

- **ACCEPTED:** Required criteria are adequately satisfied.
- **NEEDS_REVISION:** There is enough information to identify what needs improvement.
- **INSUFFICIENT_INFORMATION:** There is not enough usable information to evaluate.
- **REVIEW_REQUIRED:** A concern, such as a contradiction or uncertain relevance, cannot be resolved safely by normal evaluation.

Do not treat “no difficulty” as an automatic failure. Do not judge truthfulness.

## Blind evaluation procedure

1. First label all 20 cases and score their four dimensions without consulting the reference labels in `HUMAN_EVALUATION_RESULTS_V1.md`.
2. Record your human decisions, dimension ratings, and brief notes in the results sheet before submitting anything to the evaluator.
3. Start the Vite development server and open the Human Evaluation Lab directly at `http://localhost:5173/#/evaluation-test`. Preserve the current evaluation settings throughout the first run.
4. Select each case and verify its five fields match `HUMAN_LABELLED_DATASET_V1.md`; use **Evaluate** to run it.
5. Record the engine decision, quality, confidence, dimensions, missing criteria, and feedback. Mark rewards and progression as **not exercised**; the lab intentionally cannot change them.
6. Only after the blind labels are recorded, consult the collapsed reference-label section in the results sheet. These are suggested labels, not ground truth and not engine output.
7. Calculate the metrics below. Do not tune against this dataset until the initial measurements are saved.

### Outputs to record

Capture for each case:

- Decision.
- Overall quality score and confidence.
- Four dimension scores.
- Missing criteria and feedback.
- Mark XP, attribute, and mastery changes as **not exercised** for this lab.
- Harness version and run date.

The lab displays rubric dimensions, quality, confidence, missing criteria, and feedback. It does not exercise reward or progression code; record those as **not exercised** rather than inferring them from the decision.

## Pilot metrics

Use all 20 cases unless a run is explicitly marked invalid. Report the numerator and denominator with each percentage.

**Decision agreement**

`matching human/engine decisions / valid cases × 100`

**False acceptance rate (FAR)**

`human non-ACCEPTED cases the engine accepts / all human non-ACCEPTED cases × 100`

**False rejection rate (FRR)**

`human ACCEPTED cases the engine does not accept / all human ACCEPTED cases × 100`

Report `REVIEW_REQUIRED` separately as well, so safe abstention is visible rather than hidden in the FRR. Also report incorrect `INSUFFICIENT_INFORMATION` decisions separately if useful.

**Dimension agreement**

For each dimension, compare the human 0–100 score to the engine score. Report the mean absolute difference across valid cases; lower is closer.

Twenty examples are only a pilot and cannot establish production reliability. Proposed initial engineering targets—not industry benchmarks—are:

| Metric | Initial target |
|---|---:|
| Decision agreement | At least 90% |
| False acceptance | 0% preferred |
| False rejection | Below 10% |
| Duplicate reward payouts | 0 |
| Invalid evaluator output granting rewards | 0 |
| Missing-field detection on defined cases | 100% |

## Additional tests

The lab cannot run these because it intentionally has no reward or persistence path. Run applicable reward-path tests only in automated tests or a separate disposable end-to-end environment, after the 20-case blind run. Record each result in the results sheet. Never use a normal player profile or `server/data/mythic.db`.

| Test | Verify |
|---|---|
| Exact duplicate submission | No second XP payout |
| Slightly reworded duplicate | Similarity detection behaves sensibly |
| Same answer submitted to another Gate | Gate-specific relevance is evaluated |
| Very long response | Input length limits work |
| Empty response | Insufficient information |
| Contradictory response | Review or appropriate uncertainty |
| Repeated revision | No reward farming |
| Accepted evidence edited later | No second XP payout |
| Evaluator unavailable | Safe fallback |
| Invalid evaluator output | No unauthorized reward |

Accepted submissions in the normal Gate flow can award XP and change progression. Keep a restorable backup and use a disposable profile/database for any full-pipeline end-to-end test.

## Scope and next steps

This V1 dataset covers only the Discipline Challenge as specified above. A good result does not validate the evaluator for other Gates, skills, languages, or writing styles. After the V1 run is executable and measured, build separate independently labelled datasets for other Gate-specific skills.

Do not start an alternative-quest library or change evaluation weights as part of this pilot.
