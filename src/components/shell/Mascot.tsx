type MascotMood = 'welcome' | 'excited' | 'thinking'

/**
 * The WriFe mascot — a brain icon with mood states.
 * Per wrife-design-world skill, render at 64–80px alongside content,
 * never floating in a detached speech bubble.
 */
export default function Mascot({ mood = 'welcome', size = 72 }: { mood?: MascotMood; size?: number }) {
  const expression = mood === 'excited' ? '✨' : mood === 'thinking' ? '💭' : '🧠'
  return (
    <div
      role="img"
      aria-label={`WriFe mascot — ${mood}`}
      className="grid place-items-center rounded-full bg-brand-primary/10"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {expression}
    </div>
  )
}
