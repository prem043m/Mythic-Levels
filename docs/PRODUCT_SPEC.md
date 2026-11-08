# MYTHIC LEVELS — PRODUCT SPECIFICATION

**Document Status:** Canonical Product Specification  
**Version:** 1.0  
**Product:** Mythic Levels  
**Document Type:** Product Requirements / Product Specification  
**Audience:** Product owner, designer, frontend/backend engineers, AI agents, reviewers, future contributors  
**Source of Truth:** Product behavior and requirements  
**Related Canonical Documents:** `WORLD_DESIGN.md`, `ARCHITECTURE.md`, `UI_DESIGN.md`, `IMPLEMENTATION_PLAN.md`

---

# 1. DOCUMENT PURPOSE

This document defines what **Mythic Levels** is as a product, what it must do, how its major systems behave, what the player can experience, and which rules must remain stable during implementation.

`WORLD_DESIGN.md` defines the meaning, mythology, symbolism, Gates, Arcanas, lore, and narrative philosophy of the world.

This document defines the **product behavior built around that world**.

The purpose is to prevent implementation from becoming a collection of disconnected screens or features.

Every major feature should answer:

1. Why does this feature exist?
2. What real-world behavior does it support?
3. How does it fit the Mythic Levels progression system?
4. What does the player see?
5. What state does the system change?
6. What must never happen?

---

# 2. PRODUCT DEFINITION

## 2.1 Product Name

**MYTHIC LEVELS**

## 2.2 Product Category

Mythic Levels is a **gamified self-improvement and personal evolution system**.

It combines:

- structured self-improvement,
- real-world practice,
- behavioral progression,
- reflective journaling,
- measurable progress,
- game-like progression,
- mythology-inspired narrative,
- achievement systems,
- visual feedback.

It is not intended to be merely a habit tracker with fantasy decoration.

## 2.3 Core Product Principle

> **The game is the interface. The real world is the arena.**

The application provides structure, measurement, motivation, reflection, and progression.

The actual transformation must happen through the player's real-world actions.

## 2.4 Product Promise

Mythic Levels should help a player:

- identify weaknesses,
- understand behavioral patterns,
- practice specific capabilities,
- build consistency,
- reflect honestly,
- measure progression,
- develop stronger capabilities over time,
- and experience self-improvement as a meaningful journey.

The application must not claim that digital progression itself proves objective personal transformation.

---

# 3. PRODUCT VISION

Mythic Levels presents personal development as an evolving journey through a symbolic world.

The player begins with an **Awakening**.

They encounter the **Beast Arcana**, representing fundamental weaknesses and behavioral obstacles.

They progress through increasingly integrated forms of development:

**Beast → Human → Sage → Integration**

Each Gate represents a specific capability that can be trained.

The product turns vague self-improvement into a structured loop:

**Recognize → Observe → Practice → Resist → Apply → Challenge → Reflect**

The system should make progress visible without reducing personal growth to a single number.

---

# 4. PRODUCT PHILOSOPHY

## 4.1 Symbolic, Not Supernatural

The mythology is symbolic.

The player is not literally fighting supernatural creatures.

The Gremlin, Troll, Goblin, Orc, Fairy, Dwarf, Kitsune, Asura, and Minotaur represent recognizable human behavioral patterns.

## 4.2 Reality First

The application should always prioritize meaningful real-world action over decorative progression.

A player should not be able to "win" merely by opening the application.

## 4.3 Meaning Before Decoration

Visual effects, XP, levels, titles, and animations exist to reinforce meaning.

They must not become the purpose of the system.

## 4.4 Player Agency

The player owns the journey.

The application provides guidance and structure but does not claim authority over the player's identity or life.

## 4.5 No Shame-Based Progression

Failure should be recoverable.

Missing a day must not erase months of progress.

A player should be challenged without being humiliated.

## 4.6 Progress Is Not Perfection

The system should reward:

- effort,
- consistency,
- reflection,
- honest engagement,
- capability development.

It should not imply that perfect streaks are the only form of success.

---

# 5. PRODUCT GOALS

## 5.1 Primary Goals

Mythic Levels must:

1. Give users a clear self-improvement progression system.
2. Convert abstract weaknesses into concrete training areas.
3. Provide structured Gate-based practice.
4. Make daily progress visible.
5. Encourage reflection.
6. Provide meaningful mastery measurements.
7. Create a long-term sense of progression.
8. Preserve user progress locally.
9. Provide an emotionally compelling interface.
10. Maintain a coherent mythology across the entire application.

## 5.2 Secondary Goals

The product should:

- encourage returning daily,
- reduce ambiguity about what to practice,
- help users understand their development,
- provide historical progress,
- support personal reflection,
- make milestones memorable,
- eventually support adaptive and AI-assisted experiences.

---

# 6. PRODUCT NON-GOALS

Mythic Levels is not intended to:

- diagnose mental health conditions,
- provide medical treatment,
- replace professional therapy,
- claim scientifically precise measurement of personality,
- guarantee personal transformation,
- judge a person's worth,
- force a single definition of success,
- turn every real-world behavior into a score,
- create shame through punishment mechanics,
- present mythology as literal supernatural truth.

Future features must not violate these boundaries.

---

# 7. TARGET PLAYER EXPERIENCE

The player should feel that:

- their journey has structure,
- their weaknesses can be trained,
- progress is visible,
- challenges are meaningful,
- reflection matters,
- the system remembers their journey,
- each Gate represents a meaningful stage,
- advancing feels earned,
- the interface is immersive without becoming childish,
- the real world remains more important than the application.

The intended emotional progression is approximately:

**Curiosity → Recognition → Challenge → Effort → Resistance → Capability → Reflection → Mastery → Evolution**

---

# 8. CORE PRODUCT LOOP

The primary product loop is:

```text
ENTER
  ↓
UNDERSTAND CURRENT STATE
  ↓
SEE CURRENT GATE
  ↓
RECEIVE DAILY PRACTICE
  ↓
COMPLETE REAL-WORLD ACTION
  ↓
RECORD COMPLETION / REFLECTION
  ↓
EARN PROGRESSION
  ↓
UPDATE MASTERY
  ↓
RETURN NEXT DAY
  ↓
COMPLETE GATE
  ↓
ATTEMPT BOSS TRIAL
  ↓
MASTER GATE
  ↓
UNLOCK NEXT GATE
```

This loop must remain understandable even if the product gains additional features.

---

# 9. PLAYER LIFECYCLE

## 9.1 First Visit

A new player should encounter:

1. Product introduction.
2. Mythic Levels philosophy.
3. Awakening.
4. Player identity setup.
5. Initial entry into the progression system.
6. First Gate or appropriate starting state.

## 9.2 Returning Player

A returning player should quickly understand:

- current Arcana,
- current Gate,
- current day,
- current quest,
- current XP,
- current mastery,
- current streak,
- recent progress,
- next meaningful action.

## 9.3 Long-Term Player

A long-term player should be able to see:

- completed Gates,
- current Gate,
- mastery history,
- attributes,
- achievements,
- titles,
- reflections,
- journal history,
- overall progression,
- Arcana progression,
- Integration state when eventually reached.

---

# 10. AWAKENING SYSTEM

## 10.1 Purpose

Awakening is the player's entry point into Mythic Levels.

It establishes that the player is beginning a personal journey rather than merely creating an account.

## 10.2 Awakening Data

The initial player state may contain:

- player name,
- selected identity information supported by the product,
- awakening date,
- initial progression state,
- starting resources,
- initial Gate state.

## 10.3 Awakening Principle

Awakening should feel meaningful but should not become unnecessarily long.

The player should understand:

> "I am beginning a structured journey of development."

## 10.4 Validation

Awakening input must be validated before creating the initial progression state.

Invalid or empty player identity data must not be passed directly into domain initialization.

---

# 11. PLAYER PROFILE

The player profile represents the player's current state.

It should display:

- player name,
- current title,
- current level,
- XP,
- current Arcana,
- current Gate,
- attributes,
- resources where appropriate,
- achievements,
- titles,
- journey statistics.

The profile should represent progress without defining the player's worth.

---

# 12. PROGRESSION HIERARCHY

The product progression hierarchy is:

```text
MYTHIC LEVELS
    │
    ├── Awakening
    │
    ├── Beast Arcana
    │   ├── Gate 01
    │   ├── Gate 02
    │   ├── ...
    │   └── Gate 09
    │
    ├── Human Arcana
    │   ├── Gate 01
    │   ├── ...
    │   └── Gate 09
    │
    ├── Sage Arcana
    │   ├── Gate 01
    │   ├── ...
    │   └── Gate 09
    │
    └── Integration
```

Total Gates:

**27**

---

# 13. ARCANAS

## 13.1 Beast

The Beast Arcana represents foundational weaknesses and behavioral obstacles.

Its Gates include:

1. Gremlin of Flickering Thoughts — Focus
2. Troll of Deafened Ears — Communication
3. Goblin of Restless Desire — Discipline
4. Orc of Unshaped Force — Discipline
5. Fairy of Flighty Emotion — Emotional Balance
6. Dwarf of Narrow Vision — Perspective
7. Kitsune of Masked Speech — Communication
8. Asura of Turbulent Ego — Awareness
9. Minotaur of the Labyrinth — Wisdom

## 13.2 Human

The Human Arcana represents deliberate development and integration of human capabilities.

Its Gates include:

1. Lantern of Awareness
2. Mirror of Listening
3. Compass of Discipline
4. Quill of Expression
5. Scale of Balance
6. Lens of Perspective
7. Loom of Connection
8. Forge of Identity
9. Crown of Integration

## 13.3 Sage

The Sage Arcana represents deeper perspective, knowledge, stillness, transformation, detachment, illumination, and transcendence.

Its Gates include:

1. Veil of Inner Sight
2. Cipher of Knowledge
3. Horizon of Perspectives
4. Shrine of Stillness
5. Crucible of Transformation
6. Thread of Oneness
7. Seal of Detachment
8. Beacon of Illumination
9. Crown of Transcendence

## 13.4 Integration

Integration is the conceptual culmination of the progression.

It represents the integration of learned capabilities rather than another simple fantasy level.

The exact implementation of final Integration should remain consistent with `WORLD_DESIGN.md`.

---

# 14. GATE SYSTEM

## 14.1 Gate Definition

A Gate is a structured period of practice centered around one capability.

Every Gate should define:

- Gate ID,
- Arcana,
- Gate name,
- archetype or symbolic identity where applicable,
- weakness/problem,
- capability trained,
- description,
- lore,
- philosophy,
- quote,
- seven-day progression,
- Boss Trial,
- mastery rules,
- unlock relationship.

## 14.2 Gate as Training Unit

A Gate is not merely a page.

It is the fundamental training unit of Mythic Levels.

The player enters a Gate, practices its capability, reflects on the experience, completes the required progression, and attempts the Boss Trial.

---

# 15. SEVEN-DAY GATE STRUCTURE

Every Gate follows the canonical seven-stage structure:

| Day | Stage | Purpose |
|---|---|---|
| 1 | Recognition | Identify the pattern |
| 2 | Observation | Observe it without immediately reacting |
| 3 | Practice | Deliberately train the capability |
| 4 | Resistance | Practice under difficulty |
| 5 | Application | Apply the capability in real life |
| 6 | Challenge | Complete a harder deliberate challenge |
| 7 | Reflection & Trial | Reflect and prepare for the Boss Trial |

The exact content is Gate-specific.

The structure itself should remain consistent across Gates.

---

# 16. DAILY QUESTS

## 16.1 Purpose

Daily quests convert the abstract Gate capability into an actionable behavior.

A quest should tell the player:

- what to do,
- why it matters,
- expected duration,
- expected effort,
- reward,
- optional reflection.

## 16.2 Quest Requirements

A quest should have:

- unique ID,
- Gate ID,
- day number,
- stage,
- title,
- description,
- duration where applicable,
- XP reward,
- completion state,
- reflection state where applicable.

## 16.3 Completion

When a player completes a quest:

1. Completion must be validated.
2. The progression engine processes the completion.
3. XP is awarded according to domain rules.
4. Relevant attributes may change.
5. Mastery may change.
6. Streak state may change.
7. Achievements may trigger.
8. Titles may unlock.
9. Gate state may update.
10. Event history may record the action.
11. Persistence must save the updated state.

The UI must not independently reproduce these calculations.

---

# 17. REFLECTION SYSTEM

## 17.1 Purpose

Reflection makes the player examine what happened rather than merely marking a checkbox.

## 17.2 Reflection Principles

Reflections should encourage:

- honesty,
- observation,
- learning,
- self-awareness,
- recognition of resistance,
- recognition of progress.

## 17.3 Reflection Is Not a Test

The system should not grade a reflection as if there were one objectively correct answer.

## 17.4 Reflection Storage

Reflections should be associated with:

- quest or Gate,
- date,
- player entry,
- relevant metadata,
- timestamps where appropriate.

## 17.5 Privacy

Reflections are personal data and should be treated accordingly.

The initial local-first implementation should keep them in the user's local persistence unless the player explicitly opts into a future cloud feature.

---

# 18. BOSS TRIAL SYSTEM

## 18.1 Purpose

The Boss Trial is the culminating challenge of a Gate.

It tests whether the player can apply the capability under a meaningful challenge.

## 18.2 Boss Trial Philosophy

The Boss Trial should feel:

- significant,
- challenging,
- connected to the Gate,
- grounded in real-world action.

It must not be a purely UI-based button press.

## 18.3 Example

For the Gremlin of Flickering Thoughts:

**THE SILENT HOUR**

A player completes one 60-minute deep-focus session and honestly describes what they did.

## 18.4 Completion Requirements

A Boss Trial may require:

- prerequisite daily quests,
- a real-world action,
- reflection,
- confirmation.

The exact requirements are Gate-specific.

---

# 19. MASTERY SYSTEM

## 19.1 Purpose

Mastery represents progress within a Gate.

It is not intended to be a scientifically exact measurement of capability.

## 19.2 Suggested Mastery Model

The canonical product model uses:

- Practice: 40%
- Consistency: 20%
- Reflection: 15%
- Boss Trial: 25%

Suggested mastery threshold:

**70%**

The implementation may use the existing progression engine's concrete calculations, provided the conceptual model remains consistent.

## 19.3 Mastery Interpretation

Mastery should communicate:

> "How far have I progressed through this structured training?"

It should not communicate:

> "This is your objective level of human ability."

---

# 20. XP SYSTEM

## 20.1 Purpose

XP provides immediate and long-term feedback.

## 20.2 XP Sources

XP may come from:

- daily quest completion,
- Boss Trials,
- Gate completion,
- achievements,
- other explicitly defined progression events.

## 20.3 XP Principles

XP should:

- reward meaningful engagement,
- be deterministic,
- be controlled by domain logic,
- not be arbitrarily calculated by UI components.

## 20.4 Existing Domain Authority

The existing progression engine remains the source of truth for XP calculations.

The React application must call the engine rather than recreate formulas.

---

# 21. LEVEL SYSTEM

Levels provide a broad representation of accumulated progression.

Level calculations belong to the progression/domain layer.

The UI should display the result.

The UI must not become the authority for level calculation.

---

# 22. ATTRIBUTES

The canonical attributes are:

1. Focus
2. Discipline
3. Awareness
4. Knowledge
5. Communication
6. Emotional Balance
7. Perspective
8. Connection
9. Wisdom

Attributes should increase through relevant progression events.

A Gate should normally contribute to the capability it trains.

Attributes are representations of the player's tracked progression, not objective psychological measurements.

---

# 23. RESOURCES

The product concept includes:

- XP
- MP
- SP
- AP
- DP
- KP
- CP

The exact semantic meaning and implementation of each resource must remain aligned with the established domain models and world specification.

If a resource is not currently used by a product feature, it should not be artificially surfaced merely for visual complexity.

---

# 24. STREAK SYSTEM

## 24.1 Purpose

Streaks encourage consistency.

## 24.2 Streak Philosophy

A streak should motivate continued practice without becoming a punishment system.

## 24.3 Missing a Day

Missing a day must not erase months of progress.

The system should distinguish:

- current streak,
- historical progress,
- completed Gates,
- earned achievements,
- total XP.

A broken streak does not mean the journey is reset.

## 24.4 Date Handling

Daily progression must use a consistent date-key strategy.

Local date and daylight-saving considerations must be handled deliberately.

The UI must not casually manufacture dates or backdate completion.

---

# 25. UNLOCK SYSTEM

## 25.1 Purpose

Unlocking creates progression structure.

## 25.2 Unlock Principles

The player should not be presented with every Gate as equally available without context.

Unlocking should communicate:

- what is available,
- what is locked,
- why it is locked,
- what prerequisite must be completed.

## 25.3 Unlock Authority

Unlock rules belong to the progression/domain layer.

UI components only display unlock state.

---

# 26. ACHIEVEMENT SYSTEM

Achievements represent notable milestones.

They may be triggered by:

- quest completion patterns,
- streaks,
- Gate mastery,
- Arcana progress,
- reflection activity,
- Boss Trials,
- other meaningful progression events.

Achievement IDs must remain consistent across the registry, event logic, and UI.

Existing achievement inconsistencies must be resolved as part of implementation hardening rather than duplicated.

---

# 27. TITLE SYSTEM

Titles represent meaningful progression milestones.

Examples may include:

- Truth Seeker
- other canonical titles defined by product/world data.

Titles should be earned through meaningful conditions.

They should not be awarded merely for viewing screens.

---

# 28. JOURNAL SYSTEM

The Journal provides a dedicated place for reflection and historical self-observation.

It should support:

- viewing past reflections,
- viewing reflection dates,
- viewing Gate/quest context,
- chronological history,
- searching/filtering in future versions where appropriate.

The Journal is not intended to replace a full general-purpose notes application.

---

# 29. DAILY PLAN

The product includes a daily plan concept.

The daily plan should answer:

> "What should I meaningfully do today?"

It may combine:

- current Gate quest,
- relevant reflection,
- optional supporting tasks,
- progression context.

The daily plan must remain connected to actual progression state.

---

# 30. DASHBOARD

The Dashboard is the player's primary operational screen.

It should prioritize:

1. Current progression.
2. Current Gate.
3. Current quest.
4. XP/level.
5. Mastery.
6. Streak.
7. Attributes or meaningful capability summary.
8. Next action.

The dashboard should not become an analytics dump.

Its primary purpose is action and orientation.

---

# 31. ARCANA MAP

The Arcana map provides a visual overview of progression.

It should show:

- Beast,
- Human,
- Sage,
- Gate states,
- current Gate,
- completed Gates,
- locked Gates,
- progression path.

It should communicate the journey at a glance.

---

# 32. ANALYTICS

Analytics should help the player understand their journey.

Potential analytics include:

- XP progression,
- mastery progression,
- attribute development,
- completed quests,
- completed Gates,
- streak history,
- reflection activity,
- achievements,
- titles.

Analytics should avoid false precision.

Charts should answer useful questions rather than exist merely because charts are visually attractive.

---

# 33. PROFILE

The Profile should provide a high-level representation of the player's identity and journey.

It may include:

- name,
- title,
- level,
- XP,
- attributes,
- achievements,
- titles,
- journey statistics,
- save/export/import actions.

---

# 34. SAVE SYSTEM

## 34.1 Local Persistence

Phase 1 uses local persistence.

The existing storage key is:

`mythic-levels:v1`

## 34.2 Persistence Requirements

The system should preserve:

- player identity,
- progression,
- quest completion,
- XP,
- attributes,
- mastery,
- streaks,
- achievements,
- titles,
- reflections,
- event history,
- relevant daily plan state.

## 34.3 Save Authority

Persistence should be handled by the persistence adapter.

React components must not directly scatter localStorage calls throughout the UI.

---

# 35. EXPORT / IMPORT

The product should eventually support:

- Export Journey
- Import Journey
- Reset Journey

## 35.1 Export

Export should provide a portable representation of the player's saved journey.

## 35.2 Import

Import must validate incoming data before replacing current state.

Invalid imported data must not corrupt the application state.

## 35.3 Reset

Reset is destructive.

It should require deliberate confirmation.

The UI should clearly communicate what will be lost.

---

# 36. DATA VALIDATION

Loaded state must be validated before being trusted.

Validation should cover:

- required top-level fields,
- data types,
- valid progression identifiers,
- valid Gate IDs,
- valid Arcana IDs,
- valid quest references,
- safe reflection structures,
- safe achievement/title references.

Future versions should introduce explicit migration support when the persistence schema changes.

---

# 37. ERROR STATES

The product must have deliberate states for:

- invalid saved state,
- failed initialization,
- corrupted import,
- invalid quest action,
- unavailable Gate,
- failed persistence,
- unsupported data version.

Errors should be understandable to the player.

Technical details may be logged separately for developers.

---

# 38. LOADING STATES

The application should not show a partially initialized game state as if it were valid.

Initialization should have an explicit state such as:

- loading,
- ready,
- error.

The UI should render appropriate feedback.

---

# 39. EMPTY STATES

Examples:

- no reflections yet,
- no achievements yet,
- no completed Gates,
- no analytics history,
- no journal entries.

Empty states should guide the player toward the next useful action rather than appear broken.

---

# 40. RESPONSIVE EXPERIENCE

Mythic Levels must work across:

- desktop,
- tablet,
- mobile.

The core progression experience must remain usable on smaller screens.

The design should prioritize:

- readable typography,
- clear touch targets,
- non-overflowing cards,
- usable navigation,
- accessible forms,
- manageable information density.

---

# 41. ACCESSIBILITY

The product should progressively support:

- keyboard navigation,
- semantic HTML,
- visible focus states,
- sufficient contrast,
- accessible labels,
- reduced-motion preferences,
- readable typography,
- screen-reader-compatible controls.

Visual atmosphere must never make the product unusable.

---

# 42. NOTIFICATIONS

Notifications are a later-stage capability.

Potential future notifications:

- daily quest reminder,
- Gate progress reminder,
- reflection reminder,
- streak reminder.

Notifications must never become aggressive or shame-based.

---

# 43. OFFLINE-FIRST PRINCIPLE

Phase 1 should function locally without requiring a backend.

The player should be able to:

- open the application,
- view progression,
- complete quests,
- reflect,
- save progress,
- return later.

Cloud synchronization is a later phase.

---

# 44. PRIVACY

Mythic Levels may contain personal reflections and behavioral history.

The product should therefore follow a privacy-first model.

Phase 1:

**local data by default.**

Future cloud features must require clear user understanding and appropriate consent.

---

# 45. NAVIGATION REQUIREMENTS

The intended route structure includes:

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

Routes are implementation details of the user journey and may evolve while preserving the same product capabilities.

---

# 46. CORE NAVIGATION

The primary navigation should expose the most important areas without overwhelming the player.

Expected major areas:

- Dashboard
- Arcanas
- Journal
- Analytics
- Profile

Gate pages are reached through progression context.

Awakening is part of onboarding.

---

# 47. GAME STATE VS UI STATE

The application must distinguish between:

## Game State

Examples:

- XP,
- level,
- mastery,
- attributes,
- quests,
- Gates,
- achievements,
- titles,
- streaks.

## UI State

Examples:

- modal open/closed,
- selected tab,
- animation state,
- temporary input,
- loading state,
- navigation state.

UI state must not accidentally become the source of truth for game progression.

---

# 48. DOMAIN AUTHORITY

The progression engine is authoritative for:

- quest completion,
- XP,
- mastery,
- streak updates,
- rewards,
- achievements,
- titles,
- unlocks,
- progression transitions.

React should display results.

It should not duplicate the rules.

---

# 49. PRODUCT INVARIANTS

The following rules must remain true unless the product specification is intentionally changed:

1. Mythic Levels is symbolic, not supernatural.
2. Real-world action is more important than UI activity.
3. The player remains the central actor.
4. The progression engine remains the authority for progression calculations.
5. The UI does not calculate game rules independently.
6. Gates are data-driven.
7. There are 27 canonical Gates.
8. Gates follow the seven-stage training structure.
9. Boss Trials represent meaningful Gate challenges.
10. Missing a day does not erase long-term progress.
11. XP is a representation, not a measure of human worth.
12. Attributes are representations, not clinical or scientific diagnoses.
13. Reflection is personal and should be treated as private data.
14. Failure is recoverable.
15. Mythology supports meaning rather than replacing real-world practice.
16. Product complexity must not be added merely for appearance.
17. Future AI must not weaken the product's security or user agency.
18. Progression must remain deterministic and explainable.
19. Imported data must be validated.
20. Persistence must not silently corrupt player progress.

---

# 50. FUTURE AI FEATURES

AI is a future enhancement, not the foundation of the core progression engine.

Potential AI capabilities include:

- reflection assistance,
- personalized explanations,
- adaptive quest suggestions,
- pattern summaries,
- motivational context,
- personalized progression guidance.

AI must not secretly modify core progression.

AI-generated recommendations should remain subordinate to explicit product rules.

The system should not allow an AI model to arbitrarily award XP, unlock Gates, rewrite mastery, or alter historical progression.

---

# 51. PHASED PRODUCT ROADMAP

## Phase 1 — Core Experience

Must include:

- Home
- Awakening
- Dashboard
- Arcana map
- Gate system
- seven-day quests
- quest completion
- XP
- attributes
- mastery
- streaks
- local persistence
- core player state
- basic profile

## Phase 2 — Depth

Add:

- achievements,
- titles,
- journal,
- analytics,
- richer animations,
- scheduling/reminders,
- stronger progression feedback.

## Phase 3 — Platform

Add:

- authentication,
- cloud persistence,
- synchronization,
- PWA capabilities,
- notifications,
- stronger export/import.

## Phase 4 — Intelligence

Add:

- AI-assisted reflections,
- adaptive quests,
- personalized progression,
- deeper behavioral insights,
- mobile/community capabilities where justified.

Phase 4 must not undermine the principles established in Phases 1–3.

---

# 52. PHASE 1 ACCEPTANCE CRITERIA

A Phase 1 implementation should allow a new player to:

1. Open Mythic Levels.
2. Complete Awakening.
3. Create initial player state.
4. Reach the Dashboard.
5. See the current Gate.
6. See the current daily quest.
7. Complete a valid quest.
8. Receive correct progression changes.
9. See updated XP.
10. See relevant attribute changes.
11. See mastery changes where applicable.
12. See streak changes where applicable.
13. Persist progress.
14. Refresh the browser.
15. Recover the same progress.
16. Navigate to the Arcana map.
17. Open the current Gate.
18. View Gate progression.
19. Add a reflection where supported.
20. Continue through the Gate.
21. Complete the Boss Trial when prerequisites are satisfied.
22. Receive Gate completion/unlock results.
23. View the updated profile.

---

# 53. EDGE CASES

The implementation must consider:

- refreshing during initialization,
- missing localStorage,
- malformed localStorage,
- corrupted saved state,
- duplicate quest completion,
- completing an already completed quest,
- attempting a locked Gate,
- attempting a Boss Trial too early,
- invalid Gate IDs,
- invalid quest IDs,
- invalid dates,
- imported incompatible versions,
- empty reflections,
- browser storage limitations,
- rapid repeated actions,
- navigation during state transitions.

---

# 54. SECURITY AND TRUST BOUNDARIES

Even though Mythic Levels is primarily a local application, it must maintain clean trust boundaries.

The UI is not trusted to define progression.

The progression engine is not allowed to blindly trust arbitrary UI input.

Persistence data is untrusted until validated.

Future cloud APIs must validate state server-side.

Future AI features must not become an unrestricted authority over game state.

---

# 55. PERFORMANCE EXPECTATIONS

The core experience should feel responsive.

Targets should prioritize:

- fast initial rendering,
- immediate UI feedback,
- minimal unnecessary re-renders,
- efficient state updates,
- lightweight persistence operations,
- smooth animations.

Performance optimizations must not make the architecture harder to reason about without meaningful benefit.

---

# 56. VISUAL PRODUCT REQUIREMENT

The product should communicate:

**ancient + mythical + cosmic + restrained + serious + modern**

It should not become:

- cartoon fantasy,
- childish RPG,
- generic cyberpunk,
- excessive neon,
- noisy game UI.

The visual language must support the product's philosophical seriousness.

Detailed visual rules belong in `UI_DESIGN.md`.

---

# 57. CONTENT REQUIREMENTS

Content should be:

- concise where action is required,
- deeper where reflection is required,
- symbolic but understandable,
- serious,
- motivating without being cheesy,
- specific enough to produce real-world action.

Avoid generic motivational filler.

Avoid language that promises supernatural transformation.

Avoid shame-based language.

---

# 58. PRODUCT LANGUAGE

Preferred language:

- Gate
- Arcana
- Awakening
- Practice
- Challenge
- Reflection
- Mastery
- Progression
- Capability
- Evolution
- Journey
- Trial

Use mythology to provide meaning.

Do not allow terminology to become so abstract that players cannot understand what they are supposed to do.

---

# 59. REAL-WORLD ACTION REQUIREMENT

Whenever possible, a progression action should correspond to something the player can actually do outside the application.

Examples:

- focus session,
- listening exercise,
- deliberate delay of gratification,
- structured execution,
- emotional observation,
- strategic planning,
- honest communication,
- self-reflection,
- perspective-taking.

The application should make the action clear before asking the player to record it.

---

# 60. REWARD PHILOSOPHY

Rewards should reinforce behavior.

Good rewards:

- XP,
- meaningful progression,
- mastery,
- titles,
- achievements,
- visual recognition,
- access to new Gates.

Bad rewards:

- arbitrary currencies without purpose,
- excessive notifications,
- manipulative loss mechanics,
- punishment for missing days,
- rewards for merely opening the application.

---

# 61. RETENTION PHILOSOPHY

Mythic Levels should encourage retention through:

- meaningful progression,
- curiosity,
- visible growth,
- structured practice,
- narrative continuity,
- reflection,
- earned milestones.

It should not depend primarily on:

- fear of losing progress,
- shame,
- artificial scarcity,
- addictive reward loops.

---

# 62. PLAYER COMPETITION MODEL

The primary competitor is:

**the player's previous self.**

Leaderboards and social competition are not core product requirements.

Future social features must not undermine the personal-development philosophy.

---

# 63. COMPLETION PHILOSOPHY

Completing a Gate does not mean the player has permanently mastered a human capability.

It means the player has completed a structured training stage.

Likewise:

- Level ≠ human worth.
- XP ≠ objective capability.
- Achievement ≠ permanent transformation.
- Streak ≠ discipline itself.
- Mastery percentage ≠ scientific measurement.

These distinctions must remain visible in product philosophy and content.

---

# 64. DATA-DRIVEN CONTENT

Gate content should remain data-driven.

The system should not require:

```text
Gate1.jsx
Gate2.jsx
Gate3.jsx
...
Gate27.jsx
```

Instead, a shared Gate experience should render data from the canonical Gate catalog.

This allows:

- consistent behavior,
- easier maintenance,
- easier balancing,
- fewer duplicated bugs,
- future expansion.

---

# 65. COMPONENT RESPONSIBILITY

UI components should primarily:

- render state,
- collect input,
- trigger actions,
- communicate feedback,
- handle presentation concerns.

They should not:

- calculate XP,
- calculate mastery,
- decide unlocks,
- manually update streaks,
- duplicate achievement rules,
- write arbitrary progression state.

---

# 66. APPLICATION ACTION RESPONSIBILITY

The application/state layer should provide user-facing operations such as:

- initialize journey,
- complete quest,
- add reflection,
- attempt Boss Trial,
- export journey,
- import journey,
- reset journey.

These actions coordinate UI input with domain logic and persistence.

---

# 67. STATE MANAGEMENT

Zustand is the preferred state-management adapter because it is already installed.

The store should:

- hold application state,
- expose actions,
- manage initialization status,
- connect persistence,
- invoke progression/domain logic.

It should not become a second progression engine.

---

# 68. PERSISTENCE ARCHITECTURE

The application should maintain a clear separation:

```text
React UI
   ↓
Store / Application Actions
   ↓
Progression Engine
   ↓
Game State
   ↓
Persistence Adapter
   ↓
localStorage
```

The exact implementation may evolve.

The responsibility boundaries should remain.

---

# 69. TESTING REQUIREMENTS

Testing should cover the domain before attempting to test every visual detail.

High-value tests include:

- initial state creation,
- quest completion,
- duplicate completion prevention,
- XP calculation,
- mastery calculation,
- streak behavior,
- Gate unlocks,
- Boss Trial prerequisites,
- achievement triggers,
- title unlocks,
- persistence,
- invalid state handling,
- import validation.

The existing progression engine should be tested rather than reimplemented in tests.

---

# 70. QUALITY BAR

A feature is not considered complete merely because:

- it renders,
- the button works,
- the page looks good.

A meaningful feature should have:

1. correct product behavior,
2. correct domain integration,
3. persistence where required,
4. appropriate loading/error/empty states,
5. responsive behavior,
6. basic accessibility,
7. tests for important rules,
8. visual consistency,
9. no duplicated business logic.

---

# 71. DEFINITION OF DONE

A product feature is "done" when:

- its purpose is documented,
- its UI exists,
- its state is correctly represented,
- its domain rules are reused,
- its persistence behavior is correct,
- edge cases are considered,
- relevant tests pass,
- it follows the visual system,
- it does not violate product invariants,
- it does not introduce duplicate sources of truth.

---

# 72. IMPLEMENTATION PRIORITY

When choices conflict, prioritize in this order:

1. Correctness
2. Product meaning
3. User clarity
4. Data integrity
5. Security/privacy
6. Maintainability
7. Accessibility
8. Performance
9. Visual polish
10. Decorative complexity

A beautiful broken system is not a successful Mythic Levels implementation.

---

# 73. CHANGE MANAGEMENT

Before changing a core mechanic, ask:

1. Does this change alter world meaning?
2. Does it alter product behavior?
3. Does it alter domain rules?
4. Does it alter persistence?
5. Does it affect existing player data?
6. Does it require migration?
7. Does it contradict another canonical document?

If yes, update the appropriate canonical documentation before or alongside implementation.

---

# 74. SOURCE-OF-TRUTH HIERARCHY

When documents appear to conflict:

1. Product/world principles should be preserved.
2. `WORLD_DESIGN.md` governs mythology and canonical world meaning.
3. `PRODUCT_SPEC.md` governs product behavior.
4. `ARCHITECTURE.md` governs technical structure.
5. `UI_DESIGN.md` governs visual implementation.
6. `IMPLEMENTATION_PLAN.md` governs execution order.
7. `info.md` describes repository reality and current implementation status.
8. Source code is the current implementation, not automatically the product specification.

If implementation contradicts the specification, do not silently redefine the specification.

---

# 75. PRODUCT EVOLUTION RULE

Mythic Levels should grow through **depth**, not uncontrolled feature accumulation.

Before adding a new feature, determine whether it:

- strengthens the core loop,
- improves understanding,
- improves meaningful progression,
- improves reflection,
- improves long-term usefulness,
- or supports a clearly defined future phase.

If it does none of these, it should probably not be added.

---

# 76. FINAL PRODUCT LOOP

The complete conceptual loop is:

```text
AWAKEN
   ↓
RECOGNIZE
   ↓
ENTER A GATE
   ↓
OBSERVE
   ↓
PRACTICE
   ↓
RESIST
   ↓
APPLY
   ↓
CHALLENGE
   ↓
REFLECT
   ↓
TRIAL
   ↓
MASTER
   ↓
EVOLVE
   ↓
ENTER THE NEXT GATE
```

This loop is the heart of Mythic Levels.

---

# 77. FINAL PRODUCT DEFINITION

**Mythic Levels is a symbolic personal evolution system that transforms real-world self-improvement into a structured journey of Gates, practice, reflection, mastery, and progression.**

The mythology gives the journey meaning.

The product gives it structure.

The progression engine gives it rules.

The interface gives it presence.

The player's real-world actions give it truth.

> **The game is the interface.  
> The real world is the arena.  
> Progress is earned through action.  
> The player is the one who evolves.**

---

# 78. CANONICAL IMPLEMENTATION PRINCIPLE

When in doubt:

**Do not ask, "How can we make this feel more like a game?"**

Ask:

> **"How can the game structure make meaningful real-world growth easier to understand, practice, and sustain?"**

That is the product standard.

---

# 79. DOCUMENT MAINTENANCE

This document should be updated whenever a deliberate product-level decision changes:

- core loop,
- progression,
- Gate behavior,
- player lifecycle,
- major feature scope,
- product principles,
- phase boundaries,
- privacy model,
- or product invariants.

Do not rewrite this document casually during implementation.

When a technical implementation changes without changing intended product behavior, update `info.md` or `ARCHITECTURE.md` instead.

---

# 80. END OF CANONICAL PRODUCT SPECIFICATION

**MYTHIC LEVELS**

**Awakening → Beast → Human → Sage → Integration**

**The game is the interface.  
The real world is the arena.**
