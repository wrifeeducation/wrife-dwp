import type { Config } from 'tailwindcss'

/**
 * WriFe World design tokens — see /var/folders/.../skills/wrife-design-world
 *
 * Pupil-facing UI uses:
 *   - brand.primary purple #6C5CE7 (level banners, completed nodes, primary chips)
 *   - brand.secondary orange #F5A623 (CTAs, current node, "Start!" callouts)
 *   - mode.paragraph teal #00b894 (correct feedback panel; 365-day Daily Prompt banner)
 *   - mode.developing #F5A623 (Developing feedback band — same as CTA orange)
 *   - mode.emerging pale orange (Emerging band — gentle, never red)
 *
 * Word-class colour table is duplicated in src/styles/word-classes.ts for runtime use.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#6C5CE7',
          'primary-dark': '#3d35a0', // border-bottom shadow on purple CTAs
          secondary: '#F5A623',
          'secondary-dark': '#c47a0a', // border-bottom shadow on orange CTAs
        },
        mode: {
          correct: '#00b894',
          'correct-dark': '#007d67',
          paragraph: '#00b894', // 365-day prompt banner
          developing: '#F5A623',
          emerging: '#ffd9b8', // pale orange — never red
        },
        surface: {
          pupil: '#ffffff',
          'path-bg': '#f5f3ff', // pale purple behind level path
          'practice-bg': '#f8f6ff', // very pale purple in step screens
          'prompt-chip': '#fff8e8', // subject prompt chip background
          // cream #FDF8EE deliberately omitted — never used on pupil screens
        },
        // Word-class colour system (tile bg / border-bottom / text)
        wc: {
          determiner: { bg: '#ede9ff', border: '#b0a8f0', text: '#4a40b8' },
          noun:       { bg: '#e3f2fd', border: '#90caf9', text: '#1565c0' },
          verb:       { bg: '#ffebee', border: '#ef9a9a', text: '#c62828' },
          adjective:  { bg: '#e8f5e9', border: '#81c784', text: '#2e7d32' },
          adverb:     { bg: '#fff3e0', border: '#ffcc80', text: '#e65100' },
          preposition:{ bg: '#fdf3e8', border: '#d4a057', text: '#78440f' },
          pronoun:    { bg: '#fce4ec', border: '#f48fb1', text: '#880e4f' },
          conjunction:{ bg: '#fffde7', border: '#fff176', text: '#827717' },
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        // Fluid type tokens — per wrife-responsive skill
        'pwp-xs':   ['clamp(0.75rem, 0.7rem + 0.2vw, 0.85rem)',  { lineHeight: '1.3' }],
        'pwp-sm':   ['clamp(0.85rem, 0.8rem + 0.25vw, 0.95rem)', { lineHeight: '1.4' }],
        'pwp-base': ['clamp(1rem, 0.95rem + 0.25vw, 1.125rem)',  { lineHeight: '1.5' }],
        'pwp-md':   ['clamp(1.125rem, 1.05rem + 0.4vw, 1.25rem)',{ lineHeight: '1.4' }],
        'pwp-lg':   ['clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)',  { lineHeight: '1.3' }],
        'pwp-xl':   ['clamp(1.5rem, 1.3rem + 1vw, 1.75rem)',     { lineHeight: '1.2' }],
        'pwp-2xl':  ['clamp(1.75rem, 1.5rem + 1.25vw, 2.25rem)', { lineHeight: '1.15' }],
      },
      minHeight: {
        'pwp-touch-min': '44px',
        'pwp-touch':     '52px',
        'pwp-touch-xl':  '60px',
      },
      borderRadius: {
        'pwp-cta':   '14px',
        'pwp-banner':'16px',
        'pwp-tile':  '10px',
        'pwp-pill':  '20px',
      },
      boxShadow: {
        // Chunky bottom-border pattern — applied via border-bottom on buttons,
        // shadow here is for cards and nodes
        'pwp-node':   '0 4px 0 0 var(--tw-shadow-color)',
        'pwp-card':   '0 2px 8px rgba(108, 92, 231, 0.08)',
      },
      keyframes: {
        'slide-up': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'plant-bloom': {
          '0%':   { transform: 'scale(0.6) rotate(-8deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.1) rotate(2deg)',  opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)',    opacity: '1' },
        },
      },
      animation: {
        'slide-up':   'slide-up 0.28s ease-out',
        'plant-bloom':'plant-bloom 0.6s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config
