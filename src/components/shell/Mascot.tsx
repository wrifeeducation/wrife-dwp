/**
 * The WriFe mascot — the yellow pencil character with personality.
 *
 * Each pose maps to a specific PNG in /public/mascots. See the mascot_pack
 * folder in /Graphics for the full set.
 *
 *   welcome    - waving pencil (default for sign-in heroes)
 *   celebrate  - jumping with arms up (level-complete)
 *   thinking   - chin in hand (hint / waiting)
 *   reading    - holding paper (level-start, daily prompt)
 *   happy      - smiling face only (secure band)
 *   thumbs_up  - thumbs-up face (correct answer)
 *   worried    - worried face (emerging band)
 *   book       - face inside an open book (story prompts)
 *   badge_mastery / badge_foundation / badge_application / badge_gold —
 *     stamp-style banner mascots for tier finales and milestones
 *   doc_tick   - document with check (daily prompt complete)
 *   clipboard  - clipboard with tick (teacher view)
 *   tiles      - pencil on coloured tiles (activity icon)
 */
export type MascotPose =
  | 'welcome' | 'celebrate' | 'thinking' | 'reading'
  | 'happy' | 'thumbs_up' | 'worried' | 'book'
  | 'badge_mastery' | 'badge_foundation' | 'badge_application' | 'badge_gold'
  | 'doc_tick' | 'clipboard' | 'tiles'

const POSE_TO_FILE: Record<MascotPose, string> = {
  welcome:           '/mascots/mascot_std_15.png',
  celebrate:         '/mascots/mascot_std_13.png',
  thinking:          '/mascots/mascot_std_14.png',
  reading:           '/mascots/mascot_std_16.png',
  happy:             '/mascots/mascot_std_10.png',
  thumbs_up:         '/mascots/mascot_std_12.png',
  worried:           '/mascots/mascot_std_9.png',
  book:              '/mascots/mascot_std_7.png',
  badge_mastery:     '/mascots/mascot_std_1.png',
  badge_foundation:  '/mascots/mascot_std_6.png',
  badge_application: '/mascots/mascot_std_8.png',
  badge_gold:        '/mascots/mascot_std_2.png',
  doc_tick:          '/mascots/mascot_std_3.png',
  clipboard:         '/mascots/mascot_std_4.png',
  tiles:             '/mascots/mascot_std_5.png',
}

interface Props {
  pose?: MascotPose
  size?: number          // px
  className?: string
  /**
   * Backwards-compat with the old `mood` API where
   *   'welcome' → welcome, 'excited' → celebrate, 'thinking' → thinking
   * Existing callsites continue to work without changes.
   */
  mood?: 'welcome' | 'excited' | 'thinking'
}

const MOOD_TO_POSE: Record<NonNullable<Props['mood']>, MascotPose> = {
  welcome: 'welcome', excited: 'celebrate', thinking: 'thinking',
}

export default function Mascot({ pose, mood, size = 80, className = '' }: Props) {
  const finalPose: MascotPose = pose ?? (mood ? MOOD_TO_POSE[mood] : 'welcome')
  return (
    <img
      src={POSE_TO_FILE[finalPose]}
      width={size}
      height={size}
      alt={`WriFe mascot — ${finalPose.replace('_', ' ')}`}
      loading="eager"
      className={`select-none ${className}`}
      style={{ width: size, height: 'auto', maxWidth: '100%' }}
      draggable={false}
    />
  )
}
