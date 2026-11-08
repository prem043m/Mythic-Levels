import { makeGate } from '@/data/gateFactory'

export const HUMAN_GATES_LATE = [
  makeGate({
    id: 'human-06',
    arcana: 'human',
    gateNumber: 6,
    name: 'The Lens of Perspective',
    archetype: 'Lens',
    symbol: '◎',
    characteristic: 'Perspective',
    weakness: 'Short-horizon thinking',
    capability: 'Planning, systems, and strategic reasoning',
    principle: 'Step backward to see farther.',
    relatedAttributes: ['perspective', 'knowledge', 'wisdom'],
    difficulty: 'standard',
    recommendedMinutes: 25,
    lore: 'A lens does not add objects to the world. It changes what can be seen at once. Human perspective is the skill of holding near work and far consequence in the same glance.',
    initiation: `YOU HAVE ENTERED:

THE LENS OF PERSPECTIVE

For the next 7 days,
practice seeing farther.

Zoom out.
Choose leverage.
Let the week serve the season.`,
    philosophy: 'Strategy is kindness to your future self. Panic is a close-up that forgot the rest of the picture.',
    outcome: 'You can plan a week that serves a season and drop work that does not.',
    titleReward: 'The Wanderer',
    achievementId: 'lens-mastered',
    tasks: [
      { objective: 'Name the season.', explanation: 'Without a season, every task claims equal urgency.', task: 'Write a 90-day outcome in one paragraph and the three projects that could create it.', durationMinutes: 20, rewards: { xp: 24, ap: 4, kp: 4 }, attributes: { perspective: 6, knowledge: 2 }, prompt: 'What is actually seasonal, and what is merely loud?' },
      { objective: 'See second-order effects.', explanation: 'Narrow wins can be long losses.', task: 'Take one current choice and write: immediate effect, 30-day effect, 1-year effect.', durationMinutes: 20, rewards: { xp: 24, kp: 6, ap: 4 }, attributes: { perspective: 6, knowledge: 3 }, prompt: 'Which attractive near win becomes a future trap?' },
      { type: 'practice', objective: 'Build a weekly lens.', explanation: 'A week is the smallest honest unit of strategy for most lives.', task: 'Plan the coming week: one outcome, three priorities, two ignores, and a recovery block.', durationMinutes: 25, rewards: { xp: 34, dp: 6, kp: 6 }, attributes: { perspective: 6, discipline: 4 }, prompt: 'What did you ignore on purpose?' },
      { type: 'practice', objective: 'Kill a false priority.', explanation: 'Perspective without subtraction is just a prettier to-do list.', task: 'Stop or pause one task that does not serve the season. Record the fear that appears.', durationMinutes: 20, rewards: { xp: 32, dp: 8, ap: 4 }, attributes: { discipline: 5, perspective: 5 }, prompt: 'Whose expectations were you serving that were not yours?' },
      { type: 'knowledge', objective: 'Study a system around your aim.', explanation: 'Sometimes you are polishing a cog that is not connected to the machine.', task: 'Spend 25 minutes learning the larger system of your goal. Write five implications.', durationMinutes: 25, rewards: { xp: 36, kp: 12, ap: 4 }, attributes: { knowledge: 6, perspective: 5 }, prompt: 'What leverage did you not see last week?' },
      { type: 'practice', objective: 'Execute the far through the near.', explanation: 'A lens that never comes back to the hand is daydreaming.', task: 'Complete the highest-leverage action from your weekly plan in a 40-minute block.', durationMinutes: 40, rewards: { xp: 42, dp: 10, mp: 8 }, attributes: { discipline: 6, perspective: 5 }, prompt: 'Did the block move the season or only soothe anxiety?' },
      { type: 'reflection', objective: 'Keep a personal zoom rule.', explanation: 'You need a cue for when you are too close or too far.', task: 'Write: I am too close when… I am too far when… I return to the lens by…', durationMinutes: 15, rewards: { xp: 36, ap: 10, kp: 4 }, attributes: { wisdom: 5, perspective: 5 }, prompt: 'What is your tell for lost altitude?' },
    ],
    boss: { name: 'Lens Trial', title: 'The Far Made Near', description: 'Produce a one-page seasonal map and complete the week’s highest-leverage action. Perspective is proven when the far changes what you do today.', durationMinutes: 55, xp: 90, rewards: { xp: 90, mp: 18, kp: 10, dp: 10 }, attributes: { perspective: 12, knowledge: 8, discipline: 6 }, completionLine: 'LENS MASTERED' },
  }),
  makeGate({
    id: 'human-07',
    arcana: 'human',
    gateNumber: 7,
    name: 'The Loom of Connection',
    archetype: 'Loom',
    symbol: '🧶',
    characteristic: 'Connection',
    weakness: 'Isolation or shallow contact',
    capability: 'Relationships, collaboration, and social intelligence',
    principle: 'A human grows through other humans.',
    relatedAttributes: ['connection', 'communication', 'emotionalBalance'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'A loom does not make cloth from a single thread. Connection is not networking theater. It is the willingness to be affected, useful, and true among others.',
    initiation: `YOU HAVE ENTERED:

THE LOOM OF CONNECTION

For the next 7 days,
practice being a human among humans.

Reach.
Listen.
Collaborate.
Repair.`,
    philosophy: 'Independence is a skill. Isolation as identity is a stall. We become capable in the presence of other lives.',
    outcome: 'You can initiate meaningful contact, collaborate cleanly, and repair a small rupture.',
    titleReward: 'The Weaver',
    achievementId: 'loom-mastered',
    tasks: [
      { objective: 'See your actual web.', explanation: 'Most people are neither as alone nor as held as their story claims.', task: 'Map eight people who affect your life. Mark: nourishing, practical, strained, neglected.', durationMinutes: 15, rewards: { xp: 22, ap: 6, cp: 4 }, attributes: { connection: 4, awareness: 3 }, prompt: 'Which thread have you been pretending is optional?' },
      { objective: 'Notice the quality of contact.', explanation: 'Volume of messages is not connection.', task: 'After three interactions, rate presence from 1–5 and write one sentence on what made it so.', durationMinutes: 15, rewards: { xp: 24, ap: 6, cp: 4 }, attributes: { awareness: 4, connection: 3 }, prompt: 'Where were you physically present and actually elsewhere?' },
      { type: 'social', objective: 'Initiate without a mask of needlessness.', explanation: 'Many webs starve because no one wants to be the one who reaches.', task: 'Send or speak one genuine initiation: gratitude, invitation, or check-in that is specific.', durationMinutes: 15, rewards: { xp: 30, cp: 10 }, attributes: { connection: 6, communication: 4 }, prompt: 'What story tried to stop the reaching?' },
      { type: 'social', objective: 'Collaborate instead of performing independence.', explanation: 'The Loom appears when work is shared without scorekeeping.', task: 'Do a real piece of shared work: plan, help, or create with someone. Clarify who owns what.', durationMinutes: 30, rewards: { xp: 36, cp: 12, dp: 4 }, attributes: { connection: 7, communication: 4 }, prompt: 'Where did you over-control or under-own?' },
      { type: 'social', objective: 'Practice a repair.', explanation: 'Connection is not the absence of rupture. It is the presence of repair.', task: 'Make a small repair: apology, clarification, or overdue honesty. Keep it clean and short.', durationMinutes: 20, rewards: { xp: 34, cp: 12, sp: 4 }, attributes: { connection: 6, emotionalBalance: 4 }, prompt: 'What did you fear the repair would cost, and what did it actually cost?' },
      { type: 'social', objective: 'Offer usefulness without self-erasure.', explanation: 'Service that annihilates you is not connection; it is disappearance.', task: 'Help someone in a bounded way. State the bound. Do not martyr. Do not keep a secret ledger.', durationMinutes: 25, rewards: { xp: 38, cp: 12, ap: 4 }, attributes: { connection: 7, awareness: 3 }, prompt: 'Could you be generous and still have a self?' },
      { type: 'reflection', objective: 'Choose how you belong.', explanation: 'Identity includes the kind of we you are weaving.', task: 'Write the kind of relationships you are training, and the kind you will no longer counterfeit.', durationMinutes: 15, rewards: { xp: 36, ap: 10, cp: 4 }, attributes: { wisdom: 4, connection: 5 }, prompt: 'What does a healthy we require of you weekly?' },
    ],
    boss: { name: 'Loom Trial', title: 'The Living Thread', description: 'Have a meaningful conversation or collaboration, then make one concrete follow-through within 24 hours. Connection is a thread that continues after the scene.', durationMinutes: 45, xp: 90, rewards: { xp: 90, mp: 18, cp: 18, ap: 6 }, attributes: { connection: 12, communication: 8, emotionalBalance: 6 }, completionLine: 'LOOM MASTERED' },
  }),
  makeGate({
    id: 'human-08',
    arcana: 'human',
    gateNumber: 8,
    name: 'The Forge of Identity',
    archetype: 'Forge',
    symbol: '🔥',
    characteristic: 'Identity',
    weakness: 'Unchosen self',
    capability: 'Values, boundaries, and authenticity',
    principle: 'Do not merely discover who you are. Forge who you become.',
    relatedAttributes: ['wisdom', 'discipline', 'awareness'],
    difficulty: 'austere',
    recommendedMinutes: 25,
    lore: 'Identity is not a relic you uncover intact. It is metal. Heat, hammer, and quench. The Forge is where values stop being posters and become constraints you will actually live.',
    initiation: `YOU HAVE ENTERED:

THE FORGE OF IDENTITY

For the next 7 days,
choose the metal.

Name your values.
Keep a boundary.
Act as the person you are forging.`,
    philosophy: 'Personality is what happened. Character is what you repeatedly choose under heat.',
    outcome: 'You can name core values, keep a boundary, and act from a chosen identity for a day.',
    titleReward: 'The Forge-Bearer',
    achievementId: 'forge-mastered',
    tasks: [
      { objective: 'Sort inherited metal from chosen metal.', explanation: 'Some identities were fitted to you by fear, family, or applause.', task: 'Write identities you perform. Mark inherited, useful, or true. Keep three that you will forge.', durationMinutes: 20, rewards: { xp: 24, ap: 8 }, attributes: { awareness: 6, wisdom: 3 }, prompt: 'Which performance would collapse if nobody watched?' },
      { objective: 'Name values as constraints.', explanation: 'A value that never forbids anything is a slogan.', task: 'Choose three values. For each, write one behavior it requires and one it forbids.', durationMinutes: 20, rewards: { xp: 26, ap: 6, dp: 4 }, attributes: { wisdom: 5, discipline: 3 }, prompt: 'Which value is most expensive, and therefore most real?' },
      { type: 'practice', objective: 'Keep a boundary in the world.', explanation: 'Identity is proven at the edge where someone else wants more of you than is true.', task: 'State one real boundary. Hold it. No essay, no vanishing, no secret resentment ledger.', durationMinutes: 20, rewards: { xp: 34, dp: 8, cp: 6, sp: 4 }, attributes: { discipline: 6, communication: 4 }, prompt: 'What identity did the boundary protect?' },
      { type: 'practice', objective: 'Act from the forged self for a block.', explanation: 'You become the person whose actions you repeat, not the person you narrate.', task: 'For 40 minutes, do the work your forged self would do at this hour. Not the mood-self. Not the audience-self.', durationMinutes: 40, rewards: { xp: 42, dp: 10, mp: 8 }, attributes: { discipline: 7, wisdom: 4 }, prompt: 'What did the forged self choose that the old self delayed?' },
      { type: 'daily', objective: 'Align a small environment.', explanation: 'Identity leaks into rooms, calendars, and apps.', task: 'Change one environmental cue to match the forged self: a blocked site, a prepared space, a visible north.', durationMinutes: 20, rewards: { xp: 30, dp: 6, ap: 4 }, attributes: { discipline: 5, awareness: 3 }, prompt: 'What in your environment still belongs to a former self?' },
      { type: 'social', objective: 'Speak as yourself.', explanation: 'If no one knows the forged self, the old one will keep getting invited.', task: 'Tell one trusted person a true sentence about who you are training to become.', durationMinutes: 15, rewards: { xp: 34, cp: 8, ap: 6 }, attributes: { communication: 5, connection: 4 }, prompt: 'What was at risk in being seen in process rather than finished?' },
      { type: 'reflection', objective: 'Write the forging oath.', explanation: 'An oath is a tool, not a spell. It is useful if it can be practiced tomorrow.', task: 'Write a one-page oath: values, boundary, daily proof, and what you refuse to become.', durationMinutes: 20, rewards: { xp: 40, ap: 12, dp: 4 }, attributes: { wisdom: 7, awareness: 4 }, prompt: 'What sentence of the oath would you want read back to you in a year?' },
    ],
    boss: { name: 'Forge Trial', title: 'The Chosen Metal', description: 'Live one full day as a test of your oath: keep the daily proof, keep one boundary, and write an evening review of where the old self tried to return.', durationMinutes: 60, xp: 100, rewards: { xp: 100, mp: 22, dp: 12, ap: 12, sp: 8 }, attributes: { wisdom: 10, discipline: 10, awareness: 8 }, completionLine: 'FORGE MASTERED' },
  }),
  makeGate({
    id: 'human-09',
    arcana: 'human',
    gateNumber: 9,
    name: 'The Crown of Integration',
    archetype: 'Crown',
    symbol: '♔',
    characteristic: 'Integration',
    weakness: 'Fragmented capability',
    capability: 'Self-mastery and conscious living',
    principle: 'Hold the faculties together as one life.',
    relatedAttributes: ['wisdom', 'discipline', 'awareness'],
    difficulty: 'austere',
    recommendedMinutes: 30,
    lore: 'A crown is not domination. It is the circle that holds many powers without letting one devour the rest. Integration is the Human’s last work: to be one person on Monday and on Saturday.',
    initiation: `YOU HAVE ENTERED:

THE CROWN OF INTEGRATION

For the next 7 days,
live as one person.

Bring focus, listening, discipline, expression, balance, perspective, connection, and identity into the same day.
Not perfectly. Together.`,
    philosophy: 'Mastery of parts is still fragmentation if they never share a calendar.',
    outcome: 'You can run an integrated day: practice, relation, reflection, and rest without abandoning any faculty.',
    titleReward: 'The Sovereign',
    achievementId: 'crown-human-mastered',
    tasks: [
      { objective: 'Inventory the faculties.', explanation: 'Integration starts with an honest court, including the neglected seats.', task: 'Score the eight Human faculties 1–5 by lived evidence this month. Name the weakest two.', durationMinutes: 20, rewards: { xp: 24, ap: 8 }, attributes: { awareness: 5, wisdom: 4 }, prompt: 'Which faculty do you perform in the app and abandon in the world?' },
      { objective: 'See the splits.', explanation: 'Many people are disciplined at work and chaotic in speech, or kind abroad and harsh at home.', task: 'Write two contexts where you become a different person. What cue switches you?', durationMinutes: 20, rewards: { xp: 26, ap: 8 }, attributes: { awareness: 6, perspective: 3 }, prompt: 'Which split is costing you the most trust—in yourself or others?' },
      { type: 'practice', objective: 'Design an integrated day.', explanation: 'A crown needs a court schedule, not a wish.', task: 'Plan tomorrow with four rooms: deep work, a human contact, a body/emotion check, and reflection. Keep it light enough to be real.', durationMinutes: 20, rewards: { xp: 32, dp: 8, ap: 4 }, attributes: { discipline: 5, perspective: 5 }, prompt: 'What did you almost overload out of pride?' },
      { type: 'practice', objective: 'Live the integrated day.', explanation: 'The Gate is not the plan.', task: 'Execute the four rooms. If one fails, repair it the same day rather than abandoning the rest.', durationMinutes: 50, rewards: { xp: 46, dp: 10, sp: 8, cp: 6, ap: 6 }, attributes: { discipline: 6, connection: 4, emotionalBalance: 4, awareness: 4 }, prompt: 'Which room wanted to cancel the others?' },
      { type: 'daily', objective: 'Practice seamless transitions.', explanation: 'Fragmentation often lives in the hallway between roles.', task: 'Between two roles today, take a 3-minute threshold: close the previous, name the next, begin cleanly.', durationMinutes: 15, rewards: { xp: 30, ap: 6, dp: 4 }, attributes: { awareness: 5, discipline: 4 }, prompt: 'What residue do you usually carry from room to room?' },
      { type: 'practice', objective: 'Hold complexity without splitting.', explanation: 'Integration is remaining one person when demands conflict.', task: 'When two values collide today, write the collision, choose, and own the cost. No pretend that nothing was lost.', durationMinutes: 25, rewards: { xp: 40, ap: 8, dp: 6, sp: 4 }, attributes: { wisdom: 6, emotionalBalance: 4 }, prompt: 'What did you choose, and what did you honor in the thing not chosen?' },
      { type: 'reflection', objective: 'Crown the human, not a persona.', explanation: 'The Human Arcana ends when you can live as a whole amateur of yourself.', task: 'Write what integrated living will mean in the Sage Arcana: less proving, more practice, more compassion.', durationMinutes: 20, rewards: { xp: 40, ap: 12, sp: 4 }, attributes: { wisdom: 7, awareness: 4 }, prompt: 'If you are already a human, what remains to train?' },
    ],
    boss: { name: 'Crown Trial', title: 'One Life', description: 'Live an integrated day with deep work, listening or collaboration, regulation, and written reflection. The crown is not a costume. It is a day that holds more than one faculty.', durationMinutes: 90, xp: 120, rewards: { xp: 120, mp: 24, dp: 12, ap: 12, cp: 8, sp: 10 }, attributes: { wisdom: 12, discipline: 10, awareness: 10, connection: 6 }, completionLine: 'HUMAN CROWN MASTERED' },
  }),
]
