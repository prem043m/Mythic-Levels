# MYTHIC LEVELS --- EVENT SYSTEM

**Version:** 1.0\
**Status:** Canonical Event Definition\
**Project:** MYTHIC LEVELS\
**Document:** `EVENT_SYSTEM.md`\
**Purpose:** Define the events and application actions that connect
player interaction to state transitions without turning events into a
second progression engine.

------------------------------------------------------------------------

# 1. Purpose

This document defines the event model for MYTHIC LEVELS.

The existing project already contains a substantial progression engine
and event history system. The purpose of this document is to describe
how meaningful actions move through the application and how those
actions may be represented as events.

The Event System answers:

> **What happened?**

The State Machine answers:

> **What state may change because of it?**

The Progression Engine answers:

> **What should actually happen according to the game rules?**

The UI answers:

> **How should the result be presented?**

These responsibilities must remain separate.

------------------------------------------------------------------------

# 2. Core Principle

MYTHIC LEVELS follows this architecture:

``` text
PLAYER ACTION
      ↓
APPLICATION ACTION
      ↓
DOMAIN / PROGRESSION OPERATION
      ↓
STATE TRANSITION
      ↓
EVENT RECORDED
      ↓
PERSISTENCE
      ↓
UI FEEDBACK
```

An event describes a meaningful occurrence.

It does not replace the progression engine.

------------------------------------------------------------------------

# 3. Event System Is Not a Second Engine

A critical rule:

> **The event system records what happened. It does not decide what
> should happen.**

Bad architecture:

``` text
QUEST_COMPLETED event
        ↓
event handler calculates XP
        ↓
event handler calculates mastery
        ↓
event handler unlocks Gate
```

This would create a second progression engine.

Preferred architecture:

``` text
completeQuest(...)
        ↓
Progression Engine
        ↓
new state + result
        ↓
record completion event
        ↓
persist state
```

The progression engine remains authoritative.

------------------------------------------------------------------------

# 4. Relationship With Canonical Documents

The Event System sits after the State Machine conceptually.

``` text
WORLD_DESIGN.md
       ↓
PRODUCT_SPEC.md
       ↓
ARCHITECTURE.md
       ↓
RULES.md
       ↓
PROGRESSION.md
       ↓
DATA_MODEL.md
       ↓
STATE_MACHINE.md
       ↓
EVENT_SYSTEM.md
       ↓
IMPLEMENTATION_PLAN.md
```

Each document has a different responsibility.

  Document                   Responsibility
  -------------------------- ---------------------------------------------
  `WORLD_DESIGN.md`          Meaning and mythic world
  `PRODUCT_SPEC.md`          Product behavior
  `ARCHITECTURE.md`          Software boundaries
  `RULES.md`                 Non-negotiable rules
  `PROGRESSION.md`           Progression rules
  `DATA_MODEL.md`            State/data representation
  `STATE_MACHINE.md`         Legal state transitions
  `EVENT_SYSTEM.md`          Meaningful actions and recorded occurrences
  `IMPLEMENTATION_PLAN.md`   Build order
  `UI_DESIGN.md`             Presentation

------------------------------------------------------------------------

# 5. Event Vocabulary

## 5.1 Event

An event is a record that something meaningful happened.

Examples:

``` text
GATE_ENTERED
PLAN_SAVED
QUEST_COMPLETED
```

Only event types confirmed by the current implementation should be
treated as existing canonical runtime names.

The repository currently confirms `GATE_ENTERED` and `PLAN_SAVED`.

The quest completion operation also appends a completion event, but the
exact runtime event identifier should be taken from the implementation
rather than invented in the UI layer.

------------------------------------------------------------------------

# 6. Action vs Event

Actions and events are related but not identical.

## Action

An action is a request to do something.

Examples:

``` text
completeQuest(...)
enterGate(...)
saveDailyPlan(...)
```

## Event

An event records that something happened.

Examples:

``` text
QUEST_COMPLETED
GATE_ENTERED
PLAN_SAVED
```

Conceptually:

``` text
ACTION
  ↓
VALIDATION
  ↓
DOMAIN OPERATION
  ↓
STATE CHANGE
  ↓
EVENT
```

An attempted action does not automatically become a successful event.

------------------------------------------------------------------------

# 7. Command vs Event

A useful distinction:

``` text
COMMAND
"What do I want the system to do?"
```

versus:

``` text
EVENT
"What actually happened?"
```

Examples:

``` text
completeQuest
```

is an action/command.

After successful processing, the system may record:

``` text
quest completion event
```

This distinction prevents the UI from claiming that an operation
succeeded before the domain accepts it.

------------------------------------------------------------------------

# 8. Event Ownership

The event lifecycle belongs to the application/domain boundary.

``` text
React
  │
  │ request
  ▼
Application Action
  │
  ▼
Progression Engine
  │
  ├── state transition
  └── event creation
        │
        ▼
Application State
        │
        ▼
Persistence
```

React should not manually append progression events.

Bad:

``` text
onClick:
  state.events.push(...)
```

Good:

``` text
onClick:
  completeQuest(...)
```

and the existing engine records the appropriate event.

------------------------------------------------------------------------

# 9. Current Repository Evidence

The current project information confirms:

-   `Progress` stores up to 400 recent events.
-   `enterGate` records a `GATE_ENTERED` event.
-   `saveDailyPlan` records a `PLAN_SAVED` event.
-   `completeQuest` appends a completion event.
-   Events are retained at a maximum of 400 records.
-   Event history is part of persisted progress.
-   The progression engine is the source of truth.
-   The caller receives an immutable new state and result from
    progression operations.

Therefore the event system should integrate with the existing
implementation rather than replace it.

------------------------------------------------------------------------

# 10. Current Confirmed Event Types

The following event identifiers are explicitly confirmed by the current
repository documentation.

## `GATE_ENTERED`

Recorded when `enterGate` successfully processes Gate entry.

## `PLAN_SAVED`

Recorded when `saveDailyPlan` successfully saves a daily plan.

## Quest completion event

The quest completion operation appends a completion event.

The exact event identifier should be read from the implementation before
code depends on its string value.

This document intentionally does not invent a runtime identifier for it.

------------------------------------------------------------------------

# 11. Proposed Conceptual Event Taxonomy

For product and architectural discussion, the following categories are
useful:

``` text
PLAYER
PROGRESSION
QUEST
GATE
BOSS
MASTERY
REWARD
STREAK
ACHIEVEMENT
TITLE
REFLECTION
PLAN
PERSISTENCE
SYSTEM
```

These categories are conceptual.

They do not automatically mean that every category must become a new
runtime event type.

------------------------------------------------------------------------

# 12. Event Categories

## Player Events

Events related to player initialization or identity.

Examples conceptually:

``` text
AWAKENING_COMPLETED
SETTINGS_UPDATED
```

## Quest Events

Events related to quest activity.

``` text
QUEST_COMPLETED
```

## Gate Events

``` text
GATE_ENTERED
GATE_COMPLETED
GATE_UNLOCKED
```

## Boss Events

``` text
BOSS_COMPLETED
```

## Mastery Events

``` text
MASTERY_EVALUATED
```

## Reward Events

``` text
REWARD_GRANTED
LEVEL_UP
```

## Streak Events

``` text
STREAK_STARTED
STREAK_CONTINUED
STREAK_INTERRUPTED
STREAK_RETURNED
```

## Achievement Events

``` text
ACHIEVEMENT_UNLOCKED
```

## Title Events

``` text
TITLE_UNLOCKED
```

## Reflection Events

``` text
REFLECTION_SAVED
REFLECTION_UPDATED
REFLECTION_DELETED
```

## Plan Events

``` text
PLAN_SAVED
```

These names are **conceptual candidates unless confirmed by the
implementation**.

Do not make the UI or engine depend on them until their actual
implementation is verified.

------------------------------------------------------------------------

# 13. Canonical Rule for Event Names

Runtime event identifiers should have one source of truth.

Do not allow:

``` text
QUEST_COMPLETED
quest_completed
questComplete
QuestCompleted
```

to represent the same event in different modules.

Before introducing a new runtime event type:

1.  search the repository
2.  inspect existing event constants
3.  inspect event creation code
4.  inspect event consumers
5.  reuse an existing identifier where appropriate
6.  only then introduce a new identifier if required

------------------------------------------------------------------------

# 14. Event Payload Principle

An event should contain enough information to explain what happened.

It should not duplicate the entire game state.

Conceptually:

``` text
EVENT
├── id
├── type
├── timestamp
├── dateKey
├── relevant entity
└── relevant metadata
```

The exact current event shape must remain repository-authoritative.

Do not redesign the persisted event schema merely because this
conceptual model is convenient.

------------------------------------------------------------------------

# 15. Event Identity

Each event should have a stable identity if the current implementation
provides one.

The purpose is to distinguish:

``` text
event A
event B
event C
```

This is useful for:

-   history display
-   debugging
-   export/import
-   deduplication
-   analytics
-   future synchronization

If the current implementation uses a different identity mechanism,
preserve it.

------------------------------------------------------------------------

# 16. Event Timestamp

Events should carry time information when the current model supports it.

There are two useful concepts:

``` text
timestamp
```

and:

``` text
dateKey
```

They are not interchangeable.

## Timestamp

Represents the precise recorded moment.

## Date key

Represents the local calendar day used by progression rules.

The current quest completion flow records completion date and timestamp.

------------------------------------------------------------------------

# 17. Event Date Integrity

Date keys are important because streak and daily completion rules use
local dates.

Do not infer:

``` text
dateKey = UTC date
```

when the progression engine uses local date semantics.

The event system must preserve the date semantics used by the domain.

------------------------------------------------------------------------

# 18. Event Source

An event should conceptually identify what caused it.

Examples:

``` text
source: quest
source: gate
source: plan
source: system
```

However, source fields should only be added if supported by the actual
data model.

The purpose is analytical clarity, not unnecessary schema growth.

------------------------------------------------------------------------

# 19. Event Entity References

Events may refer to entities such as:

``` text
playerId
gateId
questId
reflectionId
planDate
achievementId
titleId
```

Only include identifiers relevant to the actual event.

Avoid storing large copies of catalog objects.

Bad:

``` text
event.gate = entire Gate object
```

Preferred conceptually:

``` text
event.gateId = "beast-01"
```

if the existing schema supports that approach.

------------------------------------------------------------------------

# 20. Events and Static Data

Static Gate data belongs in the catalog.

Events should reference content rather than copy it.

For example:

``` text
Gate catalog
   ↓
beast-01
```

and:

``` text
event
   ↓
gateId = beast-01
```

This keeps event history compact and prevents historical records from
becoming inconsistent with catalog definitions.

If the existing implementation stores another form, preserve it.

------------------------------------------------------------------------

# 21. Quest Completion Event

A successful quest completion is one of the most important progression
events.

Conceptually:

``` text
QUEST ACTION
     ↓
resolve Gate + quest
     ↓
validate
     ↓
record completion
     ↓
apply rewards
     ↓
update progression
     ↓
record completion event
```

The event should represent successful processing, not merely a button
click.

------------------------------------------------------------------------

# 22. Quest Completion Event Meaning

A quest completion event means:

> The progression engine accepted a quest completion and produced a
> resulting state.

It does not mean:

> The user clicked the Complete button.

This distinction is important.

------------------------------------------------------------------------

# 23. Quest Completion Metadata

Conceptually useful metadata includes:

``` text
gateId
questId
dateKey
timestamp
phase
minutes
reflection presence/status
```

The current engine already records completion information including:

-   completion date
-   timestamp
-   reflection
-   phase
-   quest id
-   minutes

The event system should reuse this information rather than inventing a
separate duplicate structure.

------------------------------------------------------------------------

# 24. Quest Completion Consequences

One quest completion can produce multiple consequences:

``` text
QUEST_COMPLETED
       │
       ├── XP
       ├── LEVEL
       ├── RESOURCES
       ├── ATTRIBUTES
       ├── STREAK
       ├── MASTERY SIGNALS
       ├── ACHIEVEMENTS
       ├── TITLES
       ├── GATE COMPLETION
       └── UNLOCK
```

This does not require one event for every consequence.

The current engine performs these updates together.

------------------------------------------------------------------------

# 25. Event vs Derived Consequence

A useful distinction:

``` text
EVENT
"What happened?"
```

versus:

``` text
DERIVED STATE
"What is now true?"
```

For example:

``` text
Quest completion event
```

may result in:

``` text
XP total increased
```

The XP total is state.

The event is history.

Do not confuse them.

------------------------------------------------------------------------

# 26. Gate Entry Event

The current repository explicitly records:

``` text
GATE_ENTERED
```

when `enterGate` successfully processes entry.

Conceptual flow:

``` text
PLAYER
  ↓
ENTER GATE
  ↓
VERIFY GATE EXISTS
  ↓
VERIFY GATE UNLOCKED
  ↓
START IF NECESSARY
  ↓
MOVE CURRENT POSITION
  ↓
GATE_ENTERED
```

This is an important example of the correct event architecture.

------------------------------------------------------------------------

# 27. Gate Entry Is Not Gate Completion

These are separate events/states.

``` text
GATE_ENTERED
```

means the player entered the Gate.

It does not mean:

``` text
GATE_COMPLETED
```

A Gate must still satisfy its progression requirements.

------------------------------------------------------------------------

# 28. Gate Completion Event

Conceptually, Gate completion may produce:

``` text
GATE_COMPLETED
```

but the current runtime event identifier must be verified before
implementation depends on that exact name.

The progression engine is already responsible for marking completed
Gates and unlocking the next Gate.

Therefore a future Gate completion event should be created there if the
product needs one.

It must not be created by the Gate page.

------------------------------------------------------------------------

# 29. Gate Unlock Event

Conceptually:

``` text
GATE_UNLOCKED
```

may be useful for history and UI ceremony.

However, unlocking is already performed by the progression system.

If the current engine reports unlocks through a result without
persisting a separate unlock event, do not introduce duplicate history
automatically.

The result can be used for immediate feedback.

------------------------------------------------------------------------

# 30. Boss Completion Event

Conceptually:

``` text
BOSS_COMPLETED
```

means the Boss Trial was successfully processed.

It must not mean:

``` text
Boss page opened
```

or:

``` text
Boss button clicked
```

Boss completion must pass the domain guard first.

------------------------------------------------------------------------

# 31. Mastery Evaluation Event

Mastery is calculated from:

``` text
Practice       40%
Consistency    20%
Reflection     15%
Boss           25%
```

with the configured threshold normally:

``` text
0.7
```

The calculation is owned by the mastery service.

A future event may record:

``` text
MASTERY_EVALUATED
```

if event history requires it.

But the current engine already calculates mastery as part of
progression. Do not create a separate event pipeline merely to expose
the calculation.

------------------------------------------------------------------------

# 32. Mastery Is Not an Independent User Action

The player does not directly perform:

``` text
calculateMastery()
```

Mastery is a consequence of progression.

Therefore:

``` text
QUEST COMPLETION
      ↓
MASTERY SIGNAL UPDATE
      ↓
MASTERY CALCULATION
```

is more accurate than:

``` text
PLAYER
 ↓
MASTERY ACTION
```

------------------------------------------------------------------------

# 33. Reward Events

Quest completion can award:

-   XP
-   resources
-   attribute rewards
-   SP
-   other existing rewards

The current engine processes rewards during quest completion.

A separate `REWARD_GRANTED` event is therefore optional and should only
be added if the history/analytics requirements justify it.

Do not duplicate reward history unnecessarily.

------------------------------------------------------------------------

# 34. XP Events

XP is authoritative state.

A quest completion can change:

``` text
player.xp
```

and potentially:

``` text
player.level
```

The event history can record the originating quest completion.

It does not necessarily need a separate:

``` text
XP_GAINED
```

event.

The current architecture should remain simple unless analytics requires
finer-grained events.

------------------------------------------------------------------------

# 35. Level-Up Events

A level change can be useful for presentation:

``` text
LEVEL_UP
```

The UI may display:

``` text
LEVEL UP
+new level
```

But the level itself must be calculated by the XP system.

If the current engine returns level information as a result, the
application can use that result for immediate UI feedback.

Do not calculate level in the component.

------------------------------------------------------------------------

# 36. Streak Events

The streak engine currently handles:

-   first activity
-   same-day activity
-   next-day activity
-   gaps
-   return after interruption

The event system should preserve these semantics.

A conceptual event taxonomy could distinguish:

``` text
STREAK_STARTED
STREAK_CONTINUED
STREAK_INTERRUPTED
STREAK_RETURNED
```

However, these are not confirmed runtime event names.

The current engine returns streak information and records the completion
event.

Do not invent persistent event types without need.

------------------------------------------------------------------------

# 37. Streak Return

When a player returns after a gap:

``` text
current streak → 1
missedThenReturned → true
SP → 2
```

according to the current implementation.

The historical journey remains intact.

This is an important example where:

``` text
event
```

and:

``` text
state
```

are different.

The completion event records activity.

The streak state describes the current streak condition.

------------------------------------------------------------------------

# 38. Achievement Events

Achievements are evaluated by the achievement system.

Conceptually:

``` text
PROGRESSION EVENT
       ↓
ACHIEVEMENT EVALUATION
       ↓
NEW ACHIEVEMENT?
   ├── NO
   └── YES
        ↓
ACHIEVEMENT UNLOCKED
```

The UI should receive the result from the progression/application layer.

It should not independently evaluate achievement conditions.

------------------------------------------------------------------------

# 39. Title Events

Titles follow a similar pattern:

``` text
PROGRESSION
    ↓
TITLE CONDITIONS
    ↓
TITLE BECOMES AVAILABLE
```

The current engine evaluates achievements and titles during quest
progression.

A separate persistent title event is optional.

The UI should display title changes based on resulting state/result.

------------------------------------------------------------------------

# 40. Reflection Events

Reflections are player-generated content.

Current operations include:

``` text
upsertReflection()
deleteReflection()
```

The event system should not expose reflection content unnecessarily.

Reflection text is private player data.

If events are used for reflection changes, they should avoid copying
large text values into history unless explicitly required.

------------------------------------------------------------------------

# 41. Reflection Security

Reflection content must remain plain text.

Do not create events that store raw HTML generated from reflections.

Do not render reflection event payloads as HTML.

Use the existing sanitization behavior.

The current sanitizer:

-   accepts strings
-   removes case-insensitive `<script` openings
-   truncates plain text to 8,000 characters
-   provides `escapeHtml`

The UI should continue to treat reflection content as plain text.

------------------------------------------------------------------------

# 42. Daily Plan Event

The current repository explicitly records:

``` text
PLAN_SAVED
```

when a daily plan is saved.

Conceptual flow:

``` text
EDIT PLAN
   ↓
saveDailyPlan
   ↓
STORE PLAN BY DATE
   ↓
PLAN_SAVED
```

This is a confirmed runtime event.

------------------------------------------------------------------------

# 43. Daily Plan Is Not Core Gate Progression

A daily plan can help organize the player's day.

It must not become a second progression mechanism.

The event:

``` text
PLAN_SAVED
```

means:

> A plan was saved.

It does not mean:

> The player completed the plan.

------------------------------------------------------------------------

# 44. Event Retention

The current progress model retains up to:

``` text
400 recent events
```

The quest completion engine appends events and keeps the latest 400.

This is an important persistence constraint.

Do not allow an event-producing UI feature to bypass the retention rule.

------------------------------------------------------------------------

# 45. Event Ordering

Events should be recorded after successful state processing.

Conceptually:

``` text
ACTION
  ↓
VALIDATE
  ↓
PROCESS
  ↓
STATE CHANGE
  ↓
EVENT
```

Not:

``` text
ACTION
  ↓
EVENT
  ↓
VALIDATE
  ↓
FAIL
```

Otherwise history would contain events describing actions that never
succeeded.

------------------------------------------------------------------------

# 46. Failed Actions

A failed action should normally not create a successful domain event.

Example:

``` text
attempt locked Gate
       ↓
reject
```

Do not record:

``` text
GATE_ENTERED
```

because the Gate was never entered.

The application may still expose an error result for UI feedback.

------------------------------------------------------------------------

# 47. Error Events

Error logging and domain event history are different concepts.

A technical error may be logged for debugging without becoming a player
progression event.

For example:

``` text
PERSISTENCE_SAVE_FAILED
```

could be an application diagnostic event in a future system.

It should not automatically become a player-visible progression event.

------------------------------------------------------------------------

# 48. Event History Is Not an Audit Log

The current event history is primarily a player journey/progression
history.

It is not necessarily a complete technical audit log.

Therefore do not store every UI event:

``` text
BUTTON_HOVERED
MODAL_OPENED
TAB_CHANGED
PAGE_VIEWED
```

Those are UI analytics concerns, not core progression history.

------------------------------------------------------------------------

# 49. What Belongs in Event History

Good candidates:

``` text
quest completion
Gate entry
daily plan saved
major progression milestones
```

Potential future candidates:

``` text
Gate completion
Boss completion
achievement unlock
title unlock
level-up
Arcana ascension
```

Only add these when required by the product and implementation.

------------------------------------------------------------------------

# 50. What Does Not Belong in Core Event History

Avoid:

``` text
mouse movement
button hover
page render
component mount
route change
sidebar opened
theme changed
temporary toast
animation started
```

These are UI events.

------------------------------------------------------------------------

# 51. Event History vs Analytics

Event history can support analytics, but analytics should not force
every UI interaction into game history.

Conceptually:

``` text
CORE EVENT HISTORY
       ↓
meaningful journey events
       ↓
analytics summaries
```

not:

``` text
EVERY UI EVENT
       ↓
CORE GAME HISTORY
```

------------------------------------------------------------------------

# 52. Event History vs Current State

Current state answers:

``` text
Where is the player now?
```

Event history answers:

``` text
What meaningful things happened?
```

Example:

``` text
Current:
Gate = beast-03
XP = 410
Streak = 4
```

History:

``` text
Gate entered
Quest completed
Quest completed
Quest completed
Plan saved
...
```

Both are useful.

Neither should replace the other.

------------------------------------------------------------------------

# 53. Event History and Derived Analytics

Analytics may derive:

-   total quests
-   total practice minutes
-   completion patterns
-   streak history
-   progression velocity
-   Gate activity
-   reflection activity

However, the current progress state already contains aggregate counters.

Analytics should prefer authoritative state and event history according
to the metric being calculated.

Do not assume every metric must be reconstructed from events.

------------------------------------------------------------------------

# 54. Event Schema --- Conceptual Model

A conceptual event could look like:

``` text
{
  id,
  type,
  timestamp,
  dateKey,
  gateId?,
  questId?,
  metadata?
}
```

This is a conceptual model only.

The exact current event shape must be inspected in the repository before
implementation.

Do not rewrite existing events to match this document automatically.

------------------------------------------------------------------------

# 55. Event Metadata

Metadata should be:

-   small
-   relevant
-   serializable
-   stable
-   non-sensitive where possible

Avoid:

``` text
entire player object
entire Gate object
entire catalog
large reflection text
temporary UI state
```

Prefer references and small values.

------------------------------------------------------------------------

# 56. Event Immutability

Once an event has been recorded as historical activity, it should be
treated as historical information.

Do not modify old events merely because the current UI changed.

For example:

``` text
old quest event
```

should not be rewritten because the Gate UI was redesigned.

Historical events should remain meaningful.

------------------------------------------------------------------------

# 57. Event IDs and Deduplication

If the implementation provides event IDs, they can help detect
accidental duplicates.

Important for:

-   repeated UI submissions
-   persistence retries
-   future synchronization
-   import/export

However, duplicate quest protection already exists inside
`completeQuest`.

Do not build a second duplicate-prevention engine in the UI.

------------------------------------------------------------------------

# 58. Idempotency

An operation is idempotent when repeating it does not create unintended
additional effects.

The current quest engine explicitly prevents duplicate daily completion
and duplicate Boss completion.

Therefore:

``` text
Complete button clicked twice
```

must not grant rewards twice.

This protection belongs to the progression engine.

------------------------------------------------------------------------

# 59. UI Double-Click Protection

The UI should still provide interaction protection:

``` text
submit
  ↓
disable button while processing
```

But this is only a UX improvement.

It is not the authoritative duplicate guard.

Correct architecture:

``` text
UI protection
+
domain duplicate protection
```

------------------------------------------------------------------------

# 60. Event Flow: Quest Completion

Canonical flow:

``` text
┌──────────────────┐
│ Player clicks    │
│ Complete Quest   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Application      │
│ completeQuest    │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Progression      │
│ Engine           │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Validate         │
│ Gate + Quest     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Update State     │
│ XP / rewards /   │
│ mastery / etc.   │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Record completion│
│ event            │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Return new state │
│ + result         │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ Store + Save     │
└────────┬─────────┘
         ↓
┌──────────────────┐
│ UI Feedback      │
└──────────────────┘
```

------------------------------------------------------------------------

# 61. Event Flow: Gate Entry

``` text
Player
  ↓
enterGate(gateId)
  ↓
Gate exists?
  ↓
Gate unlocked?
  ↓
Start if necessary
  ↓
Move current position
  ↓
GATE_ENTERED
  ↓
New state
  ↓
Store
  ↓
UI
```

The current implementation explicitly supports this flow.

------------------------------------------------------------------------

# 62. Event Flow: Daily Plan

``` text
Player edits plan
       ↓
saveDailyPlan(...)
       ↓
store plan by date
       ↓
PLAN_SAVED
       ↓
new state
       ↓
store
       ↓
UI
```

Again, the event is produced after successful processing.

------------------------------------------------------------------------

# 63. Event Flow: Gate Completion

Conceptual:

``` text
QUEST / BOSS PROGRESSION
        ↓
MASTERY CALCULATION
        ↓
BOSS COMPLETE?
        ↓
MASTERY >= THRESHOLD?
        ↓
GATE COMPLETED
        ↓
NEXT GATE UNLOCK
        ↓
EVENT / RESULT
        ↓
UI CEREMONY
```

The exact persistent event sequence must follow the existing engine.

------------------------------------------------------------------------

# 64. Event Flow: Achievement

Conceptual:

``` text
PROGRESSION
     ↓
ACHIEVEMENT EVALUATION
     ↓
NEW UNLOCK?
     ├── NO
     └── YES
           ↓
     Achievement state
           ↓
     Result / optional event
           ↓
     UI notification
```

The UI does not evaluate the condition.

------------------------------------------------------------------------

# 65. Event Flow: Title

``` text
PROGRESSION
     ↓
TITLE CONDITIONS
     ↓
TITLE AVAILABLE
     ↓
STATE / RESULT
     ↓
UI
```

The title system remains data-driven.

------------------------------------------------------------------------

# 66. Event Flow: Streak Interruption

``` text
QUEST COMPLETION
      ↓
DATE EVALUATION
      ↓
GAP > 1 DAY?
      ├── NO
      │    ↓
      │  continue
      │
      └── YES
           ↓
      current streak = 1
           ↓
      interrupted / returned state
           ↓
      2 SP
```

The event history should preserve the activity that caused the return.

The streak state preserves the current streak condition.

------------------------------------------------------------------------

# 67. Event Flow: Persistence

``` text
STATE CHANGE
     ↓
SERIALIZE
     ↓
STORAGE ADAPTER
     ↓
SAVE
```

Persistence success does not create a game progression event by itself.

It is an infrastructure operation.

------------------------------------------------------------------------

# 68. Event Flow: Import

``` text
IMPORT REQUEST
      ↓
READ
      ↓
PARSE
      ↓
VALIDATE
      ↓
RESTORE
      ↓
READY
```

Imported historical events should be validated as part of imported
state.

Do not trust imported event history blindly.

------------------------------------------------------------------------

# 69. Event Flow: Reset

Reset is an explicit destructive operation.

``` text
RESET REQUEST
      ↓
CONFIRM
      ↓
CREATE VALID INITIAL STATE
      ↓
PERSIST
      ↓
READY
```

Reset should not be represented as a normal progression event unless the
product explicitly needs reset history.

------------------------------------------------------------------------

# 70. Event System and State Machine

The relationship can be summarized as:

``` text
ACTION
  ↓
STATE MACHINE GUARDS
  ↓
PROGRESSION ENGINE
  ↓
STATE TRANSITION
  ↓
EVENT RECORD
```

The event describes the successful transition.

It does not cause the transition by itself.

------------------------------------------------------------------------

# 71. Event System and Progression Engine

The progression engine may produce:

``` text
new state
+
result
+
event history changes
```

The application layer receives the resulting state.

It should not reconstruct the event from scratch.

------------------------------------------------------------------------

# 72. Event System and Store

The store should expose actions such as:

``` text
initializeAwakening()
enterGate()
completeQuest()
saveReflection()
deleteReflection()
saveDailyPlan()
updateSettings()
exportJourney()
importJourney()
resetJourney()
```

The exact API should be based on existing functions.

The store should not manually append event objects.

------------------------------------------------------------------------

# 73. Event System and React

React should:

-   trigger actions
-   display events/history
-   display progression feedback
-   display success/error states
-   animate meaningful events where appropriate

React should not:

-   create progression events manually
-   calculate event consequences
-   determine whether an event is valid
-   modify event history directly

------------------------------------------------------------------------

# 74. Event System and Framer Motion

Framer Motion may be used to present meaningful events:

``` text
quest completion
XP gain
achievement unlock
title unlock
Gate unlock
level-up
ascension
```

The animation is not the event.

For example:

``` text
DOMAIN EVENT
     ↓
UI receives result
     ↓
Framer Motion animation
```

not:

``` text
animation completed
     ↓
Gate unlocked
```

------------------------------------------------------------------------

# 75. Event System and Notifications

A notification may be generated from a domain result.

Example:

``` text
achievement unlocked
      ↓
toast / ceremony
```

The toast itself is not the authoritative achievement event.

It is a presentation of the event/result.

------------------------------------------------------------------------

# 76. Event System and Journal

The Journal may display selected meaningful history.

Potential entries:

``` text
Gate entered
Quest completed
Gate completed
Achievement unlocked
Title unlocked
Ascension
```

The Journal should read from authoritative state/event history.

It should not create its own independent history.

------------------------------------------------------------------------

# 77. Event System and Analytics

Analytics can use event history to answer:

``` text
What happened?
When did it happen?
Which Gate was active?
How often did the player practice?
```

But current aggregate state may be more appropriate for:

``` text
total XP
current level
current streak
current mastery
```

Use the correct source for each metric.

------------------------------------------------------------------------

# 78. Event System and Privacy

MYTHIC LEVELS is local-first.

Player reflections and progression data should be treated as private.

Event history is also player data.

Do not send event history to an external service merely because
analytics could use it.

A future backend or analytics system would require an explicit product
decision.

------------------------------------------------------------------------

# 79. Event System and Export

Journey export should preserve meaningful progression data.

Conceptually:

``` text
PLAYER
SETTINGS
PROGRESS
GATE PROGRESS
REFLECTIONS
EVENT HISTORY
```

The exact export structure must follow the existing persistence/export
implementation.

Do not create a second event-only export format unless required.

------------------------------------------------------------------------

# 80. Event System and Import

Imported events must not be trusted simply because they look valid.

Validation should check:

-   schema version
-   expected types
-   valid references
-   timestamps/date keys where applicable
-   event structure
-   state compatibility

The current `validateLoadedState` is intentionally partial and requires
future hardening before treating imported data as fully trusted.

------------------------------------------------------------------------

# 81. Event System and Schema Version

The current state schema version is:

``` text
1
```

and storage key:

``` text
mythic-levels:v1
```

If event schema changes incompatibly, the migration strategy must
account for it.

Do not silently reinterpret old event records.

------------------------------------------------------------------------

# 82. Event Retention Strategy

Current rule:

``` text
maximum 400 recent events
```

This means the event history is intentionally bounded.

The product should not assume that the event list is an infinite
archive.

Therefore analytics should use authoritative aggregate counters where
possible.

------------------------------------------------------------------------

# 83. Historical Data Limitation

Because only recent events are retained:

``` text
event history ≠ complete lifetime audit trail
```

For lifetime metrics, use authoritative aggregate fields such as:

-   total completed quests
-   total practice minutes
-   knowledge count
-   listening count
-   observation count
-   longest focus
-   achievement state

where appropriate.

------------------------------------------------------------------------

# 84. Event Ordering and Timestamps

If multiple events occur close together, timestamp order may be useful.

However, do not assume timestamps alone define progression order.

The domain state remains authoritative.

For example:

``` text
Event history says A then B
```

does not give permission to reconstruct arbitrary game state if
persisted state says otherwise.

------------------------------------------------------------------------

# 85. Event Rehydration

On application startup:

``` text
storage
  ↓
load persisted state
  ↓
validate
  ↓
restore state
```

The application should not replay all events to reconstruct the state
unless the architecture is explicitly changed to event sourcing.

MYTHIC LEVELS is currently state-based, not event-sourced.

------------------------------------------------------------------------

# 86. Important: Not Event Sourcing

The project should not be treated as an event-sourcing system.

Current architecture:

``` text
STATE IS AUTHORITATIVE
EVENT HISTORY IS SUPPORTING HISTORY
```

Not:

``` text
EVENTS ARE THE ONLY SOURCE OF TRUTH
```

This distinction is important.

Do not redesign the existing engine around event replay.

------------------------------------------------------------------------

# 87. Event Replay Is Not Required

The system does not need to do:

``` text
initial state
   ↓
event 1
   ↓
event 2
   ↓
event 3
   ↓
...
current state
```

Instead:

``` text
persisted current state
+
recent event history
```

are loaded directly.

This is simpler and matches the current implementation.

------------------------------------------------------------------------

# 88. Event Consumers

Potential consumers include:

``` text
Journal
Analytics
Notifications
Progression feedback
Debugging
Future synchronization
```

Consumers should read events.

They should not mutate core progression based on arbitrary event
interpretation.

------------------------------------------------------------------------

# 89. Event Consumer Rule

A consumer may say:

``` text
"If event X happened, display notification Y."
```

A consumer must not say:

``` text
"If event X happened, unlock Gate Z."
```

unless the progression engine explicitly produced that unlock as part of
the authoritative transition.

------------------------------------------------------------------------

# 90. Event-Driven UI

Good:

``` text
completeQuest()
   ↓
result
   ↓
show XP animation
   ↓
show achievement notification
```

Bad:

``` text
button click
   ↓
assume quest succeeded
   ↓
show "Quest Complete"
```

The UI should display success only after the application/domain
operation succeeds.

------------------------------------------------------------------------

# 91. Event Result vs Persisted Event

Some progression results may be useful immediately without becoming
persistent events.

Example:

``` text
new level reached
```

The engine may return level information.

The UI can show:

``` text
LEVEL UP
```

without requiring a new persistent event record if the existing
architecture does not store one.

This keeps the system simple.

------------------------------------------------------------------------

# 92. Event Naming Conventions

If new runtime events are introduced later, prefer:

``` text
UPPER_SNAKE_CASE
```

for consistency with confirmed identifiers such as:

``` text
GATE_ENTERED
PLAN_SAVED
```

Names should be:

-   concise
-   past-tense where possible
-   unambiguous
-   domain-oriented

Good:

``` text
QUEST_COMPLETED
GATE_ENTERED
PLAN_SAVED
```

Avoid:

``` text
DO_QUEST
CLICKED_QUEST
QUEST_BUTTON
```

because those describe commands or UI details.

------------------------------------------------------------------------

# 93. Event Payload Naming

Use domain names consistent with the existing model.

Examples:

``` text
gateId
questId
dateKey
timestamp
phase
minutes
```

Do not create:

``` text
gateIdentifier
questIdentifier
calendarString
```

if the repository already uses the canonical names.

------------------------------------------------------------------------

# 94. Event Category Naming

Categories should remain conceptual unless a runtime category system is
actually implemented.

For example:

``` text
QUEST
GATE
PROGRESSION
```

may be useful for filtering Journal entries.

But do not add category fields to persisted state solely because they
appear in this document.

------------------------------------------------------------------------

# 95. Event Severity

Core progression events do not require severity.

Avoid unnecessary fields such as:

``` text
severity
priority
importance
```

unless a concrete feature needs them.

The event type itself should usually communicate meaning.

------------------------------------------------------------------------

# 96. Event Source of Truth

For every event:

``` text
Who created it?
```

The answer should be:

``` text
the domain/progression/application operation that actually processed the action
```

Not:

``` text
the UI component
```

------------------------------------------------------------------------

# 97. Event Creation Timing

Create the event at the point where the domain knows the action
succeeded.

For quest completion:

``` text
after successful validation and state update
```

For Gate entry:

``` text
after Gate existence/unlock checks and entry state update
```

For plan saving:

``` text
after plan is stored in state
```

------------------------------------------------------------------------

# 98. Event Failure Semantics

If an operation returns the original state and an error:

``` text
oldState + invalid action
        ↓
oldState + error
```

there should not be a successful progression event describing the failed
action.

This follows the immutable failure contract.

------------------------------------------------------------------------

# 99. Atomic Event + State Principle

A successful progression operation should conceptually produce:

``` text
NEW STATE
+
CORRESPONDING EVENT HISTORY
```

together.

Avoid situations where:

``` text
state changed
but event missing
```

or:

``` text
event recorded
but state did not change
```

for events intended to represent state transitions.

------------------------------------------------------------------------

# 100. Event History Consistency

Examples:

If:

``` text
GATE_ENTERED
```

exists, the corresponding Gate entry should have been accepted.

If:

``` text
PLAN_SAVED
```

exists, the plan should have been saved.

If a quest completion event exists, the completion should be represented
in progress.

These are consistency expectations.

------------------------------------------------------------------------

# 101. Event and Duplicate Completion

The current engine prevents duplicate daily completion and duplicate
Boss completion.

Therefore:

``` text
first valid completion
    ↓
completion event
```

and:

``` text
second duplicate request
    ↓
error
```

should not produce a second reward-generating completion event.

------------------------------------------------------------------------

# 102. Event and Date-Based Completion

Quest completion records use date keys.

Therefore event history should preserve the same date semantics where
the existing event model supports a date.

Do not convert local completion dates to a different calendar meaning in
the UI.

------------------------------------------------------------------------

# 103. Event and Difficulty

Quest XP is difficulty-scaled:

``` text
Gentle    0.90x
Standard  1.00x
Austere   1.15x
```

The event does not need to recalculate the XP.

The progression engine already applies the configured difficulty.

If an event records reward information, it should use the actual result
from the engine.

------------------------------------------------------------------------

# 104. Event and Attributes

Quest completion applies attribute rewards, capped at 100 per attribute.

The event should not calculate the attribute increase.

The progression engine performs the update.

If analytics needs attribute changes, it should use the authoritative
state/history produced by the engine.

------------------------------------------------------------------------

# 105. Event and Mastery

Mastery signals are:

``` text
Practice
Consistency
Reflection
Boss
```

with weights:

``` text
40%
20%
15%
25%
```

The event system records activity.

The mastery system interprets activity.

This separation is essential.

------------------------------------------------------------------------

# 106. Event and Unlocking

Unlocking belongs to:

``` text
src/services/progression/unlocks.js
```

The event system should not contain:

``` text
if previousGateCompleted then unlockNext
```

Instead:

``` text
progression engine
      ↓
unlock service
      ↓
new state/result
      ↓
optional event/history representation
```

------------------------------------------------------------------------

# 107. Event and Arcana Ascension

A Gate completion may cause:

``` text
Arcana ascension
```

The engine reports ascension information.

The UI may display an ascension ceremony.

The animation is presentation.

The underlying Arcana transition remains domain-controlled.

------------------------------------------------------------------------

# 108. Event and Current Position

The player's current position may advance after Gate completion.

The event system should not independently update:

``` text
currentArcana
currentGate
```

It records or presents the result.

The progression engine determines the new position.

------------------------------------------------------------------------

# 109. Event and Journal Ordering

Journal entries should preferably be sorted using event timestamps or
the existing event ordering.

But the Journal must not mutate the events simply to sort them.

Sorting for presentation is a derived UI operation.

------------------------------------------------------------------------

# 110. Event and Analytics Aggregation

Analytics may group events by:

``` text
date
Gate
Arcana
event type
quest
```

This should be read-only.

Analytics must not modify event history.

------------------------------------------------------------------------

# 111. Event and Empty State

If no events exist:

``` text
No journey events yet.
```

This is a valid UI state.

It does not mean:

``` text
player has no state
```

The player may have an initialized state even with little or no event
history.

------------------------------------------------------------------------

# 112. Event and Loading State

While persisted state is loading:

``` text
EVENT HISTORY LOADING
```

is a UI/application state.

It is not a game event.

------------------------------------------------------------------------

# 113. Event and Error State

If event history cannot be loaded:

``` text
EVENT HISTORY ERROR
```

is an application/UI state.

It does not mean the player lost their progression.

The application should preserve the distinction between:

``` text
event display failure
```

and:

``` text
game state failure
```

------------------------------------------------------------------------

# 114. Event System and Local Storage

Current storage is browser local persistence using:

``` text
mythic-levels:v1
```

Events are part of the persisted progress.

The UI should not directly write:

``` text
localStorage.setItem(...)
```

for events.

Use:

``` text
store/action
   ↓
storage service
```

------------------------------------------------------------------------

# 115. Event System and Future Cloud Sync

The architecture may eventually support:

-   IndexedDB
-   cloud synchronization
-   authentication
-   backend persistence

But these are not current requirements.

The Event System should therefore avoid assuming a server.

Do not add:

``` text
server event IDs
websocket event streams
event queues
```

unless the product explicitly requires them.

------------------------------------------------------------------------

# 116. Event System and Offline-First Behavior

Because the current application is local-first:

``` text
player action
   ↓
local domain state
   ↓
local event history
   ↓
local persistence
```

should work without a backend.

A future synchronization layer can be added later without changing the
meaning of core events.

------------------------------------------------------------------------

# 117. Future Synchronization Consideration

If synchronization is introduced later, event identity and ordering may
become more important.

Potential future concerns:

-   duplicate event delivery
-   conflict resolution
-   ordering
-   schema versions
-   merge behavior

These are future architecture concerns.

Do not implement them prematurely.

------------------------------------------------------------------------

# 118. Event System and Performance

The event history is capped at 400 events.

This limits growth.

Avoid creating events for every tiny UI interaction.

The event system should remain lightweight.

Good:

``` text
quest completion
Gate entry
plan saved
major milestone
```

Bad:

``` text
every keystroke
every render
every hover
every scroll
```

------------------------------------------------------------------------

# 119. Event Payload Size

Keep event payloads small.

Particularly avoid storing:

-   full Gate definitions
-   full quest definitions
-   large reflection text
-   duplicate player state
-   UI component state

The persisted state already contains the authoritative data.

------------------------------------------------------------------------

# 120. Event Serialization

Events must be serializable if they are persisted.

Avoid storing:

``` text
functions
React elements
DOM nodes
class instances
Promises
circular objects
```

Use plain data.

The current project is JavaScript and local-storage based, so
serializable plain objects are appropriate.

------------------------------------------------------------------------

# 121. Event Compatibility

When changing event structure:

``` text
inspect old data
      ↓
determine compatibility
      ↓
migration or rejection
```

Do not assume old persisted events will automatically remain valid.

------------------------------------------------------------------------

# 122. Event System and Testing

Tests should verify event behavior at the domain boundary.

Important tests:

-   successful Gate entry records `GATE_ENTERED`
-   successful plan save records `PLAN_SAVED`
-   successful quest completion records the completion event
-   invalid Gate entry does not record `GATE_ENTERED`
-   duplicate quest completion does not duplicate successful completion
    history
-   event retention remains at 400
-   state and event history remain consistent
-   imported event history is validated

------------------------------------------------------------------------

# 123. Event Test Pattern

Use:

``` text
GIVEN current state
WHEN valid action occurs
THEN expected state changes
AND expected event exists
```

For failure:

``` text
GIVEN current state
WHEN invalid action occurs
THEN action is rejected
AND successful event is absent
AND original valid state remains
```

------------------------------------------------------------------------

# 124. Gate Entry Test

``` text
GIVEN
    Gate exists
    Gate is unlocked

WHEN
    enterGate(gateId)

THEN
    Gate entry succeeds

AND
    player position updates as defined

AND
    GATE_ENTERED is recorded
```

------------------------------------------------------------------------

# 125. Locked Gate Test

``` text
GIVEN
    Gate is locked

WHEN
    enterGate(gateId)

THEN
    action fails

AND
    Gate is not entered

AND
    GATE_ENTERED is not recorded

AND
    previous valid state remains
```

------------------------------------------------------------------------

# 126. Quest Completion Test

``` text
GIVEN
    valid Gate
    valid quest
    quest not already completed

WHEN
    completeQuest(input)

THEN
    quest completion succeeds

AND
    progression updates

AND
    completion event is recorded

AND
    result contains applicable progression feedback
```

------------------------------------------------------------------------

# 127. Duplicate Quest Test

``` text
GIVEN
    quest already completed for the relevant day

WHEN
    completeQuest(input)

THEN
    duplicate completion is rejected

AND
    rewards are not duplicated

AND
    a second successful completion event is not created
```

------------------------------------------------------------------------

# 128. Plan Save Test

``` text
GIVEN
    valid daily plan

WHEN
    saveDailyPlan(plan)

THEN
    plan is stored

AND
    PLAN_SAVED is recorded
```

------------------------------------------------------------------------

# 129. Event Retention Test

``` text
GIVEN
    progress already contains 400 events

WHEN
    another valid event is appended

THEN
    the event history remains capped

AND
    only the configured recent-event window is retained
```

The current implementation retains the latest 400 events.

------------------------------------------------------------------------

# 130. Event Consistency Test

For each successful progression action:

``` text
state change
```

and:

``` text
event history
```

must describe compatible outcomes.

Do not allow:

``` text
event says completed
state says not completed
```

for a successful domain event.

------------------------------------------------------------------------

# 131. Event System and Immutability

The progression engine clones the incoming state before applying
changes.

Failure returns the original state with an error id.

This is valuable for event handling.

Conceptually:

``` text
oldState
   +
action
   ↓
newState + result
```

or:

``` text
oldState
   +
invalid action
   ↓
oldState + error
```

The event history should follow the same immutable boundary.

------------------------------------------------------------------------

# 132. Event System and Error IDs

The current engine returns an error id on failure.

The application can map this to a human-readable UI message.

For example:

``` text
domain error id
      ↓
application error mapping
      ↓
UI message
```

The event system should not turn an error id into a fake success event.

------------------------------------------------------------------------

# 133. Event System and User Messaging

A successful event can produce UI messaging:

``` text
Quest complete.
+30 XP
```

An unlock can produce:

``` text
Gate Unlocked.
```

An achievement can produce:

``` text
Achievement Unlocked.
```

The message is presentation.

The underlying event/result is authoritative.

------------------------------------------------------------------------

# 134. Event System and Animation

Correct:

``` text
state/result
   ↓
event feedback
   ↓
animation
```

Incorrect:

``` text
animation finished
   ↓
mutate progression state
```

Animations should never control game-state transitions.

------------------------------------------------------------------------

# 135. Event System and Accessibility

Event feedback must not rely only on animation.

For example:

``` text
Gate Unlocked
```

should be understandable without animation.

Provide:

-   text feedback
-   accessible labels
-   focus management where needed
-   reduced-motion support

The event remains meaningful regardless of visual effects.

------------------------------------------------------------------------

# 136. Event System and Responsive UI

Event history may be displayed on:

-   desktop
-   tablet
-   mobile

The data remains the same.

Only presentation changes.

Do not create separate event semantics for mobile.

------------------------------------------------------------------------

# 137. Event Filtering

Future Journal/Analytics screens may filter by:

``` text
All
Quests
Gates
Achievements
Titles
Plans
```

Filtering is presentation logic.

It should not modify stored event history.

------------------------------------------------------------------------

# 138. Event Sorting

Future Journal screens may sort by:

``` text
newest
oldest
```

This is a derived view.

Do not rewrite the underlying event array just to support a visual sort.

------------------------------------------------------------------------

# 139. Event Grouping

The Journal may group events:

``` text
Today
Yesterday
Earlier
```

This is presentation logic based on event timestamps/date keys.

It does not change event semantics.

------------------------------------------------------------------------

# 140. Event Detail View

A future event detail view may show:

``` text
Event type
Date
Time
Gate
Quest
Reward
Progression result
```

Only expose fields actually present and appropriate.

Do not fabricate metadata.

------------------------------------------------------------------------

# 141. Event History Privacy in UI

Reflection-related events should not expose reflection text
unnecessarily.

The Journal should avoid displaying private reflection content unless
the player explicitly opens the relevant reflection.

------------------------------------------------------------------------

# 142. Event System and Export Privacy

Exports may contain sensitive personal-development information.

The application should make clear that journey exports contain player
data.

Do not automatically upload them.

------------------------------------------------------------------------

# 143. Event System and Reset

When reset is confirmed:

``` text
current journey state
      ↓
new initial state
```

The previous event history is expected to be removed as part of
resetting the journey if the existing reset implementation behaves that
way.

The exact behavior should be verified in the repository before changing
or documenting a different reset contract.

------------------------------------------------------------------------

# 144. Event System and Initial Awakening

Awakening creates initial state.

A future:

``` text
AWAKENING_COMPLETED
```

event could be useful for Journal/analytics.

But the current repository documentation does not explicitly confirm
that event identifier.

Therefore do not make it a runtime dependency until verified.

------------------------------------------------------------------------

# 145. Event System and Initial Gate

`createInitialState(awakening)` creates the first Beast Gate record:

``` text
beast-01
```

The creation of this initial Gate state does not automatically mean:

``` text
GATE_ENTERED
```

Gate entry is a separate operation.

This distinction prevents initialization from being confused with player
action.

------------------------------------------------------------------------

# 146. Event System and Current Position

Initial position is:

``` text
Arcana: beast
Gate: 1
```

The current position is state.

A `GATE_ENTERED` event is a history record.

Do not use the event itself as the source of current position.

------------------------------------------------------------------------

# 147. Event System and Catalog

The catalog defines:

-   Arcanas
-   Gates
-   quests
-   seven-day progression definitions
-   achievements
-   titles

Events should reference these definitions where necessary.

The catalog remains static content.

------------------------------------------------------------------------

# 148. Event System and 27 Gates

The same event architecture must support all:

``` text
27 Gates
3 Arcanas
7 daily tasks per Gate
1 Boss Trial per Gate
```

Do not create different event systems for Beast, Human, and Sage.

The event type remains generic.

The entity reference identifies the specific Gate.

------------------------------------------------------------------------

# 149. Event System and 7-Day Structure

Quest events should preserve enough information to understand which
stage occurred where the existing schema supports it.

The current engine records:

``` text
phase
quest id
date
minutes
reflection
```

This supports meaningful history without duplicating quest definitions.

------------------------------------------------------------------------

# 150. Event System and Boss Trial

Boss completion should be represented through the existing
quest/progression machinery if that is how the current engine models it.

Do not create a completely separate Boss event pipeline unless
implementation requires it.

The Boss is part of Gate progression.

------------------------------------------------------------------------

# 151. Event System and Mastery Signals

A quest completion may change:

``` text
practice signal
consistency signal
reflection signal
```

Boss completion changes:

``` text
boss signal
```

The event system records activity.

The mastery service calculates the signal/result.

------------------------------------------------------------------------

# 152. Event System and Mastery Threshold

The normal mastery threshold is:

``` text
70%
```

or:

``` text
0.7
```

but the player settings contain the configured threshold.

Therefore the event system must not hardcode:

``` text
if mastery >= 0.7
```

The progression engine uses the configured rule.

------------------------------------------------------------------------

# 153. Event System and Difficulty

Difficulty affects XP and duration.

The event system should not calculate:

``` text
base XP × difficulty
```

The progression engine already does this.

If the result contains actual XP, display that result.

------------------------------------------------------------------------

# 154. Event System and Resources

Resources include:

``` text
XP
MP
SP
AP
DP
KP
CP
```

The event system should not independently increment these values.

The progression engine owns resource updates.

------------------------------------------------------------------------

# 155. Event System and Attribute History

Quest completion appends an attribute-history snapshot and keeps the
latest 120 snapshots.

This is a separate historical mechanism from event history.

Do not merge:

``` text
attribute history
```

and:

``` text
event history
```

into one structure.

They answer different questions.

------------------------------------------------------------------------

# 156. Event History vs Attribute History

Event history:

``` text
What meaningful actions happened?
```

Attribute history:

``` text
How did attributes look over time?
```

Both may be used by Analytics.

They should remain conceptually separate.

------------------------------------------------------------------------

# 157. Event System and Achievement Registry

The current repository contains achievement definitions and dynamically
supplied Gate achievement identifiers.

The achievement registry is not currently a perfect one-to-one mapping
with every Gate achievement field.

Therefore the event system should not assume every achievement has a
static identifier in one registry without inspecting the implementation.

------------------------------------------------------------------------

# 158. Event System and Titles

Titles are data-driven and evaluated by progression logic.

Events may provide a convenient history record:

``` text
title became available
```

but title eligibility must remain in the progression system.

------------------------------------------------------------------------

# 159. Event System and Daily Plans

Daily plans are stored by date.

`PLAN_SAVED` is confirmed.

The event should identify the saved plan sufficiently for history if the
existing schema supports that.

Do not store unnecessary plan duplication.

------------------------------------------------------------------------

# 160. Event System and Settings

Settings updates are application state changes.

Potential conceptual event:

``` text
SETTINGS_UPDATED
```

but this is not currently confirmed as a runtime event.

Settings changes should not accidentally create progression events
unless the product explicitly requires it.

------------------------------------------------------------------------

# 161. Event System and Difficulty Changes

Changing difficulty affects future progression behavior.

It should not retroactively recalculate historical events.

For example:

``` text
Quest completed under Standard
```

must not become:

``` text
Quest completed under Austere
```

because the player later changes difficulty.

Historical records should describe what happened at the time.

------------------------------------------------------------------------

# 162. Event System and Historical Truth

The core event principle is:

> **An event describes the accepted action as it happened, not how the
> system wishes it had happened later.**

This is especially important for:

-   dates
-   Gate identity
-   quest identity
-   rewards
-   difficulty
-   progression outcomes

------------------------------------------------------------------------

# 163. Event Mutation

Avoid editing historical events unless there is a deliberate
migration/correction mechanism.

Normal UI actions should append new history or change authoritative
state through the domain.

They should not rewrite history casually.

------------------------------------------------------------------------

# 164. Event Deletion

The user-facing product currently has reflection deletion, but not a
general "delete arbitrary event" operation.

Do not add event deletion simply to support Journal editing.

Event history is system-generated history.

------------------------------------------------------------------------

# 165. Event History Limits

The current cap of 400 means older events can eventually disappear from
the active event list.

This is acceptable under the current model.

Lifetime progression counters must not depend solely on retained events.

------------------------------------------------------------------------

# 166. Event System and Long-Term Progress

Long-term progress is represented by state such as:

``` text
completed quests
Gate completion
XP
level
attributes
achievements
titles
practice totals
```

Event history supplements that state.

It is not the sole record of lifetime progress.

------------------------------------------------------------------------

# 167. Event System and Player Identity

Events belong to the player's journey.

In a local-only application there may be no need for repeated player IDs
inside every event if the containing state already belongs to one
player.

Do not duplicate identity fields unnecessarily.

------------------------------------------------------------------------

# 168. Event System and Multi-User Future

The architecture may eventually become multi-user.

If that happens, event identity and player ownership may need stronger
boundaries.

That is future scope.

The current local-first product should not introduce backend identity
infrastructure prematurely.

------------------------------------------------------------------------

# 169. Event System and Determinism

Progression actions should be deterministic given:

``` text
state
+
input
+
documented configuration
```

Event creation should describe the result.

Do not make event creation itself randomly alter progression.

------------------------------------------------------------------------

# 170. Event System and Randomness

If future features use randomness for cosmetic effects, the random value
should not silently change core progression unless the progression rules
explicitly support it.

Events should record meaningful outcomes rather than implementation
randomness.

------------------------------------------------------------------------

# 171. Event System and Debugging

Event history can help diagnose progression issues.

Example:

``` text
Gate entered
Quest completed
Quest completed
Boss completed
```

If the current state is unexpected, the history provides context.

However, debugging should still inspect the authoritative state and
progression engine.

Do not infer the entire state only from event history.

------------------------------------------------------------------------

# 172. Event System and Logging

Technical logs and player events are different.

Technical log:

``` text
Storage write failed: quota exceeded
```

Player event:

``` text
PLAN_SAVED
```

Do not mix infrastructure logs with player journey history.

------------------------------------------------------------------------

# 173. Event System and Error Reporting

An error should contain enough information for the application to show
useful feedback.

But error details should not leak unnecessary implementation internals
into the player-facing UI.

Use an application error mapping layer where appropriate.

------------------------------------------------------------------------

# 174. Event System and Testing Boundaries

Tests should be divided:

## Domain tests

Verify:

``` text
action
→ state transition
→ event history
```

## Application tests

Verify:

``` text
UI action
→ store action
→ domain operation
→ state update
→ persistence
```

## UI tests

Verify:

``` text
result
→ correct visual feedback
```

This prevents tests from duplicating business logic.

------------------------------------------------------------------------

# 175. Event System and Test Isolation

A domain test should not require React.

A progression test should not require a browser.

An event-history test should not require the full UI.

This follows the dependency direction:

``` text
UI
 ↓
Application
 ↓
Domain
 ↓
Data
```

------------------------------------------------------------------------

# 176. Event System and Current UI Gap

The current React application does not yet consume:

-   progression engine
-   catalog
-   storage service
-   daily-plan service
-   domain models

Therefore the event system is currently implemented primarily in the
domain layer, while the UI integration remains future work.

The first UI implementation should consume existing events/results
rather than invent a parallel event system.

------------------------------------------------------------------------

# 177. First Integration Target

The first useful event-driven UI should be:

``` text
Quest completion
      ↓
result
      ↓
XP feedback
      ↓
mastery feedback
      ↓
streak feedback
      ↓
achievement/title feedback
      ↓
Gate unlock feedback if applicable
```

All feedback should come from the authoritative result.

------------------------------------------------------------------------

# 178. Event Feedback Object

The exact existing engine return value should be inspected before
designing a separate event-feedback type.

The current documentation indicates that `completeQuest` returns:

-   new state
-   rewards
-   mastery signals
-   level
-   unlocks
-   achievements
-   titles
-   ascension
-   streak information
-   interruption status

This is already a strong application-facing result contract.

Do not duplicate it unnecessarily.

------------------------------------------------------------------------

# 179. Event System and Application Action Contract

A future application action may conceptually be:

``` text
completeQuest(input)
```

and return:

``` text
{
  success,
  state,
  result,
  error
}
```

This is conceptual.

The actual implementation should match the engine's current return
contract.

------------------------------------------------------------------------

# 180. Event System and UI Result Handling

The UI should handle:

``` text
success
```

and:

``` text
failure
```

separately.

Success:

``` text
show completion feedback
refresh state
```

Failure:

``` text
show error
preserve current state
```

Do not show a successful event animation for a failed action.

------------------------------------------------------------------------

# 181. Event System and Loading

While an event-producing action is processing:

``` text
SUBMITTING
```

is a UI/application state.

It should not become a persistent game event.

------------------------------------------------------------------------

# 182. Event System and Optimistic UI

Avoid optimistic progression for core game actions unless there is a
strong reason.

Do not immediately display:

``` text
+30 XP
Gate unlocked
```

before the progression engine confirms success.

Safer:

``` text
submit
 ↓
engine
 ↓
result
 ↓
feedback
```

------------------------------------------------------------------------

# 183. Event System and Offline Storage Errors

If the local storage write fails after a progression action:

``` text
domain state may have changed in memory
```

but:

``` text
persistence may have failed
```

The application must surface the persistence error appropriately.

Do not claim permanent save success when storage failed.

------------------------------------------------------------------------

# 184. Event System and State Recovery

The persistence layer should be the place responsible for save/load
behavior.

The event system should not attempt to repair corrupted state by
replaying events.

State validation and migration should handle persisted state.

------------------------------------------------------------------------

# 185. Event System and Migration

When event schemas evolve:

``` text
old schema
   ↓
migration
   ↓
current schema
```

or:

``` text
unsupported schema
   ↓
reject
```

Do not silently drop important progression history during migration.

------------------------------------------------------------------------

# 186. Event System and Versioning

Future event records may optionally have version information if the
implementation needs it.

But do not add per-event versioning automatically.

The current state schema version is:

``` text
1
```

The simplest current approach is to version the persisted state as a
whole.

------------------------------------------------------------------------

# 187. Event System and Serialization Safety

Before persisting event history, ensure values are:

``` text
JSON serializable
```

Avoid:

``` text
undefined-heavy structures
functions
DOM objects
React nodes
circular references
```

The storage layer should remain responsible for serialization.

------------------------------------------------------------------------

# 188. Event System and Static Catalog Changes

Suppose the title text for a Gate changes later.

Historical events should still identify the Gate reliably.

Using stable IDs is preferable to storing only display names.

Again, the exact current event shape is authoritative.

------------------------------------------------------------------------

# 189. Event System and Display Names

Do not use display names as stable identity.

For example:

``` text
"The Gremlin of Flickering Thoughts"
```

is content.

A stable Gate ID such as:

``` text
beast-01
```

is identity.

Events should use stable identity where supported.

------------------------------------------------------------------------

# 190. Event System and Localization

If localization is introduced later, event type should remain stable
while display text changes.

For example:

``` text
GATE_ENTERED
```

could display differently by language.

This is another reason not to store UI sentences as event types.

------------------------------------------------------------------------

# 191. Event System and Mythic Language

Event identifiers should remain technical and stable.

The UI can translate them into mythic language.

Example:

``` text
GATE_ENTERED
```

could be presented as:

``` text
THE GATE OPENS
```

The event identifier should not become:

``` text
THE_GATE_OPENS
```

unless that is deliberately chosen as the technical contract.

------------------------------------------------------------------------

# 192. Event System and World Design

The event system supports the mythology without becoming mystical logic.

Example:

``` text
GATE_COMPLETED
```

may appear as:

``` text
THE GATE IS MASTERED
```

The underlying software event remains deterministic.

------------------------------------------------------------------------

# 193. Event System and Player Agency

Events should reflect real player actions.

The system should not generate fake events to make progress appear more
impressive.

For example:

``` text
QUEST_COMPLETED
```

should correspond to accepted player input and progression processing.

This supports the core product rule:

> Real-world action \> UI activity.

------------------------------------------------------------------------

# 194. Event System and No Fake Transformation

Do not create events such as:

``` text
PERSONALITY_TRANSFORMED
LIFE_FIXED
WISDOM_ACHIEVED
```

unless the product explicitly defines them as symbolic milestones.

MYTHIC LEVELS represents progress; it does not claim to prove literal
transformation.

------------------------------------------------------------------------

# 195. Event System and Failure Philosophy

A failed action should not create shame-oriented events.

Avoid:

``` text
PLAYER_FAILED
PLAYER_WEAK
PLAYER_UNDISCIPLINED
```

A system error or unmet guard should simply explain what happened.

------------------------------------------------------------------------

# 196. Event System and Recovery

A player returning after interruption may produce meaningful progression
information.

The current streak system identifies return status and awards 2 SP.

The UI can celebrate:

``` text
WELCOME BACK
```

without framing the interruption as punishment.

------------------------------------------------------------------------

# 197. Event System and Achievements

Achievement events should celebrate meaningful milestones.

They should not encourage unhealthy behavior through excessive event
spam.

The current achievement registry already contains meaningful milestones
such as:

-   first quest
-   returning after a missed day
-   60-minute focus
-   listening
-   knowledge
-   observation
-   reflections
-   seven-day streak
-   Arcana completion
-   selected Boss completions
-   20 quests
-   100 practice minutes

The event system should preserve these as progression outcomes.

------------------------------------------------------------------------

# 198. Event System and Titles

Titles such as:

``` text
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

are domain content.

The event system may report title unlocks.

It should not decide title eligibility.

------------------------------------------------------------------------

# 199. Event System and Gate Achievements

Some Gate achievement identifiers are supplied dynamically by the
engine.

Therefore consumers should use the actual returned achievement
information rather than assuming a simple static Gate-to-achievement
mapping.

This is particularly important for future Journal/Analytics work.

------------------------------------------------------------------------

# 200. Event System and Current Limitations

Current known limitations include:

-   event history is capped at 400
-   loaded-state validation is partial
-   schema migration is not currently implemented
-   quest completion accepts a caller-supplied `dateKey`
-   achievement identifiers are not perfectly one-to-one across all
    definitions
-   React is not yet connected to the domain/event system

These are implementation considerations, not reasons to redesign the
system prematurely.

------------------------------------------------------------------------

# 201. Event System Change Safety Rule

Before changing event behavior:

1.  inspect current event creation
2.  inspect current event shape
3.  inspect consumers
4.  inspect persistence
5.  inspect tests if available
6.  reuse existing event infrastructure
7.  make the smallest coherent change
8.  validate state/event consistency

Never create a second event mechanism simply because the first one is
not yet connected to React.

------------------------------------------------------------------------

# 202. Recommended Event Integration Order

When implementing the UI:

``` text
1. Read persisted state
2. Expose event history through store
3. Display existing events
4. Connect Gate entry
5. Connect quest completion
6. Display returned progression results
7. Display achievements/titles
8. Display unlock/ascension feedback
9. Add Journal
10. Add Analytics
11. Add focused event tests
12. Harden import/export
```

------------------------------------------------------------------------

# 203. First Event-Driven Components

Potential reusable components:

``` text
EventList
EventItem
EventGroup
EventBadge
ProgressionToast
RewardSummary
AchievementToast
TitleToast
UnlockCeremony
LevelUpFeedback
```

These are presentation components.

They must consume domain/application results.

------------------------------------------------------------------------

# 204. Event Item Responsibility

An `EventItem` should answer:

``` text
What happened?
When?
Where in the journey?
```

It should not answer:

``` text
Should this event exist?
```

The domain has already decided that.

------------------------------------------------------------------------

# 205. Event List Responsibility

`EventList` should:

-   read event history
-   filter
-   sort for display
-   render items
-   handle loading/empty/error states

It should not:

-   mutate event history
-   create events
-   calculate progression

------------------------------------------------------------------------

# 206. Progression Feedback Responsibility

A progression feedback component may show:

``` text
+XP
+resources
level-up
streak
mastery
achievement
title
unlock
ascension
```

The values must come from the application/domain result.

------------------------------------------------------------------------

# 207. Event Toast Responsibility

A toast is temporary UI state.

Example:

``` text
Achievement Unlocked
```

The toast is not the achievement record.

This distinction prevents UI state from becoming game state.

------------------------------------------------------------------------

# 208. Event Ceremony Responsibility

A Gate unlock ceremony may visually show:

``` text
GATE UNLOCKED
```

The ceremony does not perform the unlock.

The progression engine has already produced the unlocked state.

------------------------------------------------------------------------

# 209. Event and Route Navigation

After a Gate completion, the application may navigate to the next Gate.

Conceptually:

``` text
Gate completion
   ↓
unlock result
   ↓
UI notification
   ↓
optional navigation
```

Navigation is optional presentation behavior.

The unlock must not depend on navigation.

------------------------------------------------------------------------

# 210. Event and Browser Refresh

A browser refresh should restore:

``` text
state
+
event history
```

from persistence.

It should not create a new event merely because the application booted.

------------------------------------------------------------------------

# 211. Event and React StrictMode

The current app uses React `StrictMode`.

Care must be taken that initialization effects do not accidentally
create duplicate domain events.

Do not put event-producing domain actions into effects that can run more
than once without proper guards.

------------------------------------------------------------------------

# 212. Event and Component Mounting

Component mounting must not automatically produce progression events.

Bad:

``` text
useEffect(() => enterGate(gateId), [])
```

unless entering the Gate is explicitly defined as an intentional
application action and protected appropriately.

Preferred:

``` text
player chooses Enter Gate
      ↓
enterGate(...)
```

------------------------------------------------------------------------

# 213. Event and Navigation Effects

Do not use route changes as a substitute for explicit actions.

For example:

``` text
opening /gate/beast-01
```

should not automatically record `GATE_ENTERED` unless the product
intentionally defines route entry as Gate entry.

The current architecture already has an explicit `enterGate` operation.

Use it.

------------------------------------------------------------------------

# 214. Event and Browser Back Button

Browser navigation should not undo domain events.

For example:

``` text
Back
```

should not undo:

``` text
QUEST_COMPLETED
```

unless an explicit undo operation exists.

There is currently no documented general progression undo mechanism.

------------------------------------------------------------------------

# 215. Event and Undo

Do not invent an undo system.

Quest completion changes multiple systems:

-   XP
-   resources
-   attributes
-   streak
-   mastery
-   achievements
-   titles
-   unlocks

Undoing it safely would require a dedicated domain design.

Therefore the current system should treat accepted progression events as
committed.

------------------------------------------------------------------------

# 216. Event and Correction

If a data correction is ever required:

``` text
domain correction operation
```

should be designed explicitly.

Do not manually edit localStorage or event history from the UI.

------------------------------------------------------------------------

# 217. Event and Data Corruption

If persisted event history is malformed:

``` text
load
 ↓
validate
 ↓
reject/migrate
```

Do not blindly render malformed events.

The current validator is partial, so event-specific validation may be
needed when persistence hardening is implemented.

------------------------------------------------------------------------

# 218. Event and Type Safety

The project uses JavaScript, not TypeScript.

Therefore consistency should come from:

-   constants
-   validation
-   tests
-   clear object structures
-   centralized event definitions where needed

Do not create a complicated type framework solely for events.

------------------------------------------------------------------------

# 219. Event Constants

If event identifiers become numerous, a centralized constant module may
be useful.

But first inspect the current repository.

If event constants already exist, reuse them.

Do not create:

``` text
eventTypes.js
```

without checking whether an equivalent system already exists.

------------------------------------------------------------------------

# 220. Event Registry

A future registry might conceptually provide:

``` text
event type
display label
icon
category
formatter
```

But this is UI metadata.

It should not become the domain authority.

------------------------------------------------------------------------

# 221. Event Display Mapping

Example:

``` text
GATE_ENTERED
    ↓
"Gate Entered"
```

or mythic:

``` text
"The Gate Opens"
```

This mapping belongs to presentation.

------------------------------------------------------------------------

# 222. Event Icons

Event icons are visual metadata.

Examples:

``` text
Quest → scroll
Gate → portal
Achievement → seal
Title → crown
Streak → flame
```

Do not encode icon decisions into domain state.

------------------------------------------------------------------------

# 223. Event Colors

Event colors should follow `UI_DESIGN.md`.

Examples:

-   Beast → Ember
-   Human → Ancient
-   Sage → Cosmic

The event system itself should remain color-agnostic.

------------------------------------------------------------------------

# 224. Event Animation

Animations should be restrained.

Appropriate:

``` text
XP number rising
small unlock glow
achievement reveal
Gate transition
```

Avoid:

``` text
constant particle effects
full-screen animation for every event
animation blocking the player's workflow
```

------------------------------------------------------------------------

# 225. Reduced Motion

If a player enables reduced motion:

``` text
event remains visible
animation becomes minimal or disabled
```

The event meaning must remain accessible without motion.

------------------------------------------------------------------------

# 226. Event Accessibility

Event components should expose:

-   readable text
-   meaningful labels
-   accessible buttons
-   keyboard navigation
-   screen-reader-compatible status updates where appropriate

Do not make critical progression feedback visual-only.

------------------------------------------------------------------------

# 227. Event History Mobile Layout

On mobile:

``` text
event type
date
short description
```

should remain readable.

Avoid forcing large desktop tables.

A timeline/card layout is appropriate.

------------------------------------------------------------------------

# 228. Event History Desktop Layout

Desktop may use:

``` text
timeline
cards
grouped history
```

with more metadata.

The underlying event data remains unchanged.

------------------------------------------------------------------------

# 229. Event System and Journal Design

The Journal is a consumer of event history.

Possible sections:

``` text
Journey
Reflections
Milestones
```

But the Journal should not become a separate source of truth.

------------------------------------------------------------------------

# 230. Event System and Analytics Design

Analytics may consume:

``` text
event history
progress counters
attribute history
Gate progress
streak state
```

Different metrics should use the appropriate authoritative source.

------------------------------------------------------------------------

# 231. Event System and Dashboard

Dashboard should show current state.

It may use recent events for:

``` text
recent activity
```

Example:

``` text
Last Quest Completed
Recent Achievement
Latest Gate Event
```

But dashboard metrics such as current XP should come from current state.

------------------------------------------------------------------------

# 232. Event System and Profile

Profile may show:

``` text
current title
achievements
journey history
```

Again, use authoritative state and event history.

------------------------------------------------------------------------

# 233. Event System and Arcana Map

The Arcana Map may display:

``` text
Gate unlocked
Gate completed
current Gate
```

Those are state-derived visual conditions.

An event may trigger animation when the state changes, but the map
should render from current state.

------------------------------------------------------------------------

# 234. Event System and Gate Page

The Gate page may show:

``` text
recent Gate events
quest completion feedback
mastery changes
Boss result
```

But the Gate page does not own the event history.

------------------------------------------------------------------------

# 235. Event System and Quest Card

A quest card may trigger:

``` text
completeQuest
```

After success:

``` text
result → card state
```

It should not itself append:

``` text
QUEST_COMPLETED
```

------------------------------------------------------------------------

# 236. Event System and Boss Card

Boss card:

``` text
submit
 ↓
application action
 ↓
progression engine
 ↓
result
```

If successful, display the appropriate completion feedback.

No direct event mutation.

------------------------------------------------------------------------

# 237. Event System and Reflection Form

Reflection form:

``` text
user input
 ↓
saveReflection
 ↓
sanitize
 ↓
state update
```

If an event is recorded by the engine/application, it should be created
there.

The form does not write event history.

------------------------------------------------------------------------

# 238. Event System and Daily Plan Form

Daily plan form:

``` text
edit
 ↓
saveDailyPlan
 ↓
PLAN_SAVED
```

The UI can show:

``` text
Plan saved.
```

after successful completion.

------------------------------------------------------------------------

# 239. Event System and Settings Form

Settings:

``` text
edit
 ↓
updateSettings
 ↓
state update
```

Do not assume a settings event exists.

Only add one if product requirements justify it.

------------------------------------------------------------------------

# 240. Event System and Export UI

Export button:

``` text
exportJourney
 ↓
serialize current valid state
 ↓
download/export
```

The click itself does not need to be a game event.

------------------------------------------------------------------------

# 241. Event System and Import UI

Import:

``` text
select file
 ↓
read
 ↓
parse
 ↓
validate
 ↓
restore
```

The file selection is UI state.

The restored journey is application/domain state.

------------------------------------------------------------------------

# 242. Event System and Reset UI

Reset:

``` text
open confirmation
 ↓
confirm
 ↓
resetJourney
```

Opening the confirmation modal is not an event.

Reset is a destructive state transition.

------------------------------------------------------------------------

# 243. Event System and Security Boundary

User-provided values must not bypass:

``` text
domain validation
```

Examples:

-   quest ID
-   Gate ID
-   date key
-   reflection
-   imported event history
-   daily plan

The application should treat UI values as input, not authority.

------------------------------------------------------------------------

# 244. Event System and Date Validation Risk

The current engine accepts a completion `dateKey` from its caller.

This means the future application boundary should consider:

-   allowed date range
-   accidental backdating
-   future dates
-   consistency with local time

Do not silently invent the final policy.

This is a documented implementation risk.

------------------------------------------------------------------------

# 245. Event System and Time Zones

The current streak system uses local date keys:

``` text
YYYY-MM-DD
```

Therefore event consumers must not arbitrarily convert event dates to
UTC and change the player's apparent day.

Use the domain's local-date semantics.

------------------------------------------------------------------------

# 246. Event System and Daylight Saving

The current implementation uses local date calculations and a fixed
millisecond day difference.

Daylight-saving transitions can make date-gap behavior worth testing.

This is primarily a progression/streak issue, but event display must not
introduce another date interpretation.

------------------------------------------------------------------------

# 247. Event System and Event Ordering During DST

Do not derive streak behavior from UI event timestamps.

Use the progression engine's date logic.

The event system records the accepted result.

------------------------------------------------------------------------

# 248. Event System and Event Count

The current event history cap is 400.

When appending:

``` text
newEvent
```

the engine retains the configured recent history.

The UI should not manually trim or expand it.

------------------------------------------------------------------------

# 249. Event System and Memory

A bounded event history prevents unbounded local-state growth.

Do not attach large payloads to each event.

Especially avoid:

``` text
large reflection
full plan
full Gate object
full state snapshot
```

inside every event.

------------------------------------------------------------------------

# 250. Event System and State Snapshots

Attribute history already stores snapshots.

Do not create full game-state snapshots for every event unless a future
requirement explicitly demands it.

That would greatly increase storage size and complexity.

------------------------------------------------------------------------

# 251. Event System and Event Replay

No replay mechanism is currently required.

If a future feature needs replay/ceremony:

``` text
read event
 ↓
presentation
```

not:

``` text
replay event
 ↓
mutate game state
```

------------------------------------------------------------------------

# 252. Event System and Notifications Queue

A future notification queue may consume progression results.

For example:

``` text
achievement unlocked
      ↓
notification queue
```

This queue would be UI/application state, not necessarily persisted core
event history.

------------------------------------------------------------------------

# 253. Event System and Toast Duplication

Avoid showing the same event twice due to:

-   React StrictMode
-   duplicate subscriptions
-   repeated store selectors
-   route remounting

The underlying event ID/result can help if deduplication is needed.

------------------------------------------------------------------------

# 254. Event System and Derived Notifications

Notifications should be generated from state/result changes, not from
arbitrary UI renders.

Bad:

``` text
component renders
 ↓
show "Gate Unlocked"
```

Good:

``` text
operation returns unlock
 ↓
show "Gate Unlocked"
```

------------------------------------------------------------------------

# 255. Event System and Persistence Notifications

A save confirmation should reflect actual save success.

Bad:

``` text
user clicked save
 ↓
"Saved!"
```

Good:

``` text
save succeeded
 ↓
"Saved."
```

This is especially important for:

-   reflections
-   daily plans
-   settings
-   journey export/import

------------------------------------------------------------------------

# 256. Event System and Error Feedback

If:

``` text
save failed
```

show:

``` text
Could not save your journey.
```

rather than:

``` text
Saved.
```

The state/persistence boundary must remain trustworthy.

------------------------------------------------------------------------

# 257. Event System and Application Boundary

A clean application action can conceptually do:

``` text
function completeQuest(input) {
    const result = progressionEngine.completeQuest(state, input);

    if (result.error) {
        return result;
    }

    updateStore(result.state);
    persist(result.state);

    return result;
}
```

This is conceptual.

Use the actual engine/storage APIs.

Do not copy this blindly into the project.

------------------------------------------------------------------------

# 258. Event System and Pure Functions

Existing progression operations are designed around immutable state
transformation.

This is valuable because:

``` text
same state + same valid input
```

can be reasoned about consistently.

Event creation should remain inside that controlled transformation
boundary where possible.

------------------------------------------------------------------------

# 259. Event System and Deterministic Testing

A pure progression operation makes event testing easier:

``` text
initial state
+
input
=
expected state + expected event
```

No React rendering is required.

------------------------------------------------------------------------

# 260. Event System and Domain Independence

The event system should be usable without React.

This allows:

-   unit tests
-   future CLI tools
-   future backend adapters
-   future migration scripts

without importing UI code.

------------------------------------------------------------------------

# 261. Event System and Dependency Direction

Maintain:

``` text
UI
 ↓
Application
 ↓
Progression/Domain
 ↓
Data
```

Do not allow:

``` text
Domain
 ↓
React
```

or:

``` text
Event model
 ↓
React component
```

------------------------------------------------------------------------

# 262. Event System and Static Content

Event type metadata may be static data.

Gate and quest definitions remain static content.

Player event history remains dynamic state.

Keep these separate.

------------------------------------------------------------------------

# 263. Event System and Domain Model

The Domain Model represents:

``` text
current player state
```

Event History represents:

``` text
recent meaningful occurrences
```

Do not collapse them into one giant object with unclear ownership.

------------------------------------------------------------------------

# 264. Event System and Product Loop

The event system supports the core loop:

``` text
REAL-WORLD ACTION
      ↓
QUEST
      ↓
PROGRESSION
      ↓
EVENT
      ↓
FEEDBACK
      ↓
REFLECTION
      ↓
NEXT ACTION
```

This makes the journey feel alive without changing the underlying rules.

------------------------------------------------------------------------

# 265. Event System and Meaning

Events should reinforce meaningful behavior.

The system should emphasize:

``` text
practice
reflection
consistency
mastery
progress
```

rather than:

``` text
click count
screen time
button usage
```

------------------------------------------------------------------------

# 266. Event System and Gamification Boundary

A game event should correspond to meaningful game progression.

Avoid rewarding:

``` text
opening dashboard 50 times
```

unless a future product requirement explicitly makes that meaningful.

The game is the interface.

The real world is the arena.

------------------------------------------------------------------------

# 267. Event System and No Manipulation

Do not generate fake activity events to increase:

``` text
XP
streak
mastery
achievement progress
```

The progression engine must remain the source of truth.

------------------------------------------------------------------------

# 268. Event System and Honest Progress

The event history should help the player see what actually happened.

This supports:

> The mythology gives the journey meaning. The product gives it
> structure. The progression engine gives it rules. The interface gives
> it presence. The player's real-world actions give it truth.

------------------------------------------------------------------------

# 269. Event System and Player Competition

The player's primary competition is:

``` text
previous self
```

Event history should therefore help the player compare:

``` text
past behavior
vs
current behavior
```

without turning the product into a social ranking system.

------------------------------------------------------------------------

# 270. Event System and Reflection

Reflection events should support private self-observation.

The system should not publicly expose reflection text.

The Journal should respect privacy.

------------------------------------------------------------------------

# 271. Event System and Failure

Failure should be recoverable.

A failed transition should not create a permanent negative player
identity event.

The event system records accepted progress, not shame.

------------------------------------------------------------------------

# 272. Event System and Long-Term Journey

Over time, the event history contributes to a narrative:

``` text
Awakening
  ↓
Gate entry
  ↓
Practice
  ↓
Mastery
  ↓
Achievement
  ↓
Gate completion
  ↓
Arcana progression
```

The narrative is generated from real actions.

------------------------------------------------------------------------

# 273. Event System and Final Sage

The final Sage Gate has no next Gate according to the current unlock
rules.

The event system must not assume a future Arcana beyond Sage.

The final endpoint should follow the product specification.

------------------------------------------------------------------------

# 274. Event System and No Fourth Arcana

Do not create:

``` text
Mythic
Celestial
Ascended
```

as a fourth Arcana merely because the event system needs an endpoint.

The canonical Arcanas are:

``` text
Beast
Human
Sage
```

------------------------------------------------------------------------

# 275. Event System and Final Completion

If the final Sage Gate produces a journey-completion milestone, the
exact event and presentation should be defined explicitly before
implementation.

Do not invent a runtime event name now.

------------------------------------------------------------------------

# 276. Event System and Documentation Discipline

If implementation introduces a new event:

1.  document the event
2.  document its trigger
3.  document its payload
4.  document its consumers
5.  document its persistence behavior
6.  add tests
7.  update this document

Documentation must stay synchronized with code.

------------------------------------------------------------------------

# 277. Event System and Code Review Checklist

Before merging event-related code:

### Source of truth

-   Does the progression engine remain authoritative?

### Event correctness

-   Is the event recorded only after successful processing?

### Payload

-   Is the payload minimal?

### Persistence

-   Is the event stored through the storage abstraction?

### UI

-   Is the UI only consuming the event/result?

### Duplication

-   Is there already an equivalent event?

### Testing

-   Is successful behavior tested?
-   Is failure behavior tested?

------------------------------------------------------------------------

# 278. Event Implementation Checklist

Before implementing any new event:

``` text
[ ] Search repository for existing event
[ ] Inspect event creation
[ ] Inspect event shape
[ ] Identify source action
[ ] Identify domain guard
[ ] Identify state transition
[ ] Identify consumers
[ ] Decide whether persistence is required
[ ] Keep payload small
[ ] Add tests
[ ] Update documentation
```

------------------------------------------------------------------------

# 279. Event Design Decision Tree

When considering a new event, ask:

``` text
Did a meaningful game action occur?
       │
       ├── NO → Do not create core event
       │
       └── YES
             ↓
Does the existing engine already represent it?
             │
             ├── YES → Reuse existing mechanism
             │
             └── NO
                   ↓
Is persistent history actually required?
                   │
                   ├── NO → Use result/UI feedback
                   │
                   └── YES → Add documented event
```

------------------------------------------------------------------------

# 280. Event vs Result Decision

Use a result when:

``` text
information is useful immediately
```

Use an event when:

``` text
historical record is useful later
```

Example:

``` text
level increased
```

may be returned as a result.

If Journal history needs it, it may also become a persistent event.

Do not assume both are always necessary.

------------------------------------------------------------------------

# 281. Event vs State Decision

Use state when:

``` text
the value answers "what is true now?"
```

Use event when:

``` text
the value answers "what happened?"
```

Example:

``` text
current streak = 4
```

is state.

``` text
quest completed yesterday
```

is history/event.

------------------------------------------------------------------------

# 282. Event vs UI State Decision

Use UI state when:

``` text
the value only exists to control presentation
```

Examples:

``` text
toast visible
modal open
animation playing
loading spinner
```

Do not persist these as game events.

------------------------------------------------------------------------

# 283. Event System and Application Readiness

Before event-driven UI work begins, the application needs:

``` text
state/store boundary
```

Then:

``` text
application actions
```

Then:

``` text
event/history consumption
```

This follows the implementation plan.

------------------------------------------------------------------------

# 284. Event System and Current Integration Plan

Recommended sequence:

``` text
Phase 0
Repository foundation
       ↓
Phase 1
State boundary
       ↓
Phase 2
App shell + routing
       ↓
Phase 3
Awakening
       ↓
Phase 4
Dashboard
       ↓
Phase 5
Arcana map
       ↓
Phase 6
Gate experience
       ↓
Phase 7
Quest completion
       ↓
Phase 8
Reflection + Boss
       ↓
Phase 9
Profile + achievements
       ↓
Phase 10
Journal + Analytics
       ↓
Phase 11
Persistence hardening
       ↓
Phase 12
Tests + accessibility
       ↓
Phase 13
Visual polish
```

Event history becomes especially important around:

``` text
Quest completion
Journal
Analytics
```

------------------------------------------------------------------------

# 285. Event System and MVP Scope

For the first vertical slice, do not implement every conceptual event.

A safe MVP can use the existing events/results:

``` text
GATE_ENTERED
PLAN_SAVED
quest completion event
```

plus progression result feedback.

Then expand only when required.

------------------------------------------------------------------------

# 286. Event System and Scope Control

Do not build:

-   event bus framework
-   message queue
-   WebSocket event stream
-   event sourcing
-   CQRS infrastructure
-   distributed event processing

for the current local-first React product.

These are unnecessary complexity.

------------------------------------------------------------------------

# 287. Event Bus Consideration

An internal event bus might appear attractive:

``` text
eventBus.emit(...)
```

but should not be introduced merely to connect components.

The existing progression engine already has state/result/event-history
behavior.

Use the simplest architecture that works.

------------------------------------------------------------------------

# 288. Event Bus Rule

If a future event bus is introduced, it must not replace:

``` text
progression engine
```

or:

``` text
application state
```

It would only coordinate secondary reactions.

------------------------------------------------------------------------

# 289. Event System and Secondary Effects

Possible secondary effects:

``` text
achievement notification
sound
animation
journal refresh
analytics refresh
```

These are appropriate consumers.

Core progression effects must remain in the progression engine.

------------------------------------------------------------------------

# 290. Event System and Sound

Sound may react to:

``` text
quest completion
achievement
level-up
Gate unlock
ascension
```

but sound must not cause progression.

Reduced sound settings should not alter game rules.

------------------------------------------------------------------------

# 291. Event System and Ceremony

Ceremonies may be triggered by results:

``` text
Gate unlock
Arcana ascension
level-up
```

The ceremony is temporary UI state.

It should be dismissible or naturally complete without altering the
underlying state.

------------------------------------------------------------------------

# 292. Event System and Persistence Timing

The application should consider whether to persist before or after UI
feedback.

Safe principle:

``` text
authoritative state update
      ↓
persistence attempt
      ↓
feedback reflecting actual result
```

The exact strategy depends on storage implementation.

Do not falsely report permanent save success.

------------------------------------------------------------------------

# 293. Event System and Local Storage Reliability

Browser localStorage can fail.

Potential causes include:

-   quota limitations
-   unavailable storage
-   malformed existing data
-   browser restrictions

The application should handle persistence errors separately from
progression logic.

------------------------------------------------------------------------

# 294. Event System and Corrupt Event History

If event history is malformed but other state is valid, future
persistence hardening may need a deliberate recovery policy.

Do not silently discard progression without a defined rule.

The current validator is not exhaustive.

------------------------------------------------------------------------

# 295. Event System and Future Migrations

Migration may need to transform:

``` text
old event shape
```

into:

``` text
new event shape
```

If an event cannot be safely migrated:

``` text
reject or quarantine according to explicit policy
```

Do not guess.

------------------------------------------------------------------------

# 296. Event System and Data Integrity

The strongest integrity boundary is:

``` text
input
 ↓
domain validation
 ↓
state transition
 ↓
event
 ↓
persistence
```

Every layer has a defined role.

------------------------------------------------------------------------

# 297. Event System and Student-Friendly Engineering

The architecture should remain understandable.

A beginner developer should be able to trace:

``` text
button
 ↓
store action
 ↓
engine function
 ↓
state result
 ↓
event history
 ↓
UI
```

Avoid abstracting events behind many unnecessary layers.

------------------------------------------------------------------------

# 298. Event System and Maintainability

Good event architecture makes it easy to answer:

``` text
Where was this event created?
Why was it created?
What state changed?
Who consumes it?
Where is it persisted?
```

If those answers are unclear, the event system is too complicated.

------------------------------------------------------------------------

# 299. Event System and Debugging Path

When an event is missing:

``` text
1. Did the UI action fire?
2. Did application action execute?
3. Did domain operation succeed?
4. Did state change?
5. Did engine append event?
6. Did store receive new state?
7. Did persistence save?
8. Is Journal reading correct state?
```

This mirrors the state-machine debugging method.

------------------------------------------------------------------------

# 300. Event System and Debugging Path for False Events

If an event appears unexpectedly:

``` text
1. Find event creation site
2. Identify caller
3. Check whether action can run twice
4. Check React effects/StrictMode
5. Check store action duplication
6. Check persistence reload
7. Check import data
```

Do not immediately change the UI.

------------------------------------------------------------------------

# 301. Event System and StrictMode Safety

Because React StrictMode is enabled, domain operations should not be
placed casually inside mount effects.

Example risk:

``` text
useEffect(() => {
    enterGate(gateId);
}, [gateId]);
```

This could accidentally create repeated domain activity depending on
implementation.

Prefer explicit user actions for meaningful progression.

------------------------------------------------------------------------

# 302. Event System and React Router

Route changes should generally be read-only.

A route:

``` text
/gate/:gateId
```

should resolve Gate data and display state.

An explicit action should call:

``` text
enterGate(gateId)
```

when Gate entry is intended.

------------------------------------------------------------------------

# 303. Event System and Store Subscriptions

Store subscriptions should render state.

They should not create new progression events just because a value
changed.

Bad:

``` text
subscribe(mastery => {
    if (mastery >= 0.7) {
        completeGate();
    }
});
```

The progression engine should already determine Gate completion.

------------------------------------------------------------------------

# 304. Event System and Derived State Effects

Derived state changes should not trigger duplicate domain operations.

For example:

``` text
Gate becomes completed
```

should be the result of the progression engine.

The UI should not see:

``` text
mastery >= threshold
```

and then call:

``` text
completeGate()
```

------------------------------------------------------------------------

# 305. Event System and One-Way Flow

The preferred direction is:

``` text
ACTION
 ↓
ENGINE
 ↓
STATE
 ↓
EVENT
 ↓
UI
```

Avoid circular flows such as:

``` text
UI
 ↓
event
 ↓
store
 ↓
UI
 ↓
event
```

------------------------------------------------------------------------

# 306. Event System and Unidirectional Architecture

A clean application follows:

``` text
User input
   ↓
Action
   ↓
Domain
   ↓
State
   ↓
View
```

Events are history produced during the domain transition.

They do not create a circular command loop.

------------------------------------------------------------------------

# 307. Event System and Domain Events

The term "domain event" may be used conceptually for:

``` text
meaningful state-related occurrence
```

But do not introduce an enterprise-style event framework.

The current project only needs simple persisted event records.

------------------------------------------------------------------------

# 308. Event System and Simplicity

The best event system for the current product is:

``` text
simple
immutable
data-driven
bounded
local-first
testable
```

Not:

``` text
distributed
event-sourced
highly abstract
backend-dependent
```

------------------------------------------------------------------------

# 309. Event System and Future Growth

The architecture should still leave room for:

-   richer Journal
-   analytics
-   cloud sync
-   notifications
-   mobile
-   external integrations

without requiring those systems now.

Use stable boundaries rather than premature infrastructure.

------------------------------------------------------------------------

# 310. Event System and Source-of-Truth Hierarchy

For progression:

``` text
Progression Engine
      ↓
Authoritative State
```

For content:

``` text
Static Catalog
```

For history:

``` text
Event History
```

For presentation:

``` text
React UI
```

For persistence:

``` text
Storage Service
```

Each has a clear role.

------------------------------------------------------------------------

# 311. Event System and Change Management

When product requirements change:

1.  determine whether the change affects world meaning
2.  product behavior
3.  progression rules
4.  data model
5.  state transitions
6.  events
7.  UI

Do not add an event merely because the UI needs a message.

------------------------------------------------------------------------

# 312. Event System and Documentation Change Protocol

If event behavior changes:

``` text
CODE
 ↓
TEST
 ↓
EVENT_SYSTEM.md
 ↓
STATE_MACHINE.md if transitions changed
 ↓
DATA_MODEL.md if schema changed
 ↓
IMPLEMENTATION_PLAN.md if build order changed
```

Keep canonical documents synchronized.

------------------------------------------------------------------------

# 313. Event System and Acceptance Criteria

The Event System is successful when:

-   meaningful domain actions can be traced
-   existing event history remains intact
-   React does not create progression events directly
-   event history stays bounded
-   events describe successful operations
-   invalid actions do not create false success events
-   Journal can consume event history
-   Analytics can consume appropriate historical data
-   state remains authoritative
-   persistence remains behind the storage layer

------------------------------------------------------------------------

# 314. Canonical Event Flow

The core flow is:

``` text
PLAYER
  ↓
ACTION
  ↓
APPLICATION
  ↓
PROGRESSION ENGINE
  ↓
STATE TRANSITION
  ↓
EVENT HISTORY
  ↓
PERSISTENCE
  ↓
UI FEEDBACK
```

------------------------------------------------------------------------

# 315. Canonical Quest Flow

``` text
PLAYER
  ↓
REAL-WORLD PRACTICE
  ↓
COMPLETE QUEST
  ↓
PROGRESSION ENGINE
  ↓
XP / REWARDS / ATTRIBUTES / STREAK / MASTERY
  ↓
QUEST COMPLETION EVENT
  ↓
STORE
  ↓
PERSISTENCE
  ↓
JOURNAL / DASHBOARD / FEEDBACK
```

------------------------------------------------------------------------

# 316. Canonical Gate Flow

``` text
GATE AVAILABLE
  ↓
ENTER GATE
  ↓
GATE_ENTERED
  ↓
7-DAY PRACTICE
  ↓
BOSS
  ↓
MASTERY
  ↓
GATE COMPLETION
  ↓
NEXT GATE UNLOCK
  ↓
UI CEREMONY
```

------------------------------------------------------------------------

# 317. Canonical Plan Flow

``` text
DAILY PLAN
  ↓
SAVE
  ↓
PLAN_SAVED
  ↓
STATE
  ↓
PERSISTENCE
```

------------------------------------------------------------------------

# 318. Canonical History Flow

``` text
MEANINGFUL ACTION
      ↓
DOMAIN ACCEPTS ACTION
      ↓
EVENT CREATED
      ↓
EVENT HISTORY
      ↓
JOURNAL / ANALYTICS
```

------------------------------------------------------------------------

# 319. Canonical Failure Flow

``` text
INVALID ACTION
      ↓
DOMAIN REJECTS
      ↓
ERROR RESULT
      ↓
ORIGINAL VALID STATE PRESERVED
      ↓
UI EXPLAINS FAILURE
```

No false success event.

------------------------------------------------------------------------

# 320. Canonical Success Flow

``` text
VALID ACTION
      ↓
DOMAIN ACCEPTS
      ↓
STATE UPDATED
      ↓
EVENT RECORDED
      ↓
STATE STORED
      ↓
UI FEEDBACK
```

------------------------------------------------------------------------

# 321. Canonical Product Principle

The Event System must support:

> **The game is the interface. The real world is the arena.**

Events should therefore represent meaningful progression rather than
superficial UI interaction.

------------------------------------------------------------------------

# 322. Canonical Engineering Principle

The Event System must support:

> **The UI displays the game. The domain defines the game. The
> progression engine controls the game. Persistence remembers the
> game.**

Events are part of remembering the journey.

They do not control the game.

------------------------------------------------------------------------

# 323. Non-Negotiable Rules

1.  Events do not replace the progression engine.
2.  UI components do not create progression events directly.
3.  Store actions do not duplicate progression logic.
4.  Successful events are created only after successful domain
    processing.
5.  Failed actions must not create false success events.
6.  Event history is not the authoritative game state.
7.  The project is not event-sourced.
8.  Current state should not be reconstructed by replaying events.
9.  Event history remains bounded at the current 400-event limit.
10. Event payloads must remain small and serializable.
11. Reflection data remains private and plain text.
12. Imported events must be validated.
13. Event identifiers must be centralized/consistent if new types are
    introduced.
14. Existing event types must be reused where possible.
15. Do not invent runtime event names without inspecting the repository.
16. `GATE_ENTERED` is an existing confirmed event.
17. `PLAN_SAVED` is an existing confirmed event.
18. Quest completion already records a completion event.
19. Gate unlocking remains owned by the progression engine.
20. Mastery remains owned by the mastery/progression system.
21. Achievements remain owned by the achievement system.
22. Titles remain owned by the title/progression system.
23. Navigation is not an event-producing progression operation by
    itself.
24. Rendering is not an event.
25. Animations are not events.
26. Toasts are not events.
27. Real-world action remains more important than UI interaction.
28. The player's previous self remains the primary competition.
29. Failure is recoverable.
30. The event system must remain understandable and maintainable.

------------------------------------------------------------------------

# 324. Final Definition

> **The MYTHIC LEVELS Event System records meaningful occurrences in the
> player's journey after the authoritative progression/domain system
> accepts an action.**

The player performs an action.

The application requests it.

The progression engine validates and processes it.

The state changes.

The event records what happened.

Persistence remembers it.

The interface presents the result.

The event system gives the journey memory without becoming the system
that controls the journey.

------------------------------------------------------------------------

# 325. Final Architecture

``` text
                    PLAYER
                       │
                       ▼
                REAL-WORLD ACTION
                       │
                       ▼
                     QUEST
                       │
                       ▼
               APPLICATION ACTION
                       │
                       ▼
             PROGRESSION ENGINE
                       │
             ┌─────────┴─────────┐
             │                   │
             ▼                   ▼
        NEW GAME STATE       EVENT RECORD
             │                   │
             └─────────┬─────────┘
                       ▼
                  APPLICATION
                    STATE
                       │
                       ▼
                  PERSISTENCE
                       │
             ┌─────────┴─────────┐
             ▼                   ▼
           DASHBOARD           JOURNAL
             │                   │
             └─────────┬─────────┘
                       ▼
                    PLAYER
```

------------------------------------------------------------------------

# 326. Final Principle

MYTHIC LEVELS should remember the player's journey without pretending
that memory is progression.

``` text
ACTION
  ↓
RULES
  ↓
PROGRESSION
  ↓
STATE
  ↓
EVENT
  ↓
MEMORY
  ↓
FEEDBACK
  ↓
NEXT ACTION
```

The progression engine remains the game.

The event system remembers the game.

The interface reveals the game.

The player's real-world behavior gives the game truth.
