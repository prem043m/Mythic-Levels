# Action Evaluation & Adaptive Gameplay — implementation status (V5)

Companion to `MYTHIC_LEVELS_GAME_MECHANICS_AND_EVALUATION_SPEC_V1`. Principle kept throughout: **the game rewards the quality of the submitted account, never what the player merely claims, and never lets an AI decide progression.** Evidence is always labelled `self-reported`.

## Pipeline (what happens when a stage is submitted)
`guided fields` → **1 deterministic checks** → **2 evaluator** → **3 decision policy** → **4 separate reward policies** → stored evidence → Gate Mastery Protocol (unchanged, reads the stored evidence).

| Step | Where | Algorithm | Why |
|------|-------|-----------|-----|
| Submission protocol | `services/evaluation/protocol.js` | Per-stage-type table of required/optional fields (situation, action, difficulty, outcome, reflection); the Gate's own prompt names the reflection | Structured input gives the evaluator something to judge; quests define what evidence they need *before* the player starts |
| Deterministic checks | `evaluation/engine.js` | Required fields present with ≥2 distinct content words; copy detection (Jaccard ≥ 0.8 vs other stages); length cap | Reliable things must not depend on an LLM |
| Evaluator | `ruleBasedEvaluator` | 4 dimensions (action specificity, task relevance, difficulty awareness, reflection quality) from the reflection rubric + guided-field content; **confidence** = evidence volume, reduced when its own signals disagree | Offline, explainable, testable. Quality and confidence are separate values |
| AI seam | `sanitizeProposal` + disagreement rule | An external evaluator may only *propose* 4 scores + confidence; values are clamped, everything else (decision, xp, unlocks) is discarded; a proposal ≥40 points above the rule-based baseline → `REVIEW_REQUIRED`; malformed → fallback to rule-based | Satisfies "AI evaluates, the engine decides". A semantic model can lower or raise scores, never grant anything |
| Decision policy | `evaluateSubmission` | Ordered rules → `INSUFFICIENT_INFORMATION` (missing fields / low confidence) · `REVIEW_REQUIRED` (copy, evaluator disagreement, fluent but unrelated) · `NEEDS_REVISION` (below quality, or a key dimension of the stage under 50) · `ACCEPTED` | The four outcomes of the spec; uncertain answers are never forced into pass/fail |
| Reward policies | `completeQuest`, `scaleAttributes` | XP/resources only on ACCEPTED (participation); attribute gain = base × quality/100 (min 1); mastery from stored evidence; rejected submissions earn nothing, are kept as drafts with an attempt count | "XP = participation, attributes = quality, mastery = demonstrated competency" |
| Revision | `reviseEvidence` | Improving an accepted reflection re-runs the same pipeline; never re-awards XP | Quality can improve without farming |
| Adaptive ranking | `progression/recommend.js › rankCandidates` | Build executable candidates → hard-constraint filter (locked, daily limit, stages incomplete) → score `S = Σ wᵢ·tᵢ` over gate relevance, mastery need, difficulty fit, time fit, recovery fit (weights in `config/evaluation.js`) → deterministic pick, with the reason and the full ranking returned | The spec's constraint-filter + weighted-ranking model; explainable |
| Adaptive difficulty | `adaptDifficulty` | Stateless, from the last 2 stages (attempts, quality): two strong → +1 (**suggestion only**), two weak/retried → −1 (a shorter, lighter session applied automatically), else 0 | Bounded and gradual: one result never moves it; support is automatic, a harder setting needs the player's choice |

## Measured evaluator quality (smoke test, NOT a benchmark)
Labels were written by the implementer, not independent humans. `src/test/calibration/`.
* **Tuning set** (24 scored): agreement 100%, false acceptance 0%, false rejection 0%, abstention on too-short/incomplete 100%, paraphrase consistency 100%. Defects found with this set were fixed (so this number is optimistic by construction).
* **Held-out set** (12, written after tuning, never tuned against): agreement **91.7%**, false acceptance **14.3%** (1 of 7), false rejection **0%**, abstention 100%.
* **Known misses:** keyword-only relevance accepts on-topic *words* in off-topic text (held-out H6: "I focused on cooking dinner…" is accepted by the baseline; an external semantic proposal catches it, see test); contradictions and implausible claims need real language understanding (case X1, reported but excluded from the thresholds).
Before production: replace with a human-labelled set, measure false-accept/false-reject per language and length, and benchmark any LLM provider against it.

## Changes found and fixed while building
* Single free-text submissions were being credited as a dedicated "reflection" answer (free 50 points) — fixed.
* Attempt verbs ("I tried to…") counted as actions — they no longer do.
* A required field needed 3 content words; "At my desk this morning" is a complete answer, so the minimum is now 2.

## Proposals awaiting your approval (`config/evaluation.js`)
Accept quality 60 · key-dimension floor 50 · minimum confidence 0.5 · per-stage dimension weights · disagreement limit 40 · difficulty window 2, strong ≥85 / weak <65 · scaffold = half length (min 5 min) · ranking weights 0.15/0.30/0.15/0.15/0.25.

## Not built yet (from the spec)
Structured numeric submissions (duration/reps) and file/link evidence · an LLM provider (only the seam and its guard rails exist) · a curated library of *alternative* quests (ranking currently chooses among executable variants of the canonical stage, ritual, rest and re-entry) · variety/preference terms (need recommendation history) · quality-dependent XP modifier and anti-farming caps beyond the 2-stages-per-day rule · a human review queue for `REVIEW_REQUIRED` · Player Intelligence trends and developmental memory.
