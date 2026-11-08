# MYTHIC LEVELS — SYSTEM ARCHITECTURE

Version: 1.0
Status: Architecture Definition
Project: MYTHIC LEVELS

---

# 1. Purpose

This document defines the technical architecture of MYTHIC LEVELS.

The purpose of the architecture is to connect the existing domain and
progression system to the React user interface without unnecessarily
rewriting or duplicating the existing game logic.

The existing progression engine is the source of truth for progression
rules.

The React application is responsible for presenting that progression
system to the player.

---

# 2. Core Architectural Principle

MYTHIC LEVELS follows this principle:

> The UI displays the game.
> The domain defines the game.
> The progression engine controls the game.
> Persistence remembers the game.

React must not become the source of truth for progression rules.

Progression rules should remain outside UI components.

For example:

BAD:

React component calculates Gate mastery.

GOOD:

React component requests the current Gate mastery from the application
state, which is calculated by the progression system.

---

# 3. High-Level Architecture

The application should follow this conceptual flow:

                    ┌──────────────────────┐
                    │        USER          │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │    REACT UI LAYER    │
                    │                      │
                    │ Pages / Components   │
                    │ Layout / Navigation │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ APPLICATION STATE    │
                    │ / STORE ADAPTER      │
                    │                      │
                    │ Zustand              │
                    │ UI state             │
                    │ Domain state access  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ APPLICATION ACTIONS  │
                    │                      │
                    │ Complete quest       │
                    │ Enter Gate           │
                    │ Save reflection      │
                    │ Save daily plan      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ PROGRESSION ENGINE   │
                    │                      │
                    │ XP                   │
                    │ Mastery              │
                    │ Streaks              │
                    │ Unlocks              │
                    │ Achievements         │
                    │ Titles               │
                    └──────────┬───────────┘
                               │
                 ┌─────────────┴─────────────┐
                 ▼                           ▼
       ┌──────────────────┐        ┌──────────────────┐
       │ DOMAIN + DATA    │        │   PERSISTENCE    │
       │                  │        │                  │
       │ Player           │        │ localStorage     │
       │ Gates            │        │ storage adapter  │
       │ Arcanas          │        │                  │
       │ Quests           │        │                  │
       │ Achievements     │        │                  │
       │ Titles           │        │                  │
       └──────────────────┘        └──────────────────┘

---

# 4. Architectural Layers

MYTHIC LEVELS should be divided into the following conceptual layers:

1. Presentation
2. Application State
3. Application Actions
4. Progression / Domain Logic
5. Domain Models
6. Static Game Data
7. Persistence
8. Utilities

Each layer should have a clear responsibility.

---

# 5. Presentation Layer

Location:

src/components/
src/pages/
src/layouts/
src/App.jsx

Responsibility:

- Render the interface.
- Receive user interaction.
- Display player state.
- Display Gate information.
- Display quest information.
- Display progression feedback.
- Handle navigation.
- Handle visual states such as loading, empty and error states.

The presentation layer must NOT contain core progression calculations.

Examples of logic that should NOT be implemented directly in components:

- XP formulas.
- Mastery formulas.
- Gate unlocking rules.
- Streak calculations.
- Achievement conditions.
- Title unlocking conditions.
- Quest reward calculations.

Components should request these results from the application/domain layer.

---

# 6. Application State Layer

The project already has Zustand installed.

Zustand may be used as the application state adapter between React and
the existing domain/progression system.

The store should provide a controlled interface for the UI.

Conceptually:

UI
↓
Zustand store/action
↓
Progression engine
↓
New state
↓
Store
↓
Persistence
↓
UI update

The store should not duplicate progression logic.

The store is an adapter/orchestrator, not the game engine.

---

# 7. Recommended Store Responsibilities

The application store should eventually provide access to:

## Player

- player identity
- title
- avatar
- goal
- current Arcana
- current Gate
- level
- XP
- resources

## Progress

- Gate progress
- completed quests
- practice minutes
- reflections
- streak
- achievements
- titles
- event history

## Settings

- difficulty
- daily duration
- available days
- reminders
- mastery threshold
- sound
- ceremony settings

## Actions

Examples:

- initializeAwakening()
- enterGate()
- completeQuest()
- saveReflection()
- deleteReflection()
- saveDailyPlan()
- updateSettings()
- exportJourney()
- importJourney()
- resetJourney()

The exact API should be designed after inspecting the existing engine
functions rather than invented unnecessarily.

---

# 8. Progression Engine

Location:

src/services/progression/

This is the most important business-logic layer.

The existing progression engine already contains substantial behavior
and should be treated as the source of truth.

Existing capabilities include:

- initial state creation
- quest completion
- XP processing
- attribute progression
- Gate mastery
- Gate unlocking
- streak tracking
- achievements
- titles
- reflections
- daily plans
- event history

The existing `completeQuest()` operation performs multiple progression
updates including rewards, attributes, streaks, mastery, unlocking,
achievements and titles.

Do not recreate these calculations in React components.

---

# 9. Progression Engine Rule

When a player performs an action:

Example:

Player completes Day 3.

The UI should NOT independently calculate:

XP +30
Mastery +X
Discipline +Y
Streak +1

Instead:

UI
↓
completeQuest(...)
↓
Progression engine
↓
New immutable state + result
↓
Store
↓
UI

The engine remains responsible for determining the result.

---

# 10. Domain Layer

Location:

src/domain/

The domain layer contains the structural representation of the player
and progression state.

Current domain models include:

- Player
- Settings
- Progress
- Gate progress

The domain layer defines the shape and construction of state.

It should not contain React-specific code.

It should not import React components.

It should remain usable independently from the UI.

---

# 11. Static Game Data Layer

Location:

src/data/

The data layer contains the content of MYTHIC LEVELS.

It currently includes:

- Arcanas
- Gates
- quests
- seven-day progression definitions
- achievements
- titles
- Gate construction helpers
- catalog functions

The application should use this data instead of hardcoding Gate
information inside React components.

---

# 12. Data-Driven Gate Architecture

The UI must be data-driven.

Do NOT create separate hardcoded components such as:

Gate1.jsx
Gate2.jsx
Gate3.jsx
...
Gate27.jsx

Instead:

Gate data
↓
Catalog
↓
Dynamic Gate page
↓
Reusable Gate components

The route should identify the Gate.

Example:

/gate/beast-01

The page resolves the Gate using the catalog.

Conceptually:

getGateById(gateId)

Then the same Gate page renders any of the 27 Gates.

---

# 13. Catalog

Location:

src/data/catalog.js

The catalog provides lookup operations such as:

- listGates()
- getGateById()
- getGateByPosition()
- getArcana()
- gatesForArcana()
- getQuest()

The UI should use these APIs instead of directly depending on individual
Gate files.

---

# 14. Seven-Day Quest Architecture

Every Gate contains a seven-day progression.

The conceptual structure is:

Day 1 — Recognition
Day 2 — Observation
Day 3 — Practice
Day 4 — Resistance
Day 5 — Application
Day 6 — Challenge
Day 7 — Reflection & Trial

After the seven-day progression:

Boss Trial
↓
Mastery evaluation
↓
Gate completion
↓
Next Gate unlock

The UI should render the data provided by the Gate definition.

It should not hardcode the content of each day.

---

# 15. Mastery Architecture

Mastery belongs to the progression layer.

The current mastery system uses four signals:

- Practice
- Consistency
- Reflection
- Boss

Current weights:

Practice: 40%
Consistency: 20%
Reflection: 15%
Boss: 25%

The default mastery threshold is 70%.

The UI may display these values but must not independently calculate
Gate mastery.

The progression system determines mastery.

---

# 16. XP and Level Architecture

XP belongs to the progression layer.

The current system starts the player at Level 1.

The first level requires 200 XP.

Subsequent requirements scale from the previous requirement.

Difficulty affects XP using the configured difficulty multiplier.

The UI should consume the calculated level and XP values.

It should not duplicate the XP formula.

---

# 17. Unlock Architecture

Gate unlocking belongs to:

src/services/progression/unlocks.js

The current progression is linear.

Conceptually:

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
...
↓
Human 09
↓
Sage 01
↓
...
↓
Sage 09

The UI should determine visual status from the progression state.

Possible visual states:

- Locked
- Available
- Current
- In Progress
- Completed

The UI must not decide whether a Gate is actually unlocked.

---

# 18. Streak Architecture

Streak logic belongs to the progression engine.

The UI should display:

- current streak
- longest streak
- interruption state
- return status

The application should follow the existing rule:

Missing a day does not erase the player's historical progress.

A returned player should be treated as returning to the journey rather
than starting the entire journey again.

---

# 19. Achievement and Title Architecture

Achievements and titles are data-driven.

Definitions belong in:

src/data/achievements.js

Evaluation belongs in:

src/services/progression/achievements.js

The UI should:

- display locked achievements
- display unlocked achievements
- display progress where available
- show unlock notifications
- display current title
- display available titles

The UI should not determine whether an achievement has been earned.

---

# 20. Reflection Architecture

Reflections are player-generated content.

Reflection operations belong to the progression/application layer.

Existing operations include:

- upsertReflection()
- deleteReflection()

Reflection text should remain plain text.

Do not inject reflection content as HTML.

The existing sanitization utility should be respected.

---

# 21. Daily Plan Architecture

Daily plan generation belongs to:

src/services/quests/

The existing daily-plan service generates:

- morning activity
- afternoon activity
- evening reflection

The UI should display and allow appropriate editing of the generated
plan.

The UI should not duplicate daily-plan generation logic.

---

# 22. Persistence Architecture

Location:

src/services/storage/

The project already provides storage adapters.

Current persistence uses:

mythic-levels:v1

The architecture should maintain a storage abstraction.

Conceptually:

Application
↓
Storage service
↓
Storage adapter

The application should not directly scatter localStorage calls across
React components.

BAD:

localStorage.setItem(...) inside multiple components.

GOOD:

store/action
↓
storage service
↓
localStorage adapter

This keeps future migration possible.

---

# 23. Current Persistence Strategy

Current phase:

Browser local persistence.

Primary mechanism:

localStorage.

Future possibilities may include:

- IndexedDB
- cloud synchronization
- authentication
- backend persistence

These should NOT be implemented until explicitly required.

Do not introduce a backend merely because it may be useful in the future.

---

# 24. Routing Architecture

React Router is installed and should be used for application navigation.

The application should eventually provide routes similar to:

/
 /awakening
 /dashboard
 /arcanas
 /gate/:gateId
 /journal
 /analytics
 /profile

Exact route structure may be adjusted during implementation if necessary.

Route components should remain thin.

Pages should compose reusable components rather than contain the entire
application implementation in one file.

---

# 25. Suggested UI Structure

A future structure may look like:

src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── player/
│   ├── progression/
│   ├── gate/
│   ├── quest/
│   ├── journal/
│   ├── analytics/
│   └── achievements/
│
├── pages/
│   ├── Home/
│   ├── Awakening/
│   ├── Dashboard/
│   ├── Arcanas/
│   ├── Gate/
│   ├── Journal/
│   ├── Analytics/
│   └── Profile/
│
├── store/
│   └── ...
│
├── data/
├── domain/
├── services/
└── utils/

This is a target organization, not permission to restructure the entire
repository immediately.

Preserve the existing structure when it is already appropriate.

---

# 26. Separation of Concerns

The following responsibilities must remain separated.

## UI

"What should the player see?"

## Store

"What application state does the UI currently have?"

## Application Actions

"What operation did the player request?"

## Progression Engine

"What should happen according to MYTHIC LEVELS rules?"

## Domain

"What does the player's state look like?"

## Data

"What Gates, quests, Arcanas and achievements exist?"

## Persistence

"How is the state saved and loaded?"

---

# 27. Dependency Direction

Preferred dependency direction:

UI
↓
Application Store / Actions
↓
Domain Services
↓
Domain + Data
↓
Utilities

Persistence may be accessed through the application/store boundary.

Lower-level modules should not import UI modules.

Examples:

Domain must NOT import React.

Progression engine must NOT import React components.

Data must NOT import page components.

UI may import domain/data/service interfaces as required.

---

# 28. Immutability

Progression operations should preserve the existing immutable behavior.

A progression operation should conceptually behave like:

oldState + action
        ↓
newState + result

The caller should not unexpectedly have its state mutated.

This is especially important for:

- quest completion
- reflections
- Gate progression
- achievements
- titles
- streaks

---

# 29. Error Handling

The application should distinguish between:

- invalid user action
- locked Gate
- missing quest
- duplicate completion
- persistence failure
- malformed imported state
- unexpected application error

Errors should be handled gracefully.

The UI should provide meaningful feedback rather than crashing.

Do not hide domain errors silently.

---

# 30. Loading and Empty States

Every data-dependent screen should consider:

### Loading

State is being initialized or restored.

### Empty

Example:

No reflections yet.

No completed quests yet.

No analytics history yet.

### Error

State could not be loaded or an operation failed.

### Success

Action completed successfully.

These states should be designed intentionally.

---

# 31. Responsive Architecture

The application must support:

- Desktop
- Tablet
- Mobile

Responsive behavior should be implemented at the component/layout level.

Do not create a completely separate mobile application.

The interface should preserve the MYTHIC LEVELS visual identity at every
screen size.

---

# 32. Animation Architecture

Framer Motion is installed and may be used for meaningful progression
feedback.

Appropriate uses include:

- page transitions
- XP gain
- quest completion
- achievement unlock
- title unlock
- Gate unlock
- level-up
- ascension ceremony

Animations must remain restrained.

Do not add animation merely for decoration.

Reduced-motion preferences must be respected.

---

# 33. Testing Architecture

Vitest and Testing Library are already installed.

Tests should eventually cover:

## Progression

- XP
- levels
- quest completion
- duplicate completion
- mastery
- Gate completion
- unlocking

## Streak

- first activity
- same-day activity
- consecutive-day activity
- missed day
- return after interruption

## Rewards

- attributes
- resources
- achievements
- titles

## Persistence

- save
- load
- malformed data
- unsupported schema
- persistence failure

## UI

- routing
- Gate rendering
- quest interaction
- reflection interaction
- player state display

Tests should be added incrementally.

Do not rewrite the project simply to introduce a testing architecture.

---

# 34. Security and Data Safety

The current application is local-first.

Player reflections and progression data should be treated as private
player data.

Reflection content must be treated as plain text.

Do not render user-generated reflection content using unsafe HTML
injection.

Imported state must pass validation before becoming application state.

Do not trust imported JSON blindly.

---

# 35. Existing Architecture That Must Be Preserved

The current repository already contains a substantial domain and
progression implementation.

Important existing areas include:

src/config/
src/domain/
src/data/
src/services/progression/
src/services/quests/
src/services/storage/
src/utils/

The following systems already exist and should be reused:

- Player state
- Settings
- Progress
- Gate progress
- 27-Gate catalog
- Seven-day Gate structure
- Quest completion
- XP
- Attributes
- Mastery
- Unlocking
- Streaks
- Achievements
- Titles
- Reflections
- Daily plans
- Local persistence

Do not rebuild these systems simply to connect them to React.

---

# 36. Current Architectural Gap

The major current gap is integration.

Current conceptual state:

                 EXISTING

┌──────────────────────────────┐
│ Domain / Data                │
│                              │
│ 27 Gates                     │
│ Progression Engine           │
│ XP / Mastery / Streaks       │
│ Achievements / Titles        │
│ Persistence                  │
└──────────────┬───────────────┘
               │
               │ NOT CONNECTED
               │
               ▼
┌──────────────────────────────┐
│ React Application            │
│                              │
│ Vite starter UI              │
└──────────────────────────────┘

Target state:

┌──────────────────────────────┐
│ React UI                     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Application State / Actions  │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Existing Domain + Engine     │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│ Persistence                  │
└──────────────────────────────┘

The primary implementation goal is to build this bridge.

---

# 37. Implementation Strategy

Implementation should happen incrementally.

Recommended order:

1. Application shell
2. Routing
3. State/store adapter
4. Awakening flow
5. Dashboard
6. Arcana/Cosmic Map
7. Dynamic Gate page
8. Quest completion
9. Progression feedback
10. Journal
11. Analytics
12. Profile
13. Testing
14. Responsive and accessibility polish

Do not attempt all phases in a single change.

---

# 38. Change Safety Rules

Before changing existing code:

1. Inspect the relevant files.
2. Understand existing exports and dependencies.
3. Reuse existing functions where possible.
4. Avoid duplicate business logic.
5. Make the smallest coherent change.
6. Run the appropriate validation.
7. Confirm that existing functionality still works.

If an existing implementation appears unnecessary, do not delete it
without verifying that nothing depends on it.

---

# 39. Cursor Development Rule

Cursor is an implementation assistant, not the owner of the architecture.

Before implementing a feature:

- inspect the repository
- read this architecture document
- read the product specification
- identify existing functionality
- reuse existing systems
- implement only the requested scope

Do not redesign the entire project because a different architecture might
appear cleaner.

---

# 40. Definition of Architectural Success

The architecture is successful when:

- React handles presentation.
- Zustand/application state handles UI-facing state.
- The progression engine remains the source of truth.
- Gate content remains data-driven.
- Persistence remains behind a storage abstraction.
- Components do not duplicate business logic.
- All 27 Gates can use the same reusable UI architecture.
- Progression updates propagate automatically to the interface.
- The project can later evolve from local-only storage without rewriting
  the entire UI.
- The system remains understandable to a student developer.

---

# 41. Final Principle

MYTHIC LEVELS should be built as a real software system, not as a
collection of visually impressive screens.

The visual interface is important.

But the architecture must ensure:

                UI
                 ↓
              ACTION
                 ↓
          PROGRESSION ENGINE
                 ↓
               STATE
                 ↓
             PERSISTENCE

The mythology is the presentation.

The progression engine is the game.

The user's real-world behavior is the actual product.