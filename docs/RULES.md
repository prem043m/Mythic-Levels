# MYTHIC LEVELS — Canonical Rules

**Document:** `RULES.md`  
**Status:** Canonical  
**Version:** 1.0  
**Scope:** Product and progression rules  
**Audience:** Developer, designer, future contributors, Cursor/AI implementation assistants  
**Authority:** This document defines the rules that implementation must preserve.  
**Relationship:** `WORLD_DESIGN.md` defines meaning; `PRODUCT_SPEC.md` defines product behavior; `ARCHITECTURE.md` defines system structure; `PROGRESSION.md` explains progression flow; this document defines the concrete rules governing that progression.

---

# 1. Purpose

`RULES.md` is the rulebook of MYTHIC LEVELS.

It defines:

- what counts as progression
- how quests are completed
- how XP is awarded
- how levels are calculated
- how resources and attributes are updated
- how Gate mastery is calculated
- how Gates are completed
- how Gates are unlocked
- how Arcana progression works
- how streaks behave
- how achievements and titles are evaluated
- how reflections behave
- how failure and missed days behave
- what the UI is allowed to do
- what the progression engine must control
- which current implementation details are already fixed
- which details must not be invented by the UI

The central rule is:

> **The UI presents progression. The progression engine determines progression.**

---

# 2. Canonical Authority Order

When two parts of the implementation appear to disagree, use this order:

```text
WORLD DESIGN
     ↓
PRODUCT SPECIFICATION
     ↓
PROGRESSION RULES
     ↓
ARCHITECTURE
     ↓
DOMAIN / DATA
     ↓
IMPLEMENTATION
     ↓
UI PRESENTATION
```

However, these documents have different responsibilities.

| Document | Authority |
|---|---|
| `WORLD_DESIGN.md` | Meaning, lore, symbolism, player journey |
| `PRODUCT_SPEC.md` | Product behavior and scope |
| `ARCHITECTURE.md` | System boundaries and technical structure |
| `PROGRESSION.md` | Progression flow |
| `RULES.md` | Concrete game/progression rules |
| `DATA_MODEL.md` | State/data representation |
| `STATE_MACHINE.md` | State transitions |
| `UI_DESIGN.md` | Visual and interaction presentation |
| `IMPLEMENTATION_PLAN.md` | Build order |

No React component, page, CSS interaction, or animation may silently redefine a rule in this document.

---

# 3. Core Principle

MYTHIC LEVELS is not a collection of screens.

The product loop is:

```text
REAL-WORLD ACTION
       ↓
QUEST
       ↓
PROGRESSION ENGINE
       ↓
STATE UPDATE
       ↓
XP / REWARDS / ATTRIBUTES / STREAK / MASTERY
       ↓
GATE PROGRESS
       ↓
GATE COMPLETION
       ↓
UNLOCK
       ↓
NEXT GATE
       ↓
ARCANA PROGRESSION
```

The player supplies the real-world action.

The quest gives that action structure.

The progression engine translates the action into game state.

The UI visualizes the resulting state.

---

# 4. Non-Negotiable Rules

The following rules are mandatory.

## 4.1 Real-world action has priority

The product must reward meaningful real-world practice rather than superficial UI interaction.

Opening the application is not equivalent to completing a quest.

Viewing a Gate is not equivalent to mastering a Gate.

Viewing a progress bar is not progression.

The game represents behavior; it does not replace behavior.

## 4.2 The progression engine is authoritative

The existing progression engine is the source of truth for:

- quest completion
- XP
- resources
- attributes
- streaks
- mastery
- Gate completion
- unlocking
- achievements
- titles
- progression events

## 4.3 The UI must not duplicate rules

React components must not independently calculate:

- XP
- level requirements
- mastery
- streaks
- Gate unlocking
- achievement conditions
- title conditions
- quest rewards
- attribute rewards

The UI requests results from the application/progression layer.

## 4.4 Gate content is data-driven

There must not be one hardcoded React component per Gate.

Do not create:

```text
Gate1.jsx
Gate2.jsx
...
Gate27.jsx
```

Use:

```text
Gate Data
   ↓
Catalog
   ↓
Dynamic Gate Page
   ↓
Reusable Components
```

## 4.5 Failure must not destroy historical progress

Missing a day does not erase the player's historical progress.

A returning player continues the journey.

The current streak may reset, but historical quest, Gate, achievement, reflection, and other persisted progress must not be treated as if the player never played.

---

# 5. Player Progression Model

The canonical conceptual model is:

```text
PLAYER
  │
  ▼
QUEST / REAL-WORLD ACTION
  │
  ▼
PROGRESSION ENGINE
  │
  ├──► XP ─────────────► LEVEL
  │
  ├──► QUEST REWARDS ──► RESOURCES
  │
  ├──► ATTRIBUTE REWARDS
  │
  ├──► STREAK
  │
  ├──► ACHIEVEMENTS
  │
  ├──► TITLES
  │
  └──► MASTERY
             │
             ▼
       GATE COMPLETION
             │
             ▼
          UNLOCK
             │
             ▼
        NEXT GATE
             │
             ▼
      ARCANA PROGRESSION
```

This is the canonical conceptual flow.

It does **not** mean that every internal operation is implemented as a separate sequential function.

For example, the existing `completeQuest()` operation performs multiple progression updates in one immutable state transition.

---

# 6. Player State Rules

A player has persistent progression state.

The current domain model includes:

- player identity
- title
- avatar
- goal
- routine
- improvement-area preferences
- current Arcana
- current Gate
- level
- XP
- resources
- attributes
- attribute history
- achievements
- reflections
- Gate progress
- streak information
- daily plans
- event history
- settings

The UI may display these values.

The UI must not manufacture authoritative values that are absent from the progression state.

---

# 7. Awakening Rules

Awakening is the player's entry into MYTHIC LEVELS.

The current initial-state flow is:

```text
AWAKENING INPUT
      ↓
createInitialState()
      ↓
PLAYER CREATED
      ↓
SETTINGS CREATED
      ↓
PROGRESS CREATED
      ↓
BEAST GATE 01 CREATED
      ↓
AWAKENING COMPLETE
```

## 7.1 Initial Arcana

The player starts in:

```text
Arcana: The Beast
Gate: Beast 01
```

The implementation identifies these as:

```text
arcana = beast
gate = 1
```

## 7.2 Initial level

The player starts at:

```text
Level 1
```

## 7.3 Initial mastery threshold

The default mastery threshold is:

```text
70%
```

The setting is represented internally as:

```text
0.7
```

## 7.4 Initial difficulty

The default difficulty is:

```text
Standard
```

---

# 8. Arcana Rules

MYTHIC LEVELS contains three Arcanas.

```text
I   THE BEAST
II  THE HUMAN
III THE SAGE
```

Each Arcana contains nine Gates.

Total:

```text
3 Arcanas × 9 Gates = 27 Gates
```

## 8.1 The Beast

Purpose:

- understand impulsive behavior
- confront behavioral patterns
- tame distractions
- develop foundational control

## 8.2 The Human

Purpose:

- build awareness
- build discipline
- develop expression
- develop identity
- develop connection

## 8.3 The Sage

Purpose:

- integrate knowledge
- develop stillness
- develop compassion
- develop wisdom

These are world/product meanings, not separate technical progression algorithms.

---

# 9. Gate Rules

There are exactly 27 canonical Gates in the current catalog.

```text
BEAST
 ├── Beast 01
 ├── Beast 02
 ├── Beast 03
 ├── Beast 04
 ├── Beast 05
 ├── Beast 06
 ├── Beast 07
 ├── Beast 08
 └── Beast 09

HUMAN
 ├── Human 01
 ├── Human 02
 ├── Human 03
 ├── Human 04
 ├── Human 05
 ├── Human 06
 ├── Human 07
 ├── Human 08
 └── Human 09

SAGE
 ├── Sage 01
 ├── Sage 02
 ├── Sage 03
 ├── Sage 04
 ├── Sage 05
 ├── Sage 06
 ├── Sage 07
 ├── Sage 08
 └── Sage 09
```

Every Gate is data-driven.

A Gate definition can contain:

- id
- Arcana
- number
- name
- archetype
- symbol
- characteristic
- weakness
- capability
- principle
- related attributes
- difficulty
- recommended duration
- lore
- initiation text
- philosophy
- outcome
- title reward
- achievement id
- seven daily entries
- boss trial

---

# 10. Gate Status Rules

A Gate may be represented by the UI using states such as:

```text
LOCKED
AVAILABLE
CURRENT
IN PROGRESS
COMPLETED
```

These are presentation states.

The UI must derive them from progression state.

The UI must not independently decide that a Gate is unlocked.

---

# 11. Seven-Day Gate Rules

Every Gate contains a seven-day progression.

The canonical phases are:

```text
DAY 1 — RECOGNITION
DAY 2 — OBSERVATION
DAY 3 — PRACTICE
DAY 4 — RESISTANCE
DAY 5 — APPLICATION
DAY 6 — CHALLENGE
DAY 7 — REFLECTION & TRIAL
```

The Gate data defines the actual task content.

The phase names provide the canonical progression structure.

## 11.1 Day 1 — Recognition

Purpose:

```text
Notice the pattern.
```

The player begins by identifying the behavior, distraction, tendency, or challenge represented by the Gate.

## 11.2 Day 2 — Observation

Purpose:

```text
Observe the pattern.
```

The player studies the behavior rather than immediately attempting to eliminate it.

## 11.3 Day 3 — Practice

Purpose:

```text
Practice the desired behavior.
```

## 11.4 Day 4 — Resistance

Purpose:

```text
Meet the difficulty directly.
```

## 11.5 Day 5 — Application

Purpose:

```text
Apply the learned behavior in a real situation.
```

## 11.6 Day 6 — Challenge

Purpose:

```text
Increase difficulty or test consistency.
```

## 11.7 Day 7 — Reflection & Trial

Purpose:

```text
Reflect on the journey and prepare for the Gate trial.
```

The exact task, duration, XP, resources, attributes, and reflection prompt come from the Gate definition.

---

# 12. Quest Rules

A quest is a defined unit of Gate progression.

A quest contains data such as:

- id
- type
- phase
- objective
- explanation
- task
- duration
- XP
- rewards
- attribute rewards
- reflection prompt

The UI renders this data.

It must not replace the quest's rules with hardcoded assumptions.

---

# 13. Quest Completion Rules

The authoritative operation is:

```text
completeQuest(...)
```

Conceptually:

```text
UI
 ↓
completeQuest(...)
 ↓
resolve Gate + quest
 ↓
validate
 ↓
calculate progression
 ↓
create new immutable state
 ↓
return result
 ↓
store
 ↓
persist
 ↓
render updated UI
```

## 13.1 Quest resolution

The engine resolves:

1. the requested Gate
2. the requested quest
3. whether the Gate is accessible
4. whether the quest exists
5. whether the quest can be completed

Missing quests and locked Gates are rejected.

## 13.2 Reflection sanitization

Reflection text is sanitized before it enters progression state.

The current sanitizer:

- accepts strings
- removes case-insensitive `<script` openings
- truncates plain text to 8,000 characters

Reflection content must remain plain text.

It must not be rendered through unsafe HTML injection.

## 13.3 Duration

The engine uses the supplied duration when present; otherwise it uses the quest duration.

The UI must display the actual resulting progression rather than inventing reward calculations from the displayed duration.

## 13.4 Duplicate completion

The current engine prevents:

- duplicate daily completion
- duplicate Boss Trial completion

A duplicate attempt must not award the same completion rewards again.

The exact error/result returned by the engine should be surfaced by the application layer rather than reimplemented in the component.

---

# 14. Quest Completion State Transition

The current engine performs the following broad operations during quest completion:

```text
1. Resolve Gate and quest
2. Validate access
3. Sanitize reflection
4. Determine duration
5. Reject duplicate completion
6. Record completion
7. Apply XP
8. Apply resources
9. Apply attribute rewards
10. Update quest counters
11. Update practice minutes
12. Update focus duration
13. Update streak
14. Save qualifying reflection
15. Record attribute history
16. Calculate Gate mastery
17. Check Gate completion
18. Unlock next Gate when appropriate
19. Advance current position when appropriate
20. Evaluate achievements
21. Evaluate titles
22. Append progression event
23. Return new state and result
```

This list describes the existing engine behavior.

The React UI must not reproduce it.

---

# 15. XP Rules

XP is a progression resource used for player levels.

The current system:

```text
Starting Level = 1
First level requirement = 200 XP
```

Subsequent level requirements scale from the previous requirement.

The current implementation uses:

```text
next requirement = previous requirement × 1.12
```

with rounding.

Therefore:

```text
Level requirement is progressive.
```

The UI must obtain the current level and XP from progression state.

It must not create a second level formula.

---

# 16. Difficulty Rules

The current difficulty modes are:

| Difficulty | XP Multiplier | Duration Multiplier |
|---|---:|---:|
| Gentle | 0.90× | 0.75× |
| Standard | 1.00× | 1.00× |
| Austere | 1.15× | 1.25× |

The XP scaling operation applies the configured multiplier and rounds the result.

The duration multiplier is a configuration rule for quest planning/content behavior.

Difficulty must be interpreted by the progression/application layer rather than recalculated by individual components.

---

# 17. Daily Phase XP Defaults

The current default seven-day phase metadata contains:

| Day | Phase | Type | Default XP |
|---|---|---|---:|
| 1 | Recognition | observation | 22 |
| 2 | Observation | observation | 24 |
| 3 | Practice | practice | 30 |
| 4 | Resistance | practice | 32 |
| 5 | Application | daily | 34 |
| 6 | Challenge | practice | 40 |
| 7 | Reflection & Trial | reflection | 36 |

Important:

> Gate-specific quest definitions may override type, objective, explanation, task, duration, XP, rewards, attributes, and prompt.

Therefore these values are defaults, not universal immutable rewards for every Gate.

---

# 18. Resource Rules

The current implementation uses:

```text
XP  = experience points used for levels
MP  = mastery points
SP  = streak points
AP  = awareness points
DP  = discipline points
KP  = knowledge points
CP  = connection / communication points
```

Quest rewards come from the quest definition and are processed by the progression engine.

The UI must display resource results returned by the engine.

It must not independently award resources.

---

# 19. Attribute Rules

The current attribute system includes:

```text
Focus
Discipline
Awareness
Knowledge
Communication
Emotional Balance
Perspective
Connection
Wisdom
```

Quest definitions may contain attribute rewards.

During quest completion:

```text
Quest
 ↓
Attribute rewards
 ↓
Progression engine
 ↓
Attribute state
```

The current implementation caps individual attribute values at:

```text
100
```

The engine records attribute-history snapshots and retains the latest 120 snapshots.

The UI must not independently modify attributes.

---

# 20. Mastery Rules

Mastery belongs to the progression engine.

Mastery uses four signals:

```text
Practice
Consistency
Reflection
Boss
```

The canonical weights are:

```text
Practice       40%
Consistency    20%
Reflection     15%
Boss           25%
──────────────────
Total         100%
```

## 20.1 Practice signal

Current implementation:

```text
completed non-trial days / 6
```

The result is capped at:

```text
1.0
```

Therefore:

```text
Practice = min(completed non-trial days / 6, 1)
```

## 20.2 Consistency signal

Current implementation:

```text
unique completion dates / 7
```

capped at:

```text
1.0
```

Therefore:

```text
Consistency = min(unique completion dates / 7, 1)
```

## 20.3 Reflection signal

A day counts toward the reflection signal when it has a reflection of at least:

```text
12 characters
```

The current implementation uses:

```text
days with qualifying reflection / 7
```

capped at:

```text
1.0
```

Therefore:

```text
Reflection = min(qualifying reflection days / 7, 1)
```

## 20.4 Boss signal

```text
Boss complete → 1
Boss incomplete → 0
```

## 20.5 Mastery formula

Conceptually:

```text
Mastery =
    (Practice × 0.40)
  + (Consistency × 0.20)
  + (Reflection × 0.15)
  + (Boss × 0.25)
```

The progression engine owns this calculation.

The UI may display the four signals and the resulting percentage, but must not calculate a competing value.

---

# 21. Mastery Threshold Rules

The default mastery threshold is:

```text
70%
```

Internally:

```text
0.70
```

A Gate completes only when:

```text
Boss is complete
AND
Mastery >= configured threshold
```

Therefore:

```text
Mastery >= 70%
alone is NOT sufficient.
```

The Boss Trial must also be complete.

Likewise:

```text
Boss complete
alone is NOT sufficient.
```

The mastery threshold is configurable through settings, with the current default of `0.7`.

---

# 22. Gate Completion Rules

The canonical Gate completion condition is:

```text
BOSS COMPLETE
        AND
MASTERY >= THRESHOLD
        ↓
GATE COMPLETE
```

On completion, the progression engine may:

- mark the Gate completed
- unlock the next Gate
- advance the player's current position
- grant Gate-related title rewards
- evaluate achievements
- evaluate titles
- report Gate ascension
- report Arcana ascension where appropriate
- append the relevant progression event

The UI only displays the result.

---

# 23. Gate Unlock Rules

Gate unlocking is owned by:

```text
src/services/progression/unlocks.js
```

The current progression is linear.

```text
Beast 01
   ↓
Beast 02
   ↓
Beast 03
   ↓
...
   ↓
Beast 09
   ↓
Human 01
   ↓
Human 02
   ↓
...
   ↓
Human 09
   ↓
Sage 01
   ↓
Sage 02
   ↓
...
   ↓
Sage 09
```

## 23.1 Beast Gate 01

Beast Gate 01 is always unlockable.

## 23.2 Beast Gates 02–09

Each requires the previous Gate in the same Arcana to be completed.

Example:

```text
Beast 01 complete
      ↓
Beast 02 unlockable
```

## 23.3 Human Gate 01

Requires:

```text
Beast 09 complete
```

## 23.4 Sage Gate 01

Requires:

```text
Human 09 complete
```

## 23.5 Final Gate

Sage Gate 09 is the final Gate.

There is no next Gate after it.

---

# 24. Arcana Transition Rules

The current position helper advances:

```text
within the current Arcana
```

and after the final Gate of an Arcana:

```text
Gate 09
   ↓
Gate 01 of next Arcana
```

Therefore:

```text
Beast 09
   ↓
Human 01

Human 09
   ↓
Sage 01
```

The final position is:

```text
Sage 09
```

No additional canonical Arcana currently exists.

---

# 25. Streak Rules

Streak logic belongs to the progression engine.

The current implementation uses local date keys:

```text
YYYY-MM-DD
```

## 25.1 First activity

No previous activity:

```text
current streak = 1
```

## 25.2 Same-day activity

Activity on the same date:

```text
current streak does not increase
```

## 25.3 Next-day activity

Activity on the following day:

```text
current streak += 1
```

The longest streak may also increase.

## 25.4 Gap greater than one day

A gap greater than one day:

```text
current streak → 1
streak interrupted → true
return status → returned
```

Historical progression remains.

## 25.5 Returning after interruption

A returning player receives:

```text
2 SP
```

Starting or continuing activity receives:

```text
1 SP
```

The player does not lose completed historical Gates or quests merely because the streak was interrupted.

---

# 26. Streak vs Progression Rule

A streak is not the same thing as total progression.

```text
STREAK
=
recent consistency signal
```

while:

```text
PROGRESSION
=
historical journey state
```

Therefore:

```text
missed day
   ↓
streak can reset
   ↓
historical progress remains
```

This distinction is mandatory.

---

# 27. Achievement Rules

Achievements are data-driven.

Definitions live in:

```text
src/data/achievements.js
```

Evaluation belongs to:

```text
src/services/progression/achievements.js
```

The current implementation includes achievement conditions covering areas such as:

- first quest
- returning after a missed day
- 60-minute focus
- listening
- knowledge
- observation
- reflections
- seven-day streak
- Arcana completion
- selected Boss completions
- 20 quests
- 100 practice minutes

The current registry contains 17 achievement records.

The exact achievement registry is a data concern and must not be duplicated in React.

---

# 28. Achievement Evaluation Rules

The UI must not decide:

```text
"the player deserves this achievement"
```

Instead:

```text
Progression event
      ↓
Achievement evaluator
      ↓
Achievement state
      ↓
UI notification / display
```

Achievements may be displayed as:

```text
LOCKED
UNLOCKED
PROGRESS
```

where progress information exists.

---

# 29. Title Rules

Titles are also data-driven.

The current title definitions include titles such as:

```text
The Awakening
The Human
The Attentive
The Listener
The Watcher
The Disciplined
The Weaver
The Forge-Bearer
The Seeker
The Scholar
The Wanderer
The Still Mind
The Illuminated
The Sage
```

Title evaluation is performed by the progression/achievement layer.

Title conditions may depend on:

- achievements
- Arcana entry
- selected Gate completion

The UI only displays title state.

---

# 30. Reflection Rules

Reflections are player-generated content.

Reflection operations include:

```text
upsertReflection()
deleteReflection()
```

A reflection is private player data in the local-first product.

## 30.1 Reflection qualification

For mastery calculation, the current implementation counts a day as having a qualifying reflection when the reflection contains at least:

```text
12 characters
```

This is separate from the general ability to save/edit reflection content.

## 30.2 Reflection size

Reflection text is limited to:

```text
8,000 characters
```

## 30.3 Safety

Reflection text must be treated as plain text.

Never inject player reflection text into the DOM as trusted HTML.

---

# 31. Boss Trial Rules

Every Gate has a Boss Trial.

The Boss Trial is part of the Gate definition.

Conceptually:

```text
Seven-day progression
        ↓
Boss Trial
        ↓
Mastery evaluation
        ↓
Gate completion check
```

Boss completion contributes:

```text
25%
```

of the Gate mastery score.

However, Boss completion also has an independent requirement:

```text
Boss must be complete
```

for Gate completion.

Therefore the Boss is both:

1. a mastery signal
2. a Gate-completion requirement

---

# 32. Boss Completion Rule

A Boss Trial must not be counted as complete merely because its page was opened.

The progression engine must record actual Boss completion.

The UI must use the engine's completion result.

Duplicate Boss completion is rejected by the current engine.

---

# 33. Daily Plan Rules

Daily plans are generated by:

```text
src/services/quests/dailyPlan.js
```

A plan contains:

```text
Morning
Afternoon
Evening
```

## Morning

The next incomplete day quest is selected.

After all seven days are complete:

```text
Morning → Boss Trial
```

## Afternoon

A generic secondary observation quest is included by the current plan generator.

## Evening

A reflection prompt is included.

Where available, the Gate Day 7 prompt is used.

## Duration

Daily duration respects the configured daily duration.

The Boss plan uses at least:

```text
40 minutes
```

and caps at the Boss duration.

Existing plans are returned unchanged.

---

# 34. Date Rules

The application uses local date keys.

Canonical format:

```text
YYYY-MM-DD
```

The date utilities provide:

- conversion to local date key
- date-key parsing
- adding days
- whole-day differences
- today's local date key

The UI must not invent its own competing date interpretation.

---

# 35. Date Integrity Rule

The current engine accepts a completion `dateKey` from its caller.

Therefore the future application layer must treat date input carefully.

The UI/application layer should not allow arbitrary historical or future backdating unless that behavior is explicitly intended and supported.

This is an implementation safety requirement because date input affects:

- streaks
- consistency
- mastery
- daily completion state
- event history

---

# 36. Persistence Rules

The application is local-first.

Persistence is abstracted behind storage services.

Current storage supports:

```text
createMemoryAdapter()
createLocalStorageAdapter()
createStorage()
```

The browser storage key is:

```text
mythic-levels:v1
```

The current schema version is:

```text
1
```

---

# 37. Persistence Integrity Rules

Loaded state must be validated before it becomes application state.

Malformed or unsupported-schema data must not silently become game state.

The current storage layer reports explicit results for:

- missing data
- malformed data
- unsupported schema
- persistence failure

The application must surface failures appropriately.

---

# 38. State Immutability Rule

Progression actions conceptually follow:

```text
OLD STATE
    +
ACTION
    ↓
NEW STATE + RESULT
```

The progression engine clones the input state from the caller's perspective.

On a failure:

```text
original state remains unchanged
```

The application store must not mutate the progression state behind the engine's back.

---

# 39. Event History Rules

Progression events are part of player history.

The current progress model retains up to:

```text
400 recent events
```

Quest completion appends a completion event.

Events support:

- progression history
- analytics
- debugging
- future ceremony/feedback
- player journey visibility

The UI should consume event history rather than inventing historical records.

---

# 40. Attribute History Rules

Attribute-history snapshots are recorded during progression.

The current implementation keeps the latest:

```text
120 snapshots
```

The UI may use this history for analytics.

It must not fabricate historical snapshots.

---

# 41. Missing Day Rules

A missing day does not mean:

```text
journey reset
```

It means:

```text
streak interruption
```

where applicable.

The player retains previously earned:

- XP
- levels
- completed quests
- completed Gates
- achievements
- titles
- reflections
- historical events
- attribute progress

The current streak may reset according to the streak rules.

---

# 42. Failure Philosophy

MYTHIC LEVELS is designed around recoverable failure.

The product should not shame the player.

The product should not erase meaningful historical progress merely because the player missed a day.

The system should distinguish:

```text
FAILED / MISSED TODAY
```

from:

```text
LOST EVERYTHING
```

These are not equivalent.

---

# 43. Progression Is Not Perfection

The player is not expected to maintain perfect behavior forever.

The product measures:

- action
- consistency
- practice
- reflection
- mastery

It does not require an impossible perfect record.

---

# 44. Player Competition Rule

The primary competitor is:

```text
the player's previous self
```

The system is not designed around mandatory competition between users.

Progression should communicate personal growth rather than social ranking.

---

# 45. Symbolic Rule

Levels, XP, attributes, Arcanas, Gates, titles, and resources are symbolic representations of real-world development.

They are not claims of supernatural transformation.

The mythology gives meaning.

The progression system gives structure.

The player's real-world action gives truth.

---

# 46. No False Progress Rule

The interface must not imply that the player improved in real life merely because:

- they opened the app
- they watched a ceremony
- they unlocked a screen
- they changed a setting
- they viewed an achievement
- they navigated to a Gate

Game progress must originate from valid progression actions.

---

# 47. UI Rule

The UI is responsible for:

- receiving user interaction
- displaying player state
- displaying Gate information
- displaying quest information
- displaying progression feedback
- handling navigation
- displaying loading states
- displaying error states
- displaying empty states
- presenting confirmation where needed
- presenting animation and ceremony

The UI is not responsible for core progression calculations.

---

# 48. Application Store Rule

The application store may orchestrate:

```text
UI
 ↓
Store action
 ↓
Progression engine
 ↓
New state
 ↓
Persistence
 ↓
UI
```

Zustand may be used as the application state adapter.

The store must not become a second progression engine.

---

# 49. What the Store Must Not Do

The store must not contain duplicate formulas for:

- XP
- mastery
- streak
- Gate unlock
- achievement evaluation
- title evaluation
- quest reward calculation
- attribute reward calculation

If a rule already belongs to the progression engine, call the engine.

---

# 50. Data-Driven Rule

Gate data belongs in:

```text
src/data/
```

The UI consumes catalog APIs such as:

```text
listGates()
getGateById()
getGateByPosition()
getArcana()
gatesForArcana()
getQuest()
```

The UI should not directly couple itself to individual Gate data files.

---

# 51. Catalog Rule

The catalog is the normal access point for content.

Conceptually:

```text
Gate ID
  ↓
Catalog
  ↓
Gate definition
```

Example route:

```text
/gate/beast-01
```

The page resolves:

```text
getGateById("beast-01")
```

and renders the same reusable Gate architecture used for all other Gates.

---

# 52. Quest Reward Rule

Quest rewards are defined by quest data and processed by the progression engine.

A component must never do this:

```javascript
player.xp += 30;
player.dp += 5;
```

Instead:

```text
completeQuest(...)
        ↓
engine calculates result
        ↓
new state
```

The exact reward may vary by Gate and quest.

---

# 53. Level-Up Rule

A level-up occurs when the player's XP satisfies the progression engine's level requirement.

The UI should display:

```text
previous level
→ new level
```

when the returned progression result indicates a level transition.

Level-up animation is presentation only.

The animation must not cause the level to change.

---

# 54. Gate Unlock Animation Rule

A Gate unlock ceremony is a visual consequence.

Correct:

```text
Engine unlocks Gate
        ↓
UI receives unlocked state
        ↓
UI animates Gate unlock
```

Incorrect:

```text
User clicks Gate
        ↓
UI decides Gate is unlocked
```

---

# 55. Achievement Animation Rule

Correct:

```text
Engine evaluates achievement
        ↓
Achievement becomes unlocked
        ↓
UI displays ceremony
```

Incorrect:

```text
UI sees a visual condition
        ↓
UI awards achievement
```

---

# 56. Title Animation Rule

A title ceremony must occur only after the progression layer reports the title as earned/unlocked.

The animation is not the source of the title state.

---

# 57. Arcana Ascension Rule

Arcana progression occurs when the final Gate of the current Arcana is completed and the next Arcana becomes available.

Current transitions:

```text
Beast 09 completed
        ↓
Human 01 progression becomes available
```

and:

```text
Human 09 completed
        ↓
Sage 01 progression becomes available
```

The final Sage Gate has no next Gate.

---

# 58. Resource Semantics

Resources are game representations of different dimensions of development.

Current resource abbreviations:

| Resource | Meaning |
|---|---|
| XP | General experience / level progression |
| MP | Mastery |
| SP | Streak |
| AP | Awareness |
| DP | Discipline |
| KP | Knowledge |
| CP | Connection / communication |

The exact resource awarded by a quest is determined by its data and engine logic.

---

# 59. Mastery vs XP Rule

XP and Mastery are separate systems.

```text
XP
 ↓
Player Level
```

while:

```text
Practice
Consistency
Reflection
Boss
 ↓
Gate Mastery
 ↓
Gate Completion
```

A player can gain XP without immediately completing a Gate.

A Gate can have meaningful mastery progress without producing a new player level.

The two systems must not be conflated.

---

# 60. Streak vs Mastery Rule

Streak and mastery are also separate.

Streak measures activity across dates.

Mastery evaluates Gate-specific completion signals.

A streak interruption does not automatically erase Gate mastery.

---

# 61. Achievement vs Gate Completion Rule

Achievements are not the same as Gate completion.

Gate completion is a progression condition.

Achievements are milestone recognition.

An achievement may be triggered by:

- quest milestones
- streak milestones
- practice milestones
- Gate milestones
- Arcana milestones
- other defined conditions

The achievement evaluator owns the decision.

---

# 62. Title vs Achievement Rule

A title may depend on an achievement, Arcana entry, or selected Gate completion.

Therefore:

```text
achievement unlocked
```

does not automatically mean:

```text
same-name title unlocked
```

Title rules must come from the title definitions/evaluator.

---

# 63. Daily Quest Completion vs Same-Day Streak Rule

Completing multiple quests on one date does not repeatedly increase the streak.

The current streak rule is date-based:

```text
same local date
=
no additional streak increment
```

Quest completion and streak increment are therefore related but distinct operations.

---

# 64. Duplicate Reward Rule

A duplicate daily completion must not award the same completion reward twice.

A duplicate Boss completion must not award the same Boss reward twice.

This protects:

- XP integrity
- resource integrity
- mastery integrity
- achievement integrity
- event integrity

---

# 65. Gate Access Rule

A locked Gate cannot be entered through the normal progression flow.

The engine verifies that a Gate is unlocked before entering it.

The UI should represent locked state and guide the player toward the required previous progression.

The UI must not bypass the engine.

---

# 66. Current Position Rule

The player's current position identifies the active progression location.

The current position is initially:

```text
Beast 01
```

After a Gate is completed and the next Gate is unlocked, the progression engine may advance the current position.

The UI should consume this position.

---

# 67. Historical Progress Rule

Historical progress must remain separate from current position.

A player may have:

```text
completed Gates
completed quests
achievement history
event history
```

even when the player is currently working on another Gate.

Current position answers:

```text
Where am I now?
```

Historical state answers:

```text
What have I already accomplished?
```

---

# 68. Privacy Rule

Player reflections and progression data are personal player data.

The current application is local-first.

Reflection content must not be exposed through unnecessary external services.

Future integrations must preserve the product's privacy boundaries.

---

# 69. Import Rule

Imported journey data must not be trusted blindly.

Before becoming active state:

```text
Imported JSON
     ↓
Parse
     ↓
Validate
     ↓
Accept / Reject
     ↓
Application State
```

Malformed or unsupported state must be rejected.

---

# 70. Reset Rule

Resetting the journey is a destructive state operation.

The UI should require an explicit user action/confirmation before invoking reset.

Reset must not happen because of:

- a navigation action
- a missed day
- a failed quest
- a temporary storage error
- an animation
- a page refresh

---

# 71. Persistence Failure Rule

If saving fails:

```text
UI must not falsely claim:
"Journey saved"
```

The application should surface the persistence failure.

The current storage layer can return:

```text
persist-failed
```

The UI/application layer should handle this result appropriately.

---

# 72. Storage vs Progression Rule

Persistence stores state.

Persistence does not define game rules.

Correct:

```text
Progression Engine
       ↓
State
       ↓
Storage
```

Incorrect:

```text
Storage
       ↓
decides mastery / XP / unlock
```

---

# 73. Browser Independence Rule

The domain and progression engine should remain usable independently from React.

The domain layer must not import React components.

The progression engine must not depend on visual components.

This allows:

- tests
- future UI changes
- future persistence changes
- future application clients

without rewriting the core game logic.

---

# 74. Testing Rules

The following progression behavior should be tested.

## XP

- starting level
- first 200 XP threshold
- subsequent level scaling
- difficulty scaling
- rounding

## Quest

- valid completion
- missing quest
- locked Gate
- duplicate daily completion
- duplicate Boss completion
- reward application

## Mastery

- practice signal
- consistency signal
- reflection signal
- Boss signal
- weighted total
- threshold
- Gate completion

## Unlocking

- Beast 01
- Beast 02–09
- Human 01
- Human 02–09
- Sage 01
- Sage 02–09
- final Gate

## Streak

- first activity
- same-day activity
- next-day activity
- missed day
- return after interruption
- longest streak

## Persistence

- save
- load
- malformed data
- unsupported schema
- persistence failure

---

# 75. Rule Change Protocol

Do not silently change a canonical rule inside implementation code.

If a new requirement changes:

```text
XP
mastery
unlocking
streaks
quest structure
Gate completion
difficulty
```

then update:

1. `RULES.md`
2. relevant progression/product documentation
3. tests
4. implementation

Only then should UI behavior be updated.

---

# 76. No Silent Rule Changes

The following are prohibited:

```text
Changing 70% mastery to 60%
without documentation

Changing 200 XP
without documentation

Changing 1.12 level scaling
without documentation

Changing Gate unlock order
without documentation

Changing streak reset behavior
without documentation

Changing Boss requirements
without documentation
```

A developer may propose a rule change, but the existing canonical rule remains authoritative until the documentation and implementation are intentionally updated.

---

# 77. Current Implementation vs Canonical Product Rule

Some values in this document describe the **current implementation** because they are already present in the repository.

These include:

- Level 1 starting point
- 200 XP first level requirement
- 1.12 level requirement scaling
- difficulty multipliers
- 70% default mastery threshold
- 40/20/15/25 mastery weights
- 12-character qualifying reflection
- 8,000-character reflection limit
- 100 attribute cap
- 120 attribute-history snapshots
- 400 event-history retention
- streak point values
- 27-Gate linear unlocking

These values must be treated as fixed current rules unless intentionally changed through the rule-change protocol.

Where the product documentation describes a broader principle but the exact implementation value is not specified, the implementation must not invent a new rule merely to make the UI easier.

---

# 78. Rule Priority During Implementation

When implementing a feature, use this sequence:

```text
1. Read the canonical rule.
2. Inspect existing engine behavior.
3. Reuse existing engine behavior.
4. Add only the missing application/UI bridge.
5. Add tests for the rule.
6. Validate the result.
```

Do not start by writing React logic.

---

# 79. Cursor Rules

Cursor is an implementation assistant.

Cursor must:

- inspect existing files before modifying them
- read relevant canonical documentation
- reuse existing engine functions
- avoid duplicate business logic
- make the smallest coherent change
- preserve existing domain behavior
- run validation after changes
- report conflicts instead of silently choosing a new rule

Cursor must not:

- redesign the architecture unnecessarily
- replace the progression engine with React state
- create 27 hardcoded Gate components
- invent XP formulas
- invent mastery formulas
- invent unlock conditions
- invent streak behavior
- invent achievements
- silently change canonical rules

---

# 80. Rule-to-Code Mapping

| Rule | Primary implementation authority |
|---|---|
| Player state | `src/domain/` |
| Static Gate content | `src/data/` |
| Catalog lookup | `src/data/catalog.js` |
| Quest completion | `src/services/progression/engine.js` |
| XP | `src/services/progression/xp.js` |
| Mastery | `src/services/progression/mastery.js` |
| Unlocking | `src/services/progression/unlocks.js` |
| Achievements | `src/services/progression/achievements.js` |
| Reflections | progression/application layer |
| Daily plans | `src/services/quests/dailyPlan.js` |
| Persistence | `src/services/storage/storage.js` |
| Date behavior | `src/utils/dates.js` |
| Text sanitization | `src/utils/sanitize.js` |
| UI state | React/application store |
| Visual feedback | React/UI layer |

---

# 81. Canonical Progression Diagram

```text
                    ┌──────────────────┐
                    │      PLAYER      │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ REAL-WORLD ACTION   │
                  │ / QUEST COMPLETION  │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ PROGRESSION ENGINE  │
                  └──────────┬──────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
        XP / LEVEL       REWARDS            ATTRIBUTES
          │                  │                  │
          │                  └────────┬─────────┘
          │                           │
          └───────────────────────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
       STREAK           ACHIEVEMENTS         TITLES
                             │
                             │
                             ▼
                         MASTERY
                             │
                  Practice 40%
                  Consistency 20%
                  Reflection 15%
                  Boss 25%
                             │
                             ▼
                  ┌───────────────────┐
                  │ MASTERY ≥ 70% AND │
                  │ BOSS COMPLETE     │
                  └─────────┬─────────┘
                            │
                            ▼
                    ┌───────────────┐
                    │ GATE COMPLETE │
                    └───────┬───────┘
                            │
                            ▼
                     NEXT GATE UNLOCK
                            │
                            ▼
                      NEXT POSITION
                            │
                            ▼
                     ARCANA PROGRESS
```

---

# 82. Canonical Seven-Day Diagram

```text
DAY 1
Recognition
    ↓
DAY 2
Observation
    ↓
DAY 3
Practice
    ↓
DAY 4
Resistance
    ↓
DAY 5
Application
    ↓
DAY 6
Challenge
    ↓
DAY 7
Reflection & Trial
    ↓
BOSS TRIAL
    ↓
MASTERY EVALUATION
    ↓
GATE COMPLETION CHECK
    ↓
NEXT GATE UNLOCK
```

The exact enforcement of individual day ordering must follow the existing engine implementation; the above is the canonical Gate progression structure.

---

# 83. Canonical Level Diagram

```text
PLAYER
  │
  ▼
QUEST COMPLETION
  │
  ▼
XP REWARD
  │
  ▼
DIFFICULTY SCALING
  │
  ▼
TOTAL XP
  │
  ▼
LEVEL REQUIREMENT
  │
  ├── requirement not reached
  │        ↓
  │     same level
  │
  └── requirement reached
           ↓
       LEVEL UP
```

Current starting values:

```text
Level = 1
First level requirement = 200 XP
Scaling = previous requirement × 1.12
```

---

# 84. Canonical Mastery Diagram

```text
                    GATE PRACTICE
                         │
                         ▼
                      Practice
                       40%
                         │
                         │
CONSISTENCY ─────────────┤ 20%
                         │
REFLECTION ──────────────┤ 15%
                         │
BOSS ────────────────────┤ 25%
                         │
                         ▼
                   WEIGHTED MASTERY
                         │
                         ▼
                 MASTERY ≥ THRESHOLD?
                         │
                    ┌────┴────┐
                   NO        YES
                   │          │
                   ▼          ▼
              GATE OPEN    BOSS CHECK
                              │
                         ┌────┴────┐
                        NO        YES
                        │          │
                        ▼          ▼
                   NOT COMPLETE  COMPLETE
```

---

# 85. Canonical Unlock Diagram

```text
BEAST 01
   ↓
BEAST 02
   ↓
BEAST 03
   ↓
BEAST 04
   ↓
BEAST 05
   ↓
BEAST 06
   ↓
BEAST 07
   ↓
BEAST 08
   ↓
BEAST 09
   ↓
HUMAN 01
   ↓
HUMAN 02
   ↓
...
   ↓
HUMAN 09
   ↓
SAGE 01
   ↓
SAGE 02
   ↓
...
   ↓
SAGE 09
   ↓
END OF CURRENT JOURNEY
```

---

# 86. Canonical Failure Diagram

```text
QUEST MISSED
     │
     ├──────────────► HISTORICAL PROGRESS REMAINS
     │
     └──────────────► STREAK MAY INTERRUPT
                              │
                              ▼
                         PLAYER RETURNS
                              │
                              ▼
                       JOURNEY CONTINUES
```

Failure is a state of the journey, not a deletion of the journey.

---

# 87. Canonical Architecture Boundary

```text
┌─────────────────────────────────────────┐
│                 REACT UI                │
│                                         │
│ Display / Interaction / Navigation      │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│       APPLICATION STATE / ACTIONS       │
│                                         │
│ Orchestration / UI-facing state         │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│          PROGRESSION ENGINE             │
│                                         │
│ Rules / Rewards / XP / Mastery /        │
│ Unlocks / Streaks / Achievements        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│             DOMAIN + DATA               │
│                                         │
│ Player / Gates / Quests / Definitions   │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│               PERSISTENCE               │
└─────────────────────────────────────────┘
```

---

# 88. Prohibited Shortcuts

The following implementation shortcuts are prohibited:

### Shortcut 1

```javascript
setXp(xp + quest.xp)
```

inside a React component.

Use the progression engine.

### Shortcut 2

```javascript
if (mastery >= 70) unlockGate()
```

inside the UI.

Use the progression engine.

### Shortcut 3

```javascript
if (day === 7) bossUnlocked = true
```

inside a component.

Use existing Gate/progression behavior.

### Shortcut 4

```javascript
if (questCompleted) achievementUnlocked = true
```

unless that exact condition belongs to the achievement evaluator.

### Shortcut 5

Creating one component for each Gate.

Use data-driven rendering.

---

# 89. Canonical Invariants

These invariants must always remain true.

## Invariant 1

```text
UI does not own progression rules.
```

## Invariant 2

```text
Progression engine owns progression calculations.
```

## Invariant 3

```text
There are 27 canonical Gates.
```

## Invariant 4

```text
There are 3 canonical Arcanas.
```

## Invariant 5

```text
Each Gate has seven progression phases.
```

## Invariant 6

```text
Gate completion requires Boss completion.
```

## Invariant 7

```text
Gate completion requires mastery >= configured threshold.
```

## Invariant 8

```text
Default mastery threshold = 70%.
```

## Invariant 9

```text
Mastery weights = 40 / 20 / 15 / 25.
```

## Invariant 10

```text
Gate unlocking is linear.
```

## Invariant 11

```text
Missing a day does not erase historical progress.
```

## Invariant 12

```text
Duplicate quest/Boss completion cannot repeatedly award completion.
```

## Invariant 13

```text
Reflection text remains plain text.
```

## Invariant 14

```text
Imported state must be validated.
```

## Invariant 15

```text
Persistence stores state but does not define progression rules.
```

---

# 90. Definition of Correct Progression

A progression implementation is correct when:

```text
A valid player action
        ↓
is accepted by the correct engine operation
        ↓
produces the correct immutable state transition
        ↓
updates the appropriate progression systems
        ↓
persists successfully when possible
        ↓
is reflected accurately in the UI
```

A visually convincing UI with incorrect progression is not correct.

---

# 91. Definition of a Correct Gate

A Gate implementation is correct when:

- the Gate comes from the canonical catalog
- the Gate has the correct Arcana and position
- the Gate displays its defined content
- its seven-day progression comes from data
- quests are resolved through the catalog/engine
- completion uses the progression engine
- mastery comes from the mastery system
- Boss completion is authoritative
- Gate completion follows the completion condition
- the next Gate is unlocked by the unlock system
- achievements and titles are evaluated by their systems
- persistence records the resulting state

---

# 92. Definition of a Correct Quest

A quest implementation is correct when:

- the quest exists in the Gate definition
- the player can access the Gate
- the quest has not already been completed
- the completion goes through the progression engine
- rewards come from the quest/engine
- XP comes from the engine
- attributes come from the engine
- streak updates come from the engine
- mastery updates come from the engine
- qualifying reflections are recorded
- duplicate completion is rejected

---

# 93. Definition of a Correct Streak

A streak implementation is correct when:

```text
first activity      → 1
same date activity  → unchanged
next day activity   → +1
gap > 1 day         → current resets to 1
return after gap    → return state + 2 SP
```

while:

```text
historical progress remains intact
```

---

# 94. Definition of a Correct Mastery System

A mastery implementation is correct when it uses:

```text
Practice       40%
Consistency    20%
Reflection     15%
Boss           25%
```

and applies:

```text
Gate complete only if:

Boss complete
AND
Mastery >= configured threshold
```

with the default threshold:

```text
70%
```

---

# 95. Definition of a Correct Unlock System

A correct unlock system produces:

```text
Beast 01
→ Beast 02
→ ...
→ Beast 09
→ Human 01
→ ...
→ Human 09
→ Sage 01
→ ...
→ Sage 09
```

and never allows the UI to bypass the progression authority.

---

# 96. Future Feature Rule

A future feature must answer:

1. What product rule does it introduce?
2. Which canonical document owns that rule?
3. Which domain/service owns the behavior?
4. What state does it change?
5. What tests prove it?
6. What UI only presents the result?

If these questions cannot be answered, the feature is not ready for implementation.

---

# 97. AI Feature Boundary

If AI is introduced later, AI must not become the authoritative source of game rules.

AI may assist with:

- natural-language guidance
- reflection prompts
- summaries
- explanations
- personalization
- optional coaching

AI must not independently decide:

- XP
- mastery
- Gate completion
- Gate unlocking
- achievements
- titles
- authoritative player state

The deterministic progression engine remains authoritative.

---

# 98. Product Truth Rule

MYTHIC LEVELS should never confuse:

```text
GAME STATE
```

with:

```text
REAL-WORLD TRUTH
```

For example:

```text
Level 10
```

means:

```text
the player's MYTHIC LEVELS progression reached Level 10
```

It does not claim that the player has objectively become ten times better.

The system provides a structured symbolic mirror of practice.

---

# 99. The Golden Rule

When in doubt:

```text
DO NOT PUT THE RULE IN THE UI.
```

Instead:

```text
Find the existing domain/progression rule.
        ↓
Reuse it.
        ↓
If it does not exist, define the rule first.
        ↓
Document it.
        ↓
Test it.
        ↓
Implement it.
        ↓
Expose the result to the UI.
```

---

# 100. Final Canonical Loop

The complete MYTHIC LEVELS progression loop is:

```text
                    PLAYER
                       │
                       ▼
             REAL-WORLD ACTION
                       │
                       ▼
                     QUEST
                       │
                       ▼
              PROGRESSION ENGINE
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
       XP          REWARDS        ATTRIBUTES
        │              │              │
        ▼              └──────┬───────┘
      LEVEL                    │
                               ▼
                            STREAK
                               │
                               ▼
                            MASTERY
                               │
             ┌─────────────────┼─────────────────┐
             ▼                 ▼                 ▼
          PRACTICE        CONSISTENCY       REFLECTION
            40%               20%               15%
             └─────────────────┬─────────────────┘
                               │
                               ▼
                             BOSS
                              25%
                               │
                               ▼
                    MASTERY ≥ THRESHOLD
                               │
                         + BOSS COMPLETE
                               │
                               ▼
                        GATE COMPLETE
                               │
                               ▼
                         NEXT UNLOCK
                               │
                               ▼
                        NEXT GATE
                               │
                               ▼
                       NEXT ARCANA
                               │
                               ▼
                    PLAYER'S NEXT SELF
```

---

# 101. Final Principle

> **The mythology gives the journey meaning.**
>
> **The product gives the journey structure.**
>
> **The progression engine gives the journey rules.**
>
> **The interface gives the journey presence.**
>
> **The player's real-world actions give the journey truth.**

Therefore:

```text
MYTHIC LEVELS
is not
a UI with game-like decoration.

It is
a deterministic progression system
presented through
a mythic interface.
```

The most important engineering boundary remains:

```text
UI
 ↓
ACTION
 ↓
PROGRESSION ENGINE
 ↓
STATE
 ↓
PERSISTENCE
```

And the most important product boundary remains:

```text
REAL-WORLD ACTION
        ↓
       GAME
        ↓
  MEANINGFUL PROGRESS
```

**End of canonical `RULES.md`.**
