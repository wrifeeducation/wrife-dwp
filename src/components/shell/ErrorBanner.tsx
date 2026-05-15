interface Props { message: string | null }

export default function ErrorBanner({ message }: Props) {
  if (!message) return null
  return (
    <div
      role="alert"
      className="p-3 rounded-pwp-tile bg-red-50 border-2 border-red-300 text-pwp-sm text-red-800 mb-3"
    >
      {message}
    </div>
  )
}
