/**
 * hushSpace v0.0.1 — Clinical CBT & Evidence-Based Psychometric Protocols
 * 
 * Implements structured reflection protocols derived from Cognitive Behavioral Therapy (CBT),
 * Acceptance & Commitment Therapy (ACT), and Mindfulness-Based Stress Reduction (MBSR).
 * 
 * @module lib/cbt/prompts
 */

export const COGNITIVE_DISTORTIONS = [
  { id: 'catastrophizing', name: 'Catastrophizing', desc: 'Assuming the absolute worst outcome will occur.' },
  { id: 'all_or_nothing', name: 'All-or-Nothing Thinking', desc: 'Viewing situations in black-and-white terms (success or total failure).' },
  { id: 'mind_reading', name: 'Mind Reading', desc: 'Assuming you know what others are thinking negatively about you.' },
  { id: 'emotional_reasoning', name: 'Emotional Reasoning', desc: 'Believing that because you feel something strongly, it must be true.' },
  { id: 'overgeneralization', name: 'Overgeneralization', desc: 'Taking a single negative event as a never-ending pattern.' },
  { id: 'fortune_telling', name: 'Fortune Telling', desc: 'Predicting that events will turn out badly without evidence.' },
];

export const CLINICAL_PROTOCOLS = [
  {
    id: 'cbt_thought_record',
    category: 'Cognitive Restructuring',
    title: 'CBT 5-Step Thought Record',
    badge: 'Evidence-Based',
    desc: 'Deconstruct automatic negative thoughts and build balanced, rational reframes.',
    template: `## 🧠 CBT Thought Record

**1. The Trigger / Situation:**
*What happened? Where were you, and what sparked the distress?*
> 

**2. Automatic Thought & Belief:**
*What exact sentence ran through your mind? What are you afraid this means?*
> 

**3. Cognitive Distortion Identified:**
*Is this Catastrophizing, All-or-Nothing, Mind Reading, or Emotional Reasoning?*
> 

**4. Evidence Check:**
- **Facts that support this thought:** 
- **Facts that contradict this thought:** 

**5. Balanced & Compassionate Reframe:**
*What is a fair, realistic perspective you would tell a dear friend in this situation?*
> 
`,
  },
  {
    id: 'somatic_gratitude',
    category: 'Positive Psychology & Somatics',
    title: 'Somatic Gratitude Triad',
    badge: 'Grounding',
    desc: 'Anchor gratitude into bodily sensations to dampen amygdala threat reactivity.',
    template: `## 🌿 Somatic Gratitude Triad

**1. The Micro-Moment:**
*What is one small, ordinary sensory detail that brought you quiet peace today? (e.g. warm tea, cool breeze, quiet room)*
> 

**2. Somatic Awareness:**
*Where do you physically feel the relaxation in your body as you recall this moment? (chest, shoulders, breath)*
> 

**3. Meaning:**
*Why does having this in your life matter to you?*
> 
`,
  },
  {
    id: 'worry_vault',
    category: 'Anxiety Defusal (ACT)',
    title: 'Worry Vault & Circle of Control',
    badge: 'Anxiety Relief',
    desc: 'Separate actionable problems from uncontrollable noise to regain agency.',
    template: `## 🛡️ Worry Vault: Circle of Control

**The Weight on My Mind:**
> 

**1. Outside My Control (I Release These):**
- 
- 

**2. Within My Immediate Agency (I Own These):**
- 
- 

**3. One Micro-Action for the Next Hour:**
> 

*Declaration:* "I accept what I cannot predict, and focus my energy on what I can do right now."
`,
  },
  {
    id: 'evening_decompression',
    category: 'Evening Protocol',
    title: 'Evening Unwind & Self-Forgiveness',
    badge: 'Sleep Prep',
    desc: 'Close open cognitive loops, release self-criticism, and prepare for deep rest.',
    template: `## 🌙 Evening Unwind & Release

**1. One Thing That Drained My Energy Today:**
> 

**2. One Thing That Brought Me Life or Connection:**
> 

**3. What I Forgive Myself for Today:**
*What went unfinished or imperfectly that I release into the night?*
> 

**4. Sleep Intention:**
*Tomorrow is a fresh canvas. Tonight I allow my mind to rest completely.*
`,
  },
  {
    id: 'morning_intention',
    category: 'Morning Protocol',
    title: 'Morning Energy & Boundary Compass',
    badge: 'Focus',
    desc: 'Set conscious psychological boundaries before the world makes demands of you.',
    template: `## ☀️ Morning Intention & Boundary Compass

**1. What energy do I want to bring into today? (e.g. Calm, Patient, Courageous)**
> 

**2. The One Most Meaningful Task for Today:**
> 

**3. A Gentle Boundary I Will Protect:**
*What distraction, person, or habit will I say 'not now' to today?*
> 
`,
  },
  {
    id: 'brain_dump',
    category: 'Expressive Writing',
    title: '5-Minute Unfiltered Brain Dump',
    badge: 'Catharsis',
    desc: 'Continuous non-judgmental expressive unloading to clear mental RAM.',
    template: `## 🌪️ 5-Minute Unfiltered Brain Dump

*Write whatever raw thoughts, fragments, anxieties, or ideas are floating in your head without editing or judging:*

`,
  },
];
