import { buildDays } from '@/data/dayPath'

export const BEAST_GATES = [
  {
    id: 'beast-01',
    arcana: 'beast',
    gateNumber: 1,
    name: 'The Gremlin of Flickering Thoughts',
    archetype: 'Gremlin',
    symbol: '⚡',
    characteristic: 'Focus',
    weakness: 'Distraction',
    capability: 'Sustained attention and single-tasking',
    principle: 'Can you command your attention?',
    relatedAttributes: ['focus', 'awareness', 'discipline'],
    difficulty: 'gentle',
    recommendedMinutes: 25,
    lore: 'The Gremlin does not hate your work. It loves novelty more than completion. It jumps because jumping has always been rewarded. You will not crush it. You will teach it to sit.',
    initiation: `YOU HAVE ENTERED:

THE GREMLIN OF FLICKERING THOUGHTS

For the next 7 days,
live according to the principle of commanded attention.

Notice when the mind leaps.
Return without contempt.
Choose one thing, then finish the choosing.

Your task is not to pretend you never scatter.
Your task is to discover the ability to stay.`,
    philosophy: 'Attention is not a mood. It is a trainable muscle. Every return from distraction is a repetition.',
    outcome: 'You can hold a chosen task for a sitting and notice interruption without following it.',
    titleReward: 'The Attentive',
    achievementId: 'gremlin-mastered',
    days: buildDays('beast-01', [
      {
        objective: 'Catch the leap as it happens.',
        explanation: 'The Gremlin is fastest at the start of a sitting, when the mind still believes it can graze.',
        task: 'Choose one closed task. For 10 minutes, each time your attention leaves, silently name it “Gremlin” and return. Count the returns.',
        durationMinutes: 10,
        rewards: { xp: 22, ap: 6, dp: 2 },
        attributes: { focus: 3, awareness: 3 },
        prompt: 'What pulled you first, and how quickly did you notice?',
      },
      {
        objective: 'Map your personal triggers.',
        explanation: 'Distraction is not random. It has doors: notifications, unfinished loops, boredom, fear of difficulty.',
        task: 'During one work block, keep a tally of every switch. Note the trigger beside each tally mark. Do not judge. Record.',
        durationMinutes: 20,
        rewards: { xp: 24, ap: 8 },
        attributes: { awareness: 4, focus: 2 },
        prompt: 'Which trigger appeared most often?',
      },
      {
        type: 'practice',
        objective: 'Practice single-tasking on purpose.',
        explanation: 'Command is proven by remaining with one object of attention after the novelty fades.',
        task: 'Silence non-essential notifications. Work on one task for 25 minutes. If you switch, restart the sitting.',
        durationMinutes: 25,
        rewards: { xp: 30, dp: 6, mp: 8 },
        attributes: { focus: 5, discipline: 3 },
        prompt: 'What changed when restarting was the cost of switching?',
      },
      {
        type: 'practice',
        objective: 'Stay when resistance arrives.',
        explanation: 'The Gremlin grows loudest at the edge of difficulty. That edge is the training ground.',
        task: 'Pick the task you have been avoiding. Sit with it for 20 minutes. You may pause, but you may not replace it with a easier task.',
        durationMinutes: 20,
        rewards: { xp: 32, dp: 8, sp: 3 },
        attributes: { discipline: 5, focus: 3 },
        prompt: 'What did resistance feel like in the body?',
      },
      {
        type: 'daily',
        objective: 'Apply focus inside ordinary life.',
        explanation: 'Training that only exists in a special session will not survive a noisy afternoon.',
        task: 'Choose one daily activity (a meal, a walk, a conversation, a chore). Do it without a second screen.',
        durationMinutes: 15,
        rewards: { xp: 28, ap: 5, dp: 4 },
        attributes: { focus: 4, awareness: 3 },
        prompt: 'What did you notice that you usually miss?',
      },
      {
        type: 'practice',
        objective: 'Hold a longer sitting.',
        explanation: 'Length is not vanity. It is proof that attention can be housed for a meaningful stretch of work.',
        task: 'Complete a 40-minute deep-focus sitting on one task. Phone in another room. One tab. One aim.',
        durationMinutes: 40,
        rewards: { xp: 42, dp: 8, mp: 12, sp: 4 },
        attributes: { focus: 7, discipline: 4 },
        prompt: 'Where did the sitting almost break, and what did you do?',
      },
      {
        type: 'reflection',
        objective: 'Tell the truth about your attention.',
        explanation: 'Mastery begins when the story of “I am distracted” becomes a map of specific habits.',
        task: 'Write a reflection covering the week: when the Gremlin won, when you returned, and what rule you will keep.',
        durationMinutes: 15,
        rewards: { xp: 36, ap: 10, sp: 4 },
        attributes: { awareness: 5, wisdom: 2 },
        prompt: 'What rule of attention will you carry into Gate II?',
      },
    ]),
    bossTrial: {
      id: 'beast-01-boss',
      name: 'Gremlin Trial',
      title: 'The Unbroken Sitting',
      description:
        'Complete one deep-focus session without phone, unnecessary tab switching, social media, or unrelated tasks. The Gremlin may speak. You do not follow.',
      durationMinutes: 45,
      xp: 80,
      rewards: { xp: 80, mp: 20, dp: 12, sp: 8, ap: 6 },
      attributes: { focus: 10, discipline: 8, awareness: 6 },
      completionLine: 'GREMLIN MASTERED',
    },
  },
  {
    id: 'beast-02',
    arcana: 'beast',
    gateNumber: 2,
    name: 'The Troll of Deafened Ears',
    archetype: 'Troll',
    symbol: '👂',
    characteristic: 'Listening',
    weakness: 'Premature reaction',
    capability: 'Understanding before responding',
    principle: 'Understand before you answer.',
    relatedAttributes: ['communication', 'awareness', 'connection'],
    difficulty: 'standard',
    recommendedMinutes: 20,
    lore: 'The Troll listens only for an opening. It collects ammunition, not meaning. It interrupts because silence feels like losing. Listening is not surrender. It is the refusal to be uninformed.',
    initiation: `YOU HAVE ENTERED:

THE TROLL OF DEAFENED EARS

For the next 7 days,
live according to the principle of the listener.

Hear the sentence to its end.
Notice the urge to leap.
Ask one more question than you need.

Your task is not to become quiet forever.
Your task is to understand before you answer.`,
    philosophy: 'Most misunderstanding is not a lack of intelligence. It is a refusal to remain with another person’s words.',
    outcome: 'You can complete conversations with fewer interruptions and more accurate restatements.',
    titleReward: 'The Listener',
    achievementId: 'troll-mastered',
    days: buildDays('beast-02', [
      {
        objective: 'Notice the urge to interrupt.',
        explanation: 'The Troll announces itself as heat in the chest and a sentence forming too early.',
        task: 'In one conversation, count every impulse to interrupt. Speak only after a full breath at the end of their sentence.',
        durationMinutes: 15,
        type: 'observation',
        rewards: { xp: 22, ap: 6, cp: 4 },
        attributes: { communication: 3, awareness: 3 },
        prompt: 'How many times did the Troll try to speak for you?',
      },
      {
        objective: 'Listen for content, not ammunition.',
        explanation: 'If you are building a reply, you are no longer receiving.',
        task: 'After one conversation, write what they actually said in five lines. No rebuttals. No autobiography.',
        durationMinutes: 20,
        rewards: { xp: 24, ap: 8, cp: 4 },
        attributes: { communication: 4, awareness: 3 },
        prompt: 'What did you almost miss because you were preparing to reply?',
      },
      {
        type: 'social',
        objective: 'Practice restating before answering.',
        explanation: 'Comprehension is proven when the other person recognizes their own meaning in your words.',
        task: 'In a real conversation, paraphrase their point once before giving yours. Ask: “Did I get that right?”',
        durationMinutes: 20,
        rewards: { xp: 30, cp: 10, ap: 4 },
        attributes: { communication: 6, connection: 4 },
        prompt: 'How did the conversation change after the paraphrase?',
      },
      {
        type: 'social',
        objective: 'Stay with disagreement without reacting.',
        explanation: 'The Troll is strongest when you feel misread or opposed.',
        task: 'When you disagree today, ask two clarifying questions before stating your position.',
        durationMinutes: 20,
        rewards: { xp: 32, cp: 8, dp: 4, sp: 3 },
        attributes: { communication: 5, emotionalBalance: 4 },
        prompt: 'What did the extra questions reveal?',
      },
      {
        type: 'social',
        objective: 'Listen in a low-stakes setting.',
        explanation: 'Skill that only appears in conflict is incomplete.',
        task: 'Give someone 10 uninterrupted minutes. No advice unless they ask. Only attention and short acknowledgements.',
        durationMinutes: 15,
        rewards: { xp: 28, cp: 10, ap: 4 },
        attributes: { connection: 5, communication: 4 },
        prompt: 'What was difficult about not fixing or advising?',
      },
      {
        type: 'social',
        objective: 'Hold a full listening practice.',
        explanation: 'A longer sitting with another person reveals habits a short exchange can hide.',
        task: 'Have a 25-minute conversation where your primary job is understanding. Take notes afterward, not during.',
        durationMinutes: 25,
        rewards: { xp: 40, cp: 12, ap: 6 },
        attributes: { communication: 7, connection: 5 },
        prompt: 'What did they need that was not a solution?',
      },
      {
        type: 'reflection',
        objective: 'Examine your listening identity.',
        explanation: 'You cannot hear others clearly if you are still performing for them.',
        task: 'Write where you listen to win, where you listen to belong, and where you listen to understand.',
        durationMinutes: 15,
        rewards: { xp: 36, ap: 10, cp: 4 },
        attributes: { awareness: 5, communication: 3 },
        prompt: 'Which of those three listening modes is most habitual?',
      },
    ]),
    bossTrial: {
      id: 'beast-02-boss',
      name: 'Troll Trial',
      title: 'The Unbroken Hearing',
      description:
        'Hold one important conversation in which you do not interrupt, you restate their meaning once, and you wait until they confirm you understood before offering your view.',
      durationMinutes: 30,
      xp: 80,
      rewards: { xp: 80, mp: 18, cp: 16, ap: 8 },
      attributes: { communication: 10, connection: 8, awareness: 6 },
      completionLine: 'TROLL MASTERED',
    },
  },
  {
    id: 'beast-03',
    arcana: 'beast',
    gateNumber: 3,
    name: 'The Goblin of Restless Desire',
    archetype: 'Goblin',
    symbol: '🪙',
    characteristic: 'Impulse control',
    weakness: 'Instant gratification',
    capability: 'Delayed gratification and persistence',
    principle: 'Wanting is not a command.',
    relatedAttributes: ['discipline', 'focus', 'emotionalBalance'],
    difficulty: 'standard',
    recommendedMinutes: 25,
    lore: 'The Goblin is not evil. It is hungry. It will trade a future you cannot yet feel for a pleasure you can have now. Training begins when you let the craving exist without letting it steer.',
    initiation: `YOU HAVE ENTERED:

THE GOBLIN OF RESTLESS DESIRE

For the next 7 days,
live according to the principle of delayed reward.

Feel the craving fully.
Do not obey it immediately.
Keep one promise that is not fun.

Your task is not to become joyless.
Your task is to stop confusing appetite with direction.`,
    philosophy: 'Impulse is information. It is not instruction. The pause between them is where a human appears.',
    outcome: 'You can delay a craving, finish a difficult block of work first, and keep a small deferred reward.',
    titleReward: 'The Disciplined',
    achievementId: 'goblin-mastered',
    days: buildDays('beast-03', [
      {
        objective: 'Name the craving without acting.',
        explanation: 'Unnamed desire feels like necessity. Named desire becomes a choice.',
        task: 'When a craving appears, wait 3 minutes. Write: what I want, what it costs, what I will do instead for now.',
        durationMinutes: 10,
        rewards: { xp: 22, ap: 8, dp: 2 },
        attributes: { awareness: 4, discipline: 2 },
        prompt: 'What did the pause do to the craving’s urgency?',
      },
      {
        objective: 'See the swap the Goblin offers.',
        explanation: 'Every instant reward is a trade. Most trades are silent.',
        task: 'List three recent “just for a minute” choices. Write the work, rest, or relationship they displaced.',
        durationMinutes: 20,
        rewards: { xp: 24, ap: 8 },
        attributes: { awareness: 4, perspective: 3 },
        prompt: 'Which swap do you regret most, and why?',
      },
      {
        type: 'practice',
        objective: 'Do the hard thing first.',
        explanation: 'The Goblin loses power when difficulty is scheduled before entertainment.',
        task: 'Complete your most important task before any optional digital pleasure today.',
        durationMinutes: 30,
        rewards: { xp: 32, dp: 8, mp: 8 },
        attributes: { discipline: 6, focus: 3 },
        prompt: 'How did the rest of the day feel after the hard thing was done?',
      },
      {
        type: 'practice',
        objective: 'Refuse a known bait.',
        explanation: 'Training requires a specific no, not a vague hope to be better.',
        task: 'Choose one habitual bait (a feed, a snack pattern, a shopping tab). Refuse it for one defined window of 2 hours.',
        durationMinutes: 25,
        rewards: { xp: 34, dp: 8, sp: 4 },
        attributes: { discipline: 6, emotionalBalance: 3 },
        prompt: 'What story did the Goblin tell to reopen the door?',
      },
      {
        type: 'daily',
        objective: 'Install a delayed reward.',
        explanation: 'Suppression without a later yes becomes brittle.',
        task: 'Finish a planned work block, then take a chosen reward you postponed on purpose. The reward must follow the work.',
        durationMinutes: 30,
        rewards: { xp: 30, dp: 6, sp: 3 },
        attributes: { discipline: 5, perspective: 3 },
        prompt: 'Did the reward feel different because it was earned rather than stolen?',
      },
      {
        type: 'practice',
        objective: 'Persist past the first quit-point.',
        explanation: 'The Goblin often quits not from exhaustion, but from the first dip in stimulation.',
        task: 'Work 35 minutes on a long-term goal. When you want to stop at minute 12–18, stay until the timer ends.',
        durationMinutes: 35,
        rewards: { xp: 42, dp: 10, mp: 10, sp: 4 },
        attributes: { discipline: 7, focus: 4 },
        prompt: 'What was the quit-point, and what happened after you stayed?',
      },
      {
        type: 'reflection',
        objective: 'Rewrite your reward rules.',
        explanation: 'A life without designed rewards will invent chaotic ones.',
        task: 'Write two rules: when pleasure is allowed, and which future you will no longer trade cheaply.',
        durationMinutes: 15,
        rewards: { xp: 36, ap: 10, dp: 4 },
        attributes: { wisdom: 4, discipline: 3 },
        prompt: 'What is one craving you can respect without obeying?',
      },
    ]),
    bossTrial: {
      id: 'beast-03-boss',
      name: 'Goblin Trial',
      title: 'The Deferred Feast',
      description:
        'Complete a meaningful block of difficult work first. Only then take a planned reward. During the work, do not sample the reward “just to check.”',
      durationMinutes: 50,
      xp: 80,
      rewards: { xp: 80, mp: 20, dp: 16, sp: 8 },
      attributes: { discipline: 10, focus: 7, emotionalBalance: 6 },
      completionLine: 'GOBLIN MASTERED',
    },
  },
]
