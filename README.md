# MYTHIC LEVELS V5

### An AI-Assisted Personal Development RPG

Mythic Levels is a personal development platform that transforms real-world growth into a mythology-inspired progression experience.

Players progress through three Arcanas — Beast, Human and Sage — by completing structured Gates, practicing real-world behaviors, reflecting on their experiences and demonstrating mastery.

The system combines gamification, deterministic evaluation, adaptive quest recommendations, structured progression and a foundation for AI-assisted coaching and semantic understanding.

---

## 1. Core Philosophy

**Beast → Human → Sage → Integration**

The player's journey represents the transformation of unstructured behavior into awareness, discipline, perspective and integration.

The world is organized into:

- 3 Arcanas
- 9 Gates per Arcana
- 27 total Gates
- 7 stages per Gate
- 189 total stages

Each Gate follows seven stages:

1. Recognition
2. Observation
3. Practice
4. Resistance
5. Application
6. Challenge
7. Trial

Progression is based on demonstrated evidence and practice, not simply clicking a completion button.

## 2. Core Features

### Gate Mastery Protocol

Each Gate requires structured progression through seven stages, supported by real-world activity and reflection.

The mastery system evaluates:

- Accepted reflections
- Evidence of real-world action
- Practice across multiple days
- Stage completion
- Final ritual completion
- Gate mastery requirements

Recovery seals allow players to move past difficult stages without receiving the mastery credit associated with accepted evidence.

### Evaluation Engine V5

The deterministic evaluation engine evaluates player submissions before progression rewards are granted.

It supports:

- Structured reflection evaluation
- Task relevance checks
- Evidence and action detection
- Contradiction detection
- Negation-aware interpretation
- Insufficient-information handling
- Duplicate reward protection
- Controlled evaluation outcomes
- Confidence and quality kept separate

Evaluation decisions are independent of progression rewards.

### Routing Diagnostics

The evaluation system identifies submissions that can be handled deterministically and those requiring further semantic interpretation.

Routing classifications:

- `FAST_PATH_ACCEPTABLE`
- `FAST_PATH_REJECTABLE`
- `SEMANTIC_REVIEW_REQUIRED`

Routing diagnostics do not independently change scores, progression or rewards.

### Recovery System

Recovery seals allow players to handle difficult stages without permanently blocking progression.

A recovery-sealed stage:

- Counts toward stage completion.
- Provides zero mastery credit.
- Does not count as an accepted reflection.
- Does not contribute Gate practice-day credit.
- Does not independently satisfy action-evidence requirements.

An accepted revision can replace the sealed evidence and release deferred rewards according to the existing recovery rules.

### Adaptive Quest Recommendations

The recommendation engine ranks eligible quests using existing progression context and bounded difficulty adaptation.

It works within progression constraints rather than recommending arbitrary activities.

### Player Progression

The progression engine manages:

- XP and levels
- Player resources
- Attributes
- Quest completion
- Gate stages
- Rituals
- Mastery
- Gate completion
- Unlocks
- Recovery

The progression engine remains the authority for rewards and unlocks.

---

## 3. Technology Stack

### Frontend
- React
- Vite
- Tailwind CSS
- Zustand

### Backend
- Node.js 22+
- Native HTTP server
- SQLite using `node:sqlite`

### Authentication and Security
- Scrypt password hashing
- Hashed bearer session tokens
- Absolute session expiry
- HMAC-SHA-256 OTP verification
- Timing-safe verifier comparison
- Email verification
- Password reset
- Session invalidation on password change
- Structural save validation

### Testing and Quality
- Vitest
- Oxlint
- Node.js server tests
- In-memory SQLite integration tests

---

## 4. Architecture

Mythic Levels uses a modular monolith architecture.

```text
React UI
   |
   v
Zustand Store
   |
   v
Application Services
   |
   +-----------------------+
   |                       |
   v                       v
Evaluation Engine     Progression Engine
   |                       |
   v                       v
Decision Results      XP / Resources / Mastery
   |                       |
   +-----------+-----------+
               |
               v
          Player State
               |
       +-------+-------+
       |               |
       v               v
   Local Storage    Optional Backend
                       |
                       v
                     SQLite
```

The backend is optional.

The game supports offline play using local persistence. Accounts and cloud backup/synchronization are provided by the backend.

Structural save validation checks the integrity of loaded state. It does not establish that client-submitted progression was legitimately earned.

---

## 5. Security and Data Integrity

The current implementation includes:

- Version 1 save-schema validation.
- Non-mutating structural validation.
- Separate normalization for compatible optional fields.
- Canonical Gate and stage reference validation.
- Rejection of malformed nested progression records.
- Cloud-save validation before SQLite persistence.
- Revision-based optimistic save updates.
- Absolute bearer-session expiry.
- Configurable session lifetime.
- User-bound HMAC OTP verification.
- OTP expiration and attempt limits.
- Single-use verification and password-reset links.
- Session revocation after password changes.

### Important configuration

Production deployments must configure:

- `OTP_VERIFIER_SECRET`
- `SESSION_TTL_SECONDS`
- A real email provider
- `EMAIL_FROM`
- `FRONTEND_URL`
- Provider-specific email credentials

Generate a cryptographically random OTP secret:

```bash
node --input-type=module -e "import { randomBytes } from 'node:crypto'; console.log(randomBytes(32).toString('hex'))"
```

Keep the secret in deployment secret management or an ignored local `.env` file. Never commit it.

Every backend instance must use the same OTP verifier secret.

The default session lifetime is 30 days. Existing sessions are migrated using their creation timestamps; expired or malformed sessions are rejected.

Outstanding legacy OTP challenges using the former unkeyed verifier are invalidated during migration. Users can request new codes.

---

## 6. AI and Intelligence Roadmap

The long-term objective is to make Mythic Levels an intelligent personal development RPG.

The following capabilities are planned and should not be considered implemented until individually completed and verified.

### Semantic Analyzer V1

Purpose: Understand the meaning behind player reflections.

Planned capabilities:

- Semantic understanding of Gate objectives
- Paraphrase recognition
- Context and intent interpretation
- Negation and temporal reasoning
- Evidence extraction
- Contradiction detection
- Missing-evidence identification
- Structured semantic evidence

Gemini is the planned initial interpretation provider.

The AI provider must never directly grant rewards or progression.

### AI Coach

A personalized development companion that understands player progression, recurring difficulties and current objectives.

Planned capabilities:

- Contextual guidance
- Reflection feedback
- Progression advice
- Personalized development suggestions
- Support for difficult stages

### Quest Intelligence

An adaptive recommendation system that uses player history and Gate context.

Planned capabilities:

- Personalized quests
- Difficulty adaptation
- Repeated-struggle detection
- Practice recommendations
- Context-aware quest selection

### Player Intelligence

A deeper character intelligence system.

Planned capabilities:

- Skills and competencies
- Derived statistics
- Behavioral patterns
- Strength and weakness analysis
- Development trends
- Mastery insights
- Personalized character profile

### Unified Intelligence Layer

The planned intelligence components will work through provider-independent interfaces.

The deterministic progression engine remains responsible for final reward and unlock authorization.

---

## 7. Project Structure

```text
MYTHIC-LEVELS/
|
+-- server/
|   +-- auth.js
|   +-- db.js
|   +-- index.js
|   +-- securityConfig.js
|   +-- emailService.js
|   +-- emailTemplates.js
|   +-- coach/
|
+-- src/
|   +-- components/
|   +-- pages/
|   +-- store/
|   +-- config/
|   +-- data/
|   +-- domain/
|   +-- services/
|   |   +-- evaluation/
|   |   +-- progression/
|   |   +-- storage/
|   |   +-- quests/
|   |   +-- api/
|   +-- test/
|
+-- docs/
|
+-- public/
|
+-- package.json
+-- vite.config.js
+-- .env.example
+-- .gitignore
```

---

## 8. Getting Started

### Requirements

- Node.js 22 or newer
- npm

### Installation

```bash
npm install
```

### Run the backend

```bash
npm run server
```

Backend:

`http://localhost:8787`

### Run the frontend

In a separate terminal:

```bash
npm run dev
```

Frontend:

`http://localhost:5173`

The Vite development server proxies `/api` requests to the backend.

### Offline mode

The game can run without the optional account backend using local storage.

### Single-process deployment

```bash
npm run build
npm run server
```

The backend serves the production frontend and API.

---

## 9. Testing and Verification

Run frontend and evaluation tests:

```bash
npm test
```

Run backend and authentication tests:

```bash
npm run test:server
```

Run lint:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Run the project's combined verification command:

```bash
npm run verify
```

The test suite includes evaluation reliability, progression, Gate Mastery Protocol, recovery, authentication, save validation and persistence coverage.

Passing automated tests does not replace independent human evaluation of real player submissions.

---

## 10. Current Development Priorities

The current development focus is:

1. Complete remaining API input and deployment safeguards.
2. Implement Semantic Analyzer V1.
3. Implement AI Coach.
4. Build Quest Intelligence.
5. Build Player Intelligence.
6. Integrate the intelligence components.
7. Conduct performance and security verification.
8. Deploy to a small pilot group.
9. Collect human evaluation and player feedback.

Human evaluation and calibration will be expanded after controlled pilot usage.

---

## 11. Product Vision

Mythic Levels is designed around a simple principle:

**Growth must be demonstrated through action, not merely recorded as progress.**

The mythology provides the world, Gates provide the challenges, quests provide the practice, and intelligence capabilities provide personalized understanding.

The ultimate goal is a system that helps players understand their patterns, develop meaningful competencies and progress through real-world personal transformation.

---

*MYTHIC LEVELS V5 — A journey from instinct to awareness, from awareness to mastery, and from mastery to integration.*