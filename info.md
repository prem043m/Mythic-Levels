# MYTHIC LEVELS - Project Information

## 1. Project Summary

MYTHIC LEVELS is designed as a personal-development progression system presented as a mythic journey. The intended experience trains attention, discipline, knowledge, communication, emotional balance, perspective, connection, and wisdom through a sequence of Gates.

The project currently contains two different layers:

- A substantial domain and progression implementation under `src/data`, `src/domain`, `src/services`, and `src/utils`.
- A Vite starter interface in `src/App.jsx` that still renders the default React/Vite demonstration screen.

The progression engine is therefore present in source, but it is not currently wired into the visible React application. No current UI imports the engine, catalog, storage service, daily-plan service, or domain models.

## 2. Current Runtime Status

### What runs today

- `src/main.jsx` mounts `App` inside React `StrictMode`.
- `src/App.jsx` renders a counter, React/Vite artwork, documentation links, and Vite community links.
- `src/index.css` loads Tailwind CSS and defines the intended MYTHIC LEVELS color and typography tokens, but the active app still uses starter styles from `src/App.css`.
- Vite provides the development server, production build, and preview server.

### What is implemented but not connected

- Player, settings, progress, and Gate state factories.
- A 27-Gate catalog spanning three Arcanas.
- Seven daily tasks and one boss trial per Gate.
- Quest completion and reward processing.
- XP levels and difficulty scaling.
- Attribute progression.
- Gate mastery and unlocking.
- Streak tracking, achievements, titles, reflections, and event history.
- Daily plan generation.
- Local-storage persistence helpers.

## 3. Technology Stack

- React `19.2.8`
- React DOM `19.2.8`
- Vite `8.2.2`
- React Router DOM `7.18.3` (installed but not currently used)
- Zustand `5.0.15` (installed but not currently used)
- Framer Motion `13.2.0` (installed but not currently used)
- Tailwind CSS `4.3.3`
- Tailwind Vite plugin `@tailwindcss/vite`
- Oxlint `1.79.0`
- Vitest `5.0.0`
- Testing Library for React, user events, and Jest DOM matchers
- JavaScript with JSX; no TypeScript source is present

The package is an ES module package because `package.json` sets `"type": "module"`.

## 4. Commands

```bash
npm install
npm run dev
npm run build
npm run lint
npm run preview
```

Scripts defined in `package.json`:

- `dev`: starts Vite with hot module replacement.
- `build`: creates the production bundle.
- `lint`: runs Oxlint.
- `preview`: serves the production build locally.

There is no `test` script, even though Vitest and Testing Library packages are installed.

## 5. Application Entry Points

### `index.html`

- Declares an English HTML document.
- Loads `/favicon.svg`.
- Sets a responsive viewport.
- Provides a MYTHIC LEVELS description mentioning 27 Gates across three Arcanas.
- Loads Cinzel and Source Sans 3 from Google Fonts.
- Sets the document title to `MYTHIC LEVELS`.
- Provides the `#root` mount element.
- Loads `/src/main.jsx` as a module.

### `src/main.jsx`

Creates a React root from `document.getElementById('root')`, imports global CSS, and renders `<App />` inside `<StrictMode>`.

### `src/App.jsx`

This is still the standard Vite starter component:

- Stores a local counter with `useState`.
- Displays the imported hero image, React logo, and Vite logo.
- Renders a `Get started` heading and HMR instructions.
- Links to Vite, React, GitHub, Discord, X, and Bluesky.
- Does not use routing, global state, persistence, progression services, or the MYTHIC LEVELS domain.

## 6. Styling and Visual System

### `src/index.css`

Imports Tailwind CSS and defines a dark mythic visual language with these theme values:

- Backgrounds: void and obsidian tones.
- Accent colors: ancient gold, mystic violet, cosmic cyan, ember orange, and spirit lavender.
- Text colors: ink and muted.
- Display font: Cinzel.
- Body font: Source Sans 3.

It also provides:

- Dark `color-scheme`.
- Full-viewport root and body sizing.
- Cyan `:focus-visible` outlines.
- Selection color based on mystic violet.
- `.text-balance` utility.
- `.engraved` uppercase typography utility.
- `.panel` gradient panel styling.
- `.glow-mystic` and `.glow-ancient` shadow utilities.
- Reduced-motion overrides.

### `src/App.css`

Contains the default Vite starter layout for the counter, hero artwork, central section, next-steps sections, links, and spacer. It uses starter variables such as `--accent`, `--border`, `--text-h`, `--social-bg`, and `--shadow`; those variables are not defined in the visible project CSS and should be reviewed when replacing the starter UI.

## 7. Configuration

### `vite.config.js`

- Enables React through `@vitejs/plugin-react`.
- Enables Tailwind through `@tailwindcss/vite`.
- Defines the `@` alias as the `src` directory.
- Configures Vitest for the `jsdom` environment with global APIs.
- Points Vitest at `./src/test/setup.js`.

The file references a test setup path, but the current source inventory does not contain `src/test/setup.js` or any test files.

### `jsconfig.json`

Defines the `@/*` path alias to resolve to `src/*`. This matches the Vite alias and is used throughout the domain and service modules.

### `.oxlintrc.json`

Enables the React and Oxc plugins. React Hooks rules are errors, while the React only-export-components rule is a warning and permits constant exports.

## 8. Domain Model

### Player

`src/domain/models.js` creates a player with:

- Generated `player-*` id.
- Trimmed name and title, defaulting to `The Human`.
- ISO creation timestamp.
- Current position, initially Arcana `beast`, Gate `1`.
- XP and seven resource counters: MP, SP, AP, DP, KP, and CP.
- Nine zeroed attributes.
- Attribute history starting with an initial snapshot.
- Empty achievement list.
- Initial title `The Awakening`.
- Avatar, goal, routine, and improvement-area preferences.

### Settings

Settings default to:

- `standard` difficulty.
- 25 minutes per day.
- All seven days available.
- Reminders disabled.
- Mastery threshold `0.7`.
- Sound disabled.
- Awakening marked incomplete until initial state creation.
- Ceremony not skipped.

### Progress

Progress stores:

- Per-Gate records.
- Total completed quests.
- Knowledge, listening, and observation quest counters.
- Longest focus duration.
- Total practice minutes.
- Reflections.
- Up to 400 recent events.
- Daily plans by date key.
- Current and longest streak, last active date, and interruption state.
- Whether the player has missed a day and returned.

### Gate progress

Each Gate record contains:

- Gate id.
- Unlock status.
- Start and completion timestamps.
- Per-day completion records.
- Boss completion timestamp.
- Gate MP total.

## 9. Core Constants and Resources

Defined in `src/config/constants.js`:

- Storage key: `mythic-levels:v1`.
- Schema version: `1`.
- Arcana order: `beast`, `human`, `sage`.
- Attributes: Focus, Discipline, Awareness, Knowledge, Communication, Emotional Balance, Perspective, Connection, and Wisdom.
- Default mastery threshold: `70%`.
- Mastery weights:
  - Practice: `40%`
  - Consistency: `20%`
  - Reflection: `15%`
  - Boss: `25%`
- Difficulty modes:
  - Gentle: `0.9x` XP and `0.75x` duration.
  - Standard: `1.0x` XP and `1.0x` duration.
  - Austere: `1.15x` XP and `1.25x` duration.
- Six avatar choices: Lantern, Beast, Human, Sage, Quill, and Compass.

Resource names are abbreviated in the implementation:

- `xp`: experience points used for levels.
- `mp`: mastery points, also accumulated per Gate.
- `sp`: streak points.
- `ap`: awareness points.
- `dp`: discipline points.
- `kp`: knowledge points.
- `cp`: connection/communication points.

## 10. Content Architecture

### Arcanas

`src/data/arcanas.js` defines three thematic arcs:

1. The Beast (`I`, ember accent): understand, confront, tame, and master impulsive behavior.
2. The Human (`II`, ancient accent): build awareness, discipline, expression, identity, and connection.
3. The Sage (`III`, cosmic accent): integrate knowledge, stillness, compassion, and wisdom.

Each Arcana contains a name, Roman numeral, glyph, accent token, promise, and lore.

### Gates

The catalog assembles 27 Gates from six data files:

- Beast Gates 1-3: `beastGates.part1.js`.
- Beast Gates 4-9: `beastGates.late.js`.
- Human Gates 1-5: `humanGates.early.js`.
- Human Gates 6-9: `humanGates.late.js`.
- Sage Gates 1-4: `sageGates.early.js`.
- Sage Gates 5-9: `sageGates.late.js`.

Each Gate describes its id, Arcana, number, name, archetype, symbol, characteristic, weakness, capability, principle, related attributes, difficulty, recommended duration, lore, initiation text, philosophy, outcome, title reward, and achievement id.

The nine Gate sequence in each Arcana is intended to move from recognition and basic practice toward integration and completion. Gate content is deliberately written as real-world behavioral exercises rather than fantasy combat.

### Gate construction

Most Gates use `makeGate` from `src/data/gateFactory.js`. It converts a compact config into:

- Seven normalized daily entries generated by `buildDays`.
- One normalized boss trial with a generated id.

The Beast data uses the same seven-phase builder directly for its early and late files.

### Seven daily phases

`src/data/dayPath.js` provides default metadata for:

1. Recognition - observation - 22 XP.
2. Observation - observation - 24 XP.
3. Practice - practice - 30 XP.
4. Resistance - practice - 32 XP.
5. Application - daily - 34 XP.
6. Challenge - practice - 40 XP.
7. Reflection & Trial - reflection - 36 XP.

Gate-specific entries can override type, objective, explanation, task, duration, XP, rewards, attributes, and prompt.

## 11. Catalog API

`src/data/catalog.js` creates `ALL_GATES` and an id lookup map. It exposes:

- `listGates()` - all 27 Gates.
- `getGateById(id)` - one Gate or `null`.
- `getGateByPosition(arcana, gateNumber)` - Gate lookup by location.
- `getArcana(id)` - Arcana lookup.
- `gatesForArcana(arcanaId)` - all Gates in one Arcana.
- `getQuest(gateId, questId)` - resolves a daily quest or boss trial and returns its kind, Gate, and quest.

## 12. Progression Engine

The main application logic is in `src/services/progression/engine.js`.

### Initial state

`createInitialState(awakening)`:

- Creates a player, settings, and empty progress.
- Creates the first Beast Gate record (`beast-01`).
- Marks awakening complete.
- Returns a state with schema version `1`.

### Completing a quest

`completeQuest(state, input)` clones the state and performs these operations:

1. Resolves the Gate and quest.
2. Rejects missing quests and locked Gates.
3. Sanitizes reflection text and limits it to 8,000 characters.
4. Uses the supplied duration or the quest duration.
5. Prevents duplicate daily completion and duplicate boss completion.
6. Records completion date, timestamp, reflection, phase, quest id, and minutes.
7. Applies difficulty-scaled XP and all quest resources.
8. Adds quest attribute rewards, capped at 100 per attribute.
9. Updates total quest, practice-minute, longest-focus, knowledge, listening, and observation counters.
10. Updates the streak and awards 1 SP for starting/continuing or 2 SP for returning after an interruption.
11. Saves reflections of at least 12 characters.
12. Appends an attribute-history snapshot and keeps the latest 120 snapshots.
13. Calculates Gate mastery and checks whether the Gate has both a completed boss and enough mastery.
14. Marks completed Gates, unlocks the next Gate, advances the player's current position, grants Gate titles, and reports Gate or Arcana ascension.
15. Evaluates achievements and titles.
16. Appends a completion event, retaining at most 400 events.
17. Returns the new state plus rewards, mastery signals, level, unlocks, achievements, titles, ascension, streak information, and interruption status.

The function is immutable from the caller's perspective because it clones the input state before mutation. Failure results return the original state and an error id.

### Gate entry

`enterGate` verifies the Gate exists and is unlocked, starts it if necessary, moves the player's current position, and records a `GATE_ENTERED` event.

### Reflections and plans

- `upsertReflection` creates or edits a sanitized reflection.
- `deleteReflection` removes a reflection by id.
- `saveDailyPlan` stores a plan by date and records a `PLAN_SAVED` event.

### State validation

`validateLoadedState` requires schema version `1`, a player id and name, and both progress and settings. If attributes are missing, it inserts an empty attribute object. It does not perform exhaustive validation of every nested field.

## 13. Mastery Rules

`src/services/progression/mastery.js` calculates four signals:

- Practice: completed non-trial days divided by six, capped at 1.
- Consistency: unique completion dates divided by seven, capped at 1.
- Reflection: completed days with a reflection of at least 12 characters divided by seven, capped at 1.
- Boss: 1 if the boss is complete, otherwise 0.

Mastery is the weighted sum of those four signals. A Gate completes only when:

- The boss is complete.
- Mastery is at least the configured threshold, normally `0.7`.

## 14. XP and Levels

`src/services/progression/xp.js` starts players at level 1. The first level requires 200 XP. Each subsequent level requirement is the previous requirement multiplied by `1.12` and rounded.

`scaleXp` applies difficulty multipliers and rounds the result:

- Gentle: 90%.
- Standard: 100%.
- Austere: 115%.

## 15. Gate Unlocking

`src/services/progression/unlocks.js` enforces linear progression:

- Beast Gate 1 is always unlockable.
- Gates 2-9 require the previous Gate in the same Arcana to be completed.
- Human Gate 1 requires Beast Gate 9.
- Sage Gate 1 requires Human Gate 9.
- The final Sage Gate has no next Gate.

The next position helper advances within an Arcana, then moves to Gate 1 of the next Arcana.

## 16. Streaks

`applyStreak` uses local date keys in `YYYY-MM-DD` format:

- First activity starts a streak at 1.
- Activity on the same date does not increase it.
- Activity on the next day increments current and possibly longest streak.
- A gap greater than one day resets current to 1, marks the streak interrupted, and reports a `returned` result.

Returning after a gap sets `missedThenReturned` and awards 2 SP. Starting or continuing awards 1 SP.

## 17. Achievements and Titles

`src/data/achievements.js` defines 17 achievement records, including first quest, returning after a missed day, a 60-minute focus session, listening, knowledge, observation, reflections, a seven-day streak, Arcana completion, selected boss completions, 20 quests, and 100 practice minutes.

The same file defines titles such as The Awakening, The Human, The Attentive, The Listener, The Watcher, The Disciplined, The Weaver, The Forge-Bearer, The Seeker, The Scholar, The Wanderer, The Still Mind, The Illuminated, and The Sage.

`src/services/progression/achievements.js` evaluates:

- Global milestone conditions.
- Gate completion achievement ids supplied by the engine.
- Title conditions based on achievements, Arcana entry, and selected Gate completion.

## 18. Daily Plans

`src/services/quests/dailyPlan.js` generates a plan for the current date or a requested date.

The plan contains:

- Morning: the next incomplete day quest, or the boss trial after all seven days are complete.
- Afternoon: a generic secondary observation quest.
- Evening: a reflection prompt, using Gate day 7's prompt where available.

Daily duration is limited by the user's configured daily duration. The boss plan uses at least 40 minutes and caps at the boss duration. Existing plans are returned unchanged. `defaultTomorrowDraft` generates the next-day plan.

## 19. Persistence

`src/services/storage/storage.js` provides:

- `createMemoryAdapter` for in-memory use and tests.
- `createLocalStorageAdapter` for browser `localStorage` access.
- `createStorage` with `load`, `save`, and `clear` operations.

Persistence uses the `mythic-levels:v1` key and JSON serialization. Loading rejects missing, malformed, or unsupported-schema data with explicit result objects. Browser `localStorage` reads return `null` if access throws; writes are handled by the storage wrapper and return `persist-failed` on failure.

## 20. Utilities

### Dates - `src/utils/dates.js`

- Converts dates to local `YYYY-MM-DD` keys.
- Parses date keys.
- Adds days.
- Calculates whole-day differences.
- Returns today's local date key.

### IDs and display values - `src/utils/ids.js`

- Creates prefixed UUID ids when `crypto.randomUUID` is available.
- Falls back to a timestamp plus random string.
- Provides `clamp` and percentage formatting helpers.

### Text sanitization - `src/utils/sanitize.js`

- Accepts strings only.
- Removes case-insensitive `<script` openings.
- Truncates plain text to 8,000 characters.
- Provides `escapeHtml` for HTML-sensitive characters.

The sanitizer is intentionally lightweight. It is not a general HTML sanitizer, so UI rendering should continue to treat reflection text as plain text rather than injecting it as HTML.

## 21. Static Assets

The `public` directory contains:

- `favicon.svg` for the browser tab.
- `icons.svg` used by the Vite starter screen.

The `src/assets` directory contains the Vite starter hero image, React logo, and Vite logo. These are currently imported by `App.jsx`.

## 22. Important Current Gaps and Risks

1. The progression system is not connected to the React UI. Users cannot create an awakening, view Gates, complete quests, see mastery, or save reflections through the current screen.
2. React Router, Zustand, and Framer Motion are installed but unused. They may be intended for the future application shell.
3. Vitest and Testing Library are installed, but there is no test script and no visible test directory. The configured `src/test/setup.js` path is absent from the current source inventory.
4. The starter CSS references undefined Vite-template custom properties. Replacing `App.jsx` should also replace or remove the starter CSS.
5. `validateLoadedState` checks only a small part of the state shape and does not migrate old schemas.
6. Local date calculations use local time and a fixed `86400000` millisecond day difference. Daylight-saving transitions could make date-gap behavior worth testing.
7. The engine accepts a quest completion `dateKey` from its caller. A future UI should validate allowed dates and prevent unintended backdating if that matters to the product.
8. The achievement data and Gate `achievementId` fields are not a strict one-to-one registry. Some Gate ids are supplied dynamically by the engine, while title definitions also refer to ids such as `shrine-mastered` and `beacon-mastered`.
9. The README still describes the untouched React/Vite template rather than the Mythic Levels domain.
10. The project has no documented state-management boundary yet. A future UI will need to decide whether to use React state, Zustand, or another adapter around the pure progression engine.

## 23. Suggested Integration Order

When turning the domain into the product UI, a low-risk order is:

1. Add a state/store adapter that loads and saves the validated state.
2. Build the awakening flow around `createInitialState`.
3. Add a shell showing player summary, current Arcana, current Gate, level, resources, and streak.
4. Add Gate and quest views driven by the catalog API.
5. Connect quest completion to `completeQuest` and display returned rewards, mastery, unlocks, titles, and achievements.
6. Add reflections and daily-plan editing through the engine helpers.
7. Add progression history and achievement views.
8. Add focused tests for XP, mastery, streak transitions, unlocking, storage failures, sanitization, and quest completion before making the UI more elaborate.
9. Replace the Vite starter README and remove unused starter assets and CSS once the real interface is in place.

## 24. Source Map

```text
index.html                 HTML shell and fonts
package.json               Scripts and dependencies
vite.config.js             Vite, Tailwind, alias, and Vitest config
jsconfig.json              JavaScript path alias
README.md                  Still the Vite template README
src/main.jsx               React bootstrap
src/App.jsx                Current Vite starter UI
src/index.css              Global tokens and utilities
src/App.css                Current starter component styles
src/config/constants.js    Storage, Arcana, attribute, difficulty constants
src/domain/models.js       Player, settings, progress, and Gate factories
src/data/arcanas.js        Three Arcana definitions
src/data/catalog.js        Gate and quest lookup API
src/data/dayPath.js        Seven-phase day builder
src/data/gateFactory.js    Gate normalization helper
src/data/achievements.js   Achievement and title definitions
src/data/*Gates*.js        27 Gate content definitions
src/services/progression/  Pure progression rules and state transitions
src/services/quests/       Daily-plan generation
src/services/storage/      Browser and memory persistence adapters
src/utils/                 Date, id, percentage, and text helpers
public/                    Favicon and starter icon sprite
```