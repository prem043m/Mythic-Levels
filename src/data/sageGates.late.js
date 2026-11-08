import { makeGate } from '@/data/gateFactory'

export const SAGE_GATES_LATE = [
  makeGate({
    id: 'sage-05',
    arcana: 'sage',
    gateNumber: 5,
    name: 'The Crucible of Transformation',
    archetype: 'Crucible',
    symbol: '⚗',
    characteristic: 'Transformation',
    weakness: 'Rigidity after failure',
    capability: 'Adaptation, creativity, learning from breaking',
    principle: 'What breaks you can become material for rebuilding.',
    relatedAttributes: ['wisdom', 'discipline', 'emotionalBalance'],
    difficulty: 'austere',
    recommendedMinutes: 25,
    lore: 'A crucible is a vessel that can hold heat without pretending the metal is already finished. Transformation is not self-harm. It is the refusal to waste a breaking.',
    initiation: `YOU HAVE ENTERED:

THE CRUCIBLE OF TRANSFORMATION

For the next 7 days,
treat difficulty as material.

Name a break.
Extract the lesson.
Rebuild one practice.`,
    philosophy: 'Failure is expensive. It becomes tragic only when it is not metabolized.',
    outcome: 'You can review a failure without collapse and change one method because of it.',
    titleReward: 'The Seeker',
    achievementId: 'crucible-mastered',
    tasks: [
      { objective: 'Name a true breaking.', explanation: 'Vague pain cannot be refined.', task: 'Write one failure, loss, or collapse with facts first, then story. Separate them.', durationMinutes: 20, rewards: { xp: 24, ap: 10 }, attributes: { awareness: 5, wisdom: 3 }, prompt: 'What is fact, and what is the identity you built on the fact?' },
      { objective: 'Find the unused material.', explanation: 'Most people extract shame and leave the information.', task: 'From that event, write three usable lessons and one lesson that is actually a curse you will not keep.', durationMinutes: 20, rewards: { xp: 26, ap: 8, kp: 2 }, attributes: { wisdom: 5, perspective: 3 }, prompt: 'Which “lesson” is just self-punishment in a wiser costume?' },
      { type: 'practice', objective: 'Change a method, not a soul.', explanation: 'Transformation that only changes self-talk is incomplete.', task: 'Alter one working method based on the lesson. Run it for a 25-minute block.', durationMinutes: 25, rewards: { xp: 36, dp: 8, mp: 8, ap: 4 }, attributes: { discipline: 6, wisdom: 4 }, prompt: 'What is different in the method, not in the speech about yourself?' },
      { type: 'practice', objective: 'Create from constraint.', explanation: 'Creativity is often heat plus a wall.', task: 'Take a limitation you have and make a small thing: a plan, a paragraph, a prototype, a conversation script.', durationMinutes: 30, rewards: { xp: 38, kp: 6, dp: 6, ap: 4 }, attributes: { knowledge: 4, wisdom: 4, discipline: 3 }, prompt: 'What did the constraint force you to invent?' },
      { type: 'daily', objective: 'Practice non-catastrophic repair.', explanation: 'The Crucible fails if every error becomes a new personality.', task: 'When something goes wrong today, run a 15-minute repair: name, adjust, continue.', durationMinutes: 15, rewards: { xp: 32, sp: 8, dp: 6 }, attributes: { emotionalBalance: 6, discipline: 4 }, prompt: 'How quickly can you return to being a practitioner?' },
      { type: 'practice', objective: 'Hold heat without fleeing.', explanation: 'Some transformations require staying with discomfort long enough to learn.', task: 'Work 35 minutes on the rebuilt method after the first urge to revert.', durationMinutes: 35, rewards: { xp: 44, dp: 10, sp: 6, mp: 10 }, attributes: { discipline: 7, emotionalBalance: 5 }, prompt: 'What did the old method offer that the new one does not yet?' },
      { type: 'reflection', objective: 'Write the rebuilt form.', explanation: 'You need a description of the person who learned, not the person who was wounded only.', task: 'Write: what broke, what it taught, what you rebuilt, what you will not mythologize.', durationMinutes: 20, rewards: { xp: 40, ap: 12, sp: 4 }, attributes: { wisdom: 7, awareness: 4 }, prompt: 'How do you honor the heat without living in the fire?' },
    ],
    boss: { name: 'Crucible Trial', title: 'The Rebuilt Vessel', description: 'Review a real failure on one page, extract a method change, and complete a practice session using the new method. Transformation is evidenced in the next attempt.', durationMinutes: 55, xp: 100, rewards: { xp: 100, mp: 22, ap: 12, dp: 12, sp: 10 }, attributes: { wisdom: 12, discipline: 10, emotionalBalance: 8 }, completionLine: 'CRUCIBLE MASTERED' },
  }),
  makeGate({
    id: 'sage-06',
    arcana: 'sage',
    gateNumber: 6,
    name: 'The Thread of Oneness',
    archetype: 'Thread',
    symbol: '∞',
    characteristic: 'Compassion',
    weakness: 'Isolated self-importance',
    capability: 'Contribution, empathy, interconnected thinking',
    principle: 'Wisdom without compassion remains incomplete.',
    relatedAttributes: ['connection', 'wisdom', 'emotionalBalance'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'The thread is the reminder that no inner work is only inner. Lives touch. The Sage who sees clearly and does not care has trained only half a mind.',
    initiation: `YOU HAVE ENTERED:

THE THREAD OF ONENESS

For the next 7 days,
practice being part of a larger life.

See a person fully.
Give without ledger.
Let compassion include yourself.`,
    philosophy: 'Compassion is accurate seeing plus the refusal to treat pain—yours or theirs—as unreal.',
    outcome: 'You can offer a real act of care, think in systems of people, and include yourself in that care.',
    titleReward: 'The Illuminated',
    achievementId: 'thread-mastered',
    tasks: [
      { objective: 'See the other as real as you.', explanation: 'Oneness begins as the end of extras in a story where only you are fully human.', task: 'Write a person you resent or ignore as a full character: needs, pressures, likely fears. No excusing harm; no flattening.', durationMinutes: 15, rewards: { xp: 24, ap: 8, cp: 4 }, attributes: { connection: 5, awareness: 4 }, prompt: 'What did complexity do to your cartoon of them?' },
      { objective: 'Notice interconnection.', explanation: 'Your calm, waste, work, and words land somewhere.', task: 'Trace one ordinary action today through three other lives it affects.', durationMinutes: 15, rewards: { xp: 24, ap: 6, kp: 2 }, attributes: { perspective: 5, connection: 3 }, prompt: 'Where are you pretending to be a closed system?' },
      { type: 'social', objective: 'Give a specific good.', explanation: 'Vague warmth is not a thread.', task: 'Do one concrete kindness or help with a clear need. Make it bounded and real.', durationMinutes: 20, rewards: { xp: 34, cp: 12, ap: 4 }, attributes: { connection: 7, wisdom: 3 }, prompt: 'Did you give what they needed, or what made you feel like a good person?' },
      { type: 'social', objective: 'Practice compassion under irritation.', explanation: 'The easy thread is not the training.', task: 'In a friction moment, choose one compassionate action: patience, a question, a fair word. Do not become a doormat.', durationMinutes: 15, rewards: { xp: 34, cp: 8, sp: 6 }, attributes: { emotionalBalance: 5, connection: 5 }, prompt: 'What is the difference between compassion and self-erasure here?' },
      { type: 'daily', objective: 'Include yourself in the thread.', explanation: 'A compassion that excludes the self becomes martyrdom and then bitterness.', task: 'Offer yourself one same-class care you would offer a respected friend.', durationMinutes: 15, rewards: { xp: 30, sp: 8, ap: 4 }, attributes: { emotionalBalance: 5, wisdom: 3 }, prompt: 'Why is self-care harder to authorize than self-criticism?' },
      { type: 'social', objective: 'Contribute to a common good.', explanation: 'Oneness becomes civic when it leaves the diary.', task: 'Contribute time, skill, or attention to something that is not only yours: household, team, community, craft.', durationMinutes: 35, rewards: { xp: 44, cp: 14, dp: 6 }, attributes: { connection: 8, discipline: 4 }, prompt: 'What did contribution reveal that consumption never does?' },
      { type: 'reflection', objective: 'Write a compassion ethic.', explanation: 'The Sage needs a way to care without drowning or performing.', task: 'Write: whom I will not dehumanize, how I will help, how I will rest, how I will tell the truth while caring.', durationMinutes: 15, rewards: { xp: 36, ap: 10, cp: 4 }, attributes: { wisdom: 6, connection: 4 }, prompt: 'Where does your compassion still have a favorite and an invisible?' },
    ],
    boss: { name: 'Thread Trial', title: 'The Living Bond', description: 'Complete a real act of contribution or care, then write how it affected another life and your own. Include one way you did not abandon yourself while giving.', durationMinutes: 50, xp: 90, rewards: { xp: 90, mp: 18, cp: 18, ap: 10, sp: 6 }, attributes: { connection: 12, wisdom: 8, emotionalBalance: 6 }, completionLine: 'THREAD MASTERED' },
  }),
  makeGate({
    id: 'sage-07',
    arcana: 'sage',
    gateNumber: 7,
    name: 'The Seal of Detachment',
    archetype: 'Seal',
    symbol: '◉',
    characteristic: 'Detachment',
    weakness: 'Outcome-captivity',
    capability: 'Care without being owned by result',
    principle: 'You can care deeply without being controlled by the outcome.',
    relatedAttributes: ['emotionalBalance', 'wisdom', 'awareness'],
    difficulty: 'austere',
    recommendedMinutes: 20,
    lore: 'A seal does not mean you stop loving the letter. It means the letter can be sent. Detachment is not coldness. It is the end of using results as the only proof you exist.',
    initiation: `YOU HAVE ENTERED:

THE SEAL OF DETACHMENT

For the next 7 days,
practice sincere effort without clutching.

Do the work.
Release the verdict.
Keep your worth off the leaderboard.`,
    philosophy: 'Clinging turns love into panic and craft into self-worth gambling. The Sage still aims. The Sage does not indenture the soul to the score.',
    outcome: 'You can complete important work and not let the immediate result rewrite your identity.',
    titleReward: 'The Still Mind',
    achievementId: 'seal-mastered',
    tasks: [
      { objective: 'Name what you clutch.', explanation: 'Detachment is specific or it is a spiritual costume.', task: 'List three outcomes you treat as verdicts on your worth. Write the clutch in the body.', durationMinutes: 15, rewards: { xp: 22, ap: 10 }, attributes: { awareness: 6, emotionalBalance: 3 }, prompt: 'Which outcome have you made into a god?' },
      { objective: 'See comparison as a hook.', explanation: 'The Asura still visits the Sage, quieter and better dressed.', task: 'When comparison appears, write: their path, my path, the work still mine. Then return to one next action.', durationMinutes: 15, rewards: { xp: 26, ap: 8, dp: 4 }, attributes: { awareness: 5, wisdom: 3 }, prompt: 'What work was comparison trying to interrupt?' },
      { type: 'practice', objective: 'Do the work, then seal it.', explanation: 'Sending is a spiritual and practical act.', task: 'Complete a piece of work and close it: submit, send, or declare a version done. No hovering refresh ritual.', durationMinutes: 30, rewards: { xp: 36, dp: 8, sp: 6, mp: 8 }, attributes: { discipline: 6, emotionalBalance: 5 }, prompt: 'What did your hands want to do after the seal?' },
      { type: 'practice', objective: 'Care without controlling.', explanation: 'Some clutching wears the mask of responsibility.', task: 'Help or create, then leave room for another person’s response. Do not manage their feeling in advance.', durationMinutes: 20, rewards: { xp: 34, cp: 6, sp: 6, ap: 4 }, attributes: { connection: 4, emotionalBalance: 6 }, prompt: 'Where does care become a secret bid for control?' },
      { type: 'daily', objective: 'Keep worth on an inner ledger.', explanation: 'If the only scoreboard is outer, every quiet day feels like death.', task: 'Score today only on sincerity of effort, honesty, and kindness. Not on wins.', durationMinutes: 10, rewards: { xp: 28, ap: 8, sp: 6 }, attributes: { wisdom: 5, emotionalBalance: 4 }, prompt: 'What remains valuable if nothing applauds?' },
      { type: 'practice', objective: 'Sit with not-knowing the result.', explanation: 'Uncertainty is the usual fuel of clutching.', task: 'Sit 20 minutes intending nothing but presence while a real result is pending. Do not problem-solve.', durationMinutes: 20, rewards: { xp: 40, ap: 10, sp: 8 }, attributes: { awareness: 6, emotionalBalance: 6 }, prompt: 'What identity feels threatened by an unreturned verdict?' },
      { type: 'reflection', objective: 'Write a seal.', explanation: 'You need a sentence you can use when the hook goes in.', task: 'Write: I will care by… I will not clutch by… My worth remains…', durationMinutes: 15, rewards: { xp: 36, ap: 12, sp: 4 }, attributes: { wisdom: 7, emotionalBalance: 4 }, prompt: 'What is the difference between high standards and a hostage situation?' },
    ],
    boss: { name: 'Seal Trial', title: 'The Sent Letter', description: 'Complete and release an important piece of work or conversation. Spend 20 minutes afterward without checking, rumination, or campaigning for a verdict. Write what remained of you.', durationMinutes: 50, xp: 90, rewards: { xp: 90, mp: 18, ap: 12, sp: 14, dp: 8 }, attributes: { emotionalBalance: 12, wisdom: 10, awareness: 8 }, completionLine: 'SEAL MASTERED' },
  }),
  makeGate({
    id: 'sage-08',
    arcana: 'sage',
    gateNumber: 8,
    name: 'The Beacon of Illumination',
    archetype: 'Beacon',
    symbol: '✦',
    characteristic: 'Illumination',
    weakness: 'Private knowledge that never lights a path',
    capability: 'Teaching, synthesis, mentoring, clarity',
    principle: 'Knowledge becomes wisdom when it can illuminate another path.',
    relatedAttributes: ['wisdom', 'communication', 'knowledge'],
    difficulty: 'austere',
    recommendedMinutes: 30,
    lore: 'A beacon is not brighter because it is proud. It is useful because it is placed. Illumination is the Sage’s duty to make a path more walkable for someone who is still in weather you remember.',
    initiation: `YOU HAVE ENTERED:

THE BEACON OF ILLUMINATION

For the next 7 days,
turn understanding into light for a path.

Synthesize.
Teach.
Keep humility in the lamp.`,
    philosophy: 'If your insight cannot travel, it is still a private jewel. Jewels do not light roads.',
    outcome: 'You can teach a practiced insight clearly and help another person take a next step.',
    titleReward: 'The Illuminated',
    achievementId: 'beacon-mastered',
    tasks: [
      { objective: 'Choose a lamp, not a chandelier.', explanation: 'Teaching fails when it tries to gift an entire Arcana at once.', task: 'Pick one insight you have actually practiced. Write it in two sentences a tired person could use.', durationMinutes: 15, rewards: { xp: 24, kp: 6, ap: 4 }, attributes: { wisdom: 4, communication: 3 }, prompt: 'What must you leave out so the lamp can be carried?' },
      { objective: 'Remember the fog.', explanation: 'A beacon that forgets being lost becomes condescension.', task: 'Write your own early confusion about this insight. What did not help you then?', durationMinutes: 15, rewards: { xp: 24, ap: 8, cp: 2 }, attributes: { awareness: 4, connection: 3 }, prompt: 'What help would have been too much, too proud, or too vague?' },
      { type: 'knowledge', objective: 'Synthesize a teaching.', explanation: 'Illumination is structured, not a dump of notes.', task: 'Create a one-page guide: principle, example, common failure, next step.', durationMinutes: 30, rewards: { xp: 40, kp: 12, dp: 4 }, attributes: { knowledge: 6, wisdom: 5, communication: 4 }, prompt: 'Does the page help someone act, or only admire you?' },
      { type: 'social', objective: 'Offer light without taking the walk.', explanation: 'Mentorship is not possession.', task: 'Share the guide or insight with a real person. Ask what is useful. Do not force conversion.', durationMinutes: 25, rewards: { xp: 38, cp: 12, kp: 4 }, attributes: { communication: 6, connection: 6 }, prompt: 'Where did you want them to become your proof?' },
      { type: 'social', objective: 'Help them find their next step.', explanation: 'A beacon shows a path, not a personality transplant.', task: 'Help someone define one next practice they can keep this week. Make it smaller if needed.', durationMinutes: 20, rewards: { xp: 36, cp: 12, ap: 4 }, attributes: { connection: 6, wisdom: 4 }, prompt: 'Did you prescribe your path or help them see theirs?' },
      { type: 'practice', objective: 'Keep practicing while teaching.', explanation: 'The deadest lamps are those who only speak.', task: 'Do your own practice of the same insight for 30 minutes after teaching it.', durationMinutes: 30, rewards: { xp: 42, dp: 8, mp: 8, kp: 4 }, attributes: { discipline: 5, wisdom: 5 }, prompt: 'What did teaching reveal you still do not embody?' },
      { type: 'reflection', objective: 'Write a beacon ethic.', explanation: 'Light can burn. The Sage needs rules.', task: 'Write: I teach what I practice, I do not shame, I do not recruit, I remain a student.', durationMinutes: 15, rewards: { xp: 36, ap: 10, kp: 4 }, attributes: { wisdom: 7, communication: 3 }, prompt: 'How will you stay illuminated without becoming a performer of wisdom?' },
    ],
    boss: { name: 'Beacon Trial', title: 'Light on a Path', description: 'Create a clear one-page teaching from something you have practiced, share it with a person, and complete your own practice of the same principle the same day.', durationMinutes: 70, xp: 100, rewards: { xp: 100, mp: 20, kp: 14, cp: 14, ap: 8 }, attributes: { wisdom: 12, communication: 10, knowledge: 8 }, completionLine: 'BEACON MASTERED' },
  }),
  makeGate({
    id: 'sage-09',
    arcana: 'sage',
    gateNumber: 9,
    name: 'The Crown of Transcendence',
    archetype: 'Transcendence',
    symbol: '✧',
    characteristic: 'Integration of the whole path',
    weakness: 'The fantasy of becoming other than human',
    capability: 'Lived wisdom across the faculties',
    principle: 'The journey was never about becoming something other than human.',
    relatedAttributes: ['wisdom', 'awareness', 'discipline', 'connection'],
    difficulty: 'austere',
    recommendedMinutes: 35,
    lore: 'This crown is not an escape from the species. Transcendence here means the trained human: able to see, choose, learn, feel, speak, care, and let go. The last Gate returns you to the world that always was the arena.',
    initiation: `YOU HAVE ENTERED:

THE CROWN OF TRANSCENDENCE

This is not a supernatural rank.
It is a test of integration.

For the next 7 days,
live as a capable human.

Awareness. Discipline. Knowledge. Perspective.
Balance. Communication. Compassion. Self-knowledge. Wisdom.

Then return to the ordinary day, which was always the temple.`,
    philosophy: 'The journey was never about becoming something other than human. It was about becoming more fully capable of being one.',
    outcome: 'You can run a complete daily loop—practice, relation, reflection—and see your path as training, not costume.',
    titleReward: 'The Sage',
    achievementId: 'transcendence-mastered',
    tasks: [
      { objective: 'Remember the Human you were.', explanation: 'Without origin, a crown is amnesia.', task: 'Write a letter from the player who began Gate I of the Beast. What did they not know how to do?', durationMinutes: 20, rewards: { xp: 26, ap: 10 }, attributes: { awareness: 5, wisdom: 5 }, prompt: 'What capability is now ordinary that once felt mythic?' },
      { objective: 'Measure the real faculties.', explanation: 'Numbers in an app are shadows. Behavior is the body.', task: 'Score each of the nine attributes by evidence from the last month. Give one proof and one remaining training edge.', durationMinutes: 25, rewards: { xp: 28, ap: 8, kp: 4 }, attributes: { awareness: 5, wisdom: 5, perspective: 3 }, prompt: 'Where is the app ahead of your life, and where is your life ahead of the app?' },
      { type: 'practice', objective: 'Live a complete daily loop.', explanation: 'The long-term loop must fit inside a Tuesday.', task: 'Complete: one practice, one human contact, one stillness or regulation, one written reflection.', durationMinutes: 60, rewards: { xp: 50, dp: 10, cp: 8, ap: 8, sp: 8 }, attributes: { discipline: 6, connection: 5, awareness: 5, emotionalBalance: 4 }, prompt: 'Which part of the loop still feels like costume?' },
      { type: 'practice', objective: 'Train the weakest remaining edge.', explanation: 'Transcendence that avoids the weak faculty is still a Beast with better language.', task: 'Give 40 minutes to your weakest attribute’s real-world practice.', durationMinutes: 40, rewards: { xp: 46, dp: 10, mp: 10, sp: 4 }, attributes: { discipline: 6, wisdom: 4 }, prompt: 'What did the weak edge ask that your strong edges never do?' },
      { type: 'social', objective: 'Return the light without leaving the species.', explanation: 'If you cannot be ordinary among others, the crown is theater.', task: 'Have a conversation in which you are fully human: no guru, no Gremlin. Listen and speak truly.', durationMinutes: 25, rewards: { xp: 38, cp: 12, ap: 6 }, attributes: { connection: 7, communication: 5, wisdom: 3 }, prompt: 'Could you be wise without being above?' },
      { type: 'practice', objective: 'Choose the next human season.', explanation: 'Completion is not arrival at a static perfection. It is readiness to keep training without mythic inflation.', task: 'Write the next 90 days: one faculty to deepen, one relationship to honor, one contribution, one rest principle.', durationMinutes: 30, rewards: { xp: 42, ap: 8, kp: 4, dp: 6 }, attributes: { perspective: 6, wisdom: 6, discipline: 4 }, prompt: 'What will you train now that there is no “final beast” to chase?' },
      { type: 'reflection', objective: 'Lay down the costume.', explanation: 'You may keep the language. You may not hide in it.', task: 'Write the final page: you are human; these were faculties; the world is the arena; the next step is ordinary and therefore sacred.', durationMinutes: 20, rewards: { xp: 44, ap: 14, sp: 6 }, attributes: { wisdom: 8, awareness: 5 }, prompt: 'If you are not becoming a god, what are you becoming responsible for?' },
    ],
    boss: {
      name: 'Transcendence Trial',
      title: 'The Human Crown',
      description:
        'Live one complete day as integrated practice: attention, a kept commitment, learning or teaching, compassion, stillness, and a written reflection. Then read: the journey was never about becoming something other than human. It was about becoming more fully capable of being one.',
      durationMinutes: 120,
      xp: 150,
      rewards: { xp: 150, mp: 30, ap: 16, dp: 16, sp: 12, cp: 10, kp: 10 },
      attributes: { wisdom: 14, awareness: 10, discipline: 10, connection: 8, emotionalBalance: 8, knowledge: 6, perspective: 8, communication: 6, focus: 6 },
      completionLine: 'THE JOURNEY RETURNS YOU TO THE HUMAN',
    },
  }),
]
