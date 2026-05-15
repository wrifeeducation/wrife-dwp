interface Props {
  classCode: string
  username: string
  pin: string
  pupilName: string
  onDismiss: () => void
}

/**
 * Displayed ONCE after a new pupil is created. Parent/teacher must save
 * these credentials — the PIN is never shown again (only re-set via the
 * reset-pin flow).
 */
export default function CredentialsCard({ classCode, username, pin, pupilName, onDismiss }: Props) {
  return (
    <div className="bg-mode-correct/10 border-2 border-mode-correct rounded-pwp-banner p-5 mb-5">
      <p className="text-pwp-xs font-extrabold text-mode-correct-dark uppercase tracking-wide mb-2">
        ✓ {pupilName} is ready to start writing
      </p>
      <p className="text-pwp-sm text-neutral-700 mb-3">
        Share these details with your child. <strong>Save them somewhere safe — the PIN won't be shown again.</strong>
      </p>
      <dl className="grid grid-cols-3 gap-2 mb-3">
        <Pair label="Class code" value={classCode} mono />
        <Pair label="Username" value={username} mono />
        <Pair label="PIN" value={pin} mono large />
      </dl>
      <button onClick={onDismiss} className="text-pwp-xs font-bold text-mode-correct-dark hover:underline">
        I've saved them, dismiss →
      </button>
    </div>
  )
}

function Pair({ label, value, mono, large }: { label: string; value: string; mono?: boolean; large?: boolean }) {
  return (
    <div className="bg-white rounded-pwp-tile p-2 text-center">
      <dt className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-wide mb-1">{label}</dt>
      <dd className={`${mono ? 'font-mono tracking-wider' : ''} font-extrabold text-neutral-900 ${large ? 'text-pwp-lg' : 'text-pwp-base'}`}>{value}</dd>
    </div>
  )
}
