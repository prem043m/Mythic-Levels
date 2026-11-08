import { makeGate } from '@/data/gateFactory'

export const HUMAN_GATES = [
  makeGate({
    id: 'human-01',
    arcana: 'human',
    gateNumber: 1,
    name: 'The Lantern of Awareness',
    archetype: 'Lantern',
    symbol: '🪔',
    characteristic: 'Awareness',
    weakness: 'Unconscious reaction',
    capability: 'Presence and conscious attention',
    principle: 'See before you act.',
    relatedAttributes: ['awareness', 'focus', 'wisdom'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'A lantern does not invent the path. It reveals what was already underfoot. Most error begins not in malice, but in acting before seeing.',
    initiation: `YOU HAVE ENTERED:

THE LANTERN OF AWARENESS

For the next 7 days,
live according to the principle of the Lantern.

Observe.
Focus.
Notice.
Act deliberately.

Your task is not to pretend to be the Lantern.
Your task is to discover the ability the Lantern represents within yourself.`,
    philosophy: 'Awareness is the first human technology. Without it, every other virtue is luck.',
    outcome: 'You pause before key actions and can describe your inner state with more accuracy.',
    titleReward: 'The Watcher',
    achievementId: 'lantern-mastered',
    tasks: [
      { objective: 'Light the first inch.', explanation: 'Presence begins as a pause, not a personality transplant.', task: 'Before three ordinary actions, stop for one breath and name: what I am about to do, and why.', durationMinutes: 10, rewards: { xp: 22, ap: 8 }, attributes: { awareness: 5, focus: 2 }, prompt: 'What did the pause prevent?' },
      { objective: 'Watch the automatic self.', explanation: 'The Human Arcana starts by seeing habits that once belonged to the Beast.', task: 'For one hour, note automatic reaches: phone, speech, snack, agreement. No fixing yet. Only seeing.', durationMinutes: 20, rewards: { xp: 24, ap: 10 }, attributes: { awareness: 6 }, prompt: 'Which automatic reach was most frequent?' },
      { type: 'practice', objective: 'Practice a seeing sitting.', explanation: 'Attention can be placed on experience itself.', task: 'Sit 15 minutes. Track breath or ambient sound. When lost, return and mark a tally.', durationMinutes: 15, rewards: { xp: 30, ap: 8, mp: 8 }, attributes: { awareness: 6, focus: 4 }, prompt: 'How many returns did the sitting ask of you?' },
      { type: 'practice', objective: 'See in motion.', explanation: 'A lantern that only works on a cushion is incomplete.', task: 'Take a 20-minute walk without headphones. Name five things seen, five heard, and two inner states.', durationMinutes: 20, rewards: { xp: 32, ap: 8, sp: 3 }, attributes: { awareness: 6, focus: 3 }, prompt: 'What was present that your usual pace would have erased?' },
      { type: 'daily', objective: 'Insert seeing into work.', explanation: 'Conscious work begins with a named intention.', task: 'Before your main task, write one sentence of intention. After, write one sentence of what actually happened.', durationMinutes: 20, rewards: { xp: 30, ap: 6, dp: 4 }, attributes: { awareness: 5, discipline: 3 }, prompt: 'Where did intention and reality diverge?' },
      { type: 'practice', objective: 'Hold a longer lantern.', explanation: 'Stability of seeing is trained by duration.', task: 'Complete 30 minutes of undistracted presence with one chosen object of attention.', durationMinutes: 30, rewards: { xp: 42, ap: 10, mp: 10, dp: 4 }, attributes: { awareness: 7, focus: 5 }, prompt: 'What quality of mind appeared after the first restlessness?' },
      { type: 'reflection', objective: 'Describe your seeing.', explanation: 'Awareness becomes wisdom when it can be told honestly.', task: 'Write how you acted before seeing this week, and one rule for looking first.', durationMinutes: 15, rewards: { xp: 36, ap: 12 }, attributes: { awareness: 6, wisdom: 3 }, prompt: 'What do you now notice that used to be invisible?' },
    ],
    boss: { name: 'Lantern Trial', title: 'See Before You Act', description: 'Choose an important action. Observe your state for 5 minutes, write what you see, then act. Afterward, record whether seeing changed the action.', durationMinutes: 40, xp: 90, rewards: { xp: 90, mp: 20, ap: 16, sp: 6 }, attributes: { awareness: 12, focus: 8, wisdom: 6 }, completionLine: 'LANTERN MASTERED' },
  }),
  makeGate({
    id: 'human-02',
    arcana: 'human',
    gateNumber: 2,
    name: 'The Mirror of Listening',
    archetype: 'Mirror',
    symbol: '◐',
    characteristic: 'Empathy',
    weakness: 'Hearing to reply',
    capability: 'Active listening and accurate comprehension',
    principle: 'Understand before you answer.',
    relatedAttributes: ['communication', 'connection', 'awareness'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'A mirror does not argue with the face before it. It receives. Human listening is that receiving, then the courage to show the other person what you heard.',
    initiation: `YOU HAVE ENTERED:

THE MIRROR OF LISTENING

For the next 7 days,
live as one who understands before answering.

Receive fully.
Reflect accurately.
Let the other person recognize themselves in your words.`,
    philosophy: 'Empathy is not agreement. It is the refusal to distort another person in order to stay comfortable.',
    outcome: 'You can reflect another person’s meaning in a way they recognize.',
    titleReward: 'The Listener',
    achievementId: 'mirror-mastered',
    tasks: [
      { objective: 'Become a clean surface.', explanation: 'Noise in you becomes distortion in them.', task: 'Before a conversation, write down your agenda. Intentionally set it aside for the first five minutes.', durationMinutes: 10, rewards: { xp: 22, ap: 6, cp: 4 }, attributes: { awareness: 3, communication: 3 }, prompt: 'What agenda tried to return first?' },
      { objective: 'Listen for the world behind the words.', explanation: 'People often say the safe sentence, not the true one.', task: 'In one conversation, note facts, feelings, and possible need. Confirm one of them.', durationMinutes: 20, rewards: { xp: 24, cp: 8, ap: 4 }, attributes: { communication: 4, connection: 4 }, prompt: 'Which layer had you been skipping: fact, feeling, or need?' },
      { type: 'social', objective: 'Reflect without adding.', explanation: 'The mirror fails when it becomes a painter.', task: 'Paraphrase someone twice today without adding advice, autobiography, or correction.', durationMinutes: 15, rewards: { xp: 30, cp: 10 }, attributes: { communication: 6, connection: 4 }, prompt: 'How did they respond to being accurately received?' },
      { type: 'social', objective: 'Stay when it is inconvenient.', explanation: 'Patience is listening after you already understand enough to be bored or threatened.', task: 'Let someone finish, including the extra loop. Ask one question that serves their meaning, not your curiosity theater.', durationMinutes: 20, rewards: { xp: 32, cp: 8, sp: 3 }, attributes: { communication: 5, emotionalBalance: 3 }, prompt: 'What made staying difficult?' },
      { type: 'social', objective: 'Listen across difference.', explanation: 'The Human faculty is proven when the other person is not your mirror already.', task: 'Seek a viewpoint you do not share. Understand it well enough to explain it without mockery.', durationMinutes: 25, rewards: { xp: 34, cp: 10, kp: 4 }, attributes: { communication: 5, perspective: 5 }, prompt: 'What remained of the person after you stopped reducing them?' },
      { type: 'social', objective: 'Hold a dedicated listening practice.', explanation: 'Duration reveals whether empathy is a technique or a stance.', task: 'Give 25 minutes of primary listening. Notes afterward only.', durationMinutes: 25, rewards: { xp: 40, cp: 12, ap: 6 }, attributes: { connection: 7, communication: 6 }, prompt: 'What did they need besides being fixed?' },
      { type: 'reflection', objective: 'Become a more faithful mirror.', explanation: 'Your listening identity is visible in who feels safe telling you the truth.', task: 'Write who you interrupt, who you perform for, and who you actually hear.', durationMinutes: 15, rewards: { xp: 36, ap: 10, cp: 4 }, attributes: { awareness: 5, communication: 4 }, prompt: 'Whose voice do you still treat as less real than yours?' },
    ],
    boss: { name: 'Mirror Trial', title: 'The Faithful Reflection', description: 'In a real conversation, reflect the other person’s meaning until they say you understood. Only then share your view. Write both versions.', durationMinutes: 35, xp: 90, rewards: { xp: 90, mp: 18, cp: 16, ap: 8 }, attributes: { communication: 10, connection: 10, awareness: 6 }, completionLine: 'MIRROR MASTERED' },
  }),
  makeGate({
    id: 'human-03',
    arcana: 'human',
    gateNumber: 3,
    name: 'The Compass of Discipline',
    archetype: 'Compass',
    symbol: '🧭',
    characteristic: 'Discipline',
    weakness: 'Inconsistent execution',
    capability: 'Routine, self-control, and kept direction',
    principle: 'Your direction is proven by your actions.',
    relatedAttributes: ['discipline', 'focus', 'perspective'],
    difficulty: 'standard',
    recommendedMinutes: 25,
    lore: 'A compass is useless to a person who will not walk. Discipline is not punishment. It is the alignment of movement with a chosen north.',
    initiation: `YOU HAVE ENTERED:

THE COMPASS OF DISCIPLINE

For the next 7 days,
let action prove direction.

Keep the small heading.
Return when you drift.
Do not wait to feel oriented.`,
    philosophy: 'Motivation is weather. Discipline is navigation. You can walk on an overcast day.',
    outcome: 'You can keep a simple routine across imperfect days.',
    titleReward: 'The Disciplined',
    achievementId: 'compass-mastered',
    tasks: [
      { objective: 'Name your north.', explanation: 'Discipline without a heading is just rigidity.', task: 'Write one north for this season and the daily action that proves it.', durationMinutes: 15, rewards: { xp: 22, dp: 6, ap: 4 }, attributes: { perspective: 4, discipline: 3 }, prompt: 'What action is the compass needle?' },
      { objective: 'See the drift points.', explanation: 'You do not lose direction all at once. You lose it at known hours.', task: 'Track one day by hour. Mark when you were on-heading and when you drifted.', durationMinutes: 15, rewards: { xp: 24, ap: 6, dp: 4 }, attributes: { awareness: 4, discipline: 3 }, prompt: 'Which hour is your Bermuda Triangle?' },
      { type: 'practice', objective: 'Keep a minimum.', explanation: 'A floor beats a fantasy ceiling.', task: 'Define a 15-minute minimum for your north. Complete it today no matter the mood.', durationMinutes: 15, rewards: { xp: 30, dp: 10, sp: 4 }, attributes: { discipline: 7, emotionalBalance: 3 }, prompt: 'Did the minimum restore pride or merely check a box? Be honest.' },
      { type: 'practice', objective: 'Return after drift.', explanation: 'The compass is most human in the correction, not the perfect line.', task: 'When you notice drift, take a 10-minute correction block immediately. No self-speech longer than one sentence.', durationMinutes: 20, rewards: { xp: 32, dp: 8, sp: 6 }, attributes: { discipline: 6, emotionalBalance: 4 }, prompt: 'How fast can you correct without a courtroom in your head?' },
      { type: 'daily', objective: 'Build a repeatable container.', explanation: 'Routines are architecture for a tired future self.', task: 'Create a start ritual of 3 steps and use it to begin today’s main work.', durationMinutes: 25, rewards: { xp: 30, dp: 8, mp: 6 }, attributes: { discipline: 6, focus: 4 }, prompt: 'Which step actually switches you from drift to heading?' },
      { type: 'practice', objective: 'Walk farther on the heading.', explanation: 'Length trains the identity of a person who continues.', task: 'Complete 40 minutes on the north, using the ritual and one planned break.', durationMinutes: 40, rewards: { xp: 42, dp: 12, mp: 10, sp: 4 }, attributes: { discipline: 8, focus: 5 }, prompt: 'What identity showed up in minute 30?' },
      { type: 'reflection', objective: 'Write the navigation rules.', explanation: 'Discipline fails when it depends on a future burst of character.', task: 'Write: my north, my daily floor, my drift hours, my correction.', durationMinutes: 15, rewards: { xp: 36, ap: 8, dp: 6 }, attributes: { wisdom: 4, discipline: 4 }, prompt: 'What rule would last even on a gray Tuesday?' },
    ],
    boss: { name: 'Compass Trial', title: 'The Proven Heading', description: 'Complete your daily floor at the planned time, then an additional block serving the same north. Record start, drift, and correction. Direction is proven, not announced.', durationMinutes: 55, xp: 90, rewards: { xp: 90, mp: 20, dp: 16, sp: 8 }, attributes: { discipline: 12, focus: 8, perspective: 6 }, completionLine: 'COMPASS MASTERED' },
  }),
  makeGate({
    id: 'human-04',
    arcana: 'human',
    gateNumber: 4,
    name: 'The Quill of Expression',
    archetype: 'Quill',
    symbol: '✐',
    characteristic: 'Expression',
    weakness: 'Unformed thought',
    capability: 'Clear writing, speech, and honest articulation',
    principle: 'Give your thoughts a form.',
    relatedAttributes: ['communication', 'knowledge', 'awareness'],
    difficulty: 'standard',
    recommendedMinutes: 25,
    lore: 'Unwritten thought remains weather. The quill does not make you wise by existing. It forces the mind to choose a shape, and a shape can be improved.',
    initiation: `YOU HAVE ENTERED:

THE QUILL OF EXPRESSION

For the next 7 days,
give form to what you think.

Write.
Speak.
Cut the false flourish.
Keep the true sentence.`,
    philosophy: 'Expression is not decoration. It is how inner life becomes usable in the world.',
    outcome: 'You can turn a vague thought into a clear paragraph or spoken statement.',
    titleReward: 'The Weaver',
    achievementId: 'quill-mastered',
    tasks: [
      { objective: 'Empty the unformed.', explanation: 'You cannot edit a fog.', task: 'Free-write 12 minutes on whatever is occupying you. Do not stop the hand.', durationMinutes: 12, rewards: { xp: 22, ap: 6, kp: 2 }, attributes: { awareness: 4, communication: 3 }, prompt: 'What sentence appeared that you did not expect?' },
      { objective: 'Find the true sentence.', explanation: 'Most first drafts hide the point in the fourth paragraph.', task: 'Take yesterday’s fog and extract one sentence that is actually the point.', durationMinutes: 15, rewards: { xp: 24, kp: 4, ap: 4 }, attributes: { communication: 4, knowledge: 3 }, prompt: 'What were you avoiding saying directly?' },
      { type: 'practice', objective: 'Write to be understood.', explanation: 'Clarity is a moral courtesy as well as a skill.', task: 'Write 300–500 words explaining one idea you care about as if to an intelligent stranger.', durationMinutes: 25, rewards: { xp: 32, kp: 8, dp: 4 }, attributes: { communication: 6, knowledge: 4 }, prompt: 'Where did you rely on jargon instead of meaning?' },
      { type: 'practice', objective: 'Speak the form aloud.', explanation: 'The mouth reveals what the page still conceals.', task: 'Read your writing aloud. Mark every stumble. Rewrite those sentences until they can be spoken.', durationMinutes: 20, rewards: { xp: 32, cp: 6, kp: 4 }, attributes: { communication: 6, awareness: 3 }, prompt: 'Which sentence was written to impress rather than to say?' },
      { type: 'social', objective: 'Offer a formed thought to someone.', explanation: 'Expression completes when another mind can hold it.', task: 'Share a clear idea, request, or story with a real person. Ask what they understood.', durationMinutes: 20, rewards: { xp: 34, cp: 10, kp: 4 }, attributes: { communication: 7, connection: 4 }, prompt: 'What did they hear that you did not intend?' },
      { type: 'knowledge', objective: 'Explain to learn.', explanation: 'Teaching a concept is how knowledge becomes yours.', task: 'Explain a concept you are learning in writing, including one example and one limit of the idea.', durationMinutes: 30, rewards: { xp: 42, kp: 12, ap: 4 }, attributes: { knowledge: 7, communication: 5 }, prompt: 'What did you understand only while trying to explain it?' },
      { type: 'reflection', objective: 'Choose a voice.', explanation: 'A human voice is a pattern of honesty, not a brand.', task: 'Write the qualities of the speaker you are training to become, and one false voice you are retiring.', durationMinutes: 15, rewards: { xp: 36, ap: 10, kp: 4 }, attributes: { wisdom: 4, communication: 4 }, prompt: 'What would your true voice refuse to perform?' },
    ],
    boss: { name: 'Quill Trial', title: 'The Formed Thought', description: 'Write a one-page piece with a clear point, then speak it to a person or to a recording. Revise one paragraph based on what did not land.', durationMinutes: 50, xp: 90, rewards: { xp: 90, mp: 18, kp: 12, cp: 10 }, attributes: { communication: 12, knowledge: 8, awareness: 6 }, completionLine: 'QUILL MASTERED' },
  }),
  makeGate({
    id: 'human-05',
    arcana: 'human',
    gateNumber: 5,
    name: 'The Scale of Balance',
    archetype: 'Scale',
    symbol: '⚖',
    characteristic: 'Balance',
    weakness: 'Emotional extremes without recovery',
    capability: 'Regulation, composure, and repair',
    principle: 'Feel deeply without becoming ruled by feeling.',
    relatedAttributes: ['emotionalBalance', 'awareness', 'discipline'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'The Scale does not deny weight. It refuses to let one pan own the world. Balance is not a frozen middle. It is the skill of returning.',
    initiation: `YOU HAVE ENTERED:

THE SCALE OF BALANCE

For the next 7 days,
practice return.

Feel what is true.
Do not enthrone it.
Repair when you tilt.`,
    philosophy: 'Composure is not the absence of weather. It is remaining a person while the weather moves through.',
    outcome: 'You can recover from emotional tilt with a known repair practice.',
    titleReward: 'The Still Mind',
    achievementId: 'scale-mastered',
    tasks: [
      { objective: 'Weigh the day honestly.', explanation: 'Balance begins as accurate sensing, not forced calm.', task: 'Morning and evening, rate energy, mood, and tension. Note one cause, not a global story.', durationMinutes: 10, rewards: { xp: 22, ap: 8, sp: 2 }, attributes: { awareness: 4, emotionalBalance: 3 }, prompt: 'What actually moved the scale today?' },
      { objective: 'Spot the tilt early.', explanation: 'Late awareness turns a tilt into an identity.', task: 'Choose three early signals of overload or spike. When one appears, log it within five minutes.', durationMinutes: 15, rewards: { xp: 24, ap: 8, sp: 3 }, attributes: { awareness: 5, emotionalBalance: 3 }, prompt: 'Which signal is loyal enough to trust?' },
      { type: 'practice', objective: 'Install a repair.', explanation: 'Regulation is a procedure you can run while imperfect.', task: 'Use a 10-minute repair: slow breathing, walk, water, or writing. No rumination masquerading as insight.', durationMinutes: 12, rewards: { xp: 30, sp: 8, ap: 4 }, attributes: { emotionalBalance: 6, discipline: 3 }, prompt: 'Did the repair change the body, the story, or both?' },
      { type: 'practice', objective: 'Stay decent while tilted.', explanation: 'The Human test is conduct under weather, not feelings in a vacuum.', task: 'During irritation or sadness, complete one necessary interaction with care. No dumping, no disappearing.', durationMinutes: 20, rewards: { xp: 34, sp: 6, cp: 6, dp: 4 }, attributes: { emotionalBalance: 6, connection: 4 }, prompt: 'What did care cost you in the moment, and what did it protect?' },
      { type: 'daily', objective: 'Balance effort and recovery.', explanation: 'A scale with only work is not virtue. It is a future collapse.', task: 'Complete a focused block and a planned recovery of equal seriousness. Recovery is not collapse; it is chosen.', durationMinutes: 30, rewards: { xp: 32, sp: 8, dp: 6 }, attributes: { discipline: 4, emotionalBalance: 5 }, prompt: 'Do you treat recovery as earned only by breaking?' },
      { type: 'practice', objective: 'Hold composure in a longer sitting.', explanation: 'Stillness trains the delay between stimulus and self.', task: 'Sit 25 minutes. Allow feeling. Do not chase or exile it. Return to an anchor.', durationMinutes: 25, rewards: { xp: 40, ap: 8, sp: 8, mp: 8 }, attributes: { emotionalBalance: 7, awareness: 5 }, prompt: 'What happens when you stop arguing with a feeling?' },
      { type: 'reflection', objective: 'Write your scale laws.', explanation: 'You need laws for tilt that do not require a perfect mood to start.', task: 'Write early signals, forbidden decisions, and the repair you will run.', durationMinutes: 15, rewards: { xp: 36, ap: 10, sp: 4 }, attributes: { wisdom: 4, emotionalBalance: 5 }, prompt: 'What law would your future tilted self still obey?' },
    ],
    boss: { name: 'Scale Trial', title: 'The Return', description: 'On a day with real friction, run your repair, complete one kept commitment, and write how you returned. Balance is the return, not the absence of tilt.', durationMinutes: 40, xp: 90, rewards: { xp: 90, mp: 18, sp: 16, ap: 10 }, attributes: { emotionalBalance: 12, discipline: 8, awareness: 6 }, completionLine: 'SCALE MASTERED' },
  }),
]
