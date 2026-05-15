/**
 * WriFe word-class colour table — central runtime reference matching the
 * Tailwind `wc.*` namespace in tailwind.config.ts.
 *
 * Used by ActivityUI components (word-bank pills, formula tiles) and by the
 * AI assessment feedback layer when displaying flagged words by class.
 */
export type WordClass =
  | 'determiner'
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'pronoun'
  | 'conjunction'

export interface WordClassColours {
  bg: string
  border: string
  text: string
  label: string
}

export const WORD_CLASS_COLOURS: Record<WordClass, WordClassColours> = {
  determiner:  { bg: '#ede9ff', border: '#b0a8f0', text: '#4a40b8', label: 'Determiner' },
  noun:        { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0', label: 'Noun' },
  verb:        { bg: '#ffebee', border: '#ef9a9a', text: '#c62828', label: 'Verb' },
  adjective:   { bg: '#e8f5e9', border: '#81c784', text: '#2e7d32', label: 'Adjective' },
  adverb:      { bg: '#fff3e0', border: '#ffcc80', text: '#e65100', label: 'Adverb' },
  preposition: { bg: '#fdf3e8', border: '#d4a057', text: '#78440f', label: 'Preposition' },
  pronoun:     { bg: '#fce4ec', border: '#f48fb1', text: '#880e4f', label: 'Pronoun' },
  conjunction: { bg: '#fffde7', border: '#fff176', text: '#827717', label: 'Conjunction' },
}
