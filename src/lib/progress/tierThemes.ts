export interface TierTheme {
  number: number
  title: string
  subtitle: string
  emoji: string
  bg: string            // tier banner background
  fg: string            // tier banner text colour
  chipBg: string        // skill chip background
  chipFg: string        // skill chip text colour
  skills: string[]      // 3-5 short topic chips
}

export const TIER_THEMES: Record<number, TierTheme> = {
  1: { number: 1, title: 'Word Awareness',     subtitle: 'Sorting and spotting word classes',     emoji: '🔤',
       bg: '#ede9ff', fg: '#3d35a0', chipBg: '#ffffff', chipFg: '#4a40b8',
       skills: ['People', 'Places', 'Things', 'Verbs', 'Logic'] },
  2: { number: 2, title: 'Word Combinations',  subtitle: 'Pairing words into phrases',            emoji: '🧩',
       bg: '#e3f2fd', fg: '#0d3f7a', chipBg: '#ffffff', chipFg: '#1565c0',
       skills: ['Add nouns', 'Add verbs', 'Three-word phrases', 'Adjectives'] },
  3: { number: 3, title: 'Simple Sentences',   subtitle: 'Capitals, full stops, where and when',  emoji: '✍️',
       bg: '#e8f5e9', fg: '#1b5e20', chipBg: '#ffffff', chipFg: '#2e7d32',
       skills: ['Copy', 'Fix', 'Stems', 'Where', 'When'] },
  4: { number: 4, title: 'Sentence Expansion', subtitle: 'And, but, because, when',               emoji: '🌳',
       bg: '#fff3e0', fg: '#b85c00', chipBg: '#ffffff', chipFg: '#e65100',
       skills: ['Adjectives', 'And', 'But', 'Because', 'Formula'] },
  5: { number: 5, title: 'Basic Sequencing',   subtitle: 'First, next, last',                     emoji: '🪜',
       bg: '#ffebee', fg: '#8d2828', chipBg: '#ffffff', chipFg: '#c62828',
       skills: ['First/Next/Last', 'Connected', 'Before & After'] },
  6: { number: 6, title: 'Story Structure',    subtitle: 'Beginning, middle, end',                emoji: '📖',
       bg: '#fce4ec', fg: '#560727', chipBg: '#ffffff', chipFg: '#880e4f',
       skills: ['Beginnings', 'Middles', 'Endings', 'BME plans'] },
  7: { number: 7, title: 'Enhanced Sentences', subtitle: 'When-starter, although-starter, variety', emoji: '💎',
       bg: '#fdf3e8', fg: '#5a3209', chipBg: '#ffffff', chipFg: '#78440f',
       skills: ['When-starter', 'Although-starter', 'Variety'] },
  8: { number: 8, title: 'Narrative Mastery',  subtitle: 'Showcase your finest writing',           emoji: '👑',
       bg: '#fffde7', fg: '#5a5106', chipBg: '#ffffff', chipFg: '#827717',
       skills: ['Detail', 'Story arc', 'Programme finale'] },
}
