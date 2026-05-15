interface Props { state: 'completed' | 'locked' }

/** Vertical line between path nodes. Coloured purple when path is unlocked. */
export default function PathConnector({ state }: Props) {
  return (
    <div
      className="w-1 h-3.5 rounded-sm my-1 mx-auto"
      style={{ background: state === 'completed' ? 'var(--color-brand-primary)' : '#ddd' }}
    />
  )
}
