# MYTHIC LEVELS — IMPLEMENTATION PLAN

**Document Status:** Canonical Implementation Plan  
**Version:** 1.0  
**Project:** Mythic Levels  
**Technology Target:** React + Vite + JavaScript + Tailwind CSS + Framer Motion + React Router + Zustand  
**Primary Principle:** Preserve the domain engine. Build the application around it.  
**Implementation Order:** Foundation → State → Shell → Onboarding → Progression UI → Persistence → Quality → Polish

---

## 1. Purpose

This document defines the exact implementation sequence for turning the current Mythic Levels repository into the working V1 product.

It is not a product vision document, world-design document, or UI inspiration document. It is the execution contract between the existing repository and the intended product.

The implementation must use the existing domain and progression code wherever possible.

The project must **not** rebuild game rules inside React components.

The central implementation rule is:

> **React renders the game. The application layer connects the game. The progression engine defines the game.**

---

# 2. Source-of-Truth Hierarchy

When implementation decisions conflict, use this order:

1. `docs/PRODUCT_SPEC.md`
2. `docs/WORLD_DESIGN.md`
3. `docs/ARCHITECTURE.md`
4. `docs/UI_DESIGN.md`
5. `docs/IMPLEMENTATION_PLAN.md`
6. Existing domain/progression implementation
7. Existing visual reference/screenshots
8. Developer implementation judgment

However, existing executable domain logic must not be casually deleted simply because a UI document describes the concept differently.

If the existing engine and documentation disagree:

1. identify the disagreement,
2. inspect the engine behavior,
3. do not silently replace it,
4. update the appropriate canonical document only after the intended rule is confirmed.

---

# 3. Current Repository Reality

The implementation begins from a partially built application, not an empty React project.

Known repository characteristics:

- React + Vite + JavaScript.
- Tailwind CSS v4 using `@tailwindcss/vite`.
- React Router is installed.
- Zustand is installed.
- Framer Motion is installed.
- Vitest and Testing Library packages are installed.
- Substantial domain/progression code already exists.
- Static game content exists under `src/data`.
- Domain logic exists under `src/domain`.
- Services exist under `src/services`.
- Utilities exist under `src/utils`.
- `src/index.css` already contains Mythic Levels design tokens/utilities.
- `src/App.jsx` is still substantially Vite starter code.
- `src/App.css` still contains starter styling.
- React presentation is therefore incomplete.
- No complete application state boundary exists yet.
- No complete UI-facing action layer exists yet.
- No complete routing system exists yet.
- `src/components`, `src/pages`, and `src/layouts` are not yet established as the main presentation structure.
- Persistence exists at the service level but is not fully connected to React application state.
- The progression engine already contains important behavior such as quest completion, rewards, XP, mastery, streaks, achievements, titles, reflections, daily plans, and event history.
- `createInitialState()` assumes valid awakening input.
- `validateLoadedState()` is partial.
- Migration support is not yet established.
- Test setup is incomplete.
- The README still reflects the Vite template and is not the authoritative project documentation.

This plan assumes those facts and deliberately builds around them.

---

# 4. Non-Negotiable Implementation Rules

## 4.1 Do not duplicate the progression engine

Do not write XP formulas inside components.

Do not calculate mastery inside components.

Do not calculate streaks inside components.

Do not unlock Gates inside components.

Do not award achievements inside components.

Do not update titles inside components.

Do not create a second quest completion algorithm in Zustand.

The UI may display these values.

The application layer may invoke domain actions.

The progression engine remains authoritative.

---

## 4.2 Do not replace working domain code unnecessarily

Before creating a new function, search the repository for an existing equivalent.

Before changing an engine function, understand:

- its inputs,
- its outputs,
- state mutations,
- event generation,
- reward behavior,
- edge cases,
- date behavior,
- callers.

Prefer adapters over rewrites.

---

## 4.3 Keep static content data-driven

Do not create:

- `Gate1.jsx`
- `Gate2.jsx`
- `Gate3.jsx`
- etc.

Create one reusable Gate experience and provide Gate data through IDs.

The same principle applies to:

- Arcanas,
- quests,
- achievements,
- titles,
- attributes,
- resources.

---

## 4.4 UI does not own game state

UI-local state is allowed for:

- modal visibility,
- form fields,
- selected tabs,
- temporary input,
- animation state,
- expanded sections,
- loading indicators.

Game state belongs to the application state boundary.

---

## 4.5 Real-world action is more important than interface activity

The application must not reward clicking buttons simply for the sake of clicking.

Quest completion must represent an actual action or honest reflection according to the quest definition.

The interface is the tracker.

The real world is the arena.

---

## 4.6 Preserve player trust

Never:

- fake completion,
- silently award XP,
- silently remove progress,
- silently reset progress,
- erase a streak without a defined rule,
- fabricate analytics,
- claim cloud synchronization when none exists.

---

# 5. Target Architecture

The implementation target is:

```text
                    ┌──────────────────────┐
                    │      React UI        │
                    │ Pages / Components   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Application State    │
                    │ Zustand Store/Adapter│
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Application Actions  │
                    │ UI-facing commands    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ Progression Engine   │
                    │ Domain Rules         │
                    └──────────┬───────────┘
                               │
              ┌────────────────┴────────────────┐
              ▼                                 ▼
       ┌──────────────┐                 ┌──────────────┐
       │ Static Data  │                 │ Persistence  │
       │ Gates/Tasks  │                 │ localStorage │
       └──────────────┘                 └──────────────┘
```

The important dependency direction is:

```text
UI
 ↓
Application layer
 ↓
Domain/progression
 ↓
Data + persistence
```

The domain must not import React components.

The domain must not import Zustand.

The domain must not depend on browser-only UI behavior.

---

# 6. Target Directory Structure

The structure should evolve toward:

```text
src/
├── app/
│   ├── App.jsx
│   ├── router.jsx
│   └── providers.jsx
│
├── components/
│   ├── common/
│   ├── navigation/
│   ├── dashboard/
│   ├── arcana/
│   ├── gate/
│   ├── quest/
│   ├── reflection/
│   ├── profile/
│   └── analytics/
│
├── pages/
│   ├── HomePage.jsx
│   ├── AwakeningPage.jsx
│   ├── DashboardPage.jsx
│   ├── ArcanasPage.jsx
│   ├── GatePage.jsx
│   ├── JournalPage.jsx
│   ├── AnalyticsPage.jsx
│   └── ProfilePage.jsx
│
├── layouts/
│   └── AppLayout.jsx
│
├── store/
│   └── useGameStore.js
│
├── actions/
│   └── gameActions.js
│
├── data/
├── domain/
├── services/
├── utils/
├── assets/
├── test/
├── main.jsx
└── index.css
```

This is a target structure, not permission to create empty folders without purpose.

Create directories when their first real implementation is required.

---

# 7. Implementation Sequence

The complete implementation order is:

```text
PHASE 0  Repository + Foundation Hardening
    ↓
PHASE 1  Application State Boundary
    ↓
PHASE 2  App Shell + Routing
    ↓
PHASE 3  Awakening
    ↓
PHASE 4  Dashboard
    ↓
PHASE 5  Arcana Map
    ↓
PHASE 6  Gate Experience
    ↓
PHASE 7  Quest Completion + Progression
    ↓
PHASE 8  Reflection + Boss Trial
    ↓
PHASE 9  Profile + Achievements + Titles
    ↓
PHASE 10 Journal + Analytics
    ↓
PHASE 11 Persistence Hardening
    ↓
PHASE 12 Testing + Accessibility + Responsive
    ↓
PHASE 13 Visual Polish
    ↓
MYTHIC LEVELS V1
```

Do not jump directly to Phase 13 because the visual layer is easier to see.

A beautiful UI with no trustworthy state system is not V1.

---

# 8. PHASE 0 — Repository + Foundation Hardening

## Objective

Make the current repository safe to build on.

## Tasks

### 0.1 Inspect before changing

Confirm:

- package manager,
- scripts,
- Vite configuration,
- Tailwind configuration,
- entry point,
- existing domain modules,
- storage adapter,
- progression engine,
- test packages,
- lint configuration.

Do not blindly reinstall packages.

---

## 0.2 Remove starter UI safely

Inspect:

- `src/App.jsx`
- `src/App.css`

Remove Vite starter content from the application UI.

Do not delete `src/index.css` blindly because it contains Mythic Levels design tokens/utilities.

---

## 0.3 Establish application directories

Create only the directories needed for Phase 1 and Phase 2:

```text
src/app/
src/pages/
src/layouts/
src/store/
src/actions/
src/components/common/
src/components/navigation/
```

Later phases may create feature directories.

---

## 0.4 Verify existing domain behavior

Before wiring UI, inspect the existing implementation for:

- `createInitialState`
- `completeQuest`
- quest definitions
- Gate definitions
- Arcana definitions
- mastery calculation
- XP calculation
- level calculation
- streak calculation
- achievement handling
- title handling
- reflection handling
- persistence
- validation

The goal is understanding, not rewriting.

---

## 0.5 Establish test execution

Vitest is already installed.

Add the missing test setup only after inspecting current Vite/Vitest configuration.

The minimum test environment should support:

- domain tests,
- store tests,
- component tests later.

Do not introduce a complex testing framework.

---

## 0.6 Acceptance criteria

Phase 0 is complete when:

- Vite application starts.
- Existing domain modules still import successfully.
- Mythic Levels CSS remains available.
- Starter UI is identified and no longer controls the product screen.
- Test command can execute.
- No existing domain feature has been silently removed.

---

# 9. PHASE 1 — Application State Boundary

## Objective

Connect the existing game state to React without moving game rules into React.

Preferred implementation:

```text
src/store/useGameStore.js
```

Zustand is preferred because it is already installed.

---

## 9.1 Store responsibilities

The store should expose:

- current game state,
- initialization status,
- loading status if needed,
- error state,
- initialize action,
- UI-facing game actions.

It should not own progression formulas.

---

## 9.2 Initial loading flow

Target flow:

```text
Application starts
       ↓
Store initializes
       ↓
Load persisted state
       ↓
Validate loaded state
       ↓
If valid → use loaded state
If absent → show Awakening
If invalid → recover safely
       ↓
Render application
```

---

## 9.3 New-player detection

The application needs a clear distinction between:

```text
No game state exists
```

and:

```text
Game state exists
```

Do not use arbitrary UI heuristics.

Use the persistence/application state contract.

---

## 9.4 Awakening requirement

`createInitialState()` assumes valid awakening input.

Therefore the application must validate/normalize awakening data before calling it.

Minimum validation:

- name exists,
- name is a string,
- name is trimmed,
- name is not empty.

Do not allow malformed input to reach the domain constructor.

---

## 9.5 Store actions

Initial actions should be conceptually:

```text
initialize()
beginAwakening(input)
completeQuest(...)
addReflection(...)
completeBossTrial(...)
resetJourney(...)
exportJourney(...)
importJourney(...)
```

Only implement an action once the corresponding domain behavior exists.

Do not invent fake implementations.

---

## 9.6 Store update rule

A UI action should follow:

```text
User interaction
    ↓
Store action
    ↓
Application/domain function
    ↓
New game state
    ↓
Store update
    ↓
Persistence save
    ↓
UI rerender
```

---

## 9.7 Store must not do this

Avoid:

```js
xp += 25;
mastery += 10;
streak += 1;
```

inside Zustand actions.

Instead:

```js
const nextState = completeQuest(currentState, input);
set(nextState);
```

The exact function signature must follow the actual domain implementation.

---

## 9.8 Acceptance criteria

Phase 1 is complete when:

- existing state can load,
- new player can start from no state,
- game state is accessible through one application boundary,
- state changes trigger React updates,
- persistence can be triggered after state changes,
- no progression formula exists in the store.

---

# 10. PHASE 2 — App Shell + Routing

## Objective

Create the navigable Mythic Levels application shell.

## Routes

Canonical target:

```text
/
 /awakening
 /dashboard
 /arcanas
 /gate/:gateId
 /journal
 /analytics
 /profile
```

---

## 10.1 Route behavior

`/` should determine whether the player needs:

- landing/home,
- awakening,
- or dashboard.

Do not duplicate state checks inside every page.

---

## 10.2 AppLayout

Create:

```text
src/layouts/AppLayout.jsx
```

Responsibilities:

- global navigation,
- page frame,
- background,
- content container,
- global visual structure.

It must not calculate progression.

---

## 10.3 Navigation

Desktop navigation should support:

- Dashboard
- Arcanas
- Journal
- Analytics
- Profile

Mobile navigation should remain usable without copying the desktop layout blindly.

---

## 10.4 Navigation state

The navigation should visually distinguish:

- active route,
- locked/disabled future areas if applicable,
- normal routes.

---

## 10.5 Acceptance criteria

Phase 2 is complete when:

- every canonical route resolves,
- navigation works,
- unknown routes have a reasonable fallback,
- layout is consistent,
- page components do not duplicate the global shell.

---

# 11. PHASE 3 — Awakening

## Objective

Create the first meaningful player interaction.

Awakening is not merely a registration form.

It is the beginning of the player's journey.

---

## 11.1 Required information

Minimum supported input:

- player name.

Do not add unnecessary onboarding fields unless defined in the product specification.

---

## 11.2 Awakening flow

```text
Landing
 ↓
Awakening
 ↓
Enter name
 ↓
Validate
 ↓
Create initial game state
 ↓
Persist
 ↓
Enter Dashboard
```

---

## 11.3 UX requirements

The page should communicate:

- this is the beginning,
- the player is entering a structured journey,
- mythology is symbolic,
- action matters more than fantasy.

Avoid:

- excessive exposition,
- long cinematic sequences,
- fake supernatural claims,
- forced account creation.

---

## 11.4 Acceptance criteria

A new player can:

1. open the application,
2. enter a valid name,
3. submit Awakening,
4. receive initial game state,
5. reach Dashboard,
6. refresh the browser,
7. retain their state.

---

# 12. PHASE 4 — Dashboard

## Objective

Create the central daily command center.

The dashboard should answer:

- Who am I?
- Where am I?
- What am I working on?
- What should I do today?
- What have I achieved?
- What is my current progression?

---

## 12.1 Dashboard content

Target sections:

### Identity

- player name,
- current title if available,
- current level.

### Progression

- XP,
- current Gate,
- Gate mastery,
- Arcana,
- attributes.

### Current action

- today's quests,
- current quest progress,
- next meaningful action.

### Streak

Display current streak without shaming the player.

### Recent achievements

Show meaningful achievements only.

---

## 12.2 Dashboard must not become a data dump

Prioritize:

```text
What matters now?
```

over:

```text
Show every number.
```

---

## 12.3 Acceptance criteria

Dashboard displays real state from the store.

No hardcoded:

- XP,
- mastery,
- streak,
- Gate,
- level,
- attribute values.

---

# 13. PHASE 5 — Arcana Map

## Objective

Make the world structure understandable and navigable.

The map represents:

```text
Beast
 ↓
Human
 ↓
Sage
 ↓
Integration
```

---

## 13.1 Arcana presentation

Each Arcana should show:

- identity,
- description,
- Gates,
- current progression,
- locked/unlocked state.

---

## 13.2 Gate list

The 27 Gates are data-driven.

Render the Gate catalog from existing data.

Do not hardcode a separate component for each Gate.

---

## 13.3 Gate states

Every Gate should be visually distinguishable as:

- locked,
- available,
- current,
- completed/mastered.

The exact status must come from game state and domain rules.

---

## 13.4 Acceptance criteria

The Arcana map correctly displays:

- all three Arcanas,
- all 27 Gates,
- Gate names,
- current Gate,
- locked/unlocked status,
- navigation to available Gate details.

---

# 14. PHASE 6 — Gate Experience

## Objective

Create the core game screen.

A Gate page should communicate:

```text
Who/what is this Gate?
What does it train?
Why does it matter?
What should I do?
How am I progressing?
```

---

## 14.1 Gate header

Display:

- Arcana,
- Gate number,
- Gate name,
- archetype/symbol,
- attribute,
- weakness or obstacle where defined,
- quote,
- lore.

---

## 14.2 Mastery

Display:

- mastery percentage,
- progression status,
- 7-day progress,
- Boss Trial status.

Do not calculate mastery in the component.

---

## 14.3 Seven-day structure

Render:

```text
1 Recognition
2 Observation
3 Practice
4 Resistance
5 Application
6 Challenge
7 Reflection
```

The exact task content comes from the canonical Gate data.

---

## 14.4 Quest card

Each quest card should show:

- day number,
- stage,
- title,
- description,
- expected time,
- XP reward,
- completion status,
- reflection requirement if applicable,
- completion action.

---

## 14.5 Acceptance criteria

Gate page is reusable for any Gate.

Changing:

```text
/gate/1
```

to another valid Gate ID must render another Gate using data.

No duplicated Gate JSX.

---

# 15. PHASE 7 — Quest Completion + Progression

## Objective

Connect real player actions to the existing progression engine.

This is one of the most important implementation phases.

---

## 15.1 Completion flow

Target:

```text
Player chooses quest
        ↓
UI gathers required input
        ↓
Store action
        ↓
Progression engine
        ↓
XP / resources / attributes / mastery / streak / achievements
        ↓
New state
        ↓
Persistence
        ↓
UI feedback
```

---

## 15.2 Completion confirmation

The interface should make it clear that the action is meaningful.

Avoid instant accidental completion.

Use confirmation when the action is consequential.

---

## 15.3 Reward display

After completion, show the actual result generated by the engine.

Potential feedback:

- XP gained,
- resource gains,
- mastery progress,
- achievement unlocked,
- title unlocked,
- streak update.

Only show rewards that actually occurred.

---

## 15.4 Idempotency

A quest should not accidentally be awarded twice because the user:

- double-clicks,
- refreshes,
- presses Back/Forward,
- submits repeatedly.

The UI may disable submission temporarily, but domain-level protection is preferable where appropriate.

---

## 15.5 Date handling

Do not trust arbitrary user-provided dates for progression unless the product explicitly supports backdating.

The engine currently accepts date-related inputs.

The application layer must use the correct current local date semantics.

Do not silently allow players to manipulate progression by changing a date field.

---

## 15.6 Acceptance criteria

Completing a quest changes the real game state through the existing engine.

After refresh:

- completion remains,
- rewards remain,
- mastery remains,
- progression remains.

No duplicate reward occurs from normal repeated UI submission.

---

# 16. PHASE 8 — Reflection + Boss Trial

## Objective

Complete the meaningful end of a Gate.

---

## 16.1 Reflection

Reflection is part of the progression system, not decoration.

Reflection UI should provide:

- prompt,
- private text input,
- save action,
- completion state.

---

## 16.2 Reflection principles

The system should encourage:

- honesty,
- observation,
- learning,
- self-awareness.

It should not encourage performative writing.

---

## 16.3 Boss Trial

Boss Trial becomes available according to Gate progression rules.

Do not hardcode:

```text
if days === 7
```

unless that is the actual domain rule.

Use the engine's availability state.

---

## 16.4 Silent Hour example

For the Gate represented by the reference design, the Boss Trial is:

**THE SILENT HOUR**

Core task:

- one 60-minute deep-focus session,
- describe honestly what was done.

The UI should reflect the actual data definition rather than embedding this text in the component.

---

## 16.5 Boss completion

Boss completion must use the progression engine.

The component should not manually add mastery.

---

## 16.6 Acceptance criteria

A player can:

- complete required quests,
- write required reflections,
- access the Boss Trial when eligible,
- submit the Boss Trial,
- receive engine-defined progression,
- see the Gate's mastery update.

---

# 17. PHASE 9 — Profile + Achievements + Titles

## Objective

Make long-term identity visible.

---

## 17.1 Profile

Profile should display:

- player name,
- current level,
- current title,
- Arcana/Gate status,
- attributes,
- resources,
- journey statistics.

---

## 17.2 Titles

Titles must come from the achievement/title system.

Do not create arbitrary display-only titles in React.

---

## 17.3 Achievements

Show:

- unlocked achievements,
- locked achievements where useful,
- meaningful progress where supported.

Avoid showing dozens of empty cards if there is little useful information.

---

## 17.4 Save System

Profile should eventually support:

- Export Journey
- Import Journey
- Reset Journey

These actions are consequential and require clear confirmation.

---

## 17.5 Reset

Reset must:

- clearly warn the player,
- require deliberate confirmation,
- erase only what the documented reset contract says,
- return the app to the intended initial state.

Do not silently reset on invalid import.

---

# 18. PHASE 10 — Journal + Analytics

## Objective

Make reflection and long-term progress inspectable.

---

## 18.1 Journal

Journal should show:

- reflections,
- dates,
- related Gates,
- relevant quest/Boss context.

Privacy is important.

Journal content should not be publicly exposed.

---

## 18.2 Analytics

Analytics should answer:

- How active have I been?
- How has mastery changed?
- What Gates have I worked on?
- What attributes have developed?
- How consistent have I been?
- What is my journey history?

---

## 18.3 Avoid vanity analytics

Do not create charts merely because charts look impressive.

Every visualization should answer a useful question.

---

## 18.4 Analytics data

Analytics must derive from actual:

- event history,
- quest completion,
- mastery,
- attributes,
- streaks,
- progression state.

Do not invent historical data.

---

# 19. PHASE 11 — Persistence Hardening

## Objective

Make local persistence trustworthy.

Current storage key:

```text
mythic-levels:v1
```

---

## 19.1 Persistence contract

The persistence layer should handle:

```text
save
load
validate
recover
export
import
reset
```

---

## 19.2 Validation

Loaded data must be validated before being trusted.

Current validation is partial.

Improve it incrementally.

Validate important structures:

- schema/version,
- player identity,
- progression state,
- Gates,
- quests,
- attributes,
- resources,
- achievements,
- titles,
- reflections,
- event history.

---

## 19.3 Migration

Future versions must not assume all stored data is current.

Target:

```text
v1
 ↓
migration
 ↓
current schema
```

Do not implement migrations speculatively before a schema change exists, but establish a place for them.

---

## 19.4 Corrupt data

If stored data is invalid:

- do not crash the entire application,
- do not silently pretend it is valid,
- provide a recovery path,
- preserve the raw data when feasible,
- explain the situation clearly.

---

## 19.5 Export

Export should produce a portable representation of the player's journey.

Export should include the version/schema information required for future import.

---

## 19.6 Import

Import must:

1. parse,
2. validate,
3. migrate if supported,
4. confirm with the player,
5. replace state,
6. persist,
7. reload application state.

Never write unvalidated imported JSON directly into game state.

---

# 20. PHASE 12 — Testing + Accessibility + Responsive

## Objective

Make V1 trustworthy across common usage conditions.

---

## 20.1 Domain tests

Protect:

- XP calculation,
- level calculation,
- mastery,
- quest completion,
- streak behavior,
- Gate unlocks,
- achievements,
- titles,
- state initialization,
- persistence validation.

Existing domain tests should remain intact.

---

## 20.2 Store tests

Test:

- initialization,
- new player,
- persisted player,
- quest completion,
- state update,
- persistence call,
- error handling.

---

## 20.3 Component tests

Prioritize high-value flows:

- Awakening form,
- navigation,
- Gate rendering,
- quest completion,
- reflection submission,
- Boss availability,
- profile reset confirmation.

Do not attempt exhaustive snapshot testing.

---

## 20.4 End-to-end critical path

At minimum verify:

```text
Open app
 ↓
Awakening
 ↓
Dashboard
 ↓
Arcana
 ↓
Gate
 ↓
Quest
 ↓
Reward
 ↓
Refresh
 ↓
Progress remains
```

---

## 20.5 Accessibility

Minimum:

- keyboard navigation,
- visible focus,
- semantic buttons,
- semantic headings,
- labels for inputs,
- sufficient contrast,
- meaningful status text,
- no essential information conveyed by color alone,
- reduced-motion support.

---

## 20.6 Responsive behavior

Test at least:

- desktop,
- tablet,
- mobile.

Important screens:

- Dashboard,
- Arcana map,
- Gate,
- Quest cards,
- Profile,
- Journal.

Do not merely shrink desktop layouts.

---

# 21. PHASE 13 — Visual Polish

## Objective

Only after functionality is trustworthy, bring the full Mythic Levels visual identity to final quality.

---

## 21.1 Visual foundation

Use the canonical design tokens from `UI_DESIGN.md`.

Core palette:

```text
Void      #05050A
Obsidian  #0D0B14
Ancient   #C8A96B
Mystic    #7B61FF
Cosmic    #4CC9F0
Ember     #FF6B35
Spirit    #D8B4FE
```

---

## 21.2 Typography

Use:

- serif typography for mythic headings/world identity,
- sans-serif typography for interface/body,
- clear hierarchy,
- restrained use of uppercase labels.

---

## 21.3 Motion

Framer Motion may be used for:

- page transitions,
- card entrance,
- progression feedback,
- reward reveal,
- map transitions,
- subtle ambient effects.

Do not animate everything.

Respect:

```text
prefers-reduced-motion
```

---

## 21.4 Visual hierarchy

The interface should feel:

- ancient,
- cosmic,
- serious,
- restrained,
- modern,
- premium.

Avoid:

- childish fantasy,
- excessive neon,
- noisy backgrounds,
- constant particles,
- game-store UI,
- casino-like reward effects.

---

# 22. Component Implementation Strategy

Build reusable primitives before large pages become complicated.

Recommended first primitives:

```text
Button
Card
Badge
ProgressBar
Stat
SectionHeader
Modal
Toast
EmptyState
LoadingState
ErrorState
```

Then domain components:

```text
ArcanaCard
GateCard
QuestCard
QuestList
MasteryDisplay
AttributeGrid
ResourceDisplay
AchievementCard
TitleDisplay
ReflectionEditor
BossTrialCard
```

Then pages.

---

# 23. Data Flow Rules

## 23.1 Read path

```text
Store
 ↓
Page
 ↓
Feature component
 ↓
Presentation component
```

---

## 23.2 Write path

```text
User event
 ↓
Feature component
 ↓
Store/application action
 ↓
Domain engine
 ↓
State update
 ↓
Persistence
 ↓
UI
```

---

## 23.3 Never use this pattern

```text
Button
 ↓
manually calculate XP
 ↓
set XP
```

---

# 24. Loading States

The application needs explicit loading behavior where initialization is asynchronous or potentially expensive.

Possible states:

```text
INITIALIZING
READY
EMPTY
ERROR
```

Avoid rendering an apparently empty player profile while persistence is still loading.

---

# 25. Error States

Errors should be:

- understandable,
- recoverable where possible,
- non-destructive,
- honest.

Examples:

```text
Could not load journey.
Try again.

Imported journey is invalid.
Nothing has been changed.

Could not save journey.
Your current session remains open, but persistence may be unavailable.
```

Exact wording may evolve with UI design.

---

# 26. Empty States

Every collection needs a meaningful empty state.

Examples:

### Journal

```text
No reflections yet.
Your first reflection will appear here.
```

### Achievements

```text
Your journey has just begun.
Achievements will appear as you progress.
```

### Analytics

```text
Complete a few quests to begin seeing your progression.
```

Empty does not mean broken.

---

# 27. Game-State vs UI-State Boundary

## Game state

Examples:

- XP,
- level,
- Gate,
- mastery,
- streak,
- attributes,
- resources,
- quest completion,
- achievements,
- titles,
- reflections,
- event history.

## UI state

Examples:

- modal open,
- selected tab,
- expanded card,
- animation active,
- temporary form input,
- toast visible.

Never persist UI state as game state unless explicitly required.

---

# 28. Date and Time Rules

Date handling is a high-risk area.

The system must distinguish:

- local calendar date,
- timestamp,
- event timestamp,
- quest date,
- reflection date.

Use the application's defined local-date behavior consistently.

Do not compare date strings from different timezone assumptions.

Do not use UTC dates blindly for player-facing daily progression.

Do not permit arbitrary client-side backdating through a hidden form field.

---

# 29. Achievement Registry Hardening

The current achievement registry has known inconsistencies.

Before relying heavily on achievement UI:

1. inspect all achievement IDs,
2. inspect all achievement triggers,
3. identify duplicates/mismatches,
4. document intended IDs,
5. fix them at the domain/data layer,
6. add regression tests.

Do not patch mismatched achievement IDs inside components.

---

# 30. Browser and Storage Constraints

The application is local-first.

Do not assume:

- server availability,
- cloud sync,
- multi-device state,
- authenticated identity,
- network availability.

Local storage can fail or become unavailable.

The application should fail gracefully.

---

# 31. Security and Trust Boundaries

Even though Mythic Levels is primarily a personal productivity product:

- imported data is untrusted,
- local data can be corrupted,
- reflection content is private user data,
- future AI features must not be allowed to silently mutate progression,
- progression rules remain deterministic and inspectable.

Future AI may assist with:

- reflection prompts,
- summaries,
- adaptive suggestions.

Future AI must not become the hidden source of truth for:

- XP,
- mastery,
- Gate unlocks,
- achievement eligibility,
- player identity.

---

# 32. Implementation Rules for Cursor

Cursor should be used as an implementation assistant, not as an autonomous architect.

Every implementation task should begin by checking:

1. relevant canonical docs,
2. existing code,
3. existing domain behavior,
4. current dependencies,
5. current state.

Prompts should identify:

- exact phase,
- exact files,
- intended behavior,
- constraints,
- acceptance criteria.

Do not ask Cursor to:

```text
Build the whole Mythic Levels app.
```

Prefer:

```text
Implement Phase 1.2 from IMPLEMENTATION_PLAN.md.
Inspect the existing domain and persistence code first.
Do not duplicate progression logic.
Create only the required store boundary.
```

---

# 33. Recommended Cursor Rules

After this implementation plan is finalized, create:

```text
.cursor/rules/mythic-levels.mdc
```

The rule file should be short.

It should state:

- read canonical docs,
- preserve domain authority,
- do not duplicate progression rules,
- UI is data-driven,
- preserve architecture boundaries,
- ask before destructive refactors,
- do not invent missing product rules,
- test changed behavior.

The rule file should not copy the entire documentation.

---

# 34. Suggested First Cursor Prompt

After all canonical planning documents are placed in `docs/`, the first implementation prompt should be:

```text
Read:

- docs/PRODUCT_SPEC.md
- docs/WORLD_DESIGN.md
- docs/ARCHITECTURE.md
- docs/UI_DESIGN.md
- docs/IMPLEMENTATION_PLAN.md

Then inspect the current repository.

Do not implement the entire product.

Implement PHASE 0 only.

Requirements:
1. Inspect the current project structure and package configuration.
2. Identify the existing domain/progression/persistence modules.
3. Preserve working domain logic.
4. Remove only Vite starter presentation code that conflicts with the Mythic Levels application.
5. Establish only the directories required for the next implementation phase.
6. Verify the application still runs.
7. Verify existing domain imports still work.
8. Establish the Vitest setup if it is currently incomplete.
9. Do not redesign the progression engine.
10. Do not add features from later phases.

At the end:
- list files created,
- list files modified,
- list files intentionally untouched,
- report tests/build checks performed,
- report any discovered architecture risks.

Stop after Phase 0.
```

---

# 35. Phase Completion Protocol

Every phase must end with:

## 35.1 Code review

Inspect:

- changed files,
- imports,
- dependencies,
- state flow,
- error handling.

## 35.2 Run application

Verify:

```bash
npm run dev
```

or the repository's actual development script.

---

## 35.3 Run tests

Use the actual configured test command.

Do not assume a script name if package.json says otherwise.

---

## 35.4 Check build

Run the repository's build command.

---

## 35.5 Manual verification

Perform the phase-specific acceptance flow.

---

## 35.6 Git checkpoint

Create a logical commit after a stable phase where Git is available.

Suggested style:

```text
feat: establish mythic levels state boundary
feat: add application shell and routing
feat: implement awakening flow
feat: build dashboard
```

Do not create meaningless commits for every tiny edit.

---

# 36. Definition of Done for a Phase

A phase is not done merely because the code compiles.

A phase is done when:

- intended behavior works,
- existing functionality is preserved,
- no known architectural boundary was violated,
- no duplicate business logic was introduced,
- relevant tests pass,
- build succeeds,
- manual acceptance criteria pass,
- UI errors are handled reasonably,
- documentation remains consistent.

---

# 37. Definition of Done for V1

Mythic Levels V1 is complete when a player can:

```text
Open Mythic Levels
      ↓
Awaken
      ↓
Create identity
      ↓
Reach Dashboard
      ↓
See current progression
      ↓
Explore Arcanas
      ↓
Explore Gates
      ↓
Open current Gate
      ↓
Understand the Gate
      ↓
Complete daily quests
      ↓
Receive legitimate progression
      ↓
Write reflections
      ↓
Complete Boss Trial
      ↓
Increase mastery
      ↓
Progress through Gates
      ↓
See achievements/titles
      ↓
Review Journal
      ↓
Review Analytics
      ↓
Refresh browser
      ↓
Progress remains
```

The experience must remain understandable on desktop and mobile.

---

# 38. Critical End-to-End Acceptance Test

This is the most important V1 test.

## Scenario

A brand-new player opens the application.

### Step 1

No saved state exists.

Expected:

```text
Awakening
```

### Step 2

Player enters a valid name.

Expected:

```text
Initial game state created.
```

### Step 3

Player reaches Dashboard.

Expected:

- correct identity,
- starting level,
- starting resources,
- current progression,
- current Gate.

### Step 4

Player opens Arcana map.

Expected:

- Beast visible,
- Gate catalog visible,
- current Gate identifiable,
- unavailable Gates correctly locked.

### Step 5

Player opens current Gate.

Expected:

- Gate lore,
- attribute,
- mastery,
- 7-day quests,
- Boss Trial status.

### Step 6

Player completes Day 1.

Expected:

- engine processes completion,
- reward is real,
- state changes,
- UI updates.

### Step 7

Player refreshes.

Expected:

- Day 1 remains completed,
- reward remains,
- no duplicate reward.

### Step 8

Player adds reflection.

Expected:

- reflection persists,
- journal can access it.

### Step 9

Player progresses enough to complete Boss Trial.

Expected:

- Boss Trial becomes available according to domain rules,
- completion affects progression through engine.

### Step 10

Player opens Profile.

Expected:

- attributes,
- resources,
- title/achievements,
- journey information.

### Step 11

Player opens Analytics.

Expected:

- analytics reflect actual history.

### Step 12

Player exports journey.

Expected:

- valid versioned export.

### Step 13

Player imports the export.

Expected:

- data validates,
- journey is restored,
- no malformed state is introduced.

If this scenario passes, the core product loop is working.

---

# 39. Risk Register

## Risk 1 — Rebuilding the engine in React

**Probability:** High  
**Impact:** Critical

Mitigation:

- strict store boundary,
- review every progression-related component,
- engine remains authoritative.

---

## Risk 2 — Store becomes a second domain engine

**Probability:** High  
**Impact:** High

Mitigation:

- store orchestrates,
- domain calculates.

---

## Risk 3 — UI hardcodes Gate data

**Probability:** Medium  
**Impact:** High

Mitigation:

- data-driven Gate components.

---

## Risk 4 — Persistence corruption

**Probability:** Medium  
**Impact:** Critical

Mitigation:

- validation,
- versioning,
- import validation,
- recovery path.

---

## Risk 5 — Date manipulation

**Probability:** Medium  
**Impact:** High

Mitigation:

- controlled date derivation,
- domain tests,
- no arbitrary client date input.

---

## Risk 6 — Visual polish hides missing functionality

**Probability:** High  
**Impact:** Medium

Mitigation:

- functionality-first phase order.

---

## Risk 7 — Starter CSS conflicts with design system

**Probability:** High  
**Impact:** Medium

Mitigation:

- inspect and remove obsolete starter styles,
- preserve canonical Mythic tokens.

---

## Risk 8 — Achievement inconsistencies

**Probability:** Medium  
**Impact:** Medium

Mitigation:

- domain-level registry audit and tests.

---

## Risk 9 — Browser storage failure

**Probability:** Low/Medium  
**Impact:** High

Mitigation:

- error handling,
- recovery messaging,
- export capability.

---

## Risk 10 — Scope expansion

**Probability:** High  
**Impact:** High

Mitigation:

Do not implement:

- authentication,
- cloud sync,
- community,
- AI coaching,
- mobile app,
- multiplayer,

until the local-first V1 is stable.

---

# 40. Scope Control

## V1 includes

- Awakening
- local identity
- Dashboard
- Arcanas
- 27 Gates
- 7-day quests
- quest completion
- XP
- levels
- attributes
- mastery
- streaks
- Boss Trials
- reflections
- achievements
- titles
- Journal
- Analytics
- Profile
- local persistence
- import/export/reset
- responsive UI
- accessibility basics

---

## V1 does not require

- authentication,
- cloud database,
- multiplayer,
- social feed,
- public profiles,
- AI-generated progression,
- external API integrations,
- native mobile app,
- push notifications,
- payment system.

These are future capabilities.

---

# 41. Performance Guidelines

The first version should remain simple.

Avoid:

- unnecessary global rerenders,
- massive animation trees,
- recalculating large analytics datasets on every render,
- loading all future heavy assets unnecessarily,
- unnecessary dependencies.

Prefer:

- derived selectors,
- memoization only where measured/useful,
- data-driven rendering,
- lightweight components,
- lazy loading for later large routes if needed.

Do not optimize prematurely.

---

# 42. Mobile Implementation Rules

Mobile is not an afterthought.

On small screens:

- navigation should collapse appropriately,
- quest cards remain readable,
- buttons remain tappable,
- text does not become microscopic,
- lore remains readable,
- progress remains visible,
- long forms remain usable.

Avoid horizontal overflow.

---

# 43. Accessibility Implementation Rules

All interactive elements need:

- accessible names,
- keyboard access,
- focus indication.

Inputs need:

- labels,
- validation feedback.

Modals need:

- clear title,
- close mechanism,
- keyboard behavior,
- focus handling where practical.

Progress bars should expose meaningful accessible information.

---

# 44. Visual Review Checklist

Before V1 release, verify:

### Identity

- Does it immediately feel like Mythic Levels?

### Hierarchy

- Is the primary action obvious?

### Typography

- Are mythic headings distinct from functional text?

### Color

- Are colors restrained?

### Spacing

- Does the UI breathe?

### Cards

- Do cards support hierarchy rather than create clutter?

### Motion

- Is animation purposeful?

### Responsiveness

- Does it work on small screens?

### Accessibility

- Can the core flow be completed with keyboard navigation?

---

# 45. Domain Review Checklist

Before V1 release, verify:

- 27 Gates exist.
- Gate IDs are stable.
- Gate data is complete.
- 7-day structure is consistent.
- Quest completion uses the engine.
- XP comes from engine logic.
- Mastery comes from engine logic.
- Streaks come from engine logic.
- Unlocks come from engine logic.
- Achievements come from engine logic.
- Titles come from engine logic.
- Reflections are persisted.
- Boss Trials use engine rules.
- Event history is preserved.
- Missing days do not destroy long-term progress.
- State initialization is valid.
- Persistence validation exists.
- Import validation exists.

---

# 46. Product Review Checklist

Before V1 release, verify:

- Mythology remains symbolic.
- Real-world action remains central.
- Failure is recoverable.
- No shame-based streak messaging.
- Player is the protagonist.
- UI does not pretend to transform the player.
- Progress represents behavior rather than fantasy.
- Reflection remains private.
- The system does not over-gamify serious self-development.
- Visual polish does not compromise clarity.

---

# 47. Final Implementation Order

The exact recommended order remains:

```text
0. Repository + Foundation
        ↓
1. State Boundary
        ↓
2. App Shell + Routing
        ↓
3. Awakening
        ↓
4. Dashboard
        ↓
5. Arcana Map
        ↓
6. Gate Experience
        ↓
7. Quest Completion
        ↓
8. Reflection + Boss
        ↓
9. Profile + Achievements
        ↓
10. Journal + Analytics
        ↓
11. Persistence Hardening
        ↓
12. Tests + Accessibility + Responsive
        ↓
13. Visual Polish
        ↓
V1 RELEASE
```

This order is intentional.

Do not reverse it simply because later screens are more visually exciting.

---

# 48. Final Engineering Principle

Mythic Levels should not be built as:

```text
Screens
+
Buttons
+
Animations
```

It should be built as:

```text
Domain Rules
+
Application State
+
Reliable Actions
+
Persistent Progress
+
Clear Interface
+
Mythic Meaning
```

The visual interface should make the underlying system understandable.

The state system should make progression reliable.

The progression engine should make the rules consistent.

The world design should make the journey meaningful.

The player's real-world actions should make the journey truthful.

---

# 49. Final Definition

The implementation is successful when:

> **The mythology gives the journey meaning.**
>
> **The product gives the journey structure.**
>
> **The progression engine gives the journey rules.**
>
> **The interface gives the journey presence.**
>
> **Persistence gives the journey continuity.**
>
> **The player's real-world actions give the journey truth.**

That is the implementation target for Mythic Levels V1.
