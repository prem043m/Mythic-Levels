import { makeGate } from '@/data/gateFactory'

export const SAGE_GATES = [
  makeGate({
    id: 'sage-01',
    arcana: 'sage',
    gateNumber: 1,
    name: 'The Veil of Inner Sight',
    archetype: 'Veil',
    symbol: '☁',
    characteristic: 'Intuition',
    weakness: 'Ignoring quiet knowing',
    capability: 'Pattern recognition, reflection, self-awareness',
    principle: 'Not everything important arrives as an answer.',
    relatedAttributes: ['awareness', 'wisdom', 'perspective'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'Inner sight is not prophecy. It is the mind noticing a pattern before it can yet explain it. The Veil trains you to respect quiet data without turning it into superstition.',
    initiation: `YOU HAVE ENTERED:

THE VEIL OF INNER SIGHT

For the next 7 days,
listen for what arrives without a slogan.

Notice hunches.
Test them.
Do not worship them.`,
    philosophy: 'Intuition is compressed experience. It deserves a hearing and a trial, not a throne.',
    outcome: 'You can notice a hunch, write it, and test it against evidence without dismissing or deifying it.',
    titleReward: 'The Watcher',
    achievementId: 'veil-mastered',
    tasks: [
      { objective: 'Notice the quiet signal.', explanation: 'Inner sight is often a bodily yes/no before a paragraph.', task: 'Log three hunches today before outcomes. Note body cue and the story you attached.', durationMinutes: 12, rewards: { xp: 22, ap: 10 }, attributes: { awareness: 6, wisdom: 2 }, prompt: 'Where does a hunch live in you: chest, gut, jaw, mood?' },
      { objective: 'Separate signal from fear.', explanation: 'Anxiety impersonates intuition with volume.', task: 'Take one strong inner message and ask: is this pattern-from-experience, or fear asking for certainty?', durationMinutes: 15, rewards: { xp: 24, ap: 8 }, attributes: { awareness: 5, emotionalBalance: 3 }, prompt: 'What would remain if urgency were removed?' },
      { type: 'practice', objective: 'Reflect without harvesting conclusions.', explanation: 'Some seeing requires not forcing an answer.', task: 'Sit 15 minutes with a question. Write images, memories, and fragments. Do not conclude.', durationMinutes: 15, rewards: { xp: 30, ap: 10, mp: 6 }, attributes: { awareness: 6, wisdom: 3 }, prompt: 'What appeared when you stopped hunting a slogan?' },
      { type: 'practice', objective: 'Test a hunch in the world.', explanation: 'Sage intuition is accountable.', task: 'Choose a small testable hunch. Design a 24-hour test. Record result.', durationMinutes: 20, rewards: { xp: 34, ap: 6, kp: 4, dp: 4 }, attributes: { knowledge: 3, awareness: 4, discipline: 3 }, prompt: 'Did reality refine the hunch or retire it?' },
      { type: 'observation', objective: 'Read patterns in ordinary life.', explanation: 'Inner sight is trained by outer seeing.', task: 'Observe one social or work pattern for a day. Write the repeating structure in five lines.', durationMinutes: 20, rewards: { xp: 30, ap: 8, kp: 4 }, attributes: { perspective: 5, awareness: 4 }, prompt: 'What repeats that everyone treats as unique events?' },
      { type: 'practice', objective: 'Hold a longer reflective sitting.', explanation: 'Depth needs time the noisy mind does not prefer.', task: 'Journal 25 minutes on a living question. End with one experiment, not one identity claim.', durationMinutes: 25, rewards: { xp: 40, ap: 12, mp: 8 }, attributes: { awareness: 7, wisdom: 5 }, prompt: 'What experiment is kinder than a final answer?' },
      { type: 'reflection', objective: 'Write a rule for quiet data.', explanation: 'You need a way to honor hunches without becoming credulous.', task: 'Write: I listen when… I test by… I reject when volume outruns evidence.', durationMinutes: 15, rewards: { xp: 36, ap: 12 }, attributes: { wisdom: 6, awareness: 4 }, prompt: 'How will you remain both receptive and sane?' },
    ],
    boss: { name: 'Veil Trial', title: 'The Tested Hunch', description: 'Name a real hunch, run a practical test, and write what inner sight got right, what fear added, and what you still do not know.', durationMinutes: 40, xp: 90, rewards: { xp: 90, mp: 18, ap: 16, kp: 6 }, attributes: { awareness: 12, wisdom: 8, perspective: 6 }, completionLine: 'VEIL MASTERED' },
  }),
  makeGate({
    id: 'sage-02',
    arcana: 'sage',
    gateNumber: 2,
    name: 'The Cipher of Knowledge',
    archetype: 'Cipher',
    symbol: '⌘',
    characteristic: 'Knowledge',
    weakness: 'Collecting without understanding',
    capability: 'Deep learning, synthesis, critical thinking',
    principle: 'Do not collect knowledge. Decode it.',
    relatedAttributes: ['knowledge', 'perspective', 'wisdom'],
    difficulty: 'standard',
    recommendedMinutes: 30,
    lore: 'A cipher is not a pile of symbols. It is a method for turning marks into meaning. The Sage does not hoard articles. The Sage can explain, question, and use.',
    initiation: `YOU HAVE ENTERED:

THE CIPHER OF KNOWLEDGE

For the next 7 days,
decode rather than collect.

Read slowly.
Question the frame.
Write the idea in your own bones.`,
    philosophy: 'Unread wisdom on a shelf is furniture. Knowledge becomes faculty when it can be used and taught.',
    outcome: 'You can study with notes, explain a concept, and state its limits.',
    titleReward: 'The Scholar',
    achievementId: 'cipher-mastered',
    tasks: [
      { objective: 'Choose one cipher, not a pile.', explanation: 'Breadth without a question is grazing.', task: 'Pick one question worth 7 days. Gather only what serves it. Write why it matters.', durationMinutes: 15, rewards: { xp: 22, kp: 6, ap: 4 }, attributes: { knowledge: 4, perspective: 3 }, prompt: 'What question is alive enough to survive boredom?' },
      { objective: 'Read as a decoder.', explanation: 'The first reading is often hypnotized by agreement.', task: 'Read 20 minutes. For each major claim, write: evidence, assumption, and what would falsify it.', durationMinutes: 25, rewards: { xp: 28, kp: 10, ap: 4 }, attributes: { knowledge: 6, awareness: 3 }, prompt: 'Which assumption was doing the most work?' },
      { type: 'knowledge', objective: 'Take notes that can be reused.', explanation: 'Highlights are not understanding.', task: 'Make notes in three layers: quotes, your words, and one example from your life.', durationMinutes: 30, rewards: { xp: 36, kp: 12, dp: 4 }, attributes: { knowledge: 7, communication: 3 }, prompt: 'Which quote did you keep because it was true, and which because it was pretty?' },
      { type: 'knowledge', objective: 'Explain the idea.', explanation: 'The cipher yields when it can leave your mouth intact.', task: 'Teach the concept in 400 words or a 5-minute spoken explanation. Include a limit of the idea.', durationMinutes: 30, rewards: { xp: 40, kp: 12, cp: 4 }, attributes: { knowledge: 7, communication: 5 }, prompt: 'Where did your explanation become fog?' },
      { type: 'knowledge', objective: 'Cross the idea with another field.', explanation: 'Synthesis is how knowledge becomes perspective.', task: 'Connect today’s idea to a different domain you know. Write three analogies and one false analogy.', durationMinutes: 25, rewards: { xp: 36, kp: 10, ap: 4 }, attributes: { knowledge: 6, perspective: 5 }, prompt: 'What new question appeared at the crossing?' },
      { type: 'practice', objective: 'Use the knowledge.', explanation: 'Unused decoding is still collecting.', task: 'Apply the idea to a real decision or practice block today. Record what changed.', durationMinutes: 35, rewards: { xp: 42, kp: 10, dp: 8 }, attributes: { knowledge: 6, discipline: 4, wisdom: 3 }, prompt: 'Did the idea survive contact with your actual life?' },
      { type: 'reflection', objective: 'Keep a scholar’s ethic.', explanation: 'The Sage’s knowledge is humble enough to remain revisable.', task: 'Write what you now know, what you only believe, and what you will re-read.', durationMinutes: 15, rewards: { xp: 36, ap: 8, kp: 6 }, attributes: { wisdom: 5, knowledge: 4 }, prompt: 'Where are you tempted to sound finished?' },
    ],
    boss: { name: 'Cipher Trial', title: 'The Decoded Idea', description: 'Study a source, write a one-page decoding (claim, evidence, limits, application), and use it in a real decision or explanation to another person.', durationMinutes: 60, xp: 100, rewards: { xp: 100, mp: 20, kp: 20, ap: 8 }, attributes: { knowledge: 12, wisdom: 8, communication: 6 }, completionLine: 'CIPHER MASTERED' },
  }),
  makeGate({
    id: 'sage-03',
    arcana: 'sage',
    gateNumber: 3,
    name: 'The Horizon of Perspectives',
    archetype: 'Horizon',
    symbol: '🌅',
    characteristic: 'Open-mindedness',
    weakness: 'Closed worldview',
    capability: 'Intellectual humility and multiple frames',
    principle: 'A wider horizon creates a larger mind.',
    relatedAttributes: ['perspective', 'knowledge', 'connection'],
    difficulty: 'standard',
    recommendedMinutes: 25,
    lore: 'A horizon is not a belief. It is the reminder that the map ends and the world does not. The Sage enlarges the frame without dissolving into having no frame at all.',
    initiation: `YOU HAVE ENTERED:

THE HORIZON OF PERSPECTIVES

For the next 7 days,
stand where more than one landscape is visible.

Seek a steel-man.
Keep your spine.
Let the world be larger than your team.`,
    philosophy: 'Humility is not self-erasure. It is the knowledge that your view is a view.',
    outcome: 'You can steel-man an opposing view and revise one of your own without collapsing.',
    titleReward: 'The Wanderer',
    achievementId: 'horizon-mastered',
    tasks: [
      { objective: 'Find the edge of your map.', explanation: 'Every mind has a drop-off it pretends is the end of the world.', task: 'Write three beliefs you almost never question. For each, write who benefits if they stay unquestioned.', durationMinutes: 15, rewards: { xp: 22, ap: 8, kp: 2 }, attributes: { awareness: 4, perspective: 4 }, prompt: 'Which belief is doing identity-work rather than truth-work?' },
      { objective: 'Stand in another landscape.', explanation: 'Exposure is not yet understanding.', task: 'Spend 25 minutes with a serious source from a view you do not hold. Take notes in their strongest terms.', durationMinutes: 25, rewards: { xp: 30, kp: 10, ap: 4 }, attributes: { knowledge: 5, perspective: 5 }, prompt: 'What did you notice in yourself besides disagreement?' },
      { type: 'knowledge', objective: 'Build a steel-man.', explanation: 'Caricature is the mind’s cheap wall.', task: 'Write the strongest version of a view you oppose, so its holder would say you were fair.', durationMinutes: 25, rewards: { xp: 36, kp: 10, cp: 4 }, attributes: { perspective: 7, communication: 4 }, prompt: 'What did fairness cost your ego?' },
      { type: 'social', objective: 'Ask to understand, not to trap.', explanation: 'Questions can be lanterns or snares.', task: 'Ask someone three genuine questions about how they see a disputed topic. Do not rebut in the same sitting.', durationMinutes: 20, rewards: { xp: 34, cp: 10, ap: 4 }, attributes: { connection: 5, perspective: 5 }, prompt: 'What became more human when it stopped being a position?' },
      { type: 'practice', objective: 'Revise one inch.', explanation: 'Openness that never updates is a pose.', task: 'Change one operational belief or habit based on new perspective. Write the old frame and the new.', durationMinutes: 20, rewards: { xp: 36, ap: 6, dp: 6, kp: 4 }, attributes: { wisdom: 5, perspective: 5 }, prompt: 'What did you keep, and what actually moved?' },
      { type: 'knowledge', objective: 'Hold two frames at once.', explanation: 'A larger mind can use more than one useful map.', task: 'Take a real problem and analyze it in two frameworks. Write what each reveals and hides.', durationMinutes: 30, rewards: { xp: 42, kp: 12, ap: 4 }, attributes: { knowledge: 6, perspective: 7 }, prompt: 'When would you choose each map?' },
      { type: 'reflection', objective: 'Keep a horizon ethic.', explanation: 'The Sage remains teachable without becoming weather-vane.', task: 'Write: I will update when… I will stand firm when… I will not mock…', durationMinutes: 15, rewards: { xp: 36, ap: 10, kp: 4 }, attributes: { wisdom: 6, perspective: 4 }, prompt: 'What is the difference between conviction and captivity in you?' },
    ],
    boss: { name: 'Horizon Trial', title: 'The Larger Map', description: 'Steel-man a view you resist, converse or read until you can represent it fairly, and write one revision to your own map. Width without self-abandonment.', durationMinutes: 55, xp: 90, rewards: { xp: 90, mp: 18, kp: 12, ap: 10, cp: 8 }, attributes: { perspective: 12, knowledge: 8, connection: 6 }, completionLine: 'HORIZON MASTERED' },
  }),
  makeGate({
    id: 'sage-04',
    arcana: 'sage',
    gateNumber: 4,
    name: 'The Shrine of Stillness',
    archetype: 'Shrine',
    symbol: '🕯',
    characteristic: 'Stillness',
    weakness: 'Noise-dependence',
    capability: 'Silence, meditation, mental calm',
    principle: 'Stillness reveals what noise conceals.',
    relatedAttributes: ['awareness', 'emotionalBalance', 'focus'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'A shrine is a space where hurry is asked to wait outside. Stillness is not emptiness as annihilation. It is the condition in which a human can hear themselves without a feed.',
    initiation: `YOU HAVE ENTERED:

THE SHRINE OF STILLNESS

For the next 7 days,
practice the unfilled minute.

Sit.
Silence a channel.
Let the mind settle enough to see.`,
    philosophy: 'Some truths are not missing. They are drowned. Stillness is how you lower the water.',
    outcome: 'You can sit in silence, take a screenless interval, and return calmer without needing a crisis.',
    titleReward: 'The Still Mind',
    achievementId: 'shrine-mastered',
    tasks: [
      { objective: 'Enter the shrine.', explanation: 'The first minutes are usually protest.', task: 'Sit 10 minutes in silence. Count breaths. Note the first five interruptions without following them.', durationMinutes: 10, rewards: { xp: 22, ap: 8, sp: 2 }, attributes: { awareness: 4, focus: 3 }, prompt: 'What arrived first when stimulation stopped?' },
      { objective: 'See your noise diet.', explanation: 'Stillness is hard when the day is built as a refusal of silence.', task: 'Log every optional sound and screen between waking and noon. Mark which were chosen and which were reflex.', durationMinutes: 15, rewards: { xp: 24, ap: 8 }, attributes: { awareness: 5, discipline: 2 }, prompt: 'Which noise is a pacifier?' },
      { type: 'practice', objective: 'Lengthen the sitting.', explanation: 'Calm is often just the other side of restlessness.', task: 'Sit 20 minutes. When restlessness peaks, stay three more minutes.', durationMinutes: 20, rewards: { xp: 34, ap: 8, sp: 6, mp: 8 }, attributes: { awareness: 5, emotionalBalance: 5, focus: 4 }, prompt: 'What was restlessness asking you to flee?' },
      { type: 'practice', objective: 'Practice a silent interval in life.', explanation: 'A shrine that exists only at dawn will be forgotten by dusk.', task: 'Take 20 minutes screenless in ordinary life: walk, tea, or looking out a window. No podcast as disguise.', durationMinutes: 20, rewards: { xp: 32, ap: 8, sp: 4 }, attributes: { awareness: 5, focus: 3 }, prompt: 'What did silence make obvious?' },
      { type: 'daily', objective: 'Protect a daily shrine.', explanation: 'Stillness becomes faculty through appointment.', task: 'Keep a 15-minute shrine at a planned hour. If missed, keep a 5-minute repair shrine the same day.', durationMinutes: 15, rewards: { xp: 30, dp: 6, sp: 6, ap: 4 }, attributes: { discipline: 5, emotionalBalance: 4 }, prompt: 'What tried to eat the appointment?' },
      { type: 'practice', objective: 'Sit through a weather system.', explanation: 'The Sage’s stillness includes feeling, not a freeze.', task: 'Sit 30 minutes. Allow emotion. Return to breath or sound. After, write one page.', durationMinutes: 30, rewards: { xp: 44, ap: 12, sp: 8, mp: 10 }, attributes: { awareness: 7, emotionalBalance: 6 }, prompt: 'What did noise usually conceal in you?' },
      { type: 'reflection', objective: 'Write a stillness covenant.', explanation: 'You need a relationship to silence that is not emergency-only.', task: 'Write when you will sit, which noises you will no longer use as anesthesia, and why.', durationMinutes: 15, rewards: { xp: 36, ap: 10, sp: 4 }, attributes: { wisdom: 5, awareness: 4 }, prompt: 'What is silence for, in your actual life?' },
    ],
    boss: { name: 'Shrine Trial', title: 'The Unfilled Hour', description: 'Complete 40 minutes of stillness (sit, walk, or mixed) without phone or secondary media. Write what the noise had been covering.', durationMinutes: 45, xp: 90, rewards: { xp: 90, mp: 20, ap: 14, sp: 12 }, attributes: { awareness: 10, emotionalBalance: 10, focus: 8 }, completionLine: 'SHRINE MASTERED' },
  }),
]
