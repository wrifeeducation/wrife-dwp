import BackToWriFe from '@/components/shell/BackToWriFe'

/**
 * Sign in
 *
 * Routes B/C/D entry. School pupils get redirected to wrife.co.uk — Phase 1 auth shell.
 *
 * Placeholder during Phase 1 scaffolding. Real implementation lands in the
 * phase that owns this screen — see WriFe_DWP_Build_Plan_v1.md.
 */
export default function Login() {
  return (
    <main className="min-h-screen bg-surface-pupil">
      <header className="bg-brand-primary text-white p-4 rounded-b-pwp-banner">
        <div className="flex justify-between items-center mb-2">
          <BackToWriFe />
          <span className="text-pwp-xs font-bold opacity-70">DWP scaffold</span>
        </div>
        <h1 className="text-pwp-xl font-extrabold">Sign in</h1>
      </header>
      <section className="p-6">
        <p className="text-pwp-base text-neutral-600">
          Routes B/C/D entry. School pupils get redirected to wrife.co.uk — Phase 1 auth shell.
        </p>
      </section>
    </main>
  )
}
