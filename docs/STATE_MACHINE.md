# MYTHIC LEVELS --- STATE MACHINE

**Version:** 1.0\
**Status:** Canonical State Transition Definition\
**Project:** MYTHIC LEVELS\
**Document:** `STATE_MACHINE.md`\
**Purpose:** Define how player and game state is allowed to move from
one meaningful condition to another.

------------------------------------------------------------------------

# 1. Purpose

This document defines the state-transition model for MYTHIC LEVELS.

The Data Model defines **what data exists**.

The Progression document defines **how progression works**.

The State Machine defines **how that data is allowed to change over
time**.

The state machine exists to prevent the application from creating
impossible or contradictory situations such as:

-   completing a locked Gate
-   completing a quest that does not belong to the current Gate
-   completing the same quest repeatedly when the domain rules do not
    allow it
-   completing a Boss Trial before the required progression
-   unlocking a Gate from the React UI
-   marking a Gate complete without the progression engine
-   advancing to a later Gate while the required unlock condition has
    not been satisfied
-   losing historical progress because a player missed a day
-   treating a UI loading state as game progress
-   allowing imported state to bypass domain rules

The state machine is therefore a **rule boundary**, not merely a UI
diagram.

------------------------------------------------------------------------

# 2. Core Principle

MYTHIC LEVELS follows this principle:

> The UI requests transitions.\
> The application coordinates transitions.\
> The progression engine decides valid game-state transitions.\
> Persistence stores the resulting state.

The UI must never become the authority for progression.

Conceptually:

``` text
PLAYER
  │
  ▼
USER ACTION
  │
  ▼
APPLICATION ACTION
  │
  ▼
PROGRESSION ENGINE
  │
  ├── validates transition
  ├── calculates consequences
  ├── creates next state
  └── returns result
  │
  ▼
APPLICATION STATE
  │
  ▼
PERSISTENCE
  │
  ▼
UI REFLECTS NEW STATE
```

------------------------------------------------------------------------

# 3. Relationship With Other Canonical Documents

This document does not replace the other system documents.

The canonical hierarchy is:

``` text
WORLD_DESIGN.md
        │
        ▼
PRODUCT_SPEC.md
        │
        ▼
ARCHITECTURE.md
        │
        ▼
RULES.md
        │
        ▼
PROGRESSION.md
        │
        ▼
DATA_MODEL.md
        │
        ▼
STATE_MACHINE.md
        │
        ▼
IMPLEMENTATION_PLAN.md
        │
        ▼
UI_DESIGN.md
```

The meaning of each document is different.

  Document                   Main question
  -------------------------- --------------------------------------
  `WORLD_DESIGN.md`          What does the Mythic world mean?
  `PRODUCT_SPEC.md`          What does the product do?
  `ARCHITECTURE.md`          Where does each responsibility live?
  `RULES.md`                 What must never be violated?
  `PROGRESSION.md`           How does progression work?
  `DATA_MODEL.md`            What data represents the game?
  `STATE_MACHINE.md`         How may that data transition?
  `IMPLEMENTATION_PLAN.md`   In what order should it be built?
  `UI_DESIGN.md`             How should the system be presented?

When these documents appear to conflict, do not silently invent a
reconciliation.

Inspect the existing implementation and canonical rules first.

------------------------------------------------------------------------

# 4. Important Distinction: Conceptual State vs Implementation State

The state machine contains two levels of description.

## 4.1 Canonical conceptual states

These describe the player's meaningful lifecycle:

``` text
AWAKENING
    ↓
ACTIVE
    ↓
GATE AVAILABLE
    ↓
QUEST PROGRESSION
    ↓
BOSS AVAILABLE
    ↓
BOSS COMPLETED
    ↓
MASTERY EVALUATED
    ↓
GATE COMPLETED
    ↓
NEXT GATE UNLOCKED
    ↓
NEXT GATE AVAILABLE
```

These are **conceptual product states**.

They explain the lifecycle clearly.

## 4.2 Repository implementation state

The current repository may represent these conditions through
combinations of fields rather than one explicit `status` field.

For example, a Gate may be considered current because of:

-   Gate progress
-   completion information
-   unlock information
-   quest completion records
-   mastery information

Therefore:

> Do not add a new `status` property simply because this document uses
> the word "state".

The existing domain model remains authoritative for actual property
names and structures.

------------------------------------------------------------------------

# 5. State Machine Vocabulary

This document uses the following terminology.

## State

A meaningful condition of the system.

Example:

``` text
Gate is unlocked and available.
```

## Transition

A valid movement from one state to another.

Example:

``` text
Gate locked → Gate available
```

## Trigger

The event or application action that requests a transition.

Example:

``` text
Complete previous Gate
```

## Guard

A condition that must be true before a transition is allowed.

Example:

``` text
Previous Gate must be completed.
```

## Effect

The state changes produced after a valid transition.

Example:

``` text
Next Gate becomes unlocked.
```

## Result

Information returned to the application/UI after the operation.

Example:

``` text
XP gained
new level
new achievements
new unlocks
```

## Invalid transition

An attempted transition that violates the domain rules.

------------------------------------------------------------------------

# 6. State Ownership

State ownership must remain explicit.

``` text
┌───────────────────────┐
│ React UI              │
│                       │
│ Displays state        │
│ Requests actions      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Application Actions   │
│                       │
│ Coordinates request   │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Progression Engine    │
│                       │
│ Owns game rules       │
│ Owns transitions      │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Domain State          │
│                       │
│ Represents result     │
└───────────┬───────────┘
            │
            ▼
┌───────────────────────┐
│ Persistence           │
│                       │
│ Stores result         │
└───────────────────────┘
```

### UI owns

-   visual state
-   modal visibility
-   selected tab
-   navigation state
-   form input before submission
-   temporary interaction state

### Application layer owns

-   orchestration
-   calling the correct domain operation
-   updating application state
-   persistence coordination
-   translating domain results into UI-facing results

### Progression engine owns

-   XP
-   level progression
-   rewards
-   attributes
-   mastery
-   streaks
-   Gate completion
-   unlocking
-   achievements
-   titles
-   other existing progression consequences

### Persistence owns

-   saving
-   loading
-   serialization
-   storage adapter behavior

------------------------------------------------------------------------

# 7. Master Player Lifecycle

The player's high-level lifecycle is:

``` text
                    ┌──────────────┐
                    │  AWAKENING   │
                    └──────┬───────┘
                           │
                    create player state
                           │
                           ▼
                    ┌──────────────┐
                    │    ACTIVE    │
                    └──────┬───────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │ GATE AVAILABLE   │
                  └────────┬─────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ QUEST PROGRESSION    │
                └──────────┬───────────┘
                           │
                     required days
                           │
                           ▼
                ┌──────────────────────┐
                │ BOSS AVAILABLE       │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ BOSS COMPLETED       │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ MASTERY EVALUATED    │
                └──────────┬───────────┘
                           │
                      threshold met
                           │
                           ▼
                ┌──────────────────────┐
                │ GATE COMPLETED       │
                └──────────┬───────────┘
                           │
                           ▼
                ┌──────────────────────┐
                │ NEXT GATE UNLOCKED   │
                └──────────┬───────────┘
                           │
                           ▼
                    NEXT GATE
```

This is the primary conceptual lifecycle.

------------------------------------------------------------------------

# 8. Awakening State

Awakening is the entry point into the MYTHIC LEVELS journey.

## 8.1 Purpose

Awakening establishes the initial player identity and creates the
initial game state.

The existing `createInitialState(awakening)` function is the
domain-level authority for this operation.

## 8.2 Conceptual states

``` text
NOT STARTED
     │
     │ valid awakening information
     ▼
AWAKENING READY
     │
     │ initialize
     ▼
ACTIVE JOURNEY
```

These labels are conceptual.

They do not require new database/state fields unless the implementation
explicitly needs them.

## 8.3 Transition guard

Before initialization:

-   awakening input must be valid
-   required player information must be normalized
-   the domain initializer must receive valid input

The application layer should not rely on UI validation alone.

## 8.4 Transition effect

Initialization creates:

-   player state
-   progress state
-   settings
-   initial Gate/progression state
-   other initial domain state required by the existing engine

The exact shape comes from the existing implementation.

## 8.5 Invalid awakening

Examples:

-   missing required name
-   malformed awakening input
-   unsupported values
-   invalid imported initialization data

The application should return an understandable error rather than
allowing an exception to become an uncontrolled UI failure.

------------------------------------------------------------------------

# 9. Active Journey State

After awakening, the player enters the active journey.

The active journey means:

``` text
player state exists
+
progression state exists
+
the system can identify the current progression position
```

The player is not required to be actively completing a quest at every
moment.

Therefore:

``` text
ACTIVE ≠ QUEST IN PROGRESS
```

Active is a broader lifecycle condition.

------------------------------------------------------------------------

# 10. Gate Lifecycle

Every Gate follows the same conceptual lifecycle.

``` text
LOCKED
  │
  │ unlock condition satisfied
  ▼
AVAILABLE
  │
  │ player enters / begins progression
  ▼
IN PROGRESS
  │
  │ required progression completed
  ▼
BOSS AVAILABLE
  │
  │ Boss Trial completed
  ▼
MASTERY READY
  │
  │ mastery evaluation
  ├───────────────┐
  │               │
  │ threshold     │ threshold not met
  │ met           │
  ▼               ▼
COMPLETED       REMAINS IN
  │             CURRENT GATE
  │
  ▼
NEXT GATE
UNLOCKED
```

The exact repository fields may differ.

The lifecycle is the behavioral model.

------------------------------------------------------------------------

# 11. Locked Gate

A locked Gate is not currently available for progression.

The UI may display:

-   lock icon
-   muted presentation
-   required previous Gate
-   unavailable action

The UI must not create or infer the unlock.

The unlock state must come from the progression system.

## Valid transition

``` text
LOCKED → AVAILABLE
```

only when the existing unlock rules say the Gate is unlocked.

## Invalid transition

``` text
LOCKED → QUEST COMPLETED
```

is never valid.

------------------------------------------------------------------------

# 12. Gate Available State

An available Gate is a Gate the player is allowed to enter or progress
through.

The UI may display:

-   Gate title
-   lore
-   archetype
-   attribute focus
-   current status
-   mastery
-   seven-day practice
-   Boss information when appropriate

Availability does not mean completion.

``` text
AVAILABLE ≠ COMPLETED
```

------------------------------------------------------------------------

# 13. Gate In-Progress State

A Gate becomes meaningfully in progress when the player begins working
through its required progression.

The current repository may represent this through quest completion
records and Gate progress rather than an explicit `inProgress` field.

Do not add redundant state without implementation need.

------------------------------------------------------------------------

# 14. Seven-Day Quest Lifecycle

The Gate's canonical seven-stage progression is:

``` text
Day 1 — Recognition
Day 2 — Observation
Day 3 — Practice
Day 4 — Resistance
Day 5 — Application
Day 6 — Challenge
Day 7 — Reflection & Trial
```

The progression sequence is:

``` text
DAY 1
  ↓
DAY 2
  ↓
DAY 3
  ↓
DAY 4
  ↓
DAY 5
  ↓
DAY 6
  ↓
DAY 7
  ↓
BOSS TRIAL
```

This does not mean that every internal implementation field must
literally contain a day state.

The sequence is a product rule.

------------------------------------------------------------------------

# 15. Quest Available

A quest is available when the player is allowed to perform it according
to the current Gate progression rules.

The UI can display:

-   quest title
-   stage
-   description
-   duration
-   XP
-   action control
-   reflection control

The UI must obtain availability from application/domain state.

It must not independently decide:

``` text
if (day === currentDay) ...
```

unless that calculation is explicitly supported by the application
contract.

------------------------------------------------------------------------

# 16. Quest Completion Transition

The central progression transition is:

``` text
QUEST AVAILABLE
        │
        │ completeQuest(...)
        ▼
PROGRESSION ENGINE
        │
        ├── validate quest
        ├── calculate XP
        ├── calculate rewards
        ├── update attributes
        ├── update streak
        ├── update mastery signals
        ├── evaluate achievements
        ├── evaluate titles
        ├── evaluate unlocks
        └── produce new state
        │
        ▼
NEW GAME STATE
```

The existing `completeQuest()` operation is substantial.

React must call it.

React must not recreate it.

------------------------------------------------------------------------

# 17. Quest Completion Guard

Before quest completion, the system must verify the conditions required
by the existing engine.

Conceptually these include:

-   valid quest
-   quest belongs to the expected Gate
-   Gate is available to the player
-   quest has not already been completed when duplicate completion is
    invalid
-   supplied input is valid
-   date information is acceptable according to the domain rules

The exact guard implementation belongs to the existing progression
system.

------------------------------------------------------------------------

# 18. Quest Completion Effects

A valid quest completion may cause multiple changes.

Conceptually:

``` text
QUEST COMPLETED
      │
      ├──► XP
      │      └──► LEVEL
      │
      ├──► REWARDS
      │      └──► RESOURCES
      │
      ├──► ATTRIBUTES
      │
      ├──► STREAK
      │
      ├──► MASTERY SIGNALS
      │
      ├──► ACHIEVEMENTS
      │
      ├──► TITLES
      │
      └──► EVENT HISTORY
```

Therefore the following is **not** the canonical internal sequence:

``` text
Player
↓
Level
↓
XP
↓
Quest
↓
Reward
↓
Attributes
```

The correct conceptual model is:

``` text
PLAYER
  ↓
QUEST / REAL-WORLD ACTION
  ↓
PROGRESSION ENGINE
  ├── XP → LEVEL
  ├── REWARDS → RESOURCES
  ├── ATTRIBUTES
  ├── STREAK
  ├── MASTERY
  ├── ACHIEVEMENTS
  └── TITLES
```

------------------------------------------------------------------------

# 19. Duplicate Quest Completion

A duplicate completion request must be treated according to the existing
domain rules.

The application must not assume that clicking the button twice is
harmless.

Possible invalid result:

``` text
QUEST ALREADY COMPLETED
```

The UI should show meaningful feedback.

It must not manually remove or undo the second request unless an
explicit domain operation exists.

------------------------------------------------------------------------

# 20. Backdating and Date Integrity

Quest completion may accept a date key.

This creates an important state-machine boundary.

The UI must not use a date parameter to bypass progression rules.

Conceptually:

``` text
USER ACTION
     ↓
DATE INPUT
     ↓
DOMAIN VALIDATION
     ↓
VALID COMPLETION
```

not:

``` text
UI chooses any date
     ↓
engine blindly accepts it
```

If the current implementation permits caller-controlled dates, this is
an implementation risk to be addressed through domain validation.

Do not silently invent a new date policy.

------------------------------------------------------------------------

# 21. Reflection State

Reflections are player-generated content.

Conceptually:

``` text
NO REFLECTION
      │
      │ save reflection
      ▼
REFLECTION EXISTS
      │
      ├── update reflection
      │
      └── delete reflection
```

Reflections are not merely decorative text.

They can contribute to progression where the existing mastery system
expects reflection signals.

## Important rule

Reflection text must remain player-controlled content.

It must not be converted into executable HTML or code.

The existing sanitization behavior must be respected.

------------------------------------------------------------------------

# 22. Reflection Transition Rules

Valid conceptual transitions include:

``` text
NO REFLECTION → REFLECTION SAVED
REFLECTION SAVED → REFLECTION UPDATED
REFLECTION SAVED → REFLECTION DELETED
```

An invalid transition is:

``` text
LOCKED GATE → FORCE MASTERY THROUGH UI REFLECTION
```

Reflection cannot bypass progression guards.

------------------------------------------------------------------------

# 23. Boss Trial Lifecycle

The Boss Trial represents the final challenge of a Gate.

Conceptual lifecycle:

``` text
BOSS LOCKED
     │
     │ seven-day progression requirement satisfied
     ▼
BOSS AVAILABLE
     │
     │ player performs Boss Trial
     ▼
BOSS SUBMITTED
     │
     │ valid completion
     ▼
BOSS COMPLETED
```

The exact implementation may represent Boss status through existing Gate
progress rather than explicit status values.

------------------------------------------------------------------------

# 24. Boss Availability Guard

The Boss Trial should not become available merely because the UI decides
to show the button.

Conceptually:

``` text
required seven-day progression
        +
other existing domain requirements
        ↓
BOSS AVAILABLE
```

The product reference uses the rule:

``` text
COMPLETE ALL 7 DAYS FIRST
```

Therefore the UI may visually communicate the guard, but the domain must
enforce it.

------------------------------------------------------------------------

# 25. Boss Completion

A successful Boss completion is a progression event.

Conceptually:

``` text
BOSS AVAILABLE
      │
      │ submit valid Boss result
      ▼
BOSS COMPLETED
      │
      ▼
MASTERY EVALUATION
```

The Boss should not automatically mean Gate completion if the mastery
system requires evaluation.

------------------------------------------------------------------------

# 26. Mastery Evaluation

Gate mastery combines multiple signals.

The canonical architecture specifies:

``` text
Practice       40%
Consistency    20%
Reflection     15%
Boss           25%
```

Canonical threshold:

``` text
70%
```

The progression engine owns the calculation.

The UI may display:

``` text
Mastery: 68%
```

or:

``` text
Mastery: 74%
```

but must not independently calculate the value.

------------------------------------------------------------------------

# 27. Mastery Decision

Conceptually:

``` text
MASTERY READY
      │
      ▼
CALCULATE MASTERY
      │
      ├───────────────┐
      │               │
      ▼               ▼
 >= threshold      < threshold
      │               │
      ▼               ▼
GATE COMPLETED    GATE REMAINS
                  UNCOMPLETED
```

A failed mastery evaluation is not a failure of the entire player
journey.

The player can continue according to the existing progression rules.

The system should not erase completed work merely because the threshold
was not met.

------------------------------------------------------------------------

# 28. Gate Completion

Gate completion is a domain-level progression transition.

Conceptually:

``` text
GATE IN PROGRESS
      +
required progression
      +
Boss completion
      +
mastery threshold
      ↓
GATE COMPLETED
```

The UI must not perform:

``` text
gate.completed = true
```

as its own business rule.

The progression engine must produce the completed state.

------------------------------------------------------------------------

# 29. Gate Completion Effects

A completed Gate may trigger:

-   Gate completion record
-   mastery result
-   XP
-   rewards
-   achievements
-   titles
-   next Gate unlock
-   event history
-   other existing progression effects

The exact effects must remain aligned with the existing implementation.

------------------------------------------------------------------------

# 30. Unlock Transition

The canonical Gate sequence is linear:

``` text
Beast 01
  ↓
Beast 02
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
...
  ↓
Sage 09
```

Unlocking belongs to the progression system.

The UI only visualizes:

``` text
LOCKED
AVAILABLE
CURRENT
IN PROGRESS
COMPLETED
```

The UI must never decide:

``` text
if previousGateCompleted:
    unlockNextGate()
```

That logic belongs to the existing unlock service.

------------------------------------------------------------------------

# 31. Arcana Transition

The three canonical Arcanas are:

``` text
BEAST
HUMAN
SAGE
```

The conceptual Arcana progression is:

``` text
BEAST 01 → ... → BEAST 09
                    ↓
                 HUMAN 01
                    ↓
              ... → HUMAN 09
                    ↓
                  SAGE 01
                    ↓
               ... → SAGE 09
```

An Arcana transition should occur through the established Gate
unlock/completion system.

The UI should not manually switch the player's Arcana.

------------------------------------------------------------------------

# 32. Arcana Transition Guard

Conceptually:

``` text
CURRENT ARCANA FINAL GATE COMPLETED
        +
UNLOCK RULE SATISFIED
        ↓
NEXT ARCANA FIRST GATE UNLOCKED
```

The exact implementation must remain authoritative.

------------------------------------------------------------------------

# 33. Missing a Day

Missing a day is not equivalent to resetting the journey.

Canonical rule:

> Missing a day does not erase historical progress.

Therefore:

``` text
ACTIVE JOURNEY
     │
     │ player misses a day
     ▼
RETURNING JOURNEY
     │
     ▼
CONTINUE EXISTING PROGRESS
```

The streak may change according to the streak rules.

Historical Gate/quest progress must not be erased merely because the
player missed a calendar day.

------------------------------------------------------------------------

# 34. Streak State

Streak is a progression signal, not the player's entire progression
state.

Conceptually:

``` text
ACTIVE
  │
  ├── activity today → streak maintained/increased
  │
  └── missed day → streak interruption according to rules
```

Important:

``` text
streak ≠ total progress
```

A broken streak must not automatically mean:

``` text
reset all Gates
reset XP
reset achievements
reset mastery
reset player
```

unless a future explicitly documented rule says so.

------------------------------------------------------------------------

# 35. Return After Interruption

A returning player should be treated as returning to the journey.

Conceptually:

``` text
PLAYER ACTIVE
      ↓
TIME PASSES
      ↓
PLAYER RETURNS
      ↓
LOAD SAVED STATE
      ↓
RESTORE EXISTING PROGRESS
      ↓
CONTINUE
```

The player should not be forced to repeat already completed work simply
because the calendar changed.

------------------------------------------------------------------------

# 36. XP and Level Transition

XP contributes to level progression.

Conceptually:

``` text
QUEST / PROGRESSION EVENT
        ↓
XP AWARDED
        ↓
TOTAL XP
        ↓
LEVEL EVALUATION
        ↓
LEVEL MAY INCREASE
```

The exact XP scaling remains defined by the progression engine.

The architecture specifies:

-   Level 1 is the starting level.
-   The first level boundary uses 200 XP.
-   Later levels use the existing scaling logic.
-   Difficulty multipliers may affect earned XP.

Do not duplicate these calculations in React.

------------------------------------------------------------------------

# 37. XP and Level Are Not Sequential Game Stages

Avoid representing progression as:

``` text
PLAYER
↓
LEVEL
↓
XP
↓
QUEST
```

This is misleading.

The correct relationship is:

``` text
PLAYER
  ↓
REAL-WORLD ACTION / QUEST
  ↓
PROGRESSION ENGINE
  ├── XP
  │    └── LEVEL
  ├── REWARDS
  ├── ATTRIBUTES
  ├── MASTERY
  ├── STREAK
  ├── ACHIEVEMENTS
  └── TITLES
```

This distinction is important for both implementation and documentation.

------------------------------------------------------------------------

# 38. Achievement Transitions

Achievements are evaluated as consequences of progression.

Conceptually:

``` text
CURRENT STATE
     │
     │ progression event
     ▼
ACHIEVEMENT EVALUATION
     │
     ├── condition false → no change
     │
     └── condition true
             ↓
        ACHIEVEMENT UNLOCKED
```

The achievement service owns the evaluation.

The UI displays the result.

------------------------------------------------------------------------

# 39. Title Transitions

Titles follow the same pattern.

``` text
PROGRESSION EVENT
       ↓
TITLE EVALUATION
       ↓
AVAILABLE TITLES
       ↓
PLAYER SELECTS/USES TITLE
```

The UI should not decide that a player has earned a title.

The progression/domain layer must determine eligibility.

------------------------------------------------------------------------

# 40. Daily Plan State

Daily plans are separate from core Gate completion.

Conceptually:

``` text
NO PLAN
   │
   │ generate
   ▼
PLAN AVAILABLE
   │
   ├── edit
   └── complete/use
```

The daily-plan service owns generation.

The UI displays and edits through the application layer.

Daily plans must not silently become a second progression engine.

------------------------------------------------------------------------

# 41. Persistence State Machine

Persistence has its own lifecycle.

``` text
APPLICATION START
      │
      ▼
LOADING
      │
      ├───────────────┐
      │               │
      ▼               ▼
VALID STATE       NO VALID STATE
      │               │
      ▼               ▼
RESTORE STATE    INITIALIZE STATE
      │               │
      └───────┬───────┘
              ▼
            READY
              │
              ▼
          SAVE CHANGES
```

Possible persistence outcomes:

``` text
LOADING
READY
LOAD ERROR
SAVE ERROR
```

These are application/UI states.

They are not game progression states.

------------------------------------------------------------------------

# 42. Persistence Failure

A storage failure must not be treated as a game-state transition.

For example:

``` text
Quest completed
      ↓
Persistence write fails
```

This is an application reliability problem.

The application must handle it intentionally.

It must not silently tell the player:

``` text
Everything saved.
```

when persistence has actually failed.

The exact recovery mechanism should follow the storage architecture.

------------------------------------------------------------------------

# 43. Import State Machine

Importing a saved journey must pass validation.

Conceptually:

``` text
IMPORT FILE
    ↓
READ DATA
    ↓
PARSE
    ↓
VALIDATE
    │
    ├── invalid → REJECT
    │
    └── valid
          ↓
     RESTORE STATE
          ↓
        READY
```

Never:

``` text
IMPORT JSON
   ↓
TRUST JSON
   ↓
REPLACE STATE
```

Imported state is untrusted input.

------------------------------------------------------------------------

# 44. Import Validation

Validation should protect against:

-   malformed JSON
-   missing required state
-   invalid types
-   invalid progression references
-   impossible Gate references
-   invalid quest references
-   invalid resource values
-   incompatible schema versions
-   corrupted progression state

The exact validation implementation belongs to the persistence/domain
boundary.

------------------------------------------------------------------------

# 45. Reset State

Resetting the journey is a destructive application operation.

Conceptually:

``` text
ACTIVE JOURNEY
      │
      │ explicit reset
      ▼
RESET CONFIRMATION
      │
      │ confirmed
      ▼
INITIAL STATE
```

Reset must be explicit.

The UI should not accidentally reset the player's journey through
navigation or refresh.

------------------------------------------------------------------------

# 46. UI State vs Game State

This distinction is mandatory.

## UI state

Examples:

``` text
isModalOpen
selectedTab
isSidebarOpen
isSubmitting
toastVisible
currentRoute
```

## Game state

Examples:

``` text
player
progress
Gate progress
quest completion
XP
level
attributes
mastery
streak
achievements
titles
reflections
event history
```

UI state may be owned by React/Zustand.

Game state must remain governed by the domain/progression architecture.

------------------------------------------------------------------------

# 47. Navigation Is Not Progression

Opening a route does not necessarily change game state.

For example:

``` text
/go/gate/beast-01
```

or:

``` text
/gate/beast-01
```

may display a Gate.

It must not automatically mean:

``` text
Gate started
```

unless an explicit domain/application action defines that transition.

Navigation and progression are different concerns.

------------------------------------------------------------------------

# 48. Refresh Is Not a Reset

A browser refresh must not restart the journey.

Conceptually:

``` text
READY
  │
  │ browser refresh
  ▼
LOADING
  │
  ▼
RESTORE SAVED STATE
  │
  ▼
READY
```

This is why persistence must remain outside individual components.

------------------------------------------------------------------------

# 49. Browser Tab / Re-render Safety

A React re-render is not a progression transition.

These events must not change game state by themselves:

-   component render
-   route render
-   state selector update
-   window resize
-   responsive breakpoint
-   opening a modal
-   closing a modal
-   navigating between tabs
-   browser refresh followed by successful restoration

Progression should occur only through explicit application/domain
actions.

------------------------------------------------------------------------

# 50. Invalid Transition Model

Every meaningful transition should be considered in terms of:

``` text
CURRENT STATE
      +
REQUEST
      +
GUARDS
      ↓
VALID?
  ├── NO → ERROR / NO STATE CHANGE
  └── YES
       ↓
     EFFECTS
       ↓
   NEW STATE
```

An invalid transition must not partially mutate the game.

Conceptually:

``` text
invalid request
     ↓
reject
     ↓
preserve previous valid state
```

------------------------------------------------------------------------

# 51. Atomicity Principle

A progression action should behave conceptually like:

``` text
oldState + action
       ↓
validation
       ↓
newState + result
```

Not:

``` text
change XP
change mastery
change streak
error
leave state half-updated
```

Existing immutable progression behavior should be preserved.

This is especially important for:

-   quest completion
-   reflections
-   Gate progression
-   achievements
-   titles
-   streaks
-   unlocks

------------------------------------------------------------------------

# 52. Transition Ownership Matrix

  -----------------------------------------------------------------------
  Transition            UI requests        Application      Engine/domain
                                           coordinates            decides
  -------------- ------------------ ------------------ ------------------
  Awakening                     Yes                Yes                Yes

  Enter Gate                    Yes                Yes    Yes where rules
                                                                    apply

  Complete quest                Yes                Yes                Yes

  Save                          Yes                Yes                Yes
  reflection                                           

  Complete Boss                 Yes                Yes                Yes

  Evaluate           No direct rule                Yes                Yes
  mastery                                              

  Complete Gate  No direct mutation                Yes                Yes

  Unlock Gate                    No     No direct rule                Yes

  Award XP                       No     No direct rule                Yes

  Update level                   No     No direct rule                Yes

  Update streak                  No     No direct rule                Yes

  Unlock                         No     No direct rule                Yes
  achievement                                          

  Earn title                     No     No direct rule                Yes

  Save state               Indirect                Yes                N/A

  Load state               Indirect                Yes                N/A
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 53. Transition Guard Principles

Guards should be:

1.  deterministic
2.  centralized
3.  testable
4.  domain-owned where they affect game rules
5.  independent from React rendering
6.  resistant to invalid UI input
7.  consistent with persisted state

A UI guard may improve user experience.

A UI guard must never be the only protection for a domain rule.

------------------------------------------------------------------------

# 54. Recommended Application Action Pattern

Application actions should conceptually follow:

``` text
action(input)
   │
   ▼
normalize/validate input
   │
   ▼
call domain/progression operation
   │
   ├── error → expose error
   │
   └── success
         ↓
     update store
         ↓
     persist state
         ↓
     expose result
```

Example:

``` text
completeQuest(questId)
```

Conceptually:

``` text
UI
 ↓
store/action
 ↓
completeQuest(...)
 ↓
newState + result
 ↓
store update
 ↓
storage save
 ↓
UI re-renders
```

------------------------------------------------------------------------

# 55. Store Responsibility

The Zustand store should act as an application-state adapter.

It should provide:

-   current game state
-   initialization status
-   loading/error status
-   UI-facing selectors/actions
-   calls into progression/domain services
-   persistence coordination

It should not become a second progression engine.

Bad:

``` text
store.completeQuest = () => {
    xp += 20;
    mastery += 5;
    streak += 1;
}
```

Good:

``` text
store.completeQuest = (questId) => {
    const result = progressionEngine.completeQuest(...);
    // store resulting state
}
```

The exact implementation should follow repository exports.

------------------------------------------------------------------------

# 56. State Transition Result

A useful application-level result may conceptually contain:

``` text
success
new state
XP gained
rewards
level change
mastery change
achievement unlocks
title changes
Gate unlocks
streak information
error information
```

However:

> Do not add a result field merely because this document mentions it.

Use the actual return shape of the existing engine where available.

If the engine currently returns less information, the application layer
should work with that contract rather than inventing a parallel domain
API.

------------------------------------------------------------------------

# 57. Gate Visual States

The UI may map domain state to visual states:

``` text
LOCKED
AVAILABLE
CURRENT
IN PROGRESS
COMPLETED
```

These are presentation categories.

They are not permission for the UI to create the underlying progression
state.

Example:

``` text
domain says unlocked
      ↓
UI displays AVAILABLE
```

not:

``` text
UI thinks it should be available
      ↓
domain becomes unlocked
```

------------------------------------------------------------------------

# 58. Quest Visual States

A quest UI may display states such as:

``` text
LOCKED
AVAILABLE
IN PROGRESS
COMPLETED
```

Again, these are derived from domain/application state.

The component should not become the source of truth.

------------------------------------------------------------------------

# 59. Boss Visual States

The Boss UI may display:

``` text
LOCKED
AVAILABLE
SUBMITTING
COMPLETED
ERROR
```

`SUBMITTING` and `ERROR` may be application/UI states.

`LOCKED`, `AVAILABLE`, and `COMPLETED` must reflect the game state.

------------------------------------------------------------------------

# 60. Loading State

Application initialization may use:

``` text
LOADING
```

This is not a game progression state.

Example:

``` text
APP START
   ↓
LOADING
   ↓
LOAD/INITIALIZE
   ↓
READY
```

During `LOADING`, progression controls should not accidentally operate
against undefined state.

------------------------------------------------------------------------

# 61. Error State

Errors should be categorized.

Conceptually:

``` text
INPUT ERROR
DOMAIN ERROR
LOCKED ACTION
DUPLICATE ACTION
PERSISTENCE ERROR
IMPORT ERROR
UNEXPECTED ERROR
```

The application should preserve valid game state when an operation
fails.

------------------------------------------------------------------------

# 62. Failure Recovery

MYTHIC LEVELS follows a recoverable failure philosophy.

Failure should generally mean:

``` text
operation rejected
+
player receives explanation
+
valid previous state remains
```

It should not mean:

``` text
player loses the entire journey
```

unless an explicit destructive action such as reset has been confirmed.

------------------------------------------------------------------------

# 63. Transition Invariants

The following invariants must hold.

## Invariant 1

A locked Gate cannot be legitimately completed.

## Invariant 2

The UI cannot directly unlock a Gate.

## Invariant 3

The UI cannot directly award XP.

## Invariant 4

The UI cannot directly set mastery.

## Invariant 5

The UI cannot directly mark a Gate completed.

## Invariant 6

Boss availability must respect its progression guard.

## Invariant 7

Quest completion must go through the progression/domain system.

## Invariant 8

Missing a day does not erase historical progress.

## Invariant 9

Persistence failure must not be silently presented as successful
persistence.

## Invariant 10

Imported state must be validated.

## Invariant 11

Navigation does not automatically equal progression.

## Invariant 12

UI re-rendering does not equal progression.

## Invariant 13

Invalid transitions must not leave partially mutated game state.

## Invariant 14

The 27-Gate progression remains data-driven.

## Invariant 15

Progression logic must not be duplicated across Gate components.

------------------------------------------------------------------------

# 64. Seven-Day Transition Matrix

  -----------------------------------------------------------------------
  Current           Action            Guard             Result
  conceptual state                                      
  ----------------- ----------------- ----------------- -----------------
  Gate available    Start progression Gate unlocked     Gate progression
                                                        begins

  Quest available   Complete quest    Valid             Quest
                                      quest/action      completion +
                                                        progression
                                                        effects

  Quest completed   Repeat same quest Existing          Reject or apply
                                      duplicate rule    documented
                                                        behavior

  Day 1 complete    Continue          Existing          Day 2 becomes
                                      progression rules relevant

  Day 2 complete    Continue          Existing          Day 3 becomes
                                      progression rules relevant

  Day 3 complete    Continue          Existing          Day 4 becomes
                                      progression rules relevant

  Day 4 complete    Continue          Existing          Day 5 becomes
                                      progression rules relevant

  Day 5 complete    Continue          Existing          Day 6 becomes
                                      progression rules relevant

  Day 6 complete    Continue          Existing          Day 7 becomes
                                      progression rules relevant

  Day 7 complete    Continue          Seven-day         Boss becomes
                                      requirement       eligible

  Boss locked       Attempt Boss      Guard false       Reject

  Boss available    Complete Boss     Valid Boss action Boss completed

  Boss completed    Evaluate mastery  Required signals  Mastery result

  Mastery below     Continue          Recovery rules    Gate remains
  threshold                                             incomplete

  Mastery meets     Complete Gate     All requirements  Gate completed
  threshold                           met               

  Gate completed    Unlock next       Unlock rule       Next Gate
                                                        unlocked
  -----------------------------------------------------------------------

------------------------------------------------------------------------

# 65. Gate Transition Matrix

  State                Allowed transition    Trigger
  -------------------- --------------------- ---------------------------------
  Locked               Available             Unlock condition
  Available            In Progress           Valid player progression action
  In Progress          Quest Completed       Valid quest completion
  In Progress          Boss Available        Required seven-day progression
  Boss Available       Boss Completed        Valid Boss completion
  Boss Completed       Mastery Evaluated     Mastery calculation
  Mastery Evaluated    Gate Completed        Threshold satisfied
  Gate Completed       Next Gate Unlocked    Unlock service
  Next Gate Unlocked   Next Gate Available   Application/domain state

------------------------------------------------------------------------

# 66. Arcana Transition Matrix

  -----------------------------------------------------------------------
  Current                 Condition               Next
  ----------------------- ----------------------- -----------------------
  Beast 01--08            Previous Gate           Next Beast Gate
                          completion              

  Beast 09                Final Beast             Human 01
                          requirements            

  Human 01--08            Previous Gate           Next Human Gate
                          completion              

  Human 09                Final Human             Sage 01
                          requirements            

  Sage 01--08             Previous Gate           Next Sage Gate
                          completion              

  Sage 09                 Final Sage requirements Journey endpoint
                                                  defined by product
  -----------------------------------------------------------------------

The final Sage behavior must follow the actual product specification.

Do not invent a fourth Arcana.

------------------------------------------------------------------------

# 67. Event Ordering

A progression event should conceptually follow this ordering:

``` text
USER ACTION
    ↓
INPUT VALIDATION
    ↓
DOMAIN GUARD
    ↓
PROGRESSION OPERATION
    ↓
STATE TRANSFORMATION
    ↓
DERIVED CONSEQUENCES
    ↓
APPLICATION STATE UPDATE
    ↓
PERSISTENCE
    ↓
UI FEEDBACK
```

The exact internal order inside the progression engine is
implementation-specific.

The important rule is that the UI must not duplicate the consequences.

------------------------------------------------------------------------

# 68. State Machine and Event History

Meaningful progression changes may be represented in event history.

Examples include:

-   quest completion
-   reward
-   level change
-   achievement unlock
-   title unlock
-   Gate completion
-   Gate unlock
-   Boss completion

Event history should describe what happened.

It should not become an alternative source of truth for progression
unless explicitly designed that way.

------------------------------------------------------------------------

# 69. Derived State

Some values may be derived rather than independently authoritative.

Examples:

``` text
current Gate
Gate visual status
progress percentages
analytics summaries
dashboard summaries
displayed mastery percentage
```

Derived values should be computed from authoritative state or provided
by the domain/application layer.

Avoid storing duplicate representations that can drift apart.

------------------------------------------------------------------------

# 70. Authoritative State

The authoritative state consists of the existing domain state
structures.

Examples include:

-   player
-   progress
-   Gate progress
-   quest completion records
-   mastery signals
-   reflections
-   achievements
-   titles
-   event history
-   settings
-   persisted state

The exact schema remains defined by `DATA_MODEL.md` and the repository
implementation.

------------------------------------------------------------------------

# 71. State Machine and Persistence Schema

Persistence must preserve enough information to reconstruct the player's
valid progression state.

Conceptually:

``` text
GAME STATE
   ↓
SERIALIZE
   ↓
STORAGE
   ↓
LOAD
   ↓
VALIDATE
   ↓
RESTORE
   ↓
GAME STATE
```

A serialized state is not automatically trustworthy simply because it
was produced by the application previously.

Validation still applies.

------------------------------------------------------------------------

# 72. Schema Versioning

The current persistence key is:

``` text
mythic-levels:v1
```

Schema evolution should be handled deliberately.

If the data model changes incompatibly:

``` text
OLD STATE
   ↓
VERSION DETECTION
   ↓
MIGRATION / REJECTION
   ↓
CURRENT STATE
```

Do not silently reinterpret old data.

Migration support should be added when the product actually requires it.

------------------------------------------------------------------------

# 73. State Machine and Testing

State-machine testing should focus on transitions, not just visual
rendering.

Important tests include:

### Awakening

-   valid awakening initializes state
-   invalid awakening is rejected

### Gates

-   locked Gate cannot be completed
-   valid Gate progression works
-   completed Gate remains completed

### Quests

-   valid quest completion updates progression
-   invalid quest is rejected
-   duplicate completion follows the documented rule

### Boss

-   Boss cannot be completed early
-   Boss can be completed when eligible

### Mastery

-   mastery calculation uses the progression system
-   threshold behavior is correct

### Unlocks

-   completing a Gate unlocks the correct next Gate
-   UI cannot bypass unlocks

### Streak

-   activity updates streak according to existing rules
-   missed day does not erase historical progress

### Persistence

-   state survives reload
-   invalid import is rejected
-   save failure is surfaced

### Reset

-   reset requires explicit action
-   reset returns to valid initial state

------------------------------------------------------------------------

# 74. Transition Test Format

Each important transition should be testable as:

``` text
GIVEN
    current state

WHEN
    action is requested

AND
    guard conditions are satisfied

THEN
    new state is produced

AND
    expected consequences are present
```

For invalid transitions:

``` text
GIVEN
    current state

WHEN
    invalid action is requested

THEN
    operation is rejected

AND
    previous valid state remains intact
```

------------------------------------------------------------------------

# 75. Example Valid Quest Transition

``` text
GIVEN
    Beast 01 is available
    Day 1 quest is available

WHEN
    player completes Day 1

THEN
    progression engine processes completion

AND
    XP/reward/progression consequences are calculated

AND
    mastery signals are updated where applicable

AND
    state is persisted through the application layer

AND
    UI reflects the new state
```

The UI does not calculate the reward.

------------------------------------------------------------------------

# 76. Example Invalid Boss Transition

``` text
GIVEN
    Beast 01 is in progress
    not all required seven-day progression is complete

WHEN
    player attempts Boss Trial

THEN
    Boss completion is rejected

AND
    Gate is not marked completed

AND
    mastery is not falsely advanced

AND
    existing valid state remains intact

AND
    UI explains why the Boss is unavailable
```

------------------------------------------------------------------------

# 77. Example Gate Completion Transition

``` text
GIVEN
    all required Gate progression is complete
    Boss Trial is complete
    mastery meets the canonical threshold

WHEN
    progression engine evaluates Gate completion

THEN
    Gate becomes completed

AND
    completion consequences are processed

AND
    next Gate unlock logic is evaluated

AND
    application state receives the resulting state
```

------------------------------------------------------------------------

# 78. Example Missed-Day Transition

``` text
GIVEN
    player has historical Gate progress

WHEN
    player does not perform a quest on a day

THEN
    historical progress remains

AND
    streak behavior follows the streak rules

AND
    the player can return to the journey

AND
    completed work is not deleted
```

------------------------------------------------------------------------

# 79. What React Must Never Do

React components must never become the progression engine.

Avoid code that directly performs:

``` text
xp += 20
mastery += 10
streak += 1
gate.completed = true
gate.unlocked = true
level += 1
achievement.unlocked = true
```

These are domain/progression responsibilities.

React should instead request an operation.

------------------------------------------------------------------------

# 80. What Zustand Must Never Become

Zustand should not become a second domain engine.

Avoid:

``` text
store calculates mastery
store calculates Gate unlock
store calculates XP
store decides Boss eligibility
store independently implements streak rules
```

Preferred:

``` text
Zustand
   ↓
application action
   ↓
existing domain/progression service
   ↓
new state
```

------------------------------------------------------------------------

# 81. What Persistence Must Never Do

Persistence must not decide progression.

It should not say:

``` text
if quest count >= 7:
    unlock Gate
```

Persistence stores state.

Progression creates state.

------------------------------------------------------------------------

# 82. What Static Data Must Never Do

Static Gate/quest data defines content.

It must not mutate player progress.

For example:

``` text
src/data/gates.js
```

may define:

-   title
-   lore
-   archetype
-   quote
-   quests
-   XP values
-   Boss definition

It must not directly modify:

``` text
player.progress
player.mastery
player.level
```

------------------------------------------------------------------------

# 83. Data-Driven Gate State Machine

All 27 Gates should use the same transition architecture.

Do not create:

``` text
Gate01.jsx
Gate02.jsx
Gate03.jsx
...
Gate27.jsx
```

as separate business-rule implementations.

Prefer:

``` text
GatePage
   ↓
gateId
   ↓
Gate catalog
   ↓
Gate progress
   ↓
reusable progression UI
```

The Gate identity comes from data.

The transition rules come from the progression system.

------------------------------------------------------------------------

# 84. State Machine and the 27 Gates

Canonical sequence:

``` text
BEAST
├── 01
├── 02
├── 03
├── 04
├── 05
├── 06
├── 07
├── 08
└── 09

HUMAN
├── 01
├── 02
├── 03
├── 04
├── 05
├── 06
├── 07
├── 08
└── 09

SAGE
├── 01
├── 02
├── 03
├── 04
├── 05
├── 06
├── 07
├── 08
└── 09
```

All Gates share the same fundamental lifecycle.

Their content and symbolic meaning differ.

------------------------------------------------------------------------

# 85. State Machine and Player Agency

The state machine should support player agency without allowing rule
bypass.

The player decides:

-   whether to perform the real-world action
-   what they write in reflections
-   when they return
-   what meaningful effort they make
-   how they interact with the journey

The system decides:

-   whether an action satisfies progression rules
-   how XP is awarded
-   whether mastery requirements are met
-   which Gate is unlocked
-   which achievements are earned

This preserves the product principle:

> The player's real-world actions give the system its truth.

------------------------------------------------------------------------

# 86. State Machine and Failure Philosophy

Failure is not a shame state.

A rejected transition means:

``` text
"This action is not valid yet."
```

not:

``` text
"You are a failure."
```

The interface should explain the next meaningful action where possible.

The state machine protects consistency.

It should not punish the player with unnecessary data loss.

------------------------------------------------------------------------

# 87. State Machine and Mythology

The state machine is technical underneath the mythic presentation.

The UI may describe:

``` text
Gate
Trial
Mastery
Unlock
Arcana
Beast
Human
Sage
```

But the underlying system remains deterministic software.

The mythology provides meaning.

It does not replace the state rules.

------------------------------------------------------------------------

# 88. Security and Trust Boundary

The browser is not a trusted authority for game-state rules.

Even in a local-first application:

``` text
UI input
   ↓
application boundary
   ↓
domain validation
   ↓
state transition
```

Imported state and user-provided values must be treated as untrusted
input.

The system should validate before accepting state changes.

------------------------------------------------------------------------

# 89. Current Repository Mapping

Based on the current architecture, the following existing areas are
important:

``` text
src/config/
src/domain/
src/data/
src/services/progression/
src/services/quests/
src/services/storage/
src/utils/
```

The progression engine already contains substantial functionality for:

-   initial state creation
-   quest completion
-   XP
-   attributes
-   mastery
-   unlocking
-   streaks
-   achievements
-   titles
-   reflections
-   daily plans
-   event history
-   persistence-related workflows

Therefore the State Machine is primarily a **documentation and
integration contract**.

It is not permission to rewrite those systems.

------------------------------------------------------------------------

# 90. Current Implementation Gap

The major gap is not the absence of progression logic.

The major gap is connecting that logic to React safely.

Current conceptual architecture:

``` text
EXISTING DOMAIN
      │
      ├── progression
      ├── data
      ├── persistence
      └── utilities
             │
             │ integration gap
             ▼
       REACT STARTER
```

Target:

``` text
REACT UI
    ↓
STORE / APPLICATION ACTIONS
    ↓
EXISTING DOMAIN + PROGRESSION ENGINE
    ↓
STATE
    ↓
PERSISTENCE
```

The state machine describes the transitions across this bridge.

------------------------------------------------------------------------

# 91. Implementation Rule

When implementing a transition:

1.  inspect the existing function
2.  inspect its input
3.  inspect its return value
4.  inspect its error behavior
5.  identify the state it changes
6.  identify its persistence behavior
7.  connect the UI to it
8.  do not rewrite the business logic in React
9.  test the transition
10. verify the persisted result

This follows the project's change-safety rule:

> Make the smallest coherent change.

------------------------------------------------------------------------

# 92. State Machine Implementation Priority

The recommended implementation order is:

``` text
1. Application initialization
2. Store/state boundary
3. Awakening
4. Gate display
5. Quest display
6. Quest completion
7. Progression feedback
8. Reflection
9. Boss Trial
10. Mastery display
11. Gate completion
12. Unlock display
13. Dashboard aggregation
14. Journal
15. Analytics
16. Profile
17. Persistence hardening
18. Testing
19. Accessibility
20. Visual polish
```

Do not implement later transitions before the earlier state boundary is
reliable.

------------------------------------------------------------------------

# 93. Transition Debugging Method

When a transition does not work, inspect in this order:

``` text
1. UI action fired?
        ↓
2. Application action called?
        ↓
3. Correct input passed?
        ↓
4. Domain/progression function called?
        ↓
5. Guard passed?
        ↓
6. New state returned?
        ↓
7. Store updated?
        ↓
8. Persistence succeeded?
        ↓
9. UI subscribed to correct state?
```

This avoids debugging the wrong layer.

------------------------------------------------------------------------

# 94. Common State Machine Mistakes

## Mistake 1 --- UI-owned progression

``` text
onClick={() => setMastery(100)}
```

Wrong.

## Mistake 2 --- Store-owned progression

``` text
completeQuest: () => {
  set({ xp: xp + 20 });
}
```

Wrong if the existing engine already owns the rule.

## Mistake 3 --- Navigation-owned progression

``` text
navigate("/gate/02");
unlockGate(02);
```

Wrong.

## Mistake 4 --- Persistence-owned progression

``` text
loadState();
if (completedDays.length === 7) {
  unlockBoss();
}
```

Wrong.

## Mistake 5 --- Duplicate Gate logic

Each Gate should not implement its own business rules.

------------------------------------------------------------------------

# 95. State Machine Review Checklist

Before accepting a feature, ask:

### Transition

-   What state does it start from?
-   What action triggers it?
-   What guard allows it?
-   What state does it produce?
-   What side effects occur?

### Ownership

-   Is the UI only requesting the action?
-   Is the progression engine still authoritative?
-   Is Zustand only coordinating state?
-   Is persistence only storing state?

### Safety

-   Can the action be duplicated?
-   Can a locked state be bypassed?
-   Can invalid imported data create impossible state?
-   Can persistence failure be detected?
-   Can a failed operation partially mutate state?

### UX

-   Is loading represented?
-   Is success represented?
-   Is failure understandable?
-   Is the next valid action clear?

------------------------------------------------------------------------

# 96. Canonical State Transition Summary

The entire product can be summarized as:

``` text
AWAKENING
    ↓
ACTIVE PLAYER
    ↓
GATE AVAILABLE
    ↓
7-DAY QUEST PROGRESSION
    ↓
QUEST COMPLETION
    ↓
PROGRESSION ENGINE
    ├── XP → LEVEL
    ├── REWARDS
    ├── ATTRIBUTES
    ├── STREAK
    ├── MASTERY SIGNALS
    ├── ACHIEVEMENTS
    └── TITLES
    ↓
BOSS AVAILABLE
    ↓
BOSS COMPLETED
    ↓
MASTERY EVALUATION
    ↓
┌─────────────────────────────┐
│ Threshold satisfied?        │
└──────────────┬──────────────┘
               │
       ┌───────┴───────┐
       │               │
      YES              NO
       │               │
       ▼               ▼
GATE COMPLETED      CONTINUE
       │             / RECOVER
       ▼
NEXT GATE UNLOCK
       │
       ▼
NEXT GATE AVAILABLE
       │
       ▼
CONTINUE JOURNEY
```

------------------------------------------------------------------------

# 97. Canonical Architectural Flow

The technical version is:

``` text
USER
  ↓
REACT UI
  ↓
APPLICATION ACTION
  ↓
PROGRESSION ENGINE
  ↓
DOMAIN STATE
  ↓
STORE UPDATE
  ↓
PERSISTENCE
  ↓
UI REFRESH
```

The UI never skips the progression boundary.

------------------------------------------------------------------------

# 98. Canonical Product Flow

The player-facing version is:

``` text
PLAYER
  ↓
REAL-WORLD ACTION
  ↓
QUEST
  ↓
PROGRESSION
  ↓
MASTERY
  ↓
GATE
  ↓
UNLOCK
  ↓
ARCANA
  ↓
PLAYER EVOLUTION
```

The two flows describe the same system from different perspectives.

------------------------------------------------------------------------

# 99. Final State Machine Principle

MYTHIC LEVELS is not a collection of independent screens.

It is a stateful progression system.

Every meaningful game action should have:

``` text
CURRENT STATE
      +
ACTION
      +
GUARDS
      ↓
TRANSITION
      ↓
NEW STATE
      +
CONSEQUENCES
```

The application should preserve this discipline from the first React
integration through future versions.

------------------------------------------------------------------------

# 100. Final Definition

> **The MYTHIC LEVELS State Machine defines the legal movement of the
> player's journey from Awakening, through real-world practice and Gate
> progression, through Boss Trials and mastery, into Gate completion and
> future Arcana progression.**

The mythology gives the states meaning.

The product gives the states structure.

The progression engine gives the transitions rules.

The application layer coordinates them.

Persistence remembers them.

The interface makes them visible.

The player's real-world actions give them truth.

------------------------------------------------------------------------

# 101. Non-Negotiable Rules

1.  The progression engine remains the source of truth.
2.  React must not implement progression rules.
3.  Zustand must not become a second progression engine.
4.  Persistence must not decide progression.
5.  Static content must not mutate player state.
6.  Locked Gates cannot be bypassed through UI logic.
7.  Boss Trials cannot bypass their guards.
8.  Mastery must come from the progression system.
9.  Gate completion must come from the progression system.
10. Unlocking must come from the unlock system.
11. Missing a day must not erase historical progress.
12. Invalid transitions must preserve the previous valid state.
13. Imported state must be validated.
14. Navigation is not progression.
15. Rendering is not progression.
16. Repeated clicks must not silently duplicate rewards.
17. All 27 Gates must remain data-driven.
18. The seven-stage Gate structure remains canonical.
19. The player remains the center of the journey.
20. The state machine exists to protect the integrity of the player's
    progress.

------------------------------------------------------------------------

# 102. Relationship to Implementation

This document should be read before implementing:

-   `useGameStore`
-   application actions
-   Gate pages
-   quest completion UI
-   Boss Trial UI
-   mastery display
-   unlock display
-   dashboard progression summaries
-   persistence integration
-   import/export
-   progression-related tests

When implementation differs from this document, do not blindly force the
code to match the document.

Instead:

``` text
inspect implementation
      ↓
identify actual behavior
      ↓
identify intended canonical rule
      ↓
make a deliberate change
      ↓
update documentation if necessary
```

Documentation and implementation must remain synchronized.

------------------------------------------------------------------------

# 103. End State

A healthy MYTHIC LEVELS implementation should make the following
statement true:

``` text
The player acts in the real world.

        ↓

The player records the action through the application.

        ↓

The application asks the progression engine to process it.

        ↓

The progression engine validates the action.

        ↓

The progression engine produces the new game state.

        ↓

The application stores that state.

        ↓

The UI reflects what actually happened.

        ↓

The player continues the journey.
```

That is the canonical state-machine behavior of MYTHIC LEVELS.
