import { isHubEntry, wrifeHubUrl } from '@/lib/auth/hubEntry'

/**
 * "← WriFe" back button.
 *
 * Rendered ONLY when the pupil entered via Route A (wrife.co.uk hub SSO).
 * sessionStorage flag `entryViaHub` is set on app init in App.tsx via
 * detectHubEntry(). A fresh direct visit (Route B / C / D) never sees this.
 *
 * Per wrife-brand-ecosystem skill — pill style, top-left of the banner.
 */
export default function BackToWriFe() {
  if (!isHubEntry()) return null

  return (
    <a
      href={wrifeHubUrl()}
      className="
        inline-flex items-center gap-1
        px-3 py-1.5 rounded-pwp-pill
        text-pwp-xs font-bold
        text-white/90 bg-white/15
        hover:bg-white/25 transition-colors
      "
      aria-label="Back to WriFe hub"
    >
      <span aria-hidden="true">←</span>
      <span>WriFe</span>
    </a>
  )
}
