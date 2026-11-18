# MYTHIC LEVELS â€” Overall Project Scope & Vision

**Project:** Mythic Levels
**Current foundation:** V5
**Direction:** AI-assisted personal development RPG

---

# 1. What Is Mythic Levels?

Mythic Levels is an **AI-assisted personal development RPG**. Its purpose is to help people improve real-world abilities through structured challenges, reflection, feedback and gradual progression.

The player does not simply gain levels by clicking buttons. They engage in real-world activities, reflect on their experiences and demonstrate progress through the Gate system.

The mythology provides the structure and identity. Real-world practice provides the substance.

## 1.1 The evolution journey

```text
BEAST  â†’  HUMAN  â†’  SAGE  â†’  INTEGRATION
```

- **Beast:** Recognize weaknesses and automatic patterns.
- **Human:** Develop conscious control and deliberate behavior.
- **Sage:** Develop deeper understanding and perspective.
- **Integration:** Apply development consistently in real life.

The product contains three Arcana, 27 Gates and seven stages per Gate.

---

# 2. Overall Product Architecture

Mythic Levels consists of three broad layers and seven major systems.

## 2.1 Three product layers

### Game Layer
- Arcana, Gates and stages.
- Quests and rituals.
- XP and player levels.
- Attributes.
- Gate mastery.
- Unlock and progression rules.

### Intelligence Layer
- Gemini-powered semantic understanding.
- AI Coach.
- Player Intelligence.
- Quest Intelligence.
- Adaptive recommendations.
- Structured player memory.

### Experience Layer
- World.
- Journey.
- Realm and Gate pages.
- Chronicle.
- Guide.
- Records.
- Settings and player identity.

All three layers must work together. AI should improve the development journey, not replace the game's identity or mechanics.

---

# 3. The Seven Major Systems

## System 1 â€” Game World and Progression

**Current status:** Existing in V5.

This is the foundation of the RPG. It includes:
- Three Arcana.
- 27 Gates.
- Seven stages per Gate.
- XP and player levels.
- Attributes.
- Quests and rituals.
- Gate mastery.
- Unlock progression.

Example: A player enters the **Troll of Deafened Ears** Gate. Its seven stages guide the player through increasingly demanding forms of practice:

1. Recognition
2. Observation
3. Practice
4. Resistance
5. Application
6. Challenge
7. Mastery

The progression engine manages completion, evidence and mastery.

**Objective:** Preserve this system and make its decisions more reliable. Avoid redesigning working progression without evidence of a defect.

## System 2 â€” Semantic Evaluation Engine

**Current status:** Basic rule-based implementation exists; Gemini integration is planned.

This system evaluates what a player writes after attempting a real-world activity.

Current V5 uses:
- Regular expressions.
- Keyword matching.
- Tokenization.
- Jaccard similarity.
- Weighted scoring.
- Confidence heuristics.

These methods can detect text patterns but cannot reliably understand meaning.

Example:

**Quest:** Listen without preparing a rebuttal.

**Submission:** "I prepared dinner and organized my kitchen."

A basic evaluator may accept a response if it detects enough words or superficial overlap. A semantic evaluator should recognize that the response does not demonstrate the intended listening behavior.

### Target behavior

Gemini receives:
- Gate philosophy and intended outcome.
- Current stage objective.
- Stage-specific evaluation rubric.
- Required and optional submission fields.
- Player's complete submission.
- Relevant previous evidence, when needed.

Gemini evaluates:
- Whether the described action is relevant.
- Whether the player describes an action or merely an intention.
- Whether difficulty and outcome are coherent.
- Whether the reflection demonstrates learning.
- Whether contradictions or inconsistencies exist.
- Whether sufficient information is available.

Gemini returns structured evaluation signals. The deterministic game engine retains final decision authority.

**Important:** The evaluator assesses the quality and relevance of a self-reported account. It does not independently prove that the real-world action happened.

## System 3 â€” AI Coach

**Current status:** A basic hardcoded coach exists; conversational Gemini coach is planned.

The AI Coach is the player's companion. Instead of showing only fixed questions and responses, it should hold natural, contextual conversations.

Example:

**Coach:** What distracted you during the conversation?
**Player:** I kept preparing my response.
**Coach:** What made you feel you needed to respond immediately?
**Player:** I disagreed with what they were saying.
**Coach:** Did you understand their full argument before responding?
**Player:** Not really.
**Coach:** Tomorrow, try allowing the other person to finish before forming your response.

The coach should understand:
- Current Gate and stage.
- Previous conversations.
- Player insights.
- Recent challenges.
- Progression history.
- Current quest and recommendations.

Its purpose is to guide, ask useful follow-up questions and support reflectionâ€”not simply chat.

The existing hardcoded coach should remain available as a fallback until the Gemini coach is verified.

## System 4 â€” Player Intelligence Engine

**Current status:** Not implemented as a complete system.

This system maintains an evolving, evidence-grounded understanding of the player's development.

It may track:
- Strengths.
- Repeated difficulties.
- Gate-specific performance.
- Improvement trends.
- Recurring behavioral patterns.
- Recovery frequency.
- Difficulty tolerance.

Example:

| Observation | Example |
|---|---|
| Strength | Improving ability to maintain focus |
| Difficulty | Frequently interrupts conversations |
| Pattern | Struggles when receiving criticism |
| Improvement | Better performance after structured preparation |
| Development trend | Reflection quality improving |

There are two complementary parts:

1. **Deterministic analytics** calculate measurable trends from stored events and accepted evidence.
2. **Gemini interpretation** interprets those trends and proposes understandable insights.

Insights must cite or reference supporting stored evidence. They must be presented as observations, not diagnoses or definitive psychological conclusions.

The player should be able to correct or dismiss an insight.

## System 5 â€” Quest Intelligence Engine

**Current status:** Basic recommendation system exists; advanced intelligence is planned.

This system determines what the player should practise next.

It considers:
- Current Gate and stage.
- Previous attempts.
- Performance history.
- Player insights.
- Difficulty tolerance.
- Available time.
- Previous activities.
- Quest eligibility and progression constraints.

Example: A player repeatedly struggles with the Goblin of Restless Desire. Instead of repeating the same activity, the system may recommend:

> For your next session, try a 10-minute period without checking your phone. Focus on noticing the urge rather than fighting it.

### Division of responsibility

1. The deterministic engine identifies eligible quests.
2. Gemini analyses player context and recommends suitable candidates.
3. Gemini explains why a candidate may be useful.
4. The deterministic engine validates the recommendation against progression, difficulty, time and other constraints.
5. The engine makes the final selection.

Gemini must not unlock a Gate or bypass progression requirements.

A curated quest library is required. Gemini may help draft or adapt wording, but new quests should be reviewed and approved rather than generated without limits during gameplay.

## System 6 â€” Memory and Player History

**Current status:** Partial implementation exists; expansion is planned.

This system supplies relevant context to the Coach and Intelligence systems.

It should maintain:
- Quest history.
- Evaluation history.
- Player insights.
- Development trends.
- Coach conversation summaries.
- Previous recommendations.
- Recovery history.

Memory and conversation history are not the same thing.

| Data type | Purpose |
|---|---|
| Conversation history | Stores what was discussed, subject to retention settings |
| Player intelligence | Stores structured, evidence-grounded development observations |
| Coach memory | Provides relevant context for future conversations |
| Event history | Records important game and evaluation events |

The existing event history is capped and is not sufficient by itself for long-term trend analysis. Durable, appropriately indexed records are needed.

Do not send the player's entire history to Gemini on every request. Retrieve only the minimum relevant context.

Provide suitable controls for consent, review, correction and deletion.

## System 7 â€” AI Orchestration and Integration

**Current status:** A unified orchestration layer is planned.

This connects the other systems and coordinates the player's journey.

The orchestrator should:
- Receive player actions.
- Load relevant Gate and stage context.
- Retrieve necessary player history and insights.
- Call the appropriate intelligence capability.
- Validate returned data.
- Invoke deterministic game rules.
- Store outcomes and events.
- Update relevant player intelligence records.
- Trigger the next recommendation.

It should not become an uncontrolled AI agent. The model proposes; the application validates and executes permitted operations.

---

# 4. How Gemini Participates

Gemini is the shared intelligence provider for four major capabilities.

| Gemini capability | Responsibility |
|---|---|
| Semantic understanding | Understands submissions and reflections |
| Conversational coaching | Asks questions and guides the player |
| Player insight interpretation | Interprets patterns from player history |
| Quest intelligence | Recommends and explains suitable activities |

Gemini does not own:
- XP.
- Attributes.
- Gate unlocking.
- Mastery.
- Reward calculations.
- Progression rules.

Those remain controlled by Mythic Levels.

## 4.1 Recommended AI interaction model

- Keep Gemini calls on the backend.
- Keep the API key out of React and all `VITE_` variables.
- Use structured output schemas, then validate responses in application code.
- Apply timeouts, quotas, rate limits and a kill switch.
- Use a mock provider for automated tests.
- Retain deterministic fallback behavior.
- Start semantic evaluation in shadow mode before allowing its signals to affect decisions.
- Obtain clear consent before sending private reflections to a third-party provider.
- Verify current provider terms, age requirements and data handling before enabling real user traffic.

Gemini should not be allowed to grant rewards, unlock Gates, modify player records directly or execute arbitrary tools.

---

# 5. The Complete Player Development Loop

This is the central experience Mythic Levels is intended to deliver.

```text
Player opens Mythic Levels
        |
        v
AI Coach understands current context
        |
        v
Quest Intelligence recommends an activity
        |
        v
Player performs a real-world task
        |
        v
Player submits a reflection
        |
        v
Semantic Evaluation interprets the submission
        |
        v
Deterministic engine makes the decision
        |
        +---- Not accepted
        |       |
        |       v
        |   Feedback and revision/recovery
        |
        +---- Accepted
                |
                v
        Rewards and progression
                |
                v
        Update Player Intelligence
                |
                v
        Update relevant memory
                |
                v
        Recommend the next activity
                |
                v
        Continue the journey
```

The experience should feel continuous and contextual. The player should not feel that they are interacting with several disconnected AI features.

---

# 6. Existing V5 vs Target System

The following status is based on the V5 implementation information reviewed so far. It is a planning baseline, not a replacement for a fresh repository audit.

| Component | Current state | Target |
|---|---|---|
| Three Arcana and 27 Gates | Existing | Preserve |
| Seven-stage progression | Existing | Preserve |
| XP and attributes | Existing | Improve reliability |
| Gate mastery | Existing | Preserve and validate |
| Submission forms | Existing | Improve where necessary |
| Rule-based evaluation | Existing | Retain as baseline and fallback |
| Semantic evaluation | Missing | Gemini-powered |
| AI Coach | Hardcoded | Contextual conversational coach |
| Player Intelligence | Partial foundations | Structured trend and insight engine |
| Quest recommendations | Basic | Context-aware recommendations |
| Alternative quest library | Missing | Curated quest collection |
| Adaptive difficulty | Basic | More contextual adaptation |
| Player memory | Partial | Structured persistent memory |
| Unified AI orchestration | Missing as a complete layer | Controlled integration |
| Recovery mechanism | Being implemented in Batch 1 | Reliable recovery |
| Privacy and AI controls | Partial | Consent, retention and safety controls |

---

# 7. Implementation Roadmap

The roadmap below describes the intended sequence. Batches may overlap where interfaces are stable, but each should have a clear commit, tests, change summary and exit criteria.

| Batch | Scope | Expected result |
|---|---|---|
| Batch 1 | Foundation fixes, recovery, evaluation safety, durable history | Reliable foundation |
| Batch 2 | Gemini provider, semantic evaluation, Coach v1 | First working AI integration |
| Batch 3 | Player Intelligence | Evidence-grounded development insights |
| Batch 4 | Quest library and Quest Intelligence | Personalized activity recommendations |
| Batch 5 | AI Coach v2 | Context-aware conversational coaching |
| Batch 6 | Orchestration and interface integration | Unified intelligence experience |
| Batch 7 | Security, testing and calibration | Verified integrated system |
| Batch 8 | Owner's end-to-end testing | Owner-verified application |
| Batch 9 | Friends' release | Initial external feedback |

## Batch 1 â€” Foundation

- Fix and standardize test commands.
- Add a reliable verification command.
- Implement a bounded recovery mechanism.
- Add evaluator and configuration version tracking.
- Add deterministic numeric and negation regression cases.
- Test contradictions where deterministic rules can identify them safely.
- Test double submissions and reward idempotency.
- Improve durable history for later trend analysis.
- Preserve existing V5 functionality.

## Batch 2 â€” Gemini Foundation

- Implement one server-side Gemini provider.
- Create a shared provider contract.
- Add structured semantic evaluation.
- Make evaluation Gate- and stage-aware.
- Add output validation and sanitization.
- Add timeout, quota, rate-limit and fallback handling.
- Implement Coach v1 using the same provider.
- Add a mock Gemini server for tests.
- Start semantic evaluation in shadow mode.

## Batch 3 â€” Player Intelligence

- Implement deterministic trend calculations.
- Track measurable player development signals.
- Let Gemini interpret structured trends.
- Store insights with supporting evidence references.
- Support insight correction and dismissal.
- Avoid unsupported psychological conclusions.

## Batch 4 â€” Quest Intelligence

- Define the curated quest data model.
- Create supplementary-practice support.
- Build and review an initial quest library.
- Add variety and preference-aware ranking.
- Let Gemini recommend and explain eligible candidates.
- Keep final selection and eligibility validation deterministic.

## Batch 5 â€” AI Coach v2

- Add controlled conversation memory.
- Retrieve relevant recent turns and structured player insights.
- Ground coaching in Gate text and current recommendations.
- Ask contextual follow-up questions.
- Avoid repetitive or judgmental coaching.
- Add chat retention and deletion controls.
- Retain a non-AI fallback.

## Batch 6 â€” Orchestration and UX

- Connect evaluation, coaching, player intelligence and quest intelligence.
- Implement controlled orchestration.
- Add consent and age-confirmation flows where required.
- Add an understandable player-insights interface.
- Show AI status and provide an off switch.
- Ensure the application remains usable when Gemini is unavailable.

## Batch 7 â€” Hardening and Verification

- Test malformed model output.
- Test prompt-injection attempts.
- Test Gemini outages and timeouts.
- Verify data access and authorization.
- Verify privacy and logging boundaries.
- Compare Gemini-assisted evaluation with independent human labels.
- Run full tests and production build.
- Verify existing progression and authentication.

## Batch 8 â€” Owner's End-to-End Testing

The owner tests the complete application:
- Registration and authentication.
- Awakening and player setup.
- Gate navigation.
- Quest recommendations.
- Coach conversations.
- Stage submissions.
- Evaluation and revision.
- Recovery.
- Rewards and mastery.
- Memory and insights.
- Application behavior when AI is disabled or unavailable.

Resolve issues before inviting friends.

## Batch 9 â€” Friends' Release

- Invite a small group of friends.
- Start with conservative AI settings and shadow evaluation where appropriate.
- Collect usability feedback.
- Review form completion, revision loops and recommendation quality.
- Fix issues before a wider release.

---

# 8. Responsibilities: Owner and Claude

The owner does not need to implement every algorithm. The owner's role is to understand the product, make decisions and verify that the system behaves as intended.

| Responsibility | Owner | Claude |
|---|---|---|
| Product direction | Decide | Advise |
| Architecture | Review and approve | Design and implement |
| React implementation | Verify | Implement |
| Gemini integration | Provide and configure API key | Implement |
| Evaluation algorithms | Review behavior | Implement |
| Player intelligence | Validate insights | Implement |
| Quest library | Review and approve content | Implement data model and tooling |
| Coach behavior | Test conversations | Implement |
| Automated testing | Review results | Write and run tests |
| Real application testing | Execute user flows | Diagnose and fix |
| Release | Approve | Prepare |

## Owner's expected involvement

The owner's most important work is:
- Understand why each system exists.
- Review architecture and implementation reports.
- Make product and privacy decisions.
- Configure the Gemini API key locally.
- Review quest content and AI-generated insights.
- Test real player journeys after each major batch.
- Approve the release.

Claude's work is implementation, integration, automated testing, debugging and technical reporting.

---

# 9. Core Architecture Rules

These rules should remain stable across all implementation batches.

1. **Gemini proposes; Mythic Levels decides.** AI output never directly grants XP or changes progression.
2. **Game rules remain deterministic.** Unlocks, rewards, mastery and eligibility are controlled by application code.
3. **Insights must be evidence-grounded.** Do not store unsupported claims as player facts.
4. **Self-reported evidence is not verified evidence.** The application must communicate this distinction honestly.
5. **Recovery must be fair.** Players should not be trapped in endless revisions, but recovery must not falsely satisfy mastery.
6. **Quest content remains curated.** Do not let unrestricted model generation change canonical Gate objectives.
7. **Memory is controlled.** Store only useful context, with review and deletion controls.
8. **Privacy is explicit.** Obtain appropriate consent before sending private reflections to an external model.
9. **AI failure must not break the game.** Use timeouts, fallback and an off switch.
10. **Preserve working V5 functionality.** Audit before editing; do not replace whole ZIPs blindly.
11. **One canonical Git repository.** Use commits and versioned release packages; never include `.env`, credentials or local databases in distributable ZIPs.
12. **Verify before claiming completion.** Distinguish tests run, tests skipped, builds completed and browser flows personally verified.

---

# 10. Final Product Vision

Imagine opening Mythic Levels six months from now.

You enter the World.

Your AI Coach understands your current Gate, recent challenges and the development patterns recorded from previous sessions.

It asks how your previous practice went.

You explain what happened. It asks a relevant follow-up question.

It recognizes that a particular difficulty has appeared repeatedly.

It recommends a suitable activity from the curated quest library.

You complete the activity.

The semantic evaluator examines your reflection against the actual Gate objective.

The deterministic game engine determines the outcome and updates your progression.

Your Player Intelligence updates its development records.

Your next recommendation reflects that new information.

This is the intended Mythic Levels experience.

The goal is not to make every screen AI-powered. The goal is to make the entire development journey coherent, contextual and adaptive.

## The three layers to remember

1. **Game layer:** Arcana, Gates, stages, quests, XP, attributes and mastery.
2. **Intelligence layer:** Gemini, semantic evaluation, coaching, player insights and quest recommendations.
3. **Experience layer:** World, Journey, Realm, Chronicle, Guide, Records and the player interface.

**Overall direction:** Keep the existing V5 game foundation, build the intelligence layer around it, and integrate everything through a controlled orchestration layer.
