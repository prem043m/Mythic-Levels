# MYTHIC LEVELS — UI DESIGN SPECIFICATION

**Document Status:** Canonical UI Design Specification  
**Version:** 1.0  
**Product:** Mythic Levels  
**Document Type:** Visual System / UX Specification  
**Audience:** Product designer, frontend engineer, UI implementer, Cursor/AI coding agents  
**Related Canonical Documents:** `WORLD_DESIGN.md`, `PRODUCT_SPEC.md`, `ARCHITECTURE.md`, `IMPLEMENTATION_PLAN.md`

---

# 1. PURPOSE

This document defines the visual language, interaction patterns, screen structure, layout principles, component behavior, responsive behavior, and user-experience standards for Mythic Levels.

It exists so that the implementation does not gradually become a collection of unrelated pages.

The UI must feel like **one world**.

The visual system should combine:

- ancient,
- mythical,
- cosmic,
- restrained,
- serious,
- modern,
- readable,
- functional.

The mythology should support the product rather than overwhelm it.

---

# 2. PRIMARY UI PRINCIPLE

> **The interface is the mythic layer placed over a real-world self-improvement system.**

The UI should make the player feel that they are progressing through a meaningful world while keeping every real-world action understandable.

A player should never have to decode the fantasy to understand what to do.

---

# 3. DESIGN OBJECTIVES

The interface must:

1. Establish a distinctive Mythic Levels identity.
2. Make current progression immediately understandable.
3. Make the next real-world action obvious.
4. Give Gates a sense of significance.
5. Make progression feel earned.
6. Make reflection feel intentional.
7. Provide visual feedback without excessive animation.
8. Work on desktop and mobile.
9. Remain accessible.
10. Avoid generic SaaS/dashboard appearance.
11. Avoid childish fantasy-RPG appearance.
12. Avoid excessive cyberpunk/neon styling.

---

# 4. VISUAL CHARACTER

The target aesthetic is:

**Ancient + Cosmic + Mythical + Minimal + Modern**

The product should feel closer to:

- an ancient codex,
- a celestial observatory,
- a mysterious progression interface,
- a serious personal operating system,

than to:

- a cartoon RPG,
- a mobile game,
- a fantasy MMO,
- a generic productivity dashboard.

---

# 5. VISUAL REFERENCES FROM THE CURRENT DIRECTION

The established visual direction includes:

- near-black backgrounds,
- restrained gold typography,
- cream/white content text,
- purple/lilac secondary accents,
- cyan/cosmic accents,
- orange/ember Beast accents,
- thin borders,
- subtle glow,
- rounded cards,
- generous spacing,
- large serif headings,
- clean sans-serif body text.

The current Emergent-inspired screens provide the visual baseline for:

- Analytics,
- Profile,
- Gate detail,
- Daily practice cards,
- Boss Trial.

These should be treated as a visual reference, not as a reason to duplicate an implementation.

---

# 6. COLOR SYSTEM

Canonical palette:

| Token | Hex | Purpose |
|---|---|---|
| Void | `#05050A` | Primary page background |
| Obsidian | `#0D0B14` | Surface/card background |
| Ancient | `#C8A96B` | Gold/heritage accent |
| Mystic | `#7B61FF` | Primary mystical accent |
| Cosmic | `#4CC9F0` | Secondary/cosmic accent |
| Ember | `#FF6B35` | Beast/warning/action accent |
| Spirit | `#D8B4FE` | Soft mystical highlight |

These are the canonical base tokens.

Additional shades may be derived for:

- borders,
- muted text,
- hover states,
- disabled states,
- overlays,
- backgrounds,

but should remain visually consistent with the canonical palette.

---

# 7. COLOR USAGE RULES

## 7.1 Void

Use for:

- page backgrounds,
- major visual negative space,
- immersive sections.

## 7.2 Obsidian

Use for:

- cards,
- panels,
- navigation surfaces,
- dialogs,
- secondary sections.

## 7.3 Ancient

Use for:

- major headings,
- important labels,
- progression highlights,
- mythic emphasis,
- selected states where appropriate.

## 7.4 Mystic

Use for:

- interactive progression,
- secondary highlights,
- selected navigation,
- mystical visual effects.

## 7.5 Cosmic

Use sparingly for:

- information highlights,
- advanced progression,
- knowledge/space-related concepts,
- subtle status indicators.

## 7.6 Ember

Primarily associated with the Beast Arcana.

Use for:

- Beast identity,
- current Beast Gate emphasis,
- action states where appropriate,
- meaningful warnings.

Do not use Ember for every button.

## 7.7 Spirit

Use for:

- soft highlights,
- reflection,
- Sage/Human-adjacent visual accents,
- secondary emphasis.

---

# 8. COLOR RESTRAINT

The UI must not use every accent simultaneously at full intensity.

A page should normally have:

- one primary visual accent,
- one secondary accent,
- neutral text/background colors.

Color should establish hierarchy rather than decoration.

---

# 9. TYPOGRAPHY

The visual system should use two complementary typography roles.

## 9.1 Display Typeface

Use a serif or distinctive display style for:

- page titles,
- Arcana titles,
- Gate names,
- major mythic statements,
- major section headings.

The current direction favors an elegant serif appearance.

## 9.2 Interface Typeface

Use a clean sans-serif for:

- body text,
- navigation,
- buttons,
- labels,
- metadata,
- forms,
- numbers,
- controls.

## 9.3 Typography Principle

> **The world speaks in serif. The interface speaks in sans-serif.**

Do not overuse decorative typography.

---

# 10. TYPOGRAPHIC HIERARCHY

Suggested hierarchy:

### Level 1 — Mythic Title

Large, spacious, highly distinctive.

Examples:

- MYTHIC LEVELS
- THE BEAST
- THE GREMLIN OF FLICKERING THOUGHTS

### Level 2 — Section Heading

Used for:

- PLAYER ANALYTICS
- 7-DAY PRACTICE
- BOSS TRIAL

### Level 3 — Card Heading

Used for:

- daily quest names,
- achievement names,
- capability names.

### Body

Comfortable line height and readable contrast.

### Metadata

Small, muted, uppercase or compact labels.

---

# 11. TEXT TONE

UI copy should be:

- concise,
- intentional,
- serious,
- direct,
- slightly poetic where appropriate.

Avoid:

- excessive motivational clichés,
- childish language,
- fake mystical language,
- unnecessary exclamation marks,
- long paragraphs in action areas.

Example:

Good:

> **COMMAND YOUR ATTENTION.**

Less appropriate:

> "Let's go, hero! You totally got this!!!"

---

# 12. GLOBAL LAYOUT

The application should use a centered responsive content system.

Desktop pages should generally have:

- persistent top navigation,
- constrained content width,
- generous horizontal margins,
- strong vertical rhythm.

The interface should not stretch text-heavy content across the entire screen.

---

# 13. SPACING SYSTEM

Use a consistent spacing scale.

Suggested conceptual scale:

```text
4   — micro
8   — tight
12  — compact
16  — standard
24  — comfortable
32  — section
48  — major section
64  — dramatic
96+ — hero spacing
```

The exact CSS implementation may use Tailwind utilities or project tokens.

Consistency matters more than any individual number.

---

# 14. CARDS

Cards are a major structural component.

They should use:

- Obsidian surfaces,
- subtle borders,
- moderate corner radius,
- restrained shadows/glows,
- generous internal spacing.

Cards should not look like floating white SaaS panels.

---

# 15. CARD HIERARCHY

A card may contain:

1. Eyebrow / metadata
2. Title
3. Main content
4. Supporting information
5. Action
6. Progress/status

Important information should be visually dominant.

---

# 16. CARD STATES

Cards may have:

- default,
- hover,
- active,
- completed,
- locked,
- current,
- disabled,
- warning,
- success.

State should be communicated through a combination of:

- border,
- icon,
- text,
- subtle color,
- progress indicator.

Do not rely on color alone.

---

# 17. BORDERS

Borders should be subtle.

The design language favors:

- thin lines,
- low-opacity borders,
- occasional accent borders for important states.

Avoid heavy boxes around every element.

---

# 18. GLOW

Glow is an accent, not a default shadow.

Use glow for:

- current Gate,
- important progression,
- selected state,
- major CTA,
- Arcana identity,
- meaningful achievement.

Avoid:

- glowing every card,
- glowing every button,
- excessive bloom.

---

# 19. BUTTON SYSTEM

Buttons should feel like controls within a serious system.

Primary buttons:

- strong contrast,
- clear label,
- restrained accent.

Secondary buttons:

- transparent/outlined,
- lower visual priority.

Destructive buttons:

- clearly differentiated,
- confirmation required for major destructive operations.

---

# 20. BUTTON COPY

Prefer direct action language:

- BEGIN AWAKENING
- ENTER GATE
- COMPLETE QUEST
- ADD REFLECTION
- ATTEMPT TRIAL
- VIEW JOURNEY
- EXPORT JOURNEY
- IMPORT JOURNEY
- RESET JOURNEY

Avoid vague labels:

- Click Here
- Continue
- Submit

when a more specific action is possible.

---

# 21. NAVIGATION

Primary navigation should be simple.

Target navigation:

```text
MYTHIC LEVELS

Dashboard
Arcanas
Journal
Analytics
Profile
```

The current section should be clearly identifiable.

---

# 22. TOP NAVIGATION

The established visual direction uses:

- Mythic Levels mark/logo on the left,
- navigation in the center/right,
- streak/status on the far side where space allows.

On smaller screens, navigation should collapse into a mobile-friendly control.

---

# 23. LOGO / WORDMARK

The wordmark should feel:

- minimal,
- ancient,
- premium,
- symbolic.

The "M" mark may be used independently where space is limited.

Avoid overly detailed fantasy logos.

---

# 24. STATUS INDICATORS

Status indicators may include:

- streak flame,
- XP,
- mastery percentage,
- level,
- current Gate,
- locked/unlocked state.

They should remain compact.

A status indicator should answer a question quickly.

Example:

**1 DAY STREAK**

is clearer than a decorative flame with no label.

---

# 25. HOME PAGE

The Home page introduces the product.

Its purpose is:

- establish identity,
- explain the concept,
- create curiosity,
- lead into Awakening.

It should not dump game statistics onto a new visitor.

Suggested structure:

1. Hero statement
2. Product philosophy
3. Evolution concept
4. Brief Gate explanation
5. CTA to Awakening

---

# 26. HOME HERO

The hero should communicate the core idea immediately.

Possible canonical messaging:

> **WHAT YOU CALL WEAKNESS MAY SIMPLY BE AN ABILITY YOU HAVE NEVER TRAINED.**

Supporting message:

> **You were not born complete. You were born capable of evolution.**

CTA:

**BEGIN AWAKENING**

---

# 27. AWAKENING PAGE

Awakening should feel like a transition into the system.

Visual treatment:

- darker background,
- large typography,
- minimal distractions,
- controlled animation,
- clear identity input,
- clear beginning action.

The screen should not feel like a generic signup form.

---

# 28. AWAKENING INTERACTION

The player should:

1. Understand what Awakening means.
2. Enter required identity information.
3. Confirm the beginning.
4. Transition into the Dashboard.

The transition should feel significant but remain fast and usable.

---

# 29. DASHBOARD

The Dashboard is the primary daily operating surface.

Suggested structure:

```text
CURRENT STATE
    ↓
CURRENT GATE
    ↓
TODAY'S QUEST
    ↓
PROGRESS
    ↓
SUPPORTING METRICS
```

The most important action should be visually obvious.

---

# 30. DASHBOARD HERO

The Dashboard hero may show:

- current Arcana,
- current Gate,
- Gate name,
- capability,
- current day,
- mastery.

Example:

**THE BEAST**

**GATE 01**

**THE GREMLIN OF FLICKERING THOUGHTS**

**TRAINS: FOCUS**

---

# 31. DASHBOARD DAILY ACTION

The current quest should be the dominant action.

A player should not need to navigate through multiple screens to determine what they should do today.

---

# 32. DASHBOARD SUPPORTING METRICS

Secondary information may include:

- XP,
- level,
- streak,
- attributes,
- Gate progress.

These should remain subordinate to the daily action.

---

# 33. ARCANA MAP

The Arcana Map should provide the player with a visual sense of the entire journey.

It should communicate:

- current Arcana,
- completed Gates,
- active Gate,
- locked Gates,
- progression direction.

---

# 34. ARCANA MAP VISUALIZATION

The map should feel like a progression path rather than a generic grid.

Possible representation:

```text
BEAST
  ● Gate 01
  │
  ● Gate 02
  │
  ● Gate 03
  │
  ...
  │
  ● Gate 09
       ↓
HUMAN
       ↓
SAGE
       ↓
INTEGRATION
```

The final implementation may use a more visual arrangement, provided the progression remains clear.

---

# 35. ARCANA VISUAL IDENTITY

## Beast

Primary accent:

**Ember**

Visual qualities:

- tension,
- roughness,
- energy,
- resistance,
- pressure.

## Human

Visual qualities:

- balance,
- clarity,
- structure,
- warmth.

Use a more balanced combination of Ancient, Spirit, and Cosmic tones.

## Sage

Visual qualities:

- stillness,
- depth,
- knowledge,
- spaciousness,
- illumination.

Mystic, Cosmic, and Spirit accents should become more prominent.

---

# 36. GATE DETAIL PAGE

The Gate page is one of the most important screens.

It should establish:

- what the Gate represents,
- what capability is being trained,
- what the player is expected to do,
- current progress,
- daily practice,
- Boss Trial.

---

# 37. GATE HEADER

The established Gate visual direction includes:

```text
THE BEAST

GATE 01 · CURRENT

THE GREMLIN OF FLICKERING THOUGHTS

ARCHETYPE
Gremlin

TRAINS
Focus

WEAKNESS
Distraction

"COMMAND YOUR ATTENTION."
```

This information hierarchy should be preserved.

---

# 38. GATE LORE

Lore should be visually separated from actionable practice.

Suggested structure:

**LORE**

Short meaningful explanation.

Then:

**THE PRACTICE**

Actionable seven-day progression.

This prevents the story from hiding the task.

---

# 39. GATE MASTERY

Mastery should be visible near the top or within a dedicated progress section.

Example:

```text
MASTERY

0%

────────────
```

As progress increases, the visual should communicate advancement without becoming a loud game-style progress bar.

---

# 40. SEVEN-DAY PRACTICE

Practice cards should show:

- Day number,
- stage,
- title,
- action description,
- duration,
- XP,
- completion state,
- reflection action.

Example:

```text
DAY 03
PRACTICE

DEEP FOCUS

Complete one 25-minute focus session.
Work on one task. No switching.

25 MIN       +30 XP

[ COMPLETE QUEST ]
[ ADD REFLECTION ]
```

---

# 41. PRACTICE CARD STATES

### Locked

Communicate:

- unavailable,
- prerequisite.

### Available

Communicate:

- ready to practice.

### Current

Communicate:

- today's focus.

### Completed

Communicate:

- completion,
- reward,
- reflection availability.

### Reflection Pending

Communicate:

- action completed,
- reflection remains available.

---

# 42. QUEST COMPLETION FEEDBACK

When a quest is completed:

- provide immediate confirmation,
- show XP earned,
- update progression,
- update relevant status,
- avoid excessive celebration.

A short visual transition is preferable to a large arcade-style explosion.

---

# 43. REFLECTION UI

Reflection should feel calm and intentional.

Recommended:

- clear prompt,
- spacious textarea,
- minimal distractions,
- character count only if useful,
- save action,
- confirmation after saving.

The visual language should encourage honesty rather than performance.

---

# 44. REFLECTION PROMPTS

Prompts should be specific to the Gate.

Example:

> **What did you notice when your attention began to drift?**

Avoid generic:

> "How did you feel?"

unless context makes it meaningful.

---

# 45. BOSS TRIAL

The Boss Trial should feel visually more significant than ordinary practice.

Suggested hierarchy:

```text
BOSS TRIAL

THE SILENT HOUR

One 60-minute deep-focus session.

Describe what you did, honestly.

[ REFLECTION FIELD ]

[ ATTEMPT TRIAL ]
```

If prerequisites are incomplete, clearly show:

**COMPLETE ALL 7 DAYS FIRST**

---

# 46. BOSS TRIAL STATE

### Locked

Show prerequisite.

### Ready

Strong visual emphasis.

### Completed

Show completion and reward.

### Failed/Incomplete

Do not shame the player.

Provide a path to retry.

---

# 47. PROFILE PAGE

The Profile page represents the player's journey rather than acting as a settings dump.

Suggested structure:

```text
PLAYER PROFILE

PLAYER NAME
TITLE

LEVEL / XP

ATTRIBUTES

TITLES

ACHIEVEMENTS

SAVE SYSTEM
```

---

# 48. TITLE DISPLAY

Titles should feel collectible but meaningful.

A grid may be used.

Unlocked titles should be visually clear.

Locked titles should communicate that they exist without making the screen feel like a casino reward board.

---

# 49. ACHIEVEMENT DISPLAY

Achievements should use:

- icon,
- name,
- concise description,
- earned/locked state.

Do not use excessive rarity colors unless they have a meaningful purpose.

---

# 50. SAVE SYSTEM UI

The established profile direction includes:

- Export Journey
- Import Journey
- Reset Journey

These actions should be clearly separated from normal progression.

Reset should have a strong confirmation step.

---

# 51. JOURNAL PAGE

The Journal should prioritize reading and reflection.

Suggested structure:

```text
JOURNAL

FILTER / SEARCH (future)

DATE
GATE
QUEST

REFLECTION

DATE
GATE
QUEST

REFLECTION
```

Entries should feel like a personal archive.

---

# 52. ANALYTICS PAGE

The established direction uses:

**MEASURE YOUR ASCENT**

**PLAYER ANALYTICS**

This tone should be preserved.

Analytics should include:

- summary statistics,
- XP progression,
- capability/attribute panels,
- mastery history,
- Gate completion history,
- streak information.

---

# 53. ANALYTICS VISUALIZATION

Charts should be restrained.

Use:

- thin lines,
- subtle grids,
- muted labels,
- accent highlights.

Avoid dashboard clutter.

Every chart should answer a meaningful question.

---

# 54. EMPTY ANALYTICS

When insufficient data exists:

Do not show fake charts.

Instead show:

- what data is missing,
- what action creates it,
- why the metric matters.

---

# 55. MOBILE EXPERIENCE

Mobile is not a shrunk desktop.

The hierarchy should be preserved while layout changes.

Prioritize:

1. Current Gate
2. Today's quest
3. Completion action
4. Progress
5. Navigation
6. Secondary information

---

# 56. MOBILE NAVIGATION

Use a compact navigation pattern.

The user should be able to reach:

- Dashboard,
- Arcanas,
- Journal,
- Analytics,
- Profile.

Touch targets should be comfortable.

---

# 57. MOBILE GATE PAGE

On mobile:

- Gate header stacks vertically,
- mastery remains visible,
- practice cards become single-column,
- Boss Trial follows practice,
- lore remains readable,
- controls remain reachable without horizontal scrolling.

---

# 58. RESPONSIVE BREAKPOINT PRINCIPLE

Use project-standard responsive breakpoints rather than creating arbitrary per-component breakpoints.

The exact breakpoints may follow Tailwind defaults unless a concrete layout requires otherwise.

---

# 59. MOTION SYSTEM

Motion should communicate:

- transition,
- progress,
- state change,
- hierarchy.

It should not exist merely because Framer Motion is installed.

---

# 60. MOTION CHARACTER

Preferred:

- fade,
- slide,
- subtle scale,
- progress interpolation,
- restrained glow,
- page transitions.

Avoid:

- bouncing UI,
- excessive particle effects,
- constant pulsing,
- long blocking animations.

---

# 61. REDUCED MOTION

The application should respect:

`prefers-reduced-motion`

When reduced motion is enabled:

- minimize transitions,
- remove unnecessary parallax,
- reduce animated glow,
- preserve functional state feedback.

---

# 62. ICONOGRAPHY

Icons should be:

- simple,
- consistent,
- recognizable,
- restrained.

Avoid mixing many unrelated icon styles.

Icons should support text rather than replace essential labels.

---

# 63. ILLUSTRATION

Illustrations may be used for:

- Arcana identity,
- Gate identity,
- empty states,
- major milestones.

They should maintain the same ancient/cosmic visual language.

They should not make the product look like a children's fantasy game.

---

# 64. BACKGROUND SYSTEM

Backgrounds should provide depth without reducing readability.

Possible treatments:

- subtle radial gradients,
- star-like particles,
- faint cosmic textures,
- atmospheric noise,
- soft glows.

Use these sparingly.

The background should never compete with text.

---

# 65. VISUAL DEPTH

Use a limited depth hierarchy:

```text
Background
   ↓
Surface
   ↓
Card
   ↓
Interactive element
   ↓
Active/emphasized state
```

Do not create dozens of shadow levels.

---

# 66. FORMS

Forms should be:

- dark-surface based,
- clearly labeled,
- readable,
- spacious,
- keyboard accessible.

Inputs should have clear:

- default,
- focus,
- error,
- disabled states.

---

# 67. TEXTAREA DESIGN

Reflection textareas should have:

- generous height,
- clear label,
- clear prompt,
- readable contrast,
- visible focus state,
- save action.

Do not make the player type into tiny fields.

---

# 68. MODALS

Use modals for:

- confirmation,
- destructive actions,
- focused short interactions.

Do not use modals for normal navigation.

---

# 69. TOASTS / FEEDBACK

Transient feedback may be used for:

- quest completed,
- reflection saved,
- export successful,
- import successful,
- reset confirmation.

Feedback should be concise.

Important state changes should also remain visible in the page itself.

---

# 70. LOCKED CONTENT

Locked Gates should communicate:

- identity,
- existence,
- prerequisite,
- future destination.

Do not make locked content visually indistinguishable from missing content.

---

# 71. CURRENT CONTENT

Current content should be visually stronger than completed or locked content.

Possible treatments:

- accent border,
- subtle glow,
- stronger heading,
- current badge.

Do not use flashing or aggressive animation.

---

# 72. COMPLETED CONTENT

Completed content should feel earned.

Use:

- check state,
- subdued accent,
- completion label,
- preserved accessibility.

Do not hide completed work.

The journey should remain visible.

---

# 73. ERROR VISUAL LANGUAGE

Errors should feel like system states, not failures of the player.

Good:

> **JOURNEY DATA COULD NOT BE LOADED**

Then:

> Try again or restore a valid journey export.

Avoid:

> **YOU FAILED**

---

# 74. SUCCESS LANGUAGE

Success should be specific.

Good:

> **QUEST COMPLETE**

> **+30 XP**

> **REFLECTION SAVED**

Avoid vague:

> Success!

---

# 75. LOADING LANGUAGE

Where useful, loading states may use world-consistent language without obscuring what is happening.

Example:

> **RESTORING YOUR JOURNEY...**

But normal technical loading can simply use:

> **Loading...**

Clarity wins over atmosphere.

---

# 76. ACCESSIBILITY VISUAL RULES

Never rely solely on:

- color,
- glow,
- animation.

State should be understandable through:

- text,
- icons,
- structure,
- semantics.

---

# 77. CONTRAST

Dark UI does not automatically mean accessible UI.

Body text must remain readable.

Muted text should still have sufficient contrast.

Decorative low-contrast elements must not carry required information.

---

# 78. FOCUS STATES

Keyboard focus must be visible.

Focus indicators should fit the visual language while remaining obvious.

Never remove browser focus indicators without replacing them with a strong accessible alternative.

---

# 79. RESPONSIVE CONTENT DENSITY

Desktop can show:

- supporting metrics,
- multiple cards,
- secondary navigation.

Mobile should prioritize:

- current action,
- essential progression,
- readable content.

Secondary information can move below the main action.

---

# 80. UI COMPONENT TAXONOMY

Suggested reusable components:

```text
Layout
├── AppShell
├── TopNav
└── PageContainer

Navigation
├── NavItem
├── MobileNav
└── Breadcrumb

Progression
├── XPBar
├── MasteryBar
├── LevelBadge
├── StreakBadge
├── GateStatus
└── ProgressSummary

Gate
├── GateHeader
├── GateLore
├── PracticeCard
├── PracticeTimeline
├── ReflectionForm
└── BossTrial

Arcana
├── ArcanaCard
├── ArcanaPath
├── GateNode
└── GateMap

Profile
├── ProfileHeader
├── AttributePanel
├── TitleGrid
└── AchievementGrid

Analytics
├── StatCard
├── XPChart
├── AttributeChart
└── CapabilityPanel

System
├── LoadingState
├── EmptyState
├── ErrorState
├── ConfirmDialog
└── Toast
```

This is a conceptual taxonomy, not a requirement to create every component immediately.

---

# 81. COMPONENT DESIGN PRINCIPLE

Components should be:

- reusable,
- data-driven,
- composable,
- small enough to understand,
- not overloaded with business logic.

A component should not become a hidden domain engine.

---

# 82. PAGE DESIGN PRINCIPLE

Pages should compose components around a clear user goal.

A page should answer:

> "Why is the player here?"

Examples:

Dashboard:

> What should I do now?

Gate:

> What am I training?

Journal:

> What have I learned?

Analytics:

> How am I progressing?

Profile:

> What has my journey become?

---

# 83. VISUAL CONSISTENCY RULE

A user should recognize Mythic Levels even when:

- visiting a new page,
- opening a different Arcana,
- viewing a future Gate,
- using mobile,
- viewing analytics.

Consistency comes from:

- typography,
- spacing,
- color,
- card language,
- navigation,
- motion,
- iconography.

---

# 84. CONTENT DENSITY

The interface should alternate between:

- information-rich sections,
- spacious visual breathing room.

Do not compress every piece of information into cards.

Not every sentence needs a container.

---

# 85. WHITESPACE

Whitespace is part of the mythology.

Large empty areas can communicate:

- stillness,
- significance,
- contemplation,
- scale.

Use space intentionally.

---

# 86. VISUAL STORYTELLING

Visual progression should subtly evolve with the player.

Potential progression:

### Beast

More tension, Ember, stronger contrast.

### Human

More balance and structure.

### Sage

More space, Cosmic/Mystic/Spirit atmosphere.

### Integration

A more unified visual language.

This progression should be subtle.

---

# 87. ANTI-PATTERNS

Do not build:

- rainbow gradients,
- excessive neon,
- cartoon monsters,
- giant gaming HUDs,
- fake 3D fantasy interfaces,
- cluttered dashboards,
- aggressive streak warnings,
- infinite confetti,
- meaningless XP popups,
- every element inside a card,
- excessive glassmorphism,
- generic Bootstrap/SaaS styling.

---

# 88. UI PRIORITY ORDER

When visual choices conflict:

1. Readability
2. User action
3. Hierarchy
4. Product meaning
5. Accessibility
6. Consistency
7. Atmosphere
8. Decoration

---

# 89. DESIGN SYSTEM PRINCIPLE

The visual system should be encoded in reusable tokens and components rather than duplicated styles.

Existing `src/index.css` contains Mythic Levels design tokens/utilities and should remain the foundation.

`src/App.css` currently contains Vite starter styling and should not remain the source of the final visual identity.

---

# 90. IMPLEMENTATION GUIDANCE

The UI implementation should:

- use the existing Tailwind setup,
- preserve canonical design tokens,
- use reusable components,
- use Framer Motion only where motion improves meaning,
- avoid hardcoding Gate-specific page structures,
- use data-driven Gate rendering,
- keep domain logic outside components.

---

# 91. DATA-DRIVEN GATE UI

The Gate page must render canonical Gate data.

Conceptually:

```text
Gate Data
   ↓
Gate Page
   ↓
Gate Header
   ↓
Lore
   ↓
Practice Timeline
   ↓
Reflection
   ↓
Boss Trial
```

Do not create a separate visual implementation for every Gate unless there is a genuine product requirement.

---

# 92. UI STATE MODEL

A page may have:

```text
loading
ready
empty
error
locked
available
current
completed
```

These states should be designed intentionally.

---

# 93. INTERACTION FEEDBACK

Every important interaction should produce understandable feedback.

Examples:

Complete Quest:

```text
QUEST COMPLETE
+30 XP
```

Save Reflection:

```text
REFLECTION SAVED
```

Unlock Gate:

```text
GATE UNLOCKED
```

Import:

```text
JOURNEY RESTORED
```

---

# 94. ANIMATION TIMING

Motion should generally be short enough that it does not delay action.

Animations should support:

- entering,
- leaving,
- changing state.

Avoid long cinematic sequences for routine actions.

---

# 95. PAGE TRANSITIONS

Page transitions may use subtle:

- fade,
- opacity,
- vertical movement.

They should preserve orientation.

Do not make every route transition feel like a loading screen.

---

# 96. GATE TRANSITION

Entering a Gate may have a stronger transition than normal navigation.

Possible:

- title fade-in,
- accent glow,
- subtle atmospheric movement.

It should remain optional/reduced under accessibility preferences.

---

# 97. REWARD ANIMATION

XP rewards may animate briefly.

Example:

`+30 XP`

can appear near the relevant progression indicator.

The final XP total must remain visible.

---

# 98. SCROLL BEHAVIOR

Long Gate pages should use natural vertical scrolling.

Do not hide important actions behind unusual scroll mechanics.

Boss Trial should remain reachable after practice content.

---

# 99. FIXED ELEMENTS

Fixed navigation may be used.

Avoid too many fixed elements.

The player should not feel that the screen is covered by persistent HUD elements.

---

# 100. PAGE TITLES

Every major page should have a clear title.

Examples:

- PLAYER ANALYTICS
- PLAYER PROFILE
- JOURNAL
- THE BEAST
- THE HUMAN
- THE SAGE

The title should provide orientation before decoration.

---

# 101. GATE NAMING

Gate names should be visually prominent.

Example:

**THE GREMLIN OF FLICKERING THOUGHTS**

Supporting information:

**Gate 01 · Current**

This hierarchy creates identity without ambiguity.

---

# 102. META LABELS

Small labels can use uppercase typography.

Examples:

- CURRENT
- ARCHETYPE
- TRAINS
- WEAKNESS
- DAY 03
- PRACTICE
- +30 XP

They should remain secondary to the actual content.

---

# 103. PROGRESS BARS

Progress bars should be:

- thin or moderately weighted,
- readable,
- clearly labeled,
- animated subtly when changing.

Never make a progress bar the only representation of important progress.

---

# 104. NUMBERS

Important numbers such as:

- XP,
- level,
- mastery,
- streak,

should be visually distinct but not oversized to the point of becoming a game HUD.

---

# 105. STREAK DISPLAY

A flame icon may represent the streak.

Recommended:

```text
🔥 1 DAY STREAK
```

The visual should motivate without implying that a broken streak destroys the journey.

---

# 106. LOCK ICONS

Lock icons may indicate unavailable progression.

Always accompany important locks with understandable text.

---

# 107. BADGES

Badges can represent:

- current,
- completed,
- locked,
- Arcana,
- achievement.

Use them sparingly.

---

# 108. TOOLTIPS

Tooltips may explain:

- unfamiliar resources,
- analytics metrics,
- icons,
- technical concepts.

Do not use tooltips to hide essential instructions.

---

# 109. FORMS AND VALIDATION

Validation should appear near the relevant field.

Examples:

> Enter your name to begin.

not:

> Invalid input.

Error messages should explain what to fix.

---

# 110. DESTRUCTIVE ACTIONS

Reset Journey must be visually distinct.

Suggested flow:

```text
RESET JOURNEY

This will remove your saved progression from this device.

[ CANCEL ]
[ RESET JOURNEY ]
```

The destructive action must not be accidentally triggered.

---

# 111. EXPORT / IMPORT UX

Export:

1. User selects Export Journey.
2. System creates validated export.
3. User receives clear success feedback.

Import:

1. User selects file/data.
2. System validates it.
3. System previews or confirms if appropriate.
4. State is replaced only after validation.
5. User receives confirmation.

---

# 112. FIRST-TIME EXPERIENCE

The first-time user should not be overwhelmed with:

- analytics,
- achievements,
- all 27 Gates,
- all resources,
- advanced settings.

The experience should progressively reveal complexity.

---

# 113. PROGRESSIVE DISCLOSURE

Show what matters now.

Reveal deeper systems as the player progresses.

This supports both:

- beginner comprehension,
- long-term depth.

---

# 114. PLAYER ORIENTATION

At almost any point, the player should be able to answer:

1. Where am I?
2. What am I training?
3. What have I completed?
4. What should I do next?

This is a core UX requirement.

---

# 115. VISUAL HIERARCHY OF A DAILY SCREEN

Recommended:

```text
CURRENT GATE
     ↓
TODAY'S PRACTICE
     ↓
PRIMARY ACTION
     ↓
PROGRESS
     ↓
REFLECTION
     ↓
SECONDARY INFORMATION
```

---

# 116. DESKTOP GATE LAYOUT

Possible structure:

```text
┌──────────────────────────────────────────────┐
│ NAVIGATION                                   │
├──────────────────────────────────────────────┤
│ ARCANA / GATE                               │
│                                              │
│ GATE TITLE                                   │
│ CAPABILITY / WEAKNESS                        │
│ QUOTE                                        │
│                                              │
│ MASTERY                                      │
├──────────────────────────────────────────────┤
│ LORE                                         │
├──────────────────────────────────────────────┤
│ 7-DAY PRACTICE                               │
│                                              │
│ DAY 01                                       │
│ DAY 02                                       │
│ DAY 03                                       │
│ ...                                          │
│ DAY 07                                       │
├──────────────────────────────────────────────┤
│ BOSS TRIAL                                   │
└──────────────────────────────────────────────┘
```

---

# 117. MOBILE GATE LAYOUT

```text
NAV
 ↓
GATE TITLE
 ↓
CAPABILITY
 ↓
MASTERY
 ↓
LORE
 ↓
DAY 01
 ↓
DAY 02
 ↓
...
 ↓
DAY 07
 ↓
BOSS TRIAL
```

Single-column clarity is more important than preserving desktop composition.

---

# 118. DASHBOARD DESKTOP

Possible hierarchy:

```text
┌──────────────────────────────────────────────┐
│ NAV                                           │
├───────────────────────┬──────────────────────┤
│ CURRENT GATE          │ LEVEL / XP           │
│                       │ STREAK               │
│ TODAY'S QUEST         │ ATTRIBUTE SUMMARY    │
│                       │                      │
│ PRIMARY ACTION        │                      │
├───────────────────────┴──────────────────────┤
│ GATE PROGRESS / JOURNEY                       │
└──────────────────────────────────────────────┘
```

Exact layout can evolve.

---

# 119. PROFILE DESKTOP

Possible hierarchy:

```text
PLAYER PROFILE

NAME
TITLE
LEVEL / XP

ATTRIBUTES

TITLES
ACHIEVEMENTS

SAVE SYSTEM
```

---

# 120. ANALYTICS DESKTOP

Possible hierarchy:

```text
MEASURE YOUR ASCENT

PLAYER ANALYTICS

SUMMARY STATS

XP ASCENT

CAPABILITY PANELS

MASTERY / GATE HISTORY

STREAK
```

---

# 121. VISUAL BALANCE

Every major page should balance:

- content,
- empty space,
- controls,
- decorative atmosphere.

Avoid pages where every pixel is filled.

---

# 122. DECORATION BUDGET

Decorative effects should have a budget.

If an effect does not:

- communicate state,
- establish Arcana identity,
- create atmosphere,
- guide attention,

remove it.

---

# 123. MYTHIC ATMOSPHERE

Atmosphere can come from:

- typography,
- naming,
- subtle backgrounds,
- spacing,
- restrained glow,
- symbolic icons,
- transitions.

It does not require:

- complex 3D models,
- heavy particle engines,
- video backgrounds,
- constant animations.

---

# 124. CONTENT OVER EFFECT

If visual effects and readable content conflict:

**content wins.**

If lore and action conflict:

**action wins on action screens.**

If decoration and accessibility conflict:

**accessibility wins.**

---

# 125. DESIGN REVIEW CHECKLIST

Before accepting a screen, verify:

### Identity

- Does it look like Mythic Levels?
- Does it fit the ancient/cosmic direction?

### Hierarchy

- Is the most important information obvious?

### Action

- Can the player understand what to do?

### Consistency

- Does it reuse established components and tokens?

### Accessibility

- Is text readable?
- Are focus states visible?
- Is state understandable without color?

### Responsiveness

- Does it work on mobile?

### Motion

- Is animation meaningful?

### Product

- Does the screen support the core product loop?

---

# 126. UI INVARIANTS

The following visual/UX rules should remain stable:

1. Mythic Levels must look serious rather than childish.
2. The interface must remain readable.
3. The real-world action must remain obvious.
4. The current progression state must be easy to locate.
5. The current quest must be easy to understand.
6. Mythology must not obscure functionality.
7. Color must communicate hierarchy.
8. Glow must remain restrained.
9. Animation must have a purpose.
10. Mobile must remain first-class.
11. Accessibility cannot be sacrificed for atmosphere.
12. Components must remain reusable.
13. Gate pages must remain data-driven.
14. The UI must not contain progression calculations.
15. Completed progress must remain visible.
16. Locked content must explain why it is locked.
17. Failure states must not shame the player.
18. The product must not resemble a generic SaaS dashboard.
19. The product must not become an arcade-style RPG HUD.
20. Visual polish must serve product meaning.

---

# 127. RELATIONSHIP TO PRODUCT SPEC

`PRODUCT_SPEC.md` defines:

> What the product does.

This document defines:

> How that product should be experienced visually and interactively.

If a visual idea conflicts with product behavior, product behavior wins.

If a visual effect does not support the product, it should be removed.

---

# 128. RELATIONSHIP TO WORLD DESIGN

`WORLD_DESIGN.md` defines:

> What the mythology means.

This document defines:

> How that meaning becomes visible.

Do not invent visual mythology that contradicts the canonical world.

---

# 129. RELATIONSHIP TO ARCHITECTURE

`ARCHITECTURE.md` defines:

> How the system is technically structured.

This document should not force business logic into UI components.

The UI consumes state and invokes application actions.

---

# 130. FINAL DESIGN PRINCIPLE

The final UI should make the player think:

> **"This is not just a dashboard. This is my journey."**

But it should never make the player think:

> **"I need to understand a fantasy game before I can use this."**

---

# 131. FINAL UI DEFINITION

**Mythic Levels should feel like a modern personal evolution system discovered inside an ancient cosmic interface.**

It should be:

**mysterious enough to create curiosity,  
clear enough to create action,  
serious enough to create meaning,  
beautiful enough to create attachment,  
and restrained enough to remain useful.**

> **The world provides the atmosphere.  
> The interface provides the clarity.  
> The system provides the progression.  
> The player provides the action.**

---

# 132. END OF CANONICAL UI DESIGN SPECIFICATION

**MYTHIC LEVELS**

**Ancient. Mythical. Cosmic. Restrained. Human.**

**The interface is the mythic layer.  
The real world remains the arena.**
