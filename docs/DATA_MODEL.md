# MYTHIC LEVELS — Canonical Data Model

**Document:** `DATA_MODEL.md`  
**Status:** Canonical  
**Version:** 1.0  
**Scope:** Domain state, progression state, static content data, persistence shape, application-state boundary, and data ownership  
**Audience:** Developer, designer, Cursor/AI implementation assistants, future contributors  
**Authority:** This document defines the canonical data boundaries and the intended shape/meaning of MYTHIC LEVELS data.  
**Relationship:** `WORLD_DESIGN.md` defines meaning; `PRODUCT_SPEC.md` defines product behavior; `ARCHITECTURE.md` defines system structure; `PROGRESSION.md` explains progression flow; `RULES.md` defines game rules; this document defines the data that carries those rules.

---

# 1. Purpose

`DATA_MODEL.md` answers one question:

> **What data does MYTHIC LEVELS have, what does each piece mean, who owns it, and how does it move through the system?**

This document defines:

- Player data
- Settings data
- Progress data
- Gate-progress data
- Quest data
- Boss Trial data
- Arcana data
- Achievement data
- Title data
- Reflection data
- Daily-plan data
- Event-history data
- Attribute-history data
- Streak data
- Resource data
- XP and level data
- Mastery data
- Static catalog data
- Persistence envelope
- Application-store boundary
- Result/feedback data
- Data ownership
- Data validation
- Data immutability expectations
- Import/export expectations
- Data retention rules
- Relationships between entities
- Canonical diagrams
- Implementation guidance

The central principle is:

```text
DATA DESCRIBES THE WORLD.
DOMAIN STATE DESCRIBES THE PLAYER.
PROGRESSION SERVICES CHANGE THE STATE.
THE UI DISPLAYS THE STATE.
PERSISTENCE REMEMBERS THE STATE.
```

---

# 2. Data Model Authority

The data model must be interpreted together with the other canonical documents.

```text
WORLD_DESIGN.md
      ↓
Meaning and symbolism
      ↓
PRODUCT_SPEC.md
      ↓
Product behavior
      ↓
ARCHITECTURE.md
      ↓
System boundaries
      ↓
PROGRESSION.md
      ↓
Progression flow
      ↓
RULES.md
      ↓
Rules
      ↓
DATA_MODEL.md
      ↓
State and content representation
```

If implementation needs to know:

- **what something means** → World Design
- **what the product should do** → Product Spec
- **where responsibility belongs** → Architecture
- **how progression moves** → Progression
- **what rule must be enforced** → Rules
- **what data represents that rule** → Data Model

---

# 3. Core Data Principle

MYTHIC LEVELS contains two fundamentally different categories of data.

## 3.1 Static content data

This defines the world.

Examples:

```text
Arcanas
Gates
Quest definitions
Boss Trials
Achievements
Titles
Seven-day phase metadata
```

This data is part of the application code/content catalog.

It is not the player's personal save file.

## 3.2 Dynamic player state

This records the player's journey.

Examples:

```text
Player
Settings
Gate progress
Quest completions
XP
Level
Resources
Attributes
Mastery-related progress
Streak
Reflections
Achievements earned
Titles earned
Daily plans
Event history
Attribute history
```

This data is player-specific and is persisted.

---

# 4. Canonical Data Architecture

```text
                         MYTHIC LEVELS
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
       STATIC CONTENT                      PLAYER STATE
              │                                 │
      ┌───────┼────────┐              ┌─────────┼─────────┐
      │       │        │              │         │         │
      ▼       ▼        ▼              ▼         ▼         ▼
   Arcanas  Gates    Quests         Player   Progress  Settings
                      │                │         │
                      ▼                │         ├── Gate Progress
                  Boss Trials          │         ├── Streak
                                       │         ├── Reflections
                                       │         ├── Events
                                       │         ├── Plans
                                       │         └── History
                                       │
                                       ▼
                                  Achievements
                                  Titles
                                  XP
                                  Resources
                                  Attributes
```

---

# 5. Source of Truth

The following ownership is canonical.

| Data | Authority |
|---|---|
| Gate meaning | Gate static data |
| Gate content | Gate static data |
| Quest content | Quest/Gate static data |
| Boss content | Gate static data |
| Player identity | Player state |
| Player XP | Progression state |
| Player level | Progression engine/state |
| Resources | Progression state |
| Attributes | Progression state |
| Gate completion | Gate progress + progression engine |
| Gate unlock | Gate progress + progression engine |
| Mastery | Progression engine |
| Streak | Progression state + progression engine |
| Achievements earned | Progression state + achievement evaluator |
| Titles earned | Player/progression state + title evaluator |
| Reflections | Progress state |
| Daily plans | Progress state |
| Events | Progress state |
| Settings | Settings state |
| Visual representation | UI |

---

# 6. The Root State

The canonical player save is conceptually:

```text
STATE
├── schemaVersion
├── player
├── settings
└── progress
```

Current repository behavior creates:

```text
schemaVersion = 1
```

The current initial-state factory creates:

```text
player
settings
progress
```

and creates the first Gate record for:

```text
beast-01
```

---

# 7. Root State Responsibilities

The root state is the complete persisted journey.

It should contain everything required to reconstruct the player's current journey without requiring the UI to infer historical progression.

Conceptually:

```text
State
│
├── schemaVersion
│
├── player
│
├── settings
│
└── progress
    │
    ├── gates
    ├── counters
    ├── reflections
    ├── events
    ├── dailyPlans
    ├── streak
    └── other progression history
```

Static content such as all 27 Gate definitions does not need to be duplicated inside every player's save.

---

# 8. Schema Version

The current schema version is:

```text
1
```

The current persistence key is:

```text
mythic-levels:v1
```

Schema version exists so future versions can distinguish:

```text
old state
```

from:

```text
current state
```

The application must not silently treat an unknown schema as current state.

---

# 9. Player Model

The Player represents the identity and high-level progression position of the player.

The current domain model creates a Player with:

- generated `player-*` id
- trimmed name
- title
- ISO creation timestamp
- current Arcana position
- current Gate position
- XP
- seven resource counters
- nine attributes
- attribute history
- achievements
- current/earned title information
- avatar
- goal
- routine
- improvement-area preferences

---

# 10. Player Identity

The Player has a generated identifier.

Current format:

```text
player-*
```

The exact generated suffix is implementation detail.

The important invariant is:

```text
player.id uniquely identifies the local journey.
```

The ID must not be regenerated on every render.

It is created as part of initial state creation.

---

# 11. Player Name

The player's name is user-provided.

The current model trims the name.

The initial-state layer must therefore normalize/validate the Awakening input before constructing a Player.

The current Player factory expects a usable name.

The application layer must not pass invalid awakening data into `createInitialState()`.

---

# 12. Player Title

The Player has title information.

The initial title is:

```text
The Awakening
```

Titles are progression-related identity data.

The title displayed in the UI must come from player/progression state.

A component must not permanently hardcode the player's current title.

---

# 13. Player Creation Timestamp

The Player contains an ISO timestamp representing creation.

Conceptually:

```text
createdAt
```

This represents when the player journey was created.

It is historical data.

It must not be regenerated during normal state updates.

---

# 14. Current Position

The player has a current progression position.

The current implementation represents position using:

```text
current Arcana
current Gate number
```

Initial position:

```text
Arcana = beast
Gate = 1
```

Conceptually:

```text
currentPosition
├── arcana
└── gate
```

The current position answers:

> Where is the player currently progressing?

It does not represent the complete history.

---

# 15. Current Position vs History

These must remain conceptually separate.

```text
CURRENT POSITION
=
where the player is now
```

while:

```text
HISTORICAL STATE
=
what the player has already done
```

A player may have:

```text
current Gate = Human 03
```

while also retaining:

```text
completed Gates
completed quests
achievement history
reflections
events
attribute history
```

---

# 16. Player XP

XP is stored as part of player progression.

Conceptually:

```text
xp
```

XP is:

- numeric
- cumulative
- used for player-level progression
- awarded by progression actions
- modified through the progression engine

The UI may display XP.

The UI must not directly mutate XP.

---

# 17. Player Resources

The current player model contains seven resource counters:

```text
MP
SP
AP
DP
KP
CP
XP
```

Where:

| Key | Meaning |
|---|---|
| `xp` | Experience Points |
| `mp` | Mastery Points |
| `sp` | Streak Points |
| `ap` | Awareness Points |
| `dp` | Discipline Points |
| `kp` | Knowledge Points |
| `cp` | Connection / Communication Points |

The exact resource award comes from quest data and progression logic.

---

# 18. XP Is a Resource but Also a Level Driver

XP has a special role.

```text
XP
 ↓
Level
```

Other resources do not replace XP's level function.

The player state therefore contains both:

```text
xp
```

and:

```text
level
```

where level is progression state derived/maintained according to the XP system.

The UI should consume the authoritative resulting level rather than implementing a competing formula.

---

# 19. Level Data

The current system starts players at:

```text
level = 1
```

The first level requirement is:

```text
200 XP
```

Subsequent requirements use the progression engine's scaling rule.

Current rule:

```text
next requirement =
previous requirement × 1.12
```

rounded.

The Data Model does not own this formula.

The progression engine owns it.

---

# 20. Player Attributes

The current Player model contains nine attributes.

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

The initial values are:

```text
0
```

for all nine attributes.

---

# 21. Attribute Representation

Conceptually:

```text
attributes
├── Focus
├── Discipline
├── Awareness
├── Knowledge
├── Communication
├── Emotional Balance
├── Perspective
├── Connection
└── Wisdom
```

Implementation may use normalized identifiers, but the semantic names remain canonical.

The current implementation caps each individual attribute at:

```text
100
```

---

# 22. Attribute Ownership

Attributes are player progression state.

Quest definitions may contain attribute rewards.

The progression engine applies those rewards.

Correct:

```text
Quest
 ↓
attribute rewards
 ↓
Progression Engine
 ↓
Player Attributes
```

Incorrect:

```text
React component
 ↓
player.attributes.focus += 5
```

---

# 23. Attribute History

The player has attribute history.

The current implementation records snapshots after progression updates.

Retention:

```text
latest 120 snapshots
```

Attribute history exists to support:

- analytics
- progress visualization
- historical development
- future insights

The UI must not fabricate history.

---

# 24. Settings Model

Settings control configurable player preferences and progression configuration.

Current settings include:

```text
difficulty
dailyDuration
availableDays
reminders
masteryThreshold
sound
awakeningCompleted
skipCeremony
```

The exact implementation property names should be read from the existing domain model before creating application APIs.

---

# 25. Default Settings

Current defaults are:

| Setting | Default |
|---|---|
| Difficulty | `standard` |
| Daily duration | `25 minutes` |
| Available days | all 7 |
| Reminders | disabled |
| Mastery threshold | `0.7` |
| Sound | disabled |
| Awakening | incomplete before initial-state creation |
| Ceremony skipped | false |

After `createInitialState()` completes Awakening:

```text
awakeningCompleted = true
```

---

# 26. Difficulty Data

The current difficulty modes are:

```text
gentle
standard
austere
```

Their progression-related configuration is:

| Difficulty | XP multiplier | Duration multiplier |
|---|---:|---:|
| Gentle | 0.90 | 0.75 |
| Standard | 1.00 | 1.00 |
| Austere | 1.15 | 1.25 |

Difficulty is configuration.

Difficulty calculation belongs to progression/application logic.

---

# 27. Mastery Threshold Data

The settings model stores the mastery threshold.

Current default:

```text
0.7
```

Equivalent display:

```text
70%
```

This allows the progression system to evaluate:

```text
mastery >= settings.masteryThreshold
```

The UI may display the threshold but does not own the comparison.

---

# 28. Progress Model

Progress represents the player's accumulated journey.

Current progress contains:

```text
Gate records
quest counters
practice totals
focus totals
reflections
events
daily plans
streak state
return/interruption state
```

---

# 29. Progress Responsibilities

Progress answers questions such as:

```text
What has the player completed?
How much practice has occurred?
Which Gates have started?
Which Gates have completed?
What reflections exist?
What plans were saved?
What recent progression events happened?
What is the current streak?
What is the longest streak?
```

---

# 30. Gate Progress Model

Each Gate has a player-specific progress record.

The current Gate record contains:

- Gate id
- unlock status
- start timestamp
- completion timestamp
- per-day completion records
- Boss completion timestamp
- Gate MP total

Conceptually:

```text
gateProgress
├── gateId
├── unlocked
├── startedAt
├── completedAt
├── days
├── bossCompletedAt
└── mp
```

The exact internal property names should remain aligned with the existing domain implementation.

---

# 31. Gate Progress Is Not Gate Content

This distinction is critical.

Static Gate:

```text
Gate Definition
```

describes:

```text
what the Gate is
```

Gate progress:

```text
Gate Progress Record
```

describes:

```text
what this player has done with the Gate
```

Therefore:

```text
Gate Definition + Gate Progress
=
Player's Gate Experience
```

---

# 32. Gate Definition

A Gate definition contains static content.

The current catalog supports Gate information including:

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
- Boss Trial

---

# 33. Gate ID

Gate IDs identify static Gate content.

Examples include:

```text
beast-01
```

The catalog contains all 27 Gate definitions.

The same Gate ID is used to connect:

```text
static Gate data
```

with:

```text
player Gate progress
```

---

# 34. Gate Position

A Gate has:

```text
Arcana
Gate number
```

For example:

```text
Arcana = beast
Gate number = 1
```

The catalog can resolve a Gate using:

```text
getGateByPosition(arcana, gateNumber)
```

---

# 35. Gate Status

The player's Gate progress can be interpreted by the application/UI as:

```text
LOCKED
UNLOCKED
CURRENT
IN PROGRESS
COMPLETED
```

These are derived/presentation states.

The canonical persisted facts are the actual progress fields.

The UI must not invent an independent status database.

---

# 36. Arcana Model

There are three static Arcanas.

```text
beast
human
sage
```

Their order is canonical:

```text
beast → human → sage
```

---

# 37. Arcana Definition

Each Arcana contains static thematic information.

Current Arcana data includes:

- id
- Roman numeral
- glyph
- accent token
- name
- promise
- lore

The three thematic arcs are:

```text
I   The Beast
II  The Human
III The Sage
```

---

# 38. Arcana Does Not Store Player Progress by Itself

Arcana definitions are static.

Player progress through an Arcana is represented through:

```text
current position
Gate progress
completed Gates
events
achievements
titles
```

Do not create duplicate Arcana-progress logic unless the product explicitly requires it.

---

# 39. Quest Definition

Quest definitions are static content.

A quest may contain:

- id
- type
- phase
- objective
- explanation
- task
- duration
- XP
- resources/rewards
- attributes
- reflection prompt

The exact property structure is defined by the existing quest/Gate data.

---

# 40. Quest ID

A quest ID identifies a quest within the Gate content.

The catalog resolves quests through:

```text
getQuest(gateId, questId)
```

The resolver returns enough information to identify:

```text
quest kind
Gate
quest definition
```

---

# 41. Quest Types

The existing seven-day system includes phase/type concepts such as:

```text
observation
practice
daily
reflection
```

Boss Trial is treated separately as a trial/boss quest kind.

Do not invent additional quest types merely for UI styling.

---

# 42. Seven-Day Phase Metadata

Default phase metadata currently contains:

| Day | Phase | Type | Default XP |
|---|---|---|---:|
| 1 | Recognition | observation | 22 |
| 2 | Observation | observation | 24 |
| 3 | Practice | practice | 30 |
| 4 | Resistance | practice | 32 |
| 5 | Application | daily | 34 |
| 6 | Challenge | practice | 40 |
| 7 | Reflection & Trial | reflection | 36 |

Gate-specific data can override:

- type
- objective
- explanation
- task
- duration
- XP
- rewards
- attributes
- prompt

Therefore these defaults do not replace Gate-specific content.

---

# 43. Daily Completion Record

Each completed day needs player-specific completion information.

The current Gate progress records contain per-day completion records.

A completion record captures information including:

- completion date
- completion timestamp
- reflection
- phase
- quest id
- minutes

This information is produced by the progression engine.

---

# 44. Completion Date

Completion date uses a local date key.

Canonical format:

```text
YYYY-MM-DD
```

This is used for:

- streaks
- consistency
- daily completion
- historical activity

---

# 45. Completion Timestamp

Completion timestamp records the actual event time as an ISO timestamp.

Conceptually:

```text
completedAt
```

The date key and timestamp serve different purposes.

```text
dateKey
=
calendar-day identity

timestamp
=
event-time identity
```

---

# 46. Completion Reflection

A quest completion may include reflection text.

The progression engine:

- sanitizes reflection input
- treats it as plain text
- truncates it to 8,000 characters

A reflection of at least:

```text
12 characters
```

qualifies for the mastery reflection signal.

---

# 47. Completion Minutes

Quest completion records the minutes associated with the completion.

The engine uses:

```text
supplied duration
```

when available, otherwise:

```text
quest duration
```

The resulting minutes contribute to progress counters.

The UI must not independently modify practice totals.

---

# 48. Boss Trial Data

Each Gate has one Boss Trial.

Boss Trial is static Gate content.

It has its own generated ID and trial definition.

Conceptually:

```text
boss
├── id
├── type
├── title
├── task
├── duration
├── XP
├── rewards
└── prompt
```

Only properties actually present in the existing data should be relied upon by implementation.

---

# 49. Boss Progress

Boss progress belongs to the player's Gate progress.

Current persisted fact:

```text
boss completion timestamp
```

The Boss is considered complete when the progression engine records completion.

The UI must not infer Boss completion from:

```text
page visited
form opened
textarea filled
```

---

# 50. Mastery Data

Mastery is calculated from player Gate progress.

It is primarily a derived progression result rather than independent UI-owned state.

The four signals are:

```text
practice
consistency
reflection
boss
```

Weights:

```text
practice      0.40
consistency   0.20
reflection    0.15
boss          0.25
```

---

# 51. Mastery Signal Data

Conceptually:

```text
masterySignals
├── practice
├── consistency
├── reflection
└── boss
```

Each signal is normalized to:

```text
0 → 1
```

The progression engine combines the signals into:

```text
mastery
```

---

# 52. Practice Signal Data

Current formula:

```text
completed non-trial days / 6
```

capped at:

```text
1
```

Therefore:

```text
practice =
min(completedNonTrialDays / 6, 1)
```

This is derived from Gate progress.

It does not need to be independently stored as authoritative state.

---

# 53. Consistency Signal Data

Current formula:

```text
unique completion dates / 7
```

capped at:

```text
1
```

This is derived from completion records.

---

# 54. Reflection Signal Data

Current formula:

```text
days with qualifying reflections / 7
```

where a qualifying reflection has at least:

```text
12 characters
```

The signal is capped at:

```text
1
```

---

# 55. Boss Signal Data

Current representation:

```text
boss complete → 1
boss incomplete → 0
```

The source of truth is Boss completion in Gate progress.

---

# 56. Mastery Result

A calculated mastery result conceptually contains:

```text
mastery
signals
threshold
isComplete
```

It may also contain supporting details for UI feedback.

The exact return object is owned by the progression engine.

The application store should pass the result through rather than recreate it.

---

# 57. Gate Completion Data

A completed Gate is represented through its Gate progress record.

Relevant facts include:

```text
completedAt
```

and related unlocked/completion state.

Gate completion may also result in:

- next Gate unlock
- current-position advance
- title reward
- achievement evaluation
- ascension information
- event history

These are separate state effects.

---

# 58. Unlock Data

Unlock state belongs to player progress.

Current Gate progress contains:

```text
unlocked
```

The progression engine determines its value.

The unlock service owns the progression chain.

The UI consumes it.

---

# 59. Linear Unlock Relationship

The data relationship is:

```text
Gate N completion
       ↓
unlock rule
       ↓
Gate N+1 progress record
       ↓
unlocked = true
```

The complete current sequence is:

```text
Beast 01 → Beast 02 → ... → Beast 09
                                      ↓
                                  Human 01
                                      ↓
                                  ... → Human 09
                                      ↓
                                   Sage 01
                                      ↓
                                  ... → Sage 09
```

---

# 60. Initial Gate Progress

`createInitialState()` creates the first Gate progress record:

```text
beast-01
```

and marks it available/unlocked for the initial journey.

Other Gate records may be created as progression unlocks them.

The implementation must preserve the current engine behavior rather than pre-populating arbitrary progress.

---

# 61. Streak Data

Progress contains streak information.

Current fields include:

```text
current streak
longest streak
last active date
interruption state
missedThenReturned
```

The exact internal names should remain aligned with the current domain model.

---

# 62. Current Streak

Current streak answers:

```text
How many consecutive active calendar days does the player currently have?
```

It is date-based.

Same-day activity does not increment the streak.

Next-day activity increments it.

A gap greater than one day resets the current streak to:

```text
1
```

when the player returns.

---

# 63. Longest Streak

Longest streak is historical.

It records the highest current streak reached.

It must not decrease because the current streak was interrupted.

---

# 64. Last Active Date

The progress state retains the most recent activity date.

This is used to evaluate:

```text
same day
next day
gap
return
```

It should use the canonical local date-key format.

---

# 65. Interruption State

Progress can record whether a streak was interrupted.

The engine reports a return after a gap.

This allows the UI and achievement system to recognize:

```text
returned after missing a day
```

without deleting historical progression.

---

# 66. Streak Points

Streak points are stored as:

```text
SP
```

Current behavior:

```text
starting/continuing activity → +1 SP
return after interruption → +2 SP
```

The progression engine applies these changes.

---

# 67. Quest Counters

Progress contains counters used for milestones and analytics.

Current counters include:

```text
total completed quests
knowledge quests
listening quests
observation quests
```

These counters support achievement evaluation and analytics.

They are updated by progression actions.

---

# 68. Practice Minutes

Progress contains:

```text
total practice minutes
```

This is accumulated from valid quest completions.

It supports:

- progress display
- analytics
- achievements
- future summaries

It must not be directly edited by the UI.

---

# 69. Longest Focus Duration

Progress contains:

```text
longest focus duration
```

The progression engine updates it when a completed quest has a greater qualifying duration.

This supports focus-related achievement conditions.

---

# 70. Reflection Collection

Progress stores player reflections.

Conceptually:

```text
reflections[]
```

A reflection has an identity and associated player/Gate/day context.

The current system supports:

```text
upsertReflection()
deleteReflection()
```

Reflections are local player data.

---

# 71. Reflection Data

A reflection conceptually contains:

```text
id
gateId
questId/day context
dateKey
text
createdAt/updatedAt context
```

The exact field shape must remain aligned with the existing reflection implementation.

Do not invent additional required fields simply to satisfy a UI component.

---

# 72. Reflection Ownership

Reflection content belongs to the player journey.

It is not static Gate content.

Therefore:

```text
Gate definition
≠
Player reflection
```

The same Gate can have different reflections for different players.

---

# 73. Reflection Security

Reflection data must be treated as untrusted user text.

The data model assumes:

```text
plain text
```

not:

```text
HTML
```

The current sanitizer removes case-insensitive `<script` openings and truncates to 8,000 characters.

The UI must render reflection text safely as text.

---

# 74. Achievement Definition

Achievements are static content definitions.

The current achievement registry contains:

```text
17 achievement records
```

covering categories including:

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

The exact registry remains the source of truth in:

```text
src/data/achievements.js
```

---

# 75. Achievement State

The Player contains an achievement list.

This represents achievements earned by the player.

Static definition:

```text
Achievement Definition
```

Player state:

```text
Earned Achievement
```

These must not be confused.

---

# 76. Achievement Definition vs Earned Achievement

Conceptually:

```text
STATIC
Achievement
├── id
├── title
├── description
└── condition

PLAYER
earnedAchievements[]
├── achievement id
└── earned information
```

The exact condition is evaluated by the achievement service.

---

# 77. Achievement IDs

Achievement IDs are identifiers connecting:

```text
static achievement definitions
```

to:

```text
player achievement state
```

The current repository has some dynamic Gate achievement IDs and title references that are not a strict one-to-one registry.

Therefore:

> Do not assume that every Gate achievement ID has a separately declared static record unless the current data actually contains it.

This is a known repository inconsistency and must not be silently “fixed” by the data model.

---

# 78. Title Definition

Titles are static progression definitions.

The current title set includes titles such as:

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

The title evaluator determines whether conditions are satisfied.

---

# 79. Title State

Player title state includes:

```text
current title
```

and may include earned/unlocked title information depending on the current implementation.

The UI should derive title display from player/progression state.

---

# 80. Title Condition Sources

Current title conditions can depend on:

- achievements
- Arcana entry
- selected Gate completion

Therefore title state is not simply:

```text
highest level = title
```

unless such a rule is explicitly defined by the title evaluator.

---

# 81. Daily Plan Data

Progress stores daily plans by date key.

Conceptually:

```text
dailyPlans
├── YYYY-MM-DD
│   └── plan
├── YYYY-MM-DD
│   └── plan
└── ...
```

The current service:

```text
saveDailyPlan()
```

stores a plan and records a:

```text
PLAN_SAVED
```

event.

---

# 82. Daily Plan Structure

The current daily plan generator uses three parts:

```text
Morning
Afternoon
Evening
```

Morning selects the next incomplete Gate quest.

After seven daily quests are complete:

```text
Morning → Boss Trial
```

Afternoon includes a secondary observation activity.

Evening includes a reflection prompt.

---

# 83. Daily Plan Duration

Daily plans respect the configured daily duration.

The Boss plan uses at least:

```text
40 minutes
```

and caps at the Boss duration.

The daily plan service owns plan construction.

The UI displays the resulting plan.

---

# 84. Existing Daily Plan Rule

If an existing plan already exists for the date, the plan generator returns it unchanged.

This prevents the UI from silently changing a saved plan simply because the page was reopened.

---

# 85. Event History

Progress stores recent progression events.

Current retention:

```text
400 events
```

The event history is intended to support:

- progression history
- analytics
- debugging
- future ceremonies
- player journey visibility

---

# 86. Event Data

An event conceptually contains:

```text
type
timestamp
date context
related entity context
metadata
```

The exact event structure is defined by the existing progression implementation.

Do not create a second event format inside React.

---

# 87. Current Event Types

Known event types include at least:

```text
GATE_ENTERED
PLAN_SAVED
QUEST_COMPLETED
```

Other progression events may be produced by the current engine for:

- Gate completion
- ascension
- rewards
- progression transitions

The exact registry is implementation-owned.

---

# 88. Event History Is Append-Oriented

Progression events are historical records.

They should be appended by progression/application actions.

The UI must not manually append events when displaying a ceremony.

For example:

```text
Gate unlock event
```

should originate from the progression result, not from the animation component.

---

# 89. Attribute History vs Event History

These are different datasets.

```text
ATTRIBUTE HISTORY
=
snapshots of attribute state
```

while:

```text
EVENT HISTORY
=
records of progression actions
```

Do not merge them into one generic history object merely for convenience.

---

# 90. Static Game Data Architecture

Static content is stored under:

```text
src/data/
```

The current project contains:

```text
Arcanas
Gates
Quests
Seven-day definitions
Achievements
Titles
Gate factory
Catalog
```

The UI should access this data through reusable APIs.

---

# 91. Gate Factory

Most Gates are constructed through:

```text
src/data/gateFactory.js
```

The factory converts compact Gate configuration into normalized Gate content.

It generates:

```text
seven daily entries
one Boss Trial
```

This means the source configuration may be smaller than the resulting runtime Gate object.

The runtime Gate remains the data consumed by the application.

---

# 92. Catalog

The catalog is the primary static-content lookup layer.

Location:

```text
src/data/catalog.js
```

Known operations:

```text
listGates()
getGateById()
getGateByPosition()
getArcana()
gatesForArcana()
getQuest()
```

---

# 93. Catalog Relationship

The catalog connects:

```text
Arcana
   ↓
Gate
   ↓
Quest
```

Conceptually:

```text
getArcana("beast")
        ↓
The Beast

getGateById("beast-01")
        ↓
Beast 01

getQuest("beast-01", questId)
        ↓
specific quest/trial
```

---

# 94. Data-Driven UI

The UI must not contain canonical Gate content.

Incorrect:

```javascript
if (gateId === "beast-01") {
  return <BeastOne />
}
```

Correct:

```text
route gateId
     ↓
catalog lookup
     ↓
Gate definition
     ↓
reusable Gate UI
```

---

# 95. Player Save vs Static Catalog

The player's saved state should not duplicate all Gate content.

Avoid:

```text
playerState.gates[].fullLore
playerState.gates[].fullQuestText
playerState.gates[].fullBossText
```

unless a future product requirement explicitly requires snapshotting content.

Normally:

```text
Static Catalog
      +
Player Gate Progress
      =
Rendered Gate
```

---

# 96. Data Relationship Diagram

```text
                 STATIC CATALOG
                       │
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       ARCANA         GATE        ACHIEVEMENT
                       │
                       ├──────────► BOSS
                       │
                       └──────────► QUESTS
                                     │
                                     ▼
                              QUEST DEFINITION
                                     │
                                     │
                                     ▼
                               PLAYER ACTION
                                     │
                                     ▼
                            PROGRESSION ENGINE
                                     │
                                     ▼
                              PLAYER STATE
```

---

# 97. Player-State Relationship Diagram

```text
PLAYER
│
├── identity
│
├── current position
│
├── level / XP
│
├── resources
│
├── attributes
│
├── title
│
├── achievements
│
├── avatar
│
├── goal
│
├── routine
│
└── preferences

SETTINGS
│
├── difficulty
├── daily duration
├── available days
├── reminders
├── mastery threshold
├── sound
├── awakening
└── ceremony

PROGRESS
│
├── gate progress
├── quest counters
├── practice minutes
├── focus duration
├── reflections
├── events
├── daily plans
├── streak
└── return/interruption state
```

---

# 98. Complete State Relationship

```text
ROOT STATE
│
├── schemaVersion
│
├── PLAYER
│   ├── id
│   ├── name
│   ├── title
│   ├── createdAt
│   ├── current position
│   ├── level
│   ├── xp
│   ├── resources
│   ├── attributes
│   ├── attribute history
│   ├── achievements
│   ├── avatar
│   ├── goal
│   ├── routine
│   └── improvement areas
│
├── SETTINGS
│   ├── difficulty
│   ├── daily duration
│   ├── available days
│   ├── reminders
│   ├── mastery threshold
│   ├── sound
│   ├── awakening
│   └── ceremony
│
└── PROGRESS
    ├── Gate records
    │   ├── unlock state
    │   ├── start
    │   ├── completion
    │   ├── day records
    │   ├── boss
    │   └── Gate MP
    │
    ├── quest counters
    ├── practice minutes
    ├── focus duration
    ├── reflections
    ├── daily plans
    ├── streak
    ├── events
    └── return state
```

---

# 99. Conceptual JSON Shape

The following is a **conceptual representation**, not a replacement for the current implementation's exact JavaScript object shape.

```json
{
  "schemaVersion": 1,
  "player": {
    "id": "player-...",
    "name": "Player",
    "title": "The Awakening",
    "createdAt": "ISO_TIMESTAMP",
    "currentPosition": {
      "arcana": "beast",
      "gate": 1
    },
    "level": 1,
    "xp": 0,
    "resources": {
      "mp": 0,
      "sp": 0,
      "ap": 0,
      "dp": 0,
      "kp": 0,
      "cp": 0
    },
    "attributes": {},
    "attributeHistory": [],
    "achievements": [],
    "avatar": "...",
    "goal": "...",
    "routine": "...",
    "improvementAreas": []
  },
  "settings": {
    "difficulty": "standard",
    "dailyDuration": 25,
    "availableDays": [],
    "reminders": false,
    "masteryThreshold": 0.7,
    "sound": false,
    "awakeningCompleted": true,
    "skipCeremony": false
  },
  "progress": {
    "gates": {},
    "questCounters": {},
    "practiceMinutes": 0,
    "longestFocusDuration": 0,
    "reflections": [],
    "dailyPlans": {},
    "streak": {},
    "events": []
  }
}
```

Important:

> This block documents the conceptual model. Existing source files remain authoritative for exact property names and object construction until the implementation is formally normalized.

---

# 100. Resource Representation

The current implementation stores resource counters on the Player.

Conceptually:

```text
player.xp
player.mp
player.sp
player.ap
player.dp
player.kp
player.cp
```

Do not assume that a future normalized object:

```text
player.resources.xp
```

should be introduced unless the existing domain model is intentionally changed.

The current source shape has priority during implementation.

---

# 101. Data Normalization Rule

Do not normalize the domain merely because a theoretical schema looks cleaner.

For example:

```text
player.mp
```

should not automatically become:

```text
player.resources.mp
```

during UI integration.

If the current source already works, preserve it.

Refactoring the domain is a separate change.

---

# 102. Application Store Shape

The application store is not the canonical persisted data model.

It is an adapter.

Conceptually:

```text
STORE
├── gameState
├── initialization status
├── loading status
├── error state
├── last progression result
└── UI/application actions
```

The store may expose convenient selectors.

It must not create a second representation of the game state.

---

# 103. Store vs Domain State

Correct:

```text
Zustand
  ↓
holds/reference current domain state
```

Incorrect:

```text
Zustand
  ↓
creates its own XP/mastery/unlock model
```

The domain/progression state remains authoritative.

---

# 104. UI State

Not every piece of UI state belongs in persisted game state.

Examples of UI-only state:

```text
modal open
toast visible
animation playing
selected tab
sidebar open
loading indicator
temporary form text
```

These should not be written into the player save unless there is a product reason.

---

# 105. Game State vs UI State

```text
GAME STATE
├── player
├── settings
├── progress
└── historical progression

UI STATE
├── modal
├── selected tab
├── animation
├── temporary form
├── loading
└── navigation
```

This distinction prevents accidental persistence of interface details.

---

# 106. Action Input Data

Progression actions receive input.

For example, `completeQuest()` needs enough information to identify:

```text
Gate
Quest
Date context
Duration context
Reflection context
```

The exact function signature remains defined by the existing engine.

The application layer should pass validated UI input to the engine.

---

# 107. Action Result Data

Progression actions may return:

```text
new state
+
result metadata
```

The current `completeQuest()` result can include:

- rewards
- mastery
- mastery signals
- level
- unlocks
- achievements
- titles
- ascension
- streak information
- interruption status

The application layer should preserve this result for immediate UI feedback.

---

# 108. Result vs State

These are different.

```text
STATE
=
what is now true
```

while:

```text
RESULT
=
what happened during this action
```

For example:

```text
state:
level = 4
```

while a completion result may report:

```text
levelUp = true
previousLevel = 3
newLevel = 4
```

The exact result structure is engine-owned.

---

# 109. Why Result Data Matters

The UI needs temporary information such as:

```text
+30 XP
Gate unlocked
Title earned
Achievement earned
Level up
Ascension
Streak increased
```

These events should not be permanently duplicated in the player state merely to drive an animation.

The progression result provides immediate feedback.

---

# 110. Persistence Envelope

Persistence stores the root state.

Conceptually:

```text
Storage
  ↓
serialized state
  ↓
localStorage
```

Current key:

```text
mythic-levels:v1
```

Current schema:

```text
1
```

The storage service is responsible for serialization/deserialization.

---

# 111. Persistence Does Not Own Domain Meaning

Storage should not decide:

```text
XP
Mastery
Unlock
Streak
Achievement
Title
```

It only stores the resulting state.

Correct:

```text
Engine
 ↓
State
 ↓
Storage
```

---

# 112. Load Flow

Canonical load flow:

```text
Application starts
       ↓
Storage adapter reads saved data
       ↓
Parse data
       ↓
Validate state
       ↓
Accept valid state
       ↓
Application state
```

If no save exists:

```text
No state
 ↓
Awakening flow
```

---

# 113. Invalid Load

The current validator requires:

```text
schemaVersion = 1
player id
player name
progress
settings
```

If required state is missing or unsupported, the load must not silently become active state.

The current validator is partial and does not exhaustively validate every nested field.

This is a known limitation.

---

# 114. Migration Rule

The current project does not yet provide comprehensive migration support.

Therefore:

```text
schema 1
```

is the current supported persisted schema.

Future schema changes should introduce an explicit migration strategy rather than silently changing object shape.

---

# 115. Future Migration Pattern

When migration is introduced:

```text
Stored schema N
      ↓
Migration N → N+1
      ↓
Validated schema N+1
      ↓
Application
```

Never:

```text
Old arbitrary object
      ↓
hope it works
```

---

# 116. Import Data

Importing a journey is equivalent to loading external state.

Therefore:

```text
Imported JSON
      ↓
Parse
      ↓
Validate
      ↓
Schema check
      ↓
Accept or reject
```

Imported data is untrusted input.

---

# 117. Export Data

Export should produce a representation of the player's current journey state.

It should include the necessary persisted state.

It should not need to include static catalog content because the application already contains the canonical catalog.

---

# 118. Reset Data

Reset removes/resets the player's persisted journey state.

It must be an explicit destructive action.

Reset is not triggered by:

```text
missed day
quest failure
Gate failure
page refresh
storage reload
```

---

# 119. Data Immutability

Progression actions are conceptually:

```text
oldState + action
       ↓
newState + result
```

The progression engine clones state from the caller's perspective.

On failure:

```text
original state
```

is returned unchanged.

This protects the data model from partial failed mutations.

---

# 120. No Partial Mutation Rule

A failed progression action must not leave behind:

```text
XP awarded
but quest not completed
```

or:

```text
achievement awarded
but Gate not updated
```

or:

```text
streak updated
but completion rejected
```

The engine should return the original state on failure.

---

# 121. Referential Ownership

Static content is application-owned:

```text
src/data/
```

Player state is journey-owned:

```text
state.player
state.settings
state.progress
```

The progression engine operates on player state using static definitions.

---

# 122. Gate Definition + Gate Progress

The fundamental relationship is:

```text
GateDefinition
        +
GateProgress
        ↓
PlayerGateView
```

Example:

```text
beast-01
```

Static:

```text
name
lore
quests
boss
principle
```

Player:

```text
unlocked
startedAt
day completions
bossCompletedAt
completedAt
MP
```

Together they create the current Gate experience.

---

# 123. Quest Definition + Completion Record

Likewise:

```text
QuestDefinition
        +
QuestCompletion
        ↓
PlayerQuestState
```

Static:

```text
objective
task
duration
XP
rewards
```

Player:

```text
completed date
timestamp
reflection
minutes
```

---

# 124. Achievement Definition + Earned State

```text
AchievementDefinition
        +
EarnedAchievement
        ↓
PlayerAchievement
```

The definition tells the system:

```text
what the achievement means
```

The earned state tells the system:

```text
whether the player has earned it
```

---

# 125. Title Definition + Player Title

```text
TitleDefinition
       +
Title Evaluation
       ↓
Player Title State
```

The title evaluator remains authoritative.

---

# 126. Derived Data

The application should distinguish stored data from derived data.

Examples of derived data:

```text
Gate mastery
Gate status
next unlock
Arcana progress percentage
level progress percentage
achievement progress
daily completion percentage
```

If the engine can calculate something reliably from authoritative state, do not create a second conflicting stored value unless there is a clear performance/product reason.

---

# 127. Derived Mastery

Mastery is derived from:

```text
Gate progress
+
completion records
+
reflections
+
Boss state
+
settings threshold
```

The authoritative calculation lives in:

```text
src/services/progression/mastery.js
```

---

# 128. Derived Gate Status

Gate status can be derived from:

```text
unlocked
current position
completedAt
```

Do not create:

```text
gate.status = "current"
```

as a second authoritative value unless the domain explicitly requires it.

---

# 129. Derived Level Progress

The UI may show:

```text
current XP
next level requirement
progress percentage
```

These are presentation calculations based on authoritative XP/level progression data.

The level formula itself remains in the progression service.

---

# 130. Derived Arcana Progress

Arcana progress can be calculated from completed Gate progress.

Conceptually:

```text
completed Gates in Arcana
-------------------------
9
```

The UI may display the result.

The canonical number of Gates per Arcana is:

```text
9
```

---

# 131. Data Retention Rules

Current retention limits:

```text
Attribute history → latest 120 snapshots
Event history → latest 400 events
```

These limits prevent unbounded growth.

Reflection retention is not defined by a numeric cap in the current source; do not invent one.

Daily-plan retention is not currently specified by a numeric cap; do not invent one.

---

# 132. Historical Data Rule

Historical data should not be rewritten simply to make the current UI easier.

For example:

```text
old event
```

should remain historical even if the current UI uses a new label.

Do not mutate historical progression meaning without a migration policy.

---

# 133. Local Date Data

Date keys use:

```text
YYYY-MM-DD
```

and are based on local time.

Date-key data appears in:

- quest completion
- streak
- daily plans
- reflection context
- consistency calculations

---

# 134. Timestamp Data

Timestamps are ISO strings.

They are used for:

- creation
- Gate entry
- completion
- events
- reflections where applicable
- persistence/history

Date keys and timestamps should not be substituted for each other.

---

# 135. Timezone Rule

The current implementation uses local date calculations.

Therefore the application must not silently convert a player's local activity date into UTC before applying streak/consistency rules.

The current date utility behavior is local-time based.

---

# 136. Daylight-Saving Rule

The current date difference implementation uses a fixed:

```text
86,400,000 milliseconds
```

day interval.

Daylight-saving transitions may therefore deserve dedicated tests.

This is a known implementation risk.

Do not silently rewrite date behavior while building the UI.

---

# 137. Validation Rule

Validation belongs at the data boundary.

Important boundaries include:

```text
Awakening input
Loaded storage
Imported journey
Quest action input
Reflection input
Settings updates
```

---

# 138. Awakening Validation

Because the Player factory trims the player name, the application layer must ensure that the name is usable before calling:

```text
createInitialState()
```

Do not allow:

```text
undefined
null
empty invalid value
```

to reach a factory that assumes:

```text
input.name.trim()
```

---

# 139. Reflection Validation

Reflection input must:

```text
be treated as text
be sanitized
be limited to 8,000 characters
```

Qualifying mastery reflection:

```text
length >= 12
```

---

# 140. Quest Validation

Before progression:

```text
Gate exists
Quest exists
Gate is unlocked
Quest is not already completed
```

The progression engine owns the authoritative validation.

---

# 141. Settings Validation

Settings updates should validate against supported configuration.

Known supported difficulty values:

```text
gentle
standard
austere
```

Known mastery threshold default:

```text
0.7
```

The application should not allow arbitrary unsupported configuration values into progression logic.

---

# 142. Data Integrity Rule

Every persisted relationship must be internally meaningful.

Examples:

```text
Gate progress gateId
```

must refer to a canonical Gate ID.

```text
Quest completion questId
```

must correspond to the relevant Gate quest.

```text
Achievement earned id
```

should be interpretable by the achievement system.

Unknown references must be handled deliberately rather than silently causing runtime failures.

---

# 143. Missing Static Content Rule

If persisted state references a Gate that is not present in the current catalog:

```text
do not crash the entire application
```

The application should surface a controlled data error or compatibility state.

A future migration system may resolve this explicitly.

---

# 144. Unknown Achievement Rule

Because the current repository has some achievement-ID inconsistencies, an unknown achievement ID should not cause the entire player save to become unusable.

The system should treat this as a data-integrity/compatibility issue.

Do not silently invent a new achievement definition at runtime.

---

# 145. Data Boundary Diagram

```text
             USER INPUT
                 │
                 ▼
        APPLICATION VALIDATION
                 │
                 ▼
         PROGRESSION ACTION
                 │
                 ▼
        PROGRESSION ENGINE
                 │
                 ▼
          DOMAIN STATE
                 │
          ┌──────┴──────┐
          ▼             ▼
      APPLICATION     STORAGE
          │             │
          ▼             ▼
          UI          SAVE DATA
```

---

# 146. Data Flow During Quest Completion

```text
QUEST DEFINITION
       │
       │
       ▼
PLAYER ACTION
       │
       ▼
ACTION INPUT
       │
       ▼
completeQuest()
       │
       ├── resolve Gate
       ├── resolve quest
       ├── validate
       ├── sanitize reflection
       ├── determine duration
       ├── record completion
       ├── calculate XP
       ├── apply resources
       ├── apply attributes
       ├── update counters
       ├── update streak
       ├── calculate mastery
       ├── check Gate completion
       ├── unlock next Gate
       ├── evaluate achievements
       ├── evaluate titles
       └── append event
       │
       ▼
NEW STATE + RESULT
       │
       ├──────────────► STORE
       │
       ├──────────────► PERSISTENCE
       │
       └──────────────► UI FEEDBACK
```

---

# 147. Data Flow During Awakening

```text
AWAKENING FORM
      │
      ▼
VALIDATED INPUT
      │
      ▼
createInitialState()
      │
      ├── Player
      ├── Settings
      ├── Progress
      └── Beast 01 Gate record
      │
      ▼
STATE VERSION 1
      │
      ▼
STORE
      │
      ▼
PERSISTENCE
      │
      ▼
DASHBOARD
```

---

# 148. Data Flow During Gate Entry

```text
Gate ID
  ↓
Catalog lookup
  ↓
Gate exists?
  ↓
Unlocked?
  ↓
enterGate()
  ↓
Gate started if necessary
  ↓
Current position updated
  ↓
GATE_ENTERED event
  ↓
New state
```

---

# 149. Data Flow During Reflection

```text
Reflection Input
      ↓
Validation
      ↓
Sanitization
      ↓
upsertReflection()
      ↓
Progress State
      ↓
Persistence
      ↓
Journal UI
```

The reflection does not directly change mastery merely because it was saved.

Mastery is evaluated by the progression system using its qualification rules.

---

# 150. Data Flow During Daily Plan

```text
Current Date
     ↓
Gate Progress
     ↓
Daily Plan Generator
     ↓
Morning
Afternoon
Evening
     ↓
Plan
     ↓
saveDailyPlan()
     ↓
Progress.dailyPlans[dateKey]
```

---

# 151. Application Selector Rules

Selectors should read data.

They should not mutate data.

Examples of useful selectors:

```text
currentPlayer
currentGate
currentArcana
currentGateProgress
currentLevel
currentXP
currentStreak
completedGates
availableGates
currentGateQuests
currentGateMastery
earnedAchievements
earnedTitles
recentEvents
todayPlan
```

Selectors may derive view-friendly information.

They must not become a hidden progression engine.

---

# 152. Selector vs Service

Use a selector when the question is:

```text
"What should the UI display?"
```

Use a progression service when the question is:

```text
"What should happen to the game state?"
```

Example:

```text
getCurrentGate()
```

is a read.

```text
completeQuest()
```

is a state transition.

---

# 153. Read vs Write Boundary

```text
READ
 ↓
selector/catalog
 ↓
UI

WRITE
 ↓
application action
 ↓
progression service
 ↓
new state
```

The UI should not write directly into the domain object.

---

# 154. Static Data Read Boundary

Static Gate content should be read through catalog/data APIs.

Do not make UI components import every individual Gate file.

Correct:

```text
GatePage
 ↓
getGateById()
```

Incorrect:

```text
GatePage
 ↓
import Beast01
import Beast02
...
```

---

# 155. Persistence Read Boundary

UI components should not directly call:

```text
localStorage.getItem(...)
```

The storage service owns persistence.

Correct:

```text
Store
 ↓
Storage Adapter
 ↓
localStorage
```

---

# 156. Persistence Write Boundary

Similarly:

```text
UI
 ↓
Store Action
 ↓
State Update
 ↓
Storage Adapter
```

not:

```text
UI
 ↓
localStorage.setItem(...)
```

---

# 157. Data Security Boundary

Player data should be treated as private local data.

The current application is local-first.

The data model assumes:

```text
local persistence
```

rather than a server database.

Future synchronization must preserve the same semantic boundaries.

---

# 158. AI Data Boundary

If AI is introduced later:

```text
Player State
      ↓
controlled context
      ↓
AI
      ↓
advisory output
```

AI must not become:

```text
AI
 ↓
authoritative player state
```

AI can interpret data.

The progression engine determines progression.

---

# 159. Serialization Rule

The persisted state must be serializable.

Avoid placing:

```text
functions
React elements
class instances
DOM nodes
Promises
browser objects
```

inside the persisted domain state.

State should contain data.

---

# 160. Static Catalog Serialization Rule

Static Gate definitions are code/data bundled with the application.

They do not need to be serialized into the player save.

This keeps saves smaller and prevents content duplication.

---

# 161. No UI Objects in State

Never store:

```text
<Component />
```

or:

```text
ReactNode
```

inside player state.

Use IDs/data instead.

Correct:

```text
icon: "focus"
```

rather than:

```text
icon: <FocusIcon />
```

---

# 162. No Functions in Save Data

Persist:

```text
questId
```

not:

```text
onComplete: function
```

Persist:

```text
difficulty: "standard"
```

not:

```text
difficultyMultiplier: () => 1
```

Rules remain in code/services.

---

# 163. No Derived UI Decorations in Save

Do not persist purely visual state such as:

```text
glowIntensity
animationProgress
cardColor
selectedTab
```

unless a future product requirement explicitly makes it meaningful.

---

# 164. Data Naming Principle

Names should communicate domain meaning.

Prefer:

```text
completedAt
masteryThreshold
lastActiveDate
practiceMinutes
currentPosition
```

over vague fields such as:

```text
value1
state2
progressData
misc
```

---

# 165. ID Principle

Stable identifiers should be used for:

```text
Player
Arcana
Gate
Quest
Achievement
Title
Reflection
Event
```

IDs connect data across the application.

Names/titles are display content and may change independently from identity.

---

# 166. Content vs State Principle

A useful rule:

> **If every player sees the same value, it is probably content.**

Examples:

```text
Gate lore
Quest objective
Boss description
Arcana promise
Achievement description
```

And:

> **If the value differs because of player behavior, it is probably state.**

Examples:

```text
quest completed
Gate unlocked
reflection text
XP
streak
achievement earned
```

---

# 167. Configuration vs State Principle

Another useful distinction:

```text
CONFIGURATION
=
how the system should behave for this player
```

Examples:

```text
difficulty
daily duration
mastery threshold
sound
reminders
```

while:

```text
STATE
=
what has happened
```

Examples:

```text
completed quests
XP
level
streak
events
reflections
```

---

# 168. Domain State vs Static Data

The domain should not copy the entire catalog into every player state.

Use IDs and progress records.

Example:

```text
Gate catalog:
beast-01 → full Gate definition

Player:
beast-01 → progress record
```

---

# 169. Data Model Invariants

The following must remain true.

## Invariant 1

```text
schemaVersion is known before state activation.
```

## Invariant 2

```text
player.id exists.
```

## Invariant 3

```text
player.name is valid.
```

## Invariant 4

```text
current position references a valid progression position.
```

## Invariant 5

```text
Gate progress IDs refer to canonical Gate IDs.
```

## Invariant 6

```text
Quest completion belongs to a valid Gate/quest relationship.
```

## Invariant 7

```text
Attributes never exceed their current cap of 100.
```

## Invariant 8

```text
Event history retains at most 400 events.
```

## Invariant 9

```text
Attribute history retains at most 120 snapshots.
```

## Invariant 10

```text
Reflection text is treated as plain text.
```

## Invariant 11

```text
Static content is not owned by React components.
```

## Invariant 12

```text
UI state is not accidentally persisted as game state.
```

## Invariant 13

```text
Persistence does not define progression rules.
```

## Invariant 14

```text
AI does not become authoritative game state.
```

---

# 170. Known Current Repository Limitations

This document intentionally records existing limitations rather than pretending they are already solved.

## 170.1 Partial validation

`validateLoadedState()` currently checks:

```text
schema version
player id
player name
progress
settings
```

and inserts an empty attribute object when attributes are missing.

It does not exhaustively validate every nested field.

## 170.2 No migration system

Schema migration is not comprehensively implemented.

## 170.3 Achievement ID inconsistencies

Achievement data and Gate achievement IDs are not currently a strict one-to-one registry.

## 170.4 Date handling risk

Local date calculations and fixed-day differences should receive dedicated tests.

## 170.5 Caller-provided date key

The quest engine accepts a completion `dateKey` from the caller.

The application layer must control this input carefully.

These are known risks, not reasons to redesign the existing domain before integration.

---

# 171. Data Model Change Protocol

When adding a new field, ask:

1. Is it static content or player state?
2. Who owns it?
3. Does it need persistence?
4. Is it derived or authoritative?
5. What service changes it?
6. What UI displays it?
7. Does it require validation?
8. Does it affect schema version?
9. Does it require migration?
10. What tests prove its behavior?

---

# 172. Adding a New Player Field

Before adding:

```text
player.someNewField
```

document:

```text
meaning
type
default
owner
persistence behavior
validation
migration impact
```

Do not add arbitrary convenience fields merely to simplify one component.

---

# 173. Adding a New Progress Field

Before adding a progress field, determine whether the information can already be derived.

Prefer:

```text
derive from existing state
```

when safe.

Only persist a new value when it represents meaningful state/history or provides a clear justified benefit.

---

# 174. Adding a New Gate Field

If every Gate needs a new static property:

```text
Gate data
 ↓
Gate factory/config
 ↓
catalog
 ↓
Gate UI
```

The player save normally does not need to copy that property.

---

# 175. Adding a New Quest Field

Quest-specific content belongs in static quest/Gate data.

If it affects progression:

```text
Quest data
 ↓
Progression engine
```

not:

```text
Quest data
 ↓
React component formula
```

---

# 176. Adding a New Achievement

A new achievement requires:

```text
Achievement definition
+
condition evaluator
+
player earned-state handling
+
tests
+
UI display if needed
```

Do not create an achievement only in the UI.

---

# 177. Adding a New Title

A new title requires:

```text
Title definition
+
title evaluation condition
+
player state handling
+
tests
```

The title ceremony remains presentation.

---

# 178. Adding a New Resource

A new resource is a product/system decision.

It requires:

```text
meaning
initial value
reward sources
spending behavior, if any
persistence
UI representation
progression rules
tests
```

Do not add a resource simply because a UI card looks empty.

---

# 179. Adding New History

Before adding historical data, determine:

```text
Why must this be stored?
What question will it answer?
How large can it become?
Does it need a retention limit?
Can it be derived from events?
```

Avoid unbounded storage.

---

# 180. Canonical Data Flow

The complete data lifecycle is:

```text
STATIC CONTENT
     │
     ▼
CATALOG
     │
     ▼
PLAYER ACTION
     │
     ▼
APPLICATION ACTION
     │
     ▼
PROGRESSION ENGINE
     │
     ▼
NEW DOMAIN STATE
     │
     ├──────────► RESULT
     │
     ├──────────► STORE
     │
     └──────────► PERSISTENCE
                         │
                         ▼
                       SAVE
```

---

# 181. Data Model and UI Relationship

```text
             DOMAIN STATE
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
    SELECTORS           CATALOG
        │                   │
        └─────────┬─────────┘
                  ▼
                 UI
```

The UI is a consumer.

It is not the owner.

---

# 182. Data Model and Progression Relationship

```text
DOMAIN STATE
     │
     ▼
PROGRESSION ENGINE
     │
     ├── reads state
     ├── reads static data
     ├── validates action
     ├── calculates progression
     └── returns new state
```

---

# 183. Data Model and Persistence Relationship

```text
DOMAIN STATE
     │
     ▼
SERIALIZE
     │
     ▼
STORAGE ADAPTER
     │
     ▼
localStorage
```

Loading reverses the flow:

```text
localStorage
     ↓
parse
     ↓
validate
     ↓
domain state
```

---

# 184. Canonical Root Diagram

```text
┌─────────────────────────────────────────────┐
│                  ROOT STATE                 │
├─────────────────────────────────────────────┤
│ schemaVersion                               │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ PLAYER                                  │ │
│ │                                         │ │
│ │ identity                                │ │
│ │ current position                        │ │
│ │ XP / level                              │ │
│ │ resources                               │ │
│ │ attributes                              │ │
│ │ achievements                            │ │
│ │ title                                   │ │
│ │ profile/preferences                     │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ SETTINGS                                │ │
│ │                                         │ │
│ │ difficulty                             │ │
│ │ daily duration                         │ │
│ │ available days                         │ │
│ │ reminders                              │ │
│ │ mastery threshold                      │ │
│ │ sound                                  │ │
│ │ awakening / ceremony                   │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ PROGRESS                                │ │
│ │                                         │ │
│ │ Gate progress                           │ │
│ │ Quest counters                          │ │
│ │ Practice / focus totals                │ │
│ │ Reflections                            │ │
│ │ Daily plans                            │ │
│ │ Streak                                 │ │
│ │ Event history                           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

---

# 185. Canonical Static Catalog Diagram

```text
┌──────────────────────────────┐
│          STATIC DATA         │
├──────────────────────────────┤
│                              │
│ Arcanas                      │
│   ├── Beast                  │
│   ├── Human                  │
│   └── Sage                   │
│                              │
│ Gates × 27                   │
│                              │
│ Seven-day definitions        │
│                              │
│ Boss definitions             │
│                              │
│ Achievements                 │
│                              │
│ Titles                       │
│                              │
└───────────────┬──────────────┘
                │
                ▼
             CATALOG
                │
                ▼
               UI
```

---

# 186. Canonical Player Data Diagram

```text
PLAYER
   │
   ├── IDENTITY
   │
   ├── POSITION
   │
   ├── LEVEL
   │
   ├── XP
   │
   ├── RESOURCES
   │
   ├── ATTRIBUTES
   │
   ├── TITLE
   │
   ├── ACHIEVEMENTS
   │
   └── PROFILE DATA
```

---

# 187. Canonical Progress Data Diagram

```text
PROGRESS
   │
   ├── GATES
   │    └── Gate Progress
   │
   ├── QUEST COUNTERS
   │
   ├── PRACTICE MINUTES
   │
   ├── LONGEST FOCUS
   │
   ├── REFLECTIONS
   │
   ├── DAILY PLANS
   │
   ├── STREAK
   │
   ├── ATTRIBUTE HISTORY
   │
   └── EVENT HISTORY
```

---

# 188. Canonical Gate Data Diagram

```text
GATE
│
├── STATIC
│   ├── identity
│   ├── Arcana
│   ├── name
│   ├── archetype
│   ├── lore
│   ├── principle
│   ├── attributes
│   ├── difficulty
│   ├── duration
│   ├── outcome
│   ├── title
│   ├── achievement
│   ├── days[7]
│   └── boss
│
└── PLAYER
    ├── unlocked
    ├── startedAt
    ├── days completed
    ├── bossCompletedAt
    ├── completedAt
    └── MP
```

---

# 189. Canonical Quest Data Diagram

```text
QUEST
│
├── STATIC DEFINITION
│   ├── id
│   ├── type
│   ├── phase
│   ├── objective
│   ├── explanation
│   ├── task
│   ├── duration
│   ├── XP
│   ├── rewards
│   ├── attributes
│   └── prompt
│
└── PLAYER COMPLETION
    ├── date
    ├── timestamp
    ├── reflection
    ├── minutes
    └── completion state
```

---

# 190. Canonical Mastery Data Diagram

```text
GATE PROGRESS
     │
     ├── completed days ───────► Practice
     │
     ├── completion dates ─────► Consistency
     │
     ├── reflections ──────────► Reflection
     │
     └── boss completion ──────► Boss
                                │
                                ▼
                         WEIGHTED MASTERY
                                │
                                ▼
                          GATE COMPLETION
```

---

# 191. Canonical History Diagram

```text
PLAYER ACTION
     │
     ▼
PROGRESSION ENGINE
     │
     ├──────────────► EVENT HISTORY
     │
     ├──────────────► ATTRIBUTE HISTORY
     │
     ├──────────────► QUEST/GATE PROGRESS
     │
     └──────────────► PLAYER RESOURCES
```

---

# 192. Canonical Persistence Diagram

```text
                    ┌──────────────┐
                    │ DOMAIN STATE │
                    └──────┬───────┘
                           │
                    serialize
                           │
                           ▼
                  ┌─────────────────┐
                  │ STORAGE ADAPTER │
                  └────────┬────────┘
                           │
                           ▼
                      localStorage
                           │
                           │ load
                           ▼
                     parse / validate
                           │
                           ▼
                    DOMAIN STATE
```

---

# 193. Data Model Testing

The data model should eventually have tests for:

## Player

- valid creation
- normalized name
- initial position
- initial title
- initial level
- initial resources
- initial attributes

## Settings

- defaults
- supported difficulty
- mastery threshold
- duration
- available days

## Progress

- initial empty state
- Gate record creation
- quest counters
- streak state
- event retention

## Gate Progress

- unlock state
- day completion
- Boss completion
- Gate completion

## Persistence

- schema version
- valid load
- invalid load
- unsupported schema
- malformed data

---

# 194. Data Model and Testing Boundary

Tests should test the owner of the behavior.

Examples:

```text
XP formula
→ XP service

Mastery formula
→ Mastery service

Gate unlock
→ Unlock service

Player shape
→ Domain model

Catalog lookup
→ Catalog tests

Persistence validation
→ Storage tests

React rendering
→ Component tests
```

Do not test the same business rule independently in multiple places unless the second test is intentionally an integration test.

---

# 195. Data Model and Implementation Order

The data model should be implemented in this order:

```text
1. Preserve existing domain models.
2. Preserve existing static catalog.
3. Create application-state adapter.
4. Add validated loading.
5. Add initial-state initialization.
6. Add persistence on successful state changes.
7. Expose selectors.
8. Connect UI.
```

Do not rebuild the domain before integration.

---

# 196. What Should Not Be Added Yet

Do not add these to the data model merely because they may be useful later:

```text
serverUserId
cloudSyncState
socialRank
friendList
leaderboardPosition
AIConfidence
AITrustScore
generatedLore
battleStats
inventory
weapons
currency systems
```

None of these are required by the current product model.

---

# 197. No Fantasy Inventory Rule

MYTHIC LEVELS uses mythic language, but the current product is not a fantasy combat inventory system.

Do not add:

```text
weapons
armor
gold
loot
combat HP
enemy HP
```

unless the product specification is intentionally changed.

The mythology represents personal development.

---

# 198. No Social Database Rule

The current product is centered on individual development.

Do not add:

```text
followers
friends
leaderboards
social ranking
competitive score
```

to the canonical player state unless the product scope explicitly changes.

---

# 199. No AI Authority Field

Do not add fields such as:

```text
aiApproved
aiMastery
aiLevel
aiVerdict
```

as authoritative progression state.

AI is advisory.

The deterministic progression engine is authoritative.

---

# 200. No Duplicate Progress Model

There must be one authoritative domain progression state.

Avoid creating:

```text
React gameState
+
Zustand gameState
+
domain gameState
```

where all three can disagree.

Preferred:

```text
DOMAIN STATE
     ↑
ZUSTAND ADAPTER
     ↑
REACT UI
```

Zustand may hold the current domain state reference/value, but it does not define a competing model.

---

# 201. Store Hydration Model

At application startup:

```text
Storage
  ↓
load
  ↓
validate
  ↓
valid?
 ┌───────┴────────┐
 NO               YES
 │                 │
 ▼                 ▼
Awakening       Hydrate store
 │                 │
 ▼                 ▼
Create state      Render app
```

---

# 202. First-Time Player

First-time state:

```text
No persisted state
```

should lead to:

```text
Awakening
```

After valid Awakening:

```text
createInitialState()
```

creates the canonical starting state.

---

# 203. Returning Player

Returning player:

```text
Persisted state exists
      ↓
Validate
      ↓
Hydrate
      ↓
Resume current position
```

The app must not restart Awakening simply because the browser was refreshed.

---

# 204. Storage Error State

Storage failures are application state, not game progression.

Conceptually:

```text
storageError
```

belongs to the application/UI layer.

Do not write:

```text
player.storageError = true
```

into the game save unless there is a product reason.

---

# 205. Loading State

Similarly:

```text
isLoading
```

is UI/application state.

It should not become part of the persisted game state.

---

# 206. Error State

Transient errors such as:

```text
failed to save
failed to load
invalid import
```

should be represented by application/UI state.

Historical progression errors may be recorded as events only when the progression system intentionally defines them as events.

---

# 207. Ceremony State

Animation/ceremony state is UI state.

For example:

```text
showLevelUpCeremony
showGateUnlockCeremony
showAchievementCeremony
```

should not be persisted as player progression facts.

The underlying achievement/level/unlock state is persisted.

---

# 208. Data Model and Navigation

Routes identify views.

Example:

```text
/gate/beast-01
```

The route parameter:

```text
beast-01
```

is an identifier.

It is not the source of truth for whether the Gate is unlocked.

The application resolves the Gate and checks player progress.

---

# 209. Gate Route Data Flow

```text
URL
 ↓
gateId
 ↓
catalog.getGateById(gateId)
 ↓
Gate definition
 ↓
player progress lookup
 ↓
Gate view
```

If the Gate is locked:

```text
locked view
```

not:

```text
unlock automatically
```

---

# 210. Journal Data Flow

Journal reads:

```text
progress.reflections
```

and associated context.

It should not create a separate reflection database.

---

# 211. Analytics Data Flow

Analytics should derive from:

```text
player state
progress
attribute history
events
Gate progress
```

It should not maintain a second authoritative analytics history.

---

# 212. Dashboard Data Flow

Dashboard can read:

```text
player level
XP
resources
streak
current Arcana
current Gate
Gate mastery
daily plan
recent events
```

All are derived from existing state/services.

---

# 213. Profile Data Flow

Profile can read:

```text
player identity
title
avatar
goal
routine
achievements
titles
journey statistics
```

Profile editing should update the appropriate domain state through application actions.

---

# 214. Arcana Map Data Flow

Arcana Map combines:

```text
static Arcana/Gate catalog
+
player Gate progress
```

It should not create a separate map-state model.

---

# 215. Gate Detail Data Flow

Gate Detail combines:

```text
Gate Definition
+
Gate Progress
+
Derived Mastery
+
Current Position
```

The page should remain reusable for all 27 Gates.

---

# 216. Quest Card Data Flow

Quest card combines:

```text
Quest Definition
+
Quest Completion State
+
Application Action
```

The card should not own reward calculations.

---

# 217. Boss Card Data Flow

Boss card combines:

```text
Boss Definition
+
Boss Completion State
+
Mastery State
+
Application Action
```

It should display the completion requirement rather than invent it.

---

# 218. Data Model for the 27-Gate World

```text
3 Arcanas
   ×
9 Gates each
   =
27 static Gate definitions
```

Player state references those Gates through progress records.

---

# 219. Data Model for Seven-Day Gates

Each Gate contains:

```text
7 daily definitions
+
1 Boss Trial
```

Player state records:

```text
which daily entries were completed
+
when
+
with what reflection
+
with what duration
+
Boss completion
```

---

# 220. Data Model for Gate Completion

Gate completion depends on:

```text
Gate Progress
    +
Mastery calculation
    +
Boss state
    +
Settings threshold
```

The completion result becomes:

```text
completedAt
```

plus associated progression effects.

---

# 221. Data Model for Arcana Completion

There is no separate required `ArcanaCompleted` object in the current model.

Arcana completion can be inferred from:

```text
all nine Gate progress records completed
```

and the progression result may report an Arcana ascension.

Do not create redundant authoritative state unless needed.

---

# 222. Data Model for Current Journey

A player's journey can be reconstructed from:

```text
player
+
settings
+
progress
+
static catalog
```

This is the canonical reconstruction model.

---

# 223. Rehydration Principle

After reloading the application:

```text
same persisted state
+
same static catalog
=
same meaningful player journey
```

UI animation state does not need to survive reload.

---

# 224. Deterministic Reconstruction

Given:

```text
same player state
same rules
same catalog
```

the application should produce the same progression interpretation.

This is important for trust.

---

# 225. No Hidden State Rule

Do not make important progression facts exist only inside:

```text
React component state
```

If something is part of the player's actual journey, it must belong to the domain/progression state.

---

# 226. No Local Component Progress

Avoid:

```text
const [completed, setCompleted] = useState(false);
```

for authoritative quest completion.

Instead:

```text
domain state
```

determines completion.

A component can use local temporary state for:

```text
form input
confirmation dialog
animation
```

but not authoritative progression.

---

# 227. Form Draft Rule

Reflection text while typing can be UI state:

```text
draftReflection
```

After save:

```text
progress.reflections
```

becomes authoritative.

This separates:

```text
what the user is typing
```

from:

```text
what the player has saved
```

---

# 228. Confirmation Rule

A confirmation modal may temporarily store:

```text
pendingAction
```

but the final action still goes through the application/progression layer.

---

# 229. Data Model and Accessibility

Accessibility metadata is UI state/content.

Do not store arbitrary DOM accessibility state in player progression.

For example:

```text
aria-expanded
```

belongs to UI.

The product meaning:

```text
Gate unlocked
```

belongs to domain state.

---

# 230. Data Model and Animation

Animation state is transient.

Progression result is authoritative.

Correct:

```text
completeQuest()
 ↓
result
 ↓
show +XP animation
```

not:

```text
animation finished
 ↓
award XP
```

---

# 231. Data Model and Offline-First Behavior

The current product is local-first.

Therefore the core player state should remain usable without a remote backend.

The data model should not require:

```text
network request
```

to understand current progression.

---

# 232. Future Cloud Sync Boundary

If cloud synchronization is added later, it should sit outside the core domain model.

Conceptually:

```text
Domain State
    ↓
Sync Adapter
    ↓
Cloud
```

not:

```text
Domain rules
    ↓
Cloud
    ↓
determines progression
```

---

# 233. Future Multi-Device Boundary

If multiple devices are introduced, conflict resolution must be explicitly designed.

Do not simply:

```text
last write wins
```

for progression without a product rule.

This is outside current V1 scope.

---

# 234. Data Versioning Principle

A saved journey is valuable historical data.

Schema changes should be conservative.

Prefer:

```text
migration
```

over:

```text
discard save
```

when practical.

---

# 235. Data Model Definition of Done

The data model is considered implementation-ready when:

- root state is understood
- Player state is understood
- Settings are understood
- Progress is understood
- Gate progress is understood
- static Gate data is understood
- quest data is understood
- Boss data is understood
- mastery inputs are understood
- streak state is understood
- achievement state is understood
- title state is understood
- reflection state is understood
- daily-plan state is understood
- event history is understood
- attribute history is understood
- persistence boundary is understood
- UI state is separated
- validation boundary is understood
- known limitations are documented

---

# 236. Data Model Checklist Before Coding

Before creating the Zustand store:

```text
[ ] Root state identified
[ ] Player fields identified
[ ] Settings identified
[ ] Progress identified
[ ] Gate progress identified
[ ] Static catalog identified
[ ] Quest data identified
[ ] Reflection data identified
[ ] Streak data identified
[ ] Event data identified
[ ] Achievement data identified
[ ] Title data identified
[ ] Persistence key identified
[ ] Schema version identified
[ ] Validation behavior identified
[ ] UI state separated
[ ] Existing source preserved
```

---

# 237. Data Model Checklist Before UI

Before building the Dashboard:

```text
[ ] State can initialize
[ ] State can load
[ ] State can save
[ ] Current player can be selected
[ ] Current Gate can be resolved
[ ] Current Gate progress can be resolved
[ ] XP/level can be read
[ ] resources can be read
[ ] streak can be read
[ ] mastery can be calculated
[ ] no UI-owned progression state exists
```

---

# 238. Data Model Checklist Before Quest Completion

Before wiring a quest button:

```text
[ ] Gate ID available
[ ] Quest ID available
[ ] Gate exists
[ ] Quest exists
[ ] Gate progress exists or can be initialized
[ ] Completion input validated
[ ] reflection sanitized
[ ] completion routed to engine
[ ] result handled
[ ] state persisted
[ ] UI feedback uses result
```

---

# 239. Data Model Checklist Before Persistence

```text
[ ] State serializable
[ ] schemaVersion present
[ ] no React objects
[ ] no functions
[ ] no DOM references
[ ] no transient animation state
[ ] validation on load
[ ] persistence failure handled
```

---

# 240. Canonical Data Rulebook

The following rules summarize the entire model.

```text
RULE 1
Static content belongs in src/data.

RULE 2
Player progression belongs in domain state.

RULE 3
Progression services are the authority for state transitions.

RULE 4
The application store is an adapter, not a second game engine.

RULE 5
UI state is separate from game state.

RULE 6
Gate content is not duplicated into player state unnecessarily.

RULE 7
Quest definitions are static; quest completion is player state.

RULE 8
Mastery is derived by the progression system.

RULE 9
Unlocks are derived/maintained by the progression system.

RULE 10
Historical events are progression data, not UI animation state.

RULE 11
Reflections are private player data and plain text.

RULE 12
Persistence stores state but does not define rules.

RULE 13
Imported data must be validated.

RULE 14
Schema changes require explicit migration planning.

RULE 15
Do not duplicate authoritative state across layers.
```

---

# 241. Canonical State Boundary

The most important boundary is:

```text
┌──────────────────────────────┐
│          REACT UI            │
│                              │
│ temporary UI state           │
│ forms                        │
│ navigation                   │
│ animations                   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│     APPLICATION / STORE      │
│                              │
│ orchestration                │
│ selectors                    │
│ loading/error state           │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      DOMAIN / PROGRESS       │
│                              │
│ authoritative player state   │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│      PROGRESSION ENGINE      │
│                              │
│ authoritative transitions    │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│          STORAGE             │
│                              │
│ persistence only             │
└──────────────────────────────┘
```

---

# 242. Canonical Content Boundary

```text
┌──────────────────────────────┐
│       STATIC CONTENT         │
│                              │
│ Arcana                       │
│ Gate                         │
│ Quest                        │
│ Boss                         │
│ Achievement                 │
│ Title                        │
└──────────────┬───────────────┘
               │
               ▼
            CATALOG
               │
               ▼
        PROGRESSION ENGINE
               │
               ▼
        PLAYER STATE
```

---

# 243. Canonical Player Journey Reconstruction

```text
                 STATIC CATALOG
                      │
                      │
                      ▼
PLAYER SAVE ─────► APPLICATION
   │                  │
   │                  ▼
   │              CURRENT UI
   │
   ├── Player
   ├── Settings
   └── Progress
```

The catalog provides meaning.

The save provides personal history.

Together they reconstruct the journey.

---

# 244. Canonical Data Lifecycle

```text
CREATE
  ↓
VALIDATE
  ↓
STORE IN DOMAIN STATE
  ↓
PROGRESS
  ↓
RECORD HISTORY
  ↓
PERSIST
  ↓
LOAD
  ↓
VALIDATE
  ↓
REHYDRATE
  ↓
CONTINUE
```

---

# 245. Final Canonical Model

At the highest level:

```text
MYTHIC LEVELS
│
├── STATIC WORLD
│   ├── Arcanas
│   ├── Gates
│   ├── Quests
│   ├── Boss Trials
│   ├── Achievements
│   └── Titles
│
└── PLAYER JOURNEY
    ├── Player
    ├── Settings
    └── Progress
        ├── Gate Progress
        ├── Quest History
        ├── Practice
        ├── Reflections
        ├── Streak
        ├── Daily Plans
        ├── Events
        └── Attribute History
```

---

# 246. Final Engineering Principle

> **Static data describes what MYTHIC LEVELS is.**
>
> **Player state describes what the player has done.**
>
> **Progression services determine what happens next.**
>
> **Application state connects the domain to React.**
>
> **Persistence remembers the journey.**
>
> **The UI displays the result.**

Therefore:

```text
CONTENT
  ↓
CATALOG
  ↓
PLAYER ACTION
  ↓
PROGRESSION ENGINE
  ↓
DOMAIN STATE
  ↓
PERSISTENCE
  ↓
APPLICATION STATE
  ↓
UI
```

The canonical data principle is:

```text
ONE JOURNEY
ONE AUTHORITATIVE STATE
ONE PROGRESSION AUTHORITY
ONE STATIC CONTENT CATALOG
```

Do not create competing sources of truth.

---

# 247. Final Implementation Rule

When implementing MYTHIC LEVELS, ask:

```text
"What data am I changing?"
```

Then:

```text
"Who owns that data?"
```

Then:

```text
"Is it static, state, derived, or UI-only?"
```

Then:

```text
"Which existing service already handles it?"
```

Then:

```text
"Do I need to persist it?"
```

Then:

```text
"How will it be validated?"
```

Only after answering these questions should code be written.

---

# 248. Final Relationship Between Canonical Documents

```text
WORLD_DESIGN.md
"What does the journey mean?"
            ↓
PRODUCT_SPEC.md
"What should the product do?"
            ↓
ARCHITECTURE.md
"Where does each responsibility live?"
            ↓
PROGRESSION.md
"How does the player progress?"
            ↓
RULES.md
"What exact rules govern progression?"
            ↓
DATA_MODEL.md
"What data represents those rules?"
            ↓
STATE_MACHINE.md
"How does state transition?"
            ↓
IMPLEMENTATION_PLAN.md
"How do we build it?"
            ↓
CODE
```

This document therefore completes the next major layer of the MYTHIC LEVELS specification.

**End of canonical `DATA_MODEL.md`.**
