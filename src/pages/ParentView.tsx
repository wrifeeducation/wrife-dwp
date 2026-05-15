import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import BackToWriFe from '@/components/shell/BackToWriFe'
import AddPupilForm from '@/components/dashboard/AddPupilForm'
import CredentialsCard from '@/components/dashboard/CredentialsCard'
import { useHomeAccount } from '@/hooks/useHomeAccount'

interface ChildRow {
  id: string; username: string; display_name: string; year_group: string | null
  class_code: string | null
}

export default function ParentView() {
  const { account, loading: accountLoading } = useHomeAccount()
  const [children, setChildren] = useState<ChildRow[]>([])
  const [classCode, setClassCode] = useState<string | null>(null)
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [newCreds, setNewCreds] = useState<{ credentials: { class_code: string; username: string; pin: string }, pupilName: string } | null>(null)

  useEffect(() => {
    if (!account) return
    let cancelled = false
    async function load() {
      if (!account) return
      const { data } = await supabase
        .from('pupils')
        .select('id, username, display_name, year_group, class:classes!inner(class_code, account_type)')
        .eq('class.account_type', 'home')
      if (cancelled) return
      const raw = (data ?? []) as any[]
      // Supabase returns joined `class` as an array OR an object depending on cardinality
      const rows: ChildRow[] = raw.map((r) => ({
        id: r.id, username: r.username, display_name: r.display_name, year_group: r.year_group,
        class_code: Array.isArray(r.class) ? (r.class[0]?.class_code ?? null) : (r.class?.class_code ?? null),
      }))
      setChildren(rows)
      // Pick the home class code (all children share one for parents)
        const first = rows.find((r) => r.class_code)
      setClassCode(first?.class_code ?? null)
      setLoadingChildren(false)
    }
    load()
    return () => { cancelled = true }
  }, [account, newCreds])

  if (accountLoading) return <Shell><p className="text-pwp-base text-neutral-500">Loading…</p></Shell>
  if (!account) return <NotSignedIn />

  return (
    <main className="min-h-screen bg-surface-pupil pb-12">
      <header className="bg-brand-primary text-white px-5 py-4 rounded-b-pwp-banner">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-pwp-xs opacity-75 font-bold uppercase tracking-wide">Parent dashboard</p>
            <h1 className="text-pwp-lg font-extrabold">Hi {account.display_name.split(' ')[0]}!</h1>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => location.assign('/'))} className="text-pwp-xs font-bold opacity-80 hover:opacity-100 underline">
            Sign out
          </button>
        </div>
      </header>

      <section className="max-w-2xl mx-auto px-5 py-6">
        {newCreds && (
          <CredentialsCard
            classCode={newCreds.credentials.class_code}
            username={newCreds.credentials.username}
            pin={newCreds.credentials.pin}
            pupilName={newCreds.pupilName}
            onDismiss={() => setNewCreds(null)}
          />
        )}

        <div className="bg-white rounded-pwp-banner border-2 border-brand-primary/15 p-5 mb-5">
          <p className="text-pwp-md font-extrabold text-brand-primary mb-2">Your children</p>
          {loadingChildren ? (
            <p className="text-pwp-sm text-neutral-500">Loading…</p>
          ) : children.length === 0 ? (
            <p className="text-pwp-sm text-neutral-600">No children yet. Add one below to get started.</p>
          ) : (
            <ul className="space-y-2">
              {children.map((c) => (
                <li key={c.id} className="flex items-center justify-between bg-surface-practice-bg rounded-pwp-tile px-3 py-2">
                  <div>
                    <p className="text-pwp-base font-extrabold text-neutral-900">{c.display_name}</p>
                    <p className="text-pwp-xs text-neutral-500 font-mono">{c.username} · class {c.class_code ?? classCode ?? '—'} {c.year_group ? `· ${c.year_group}` : ''}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AddPupilForm context="parent" onCreated={(r) => setNewCreds(r)} />

        <p className="text-pwp-xs text-neutral-500 text-center">
          <Link to="/" className="hover:underline text-brand-primary font-bold">View as my child →</Link>
        </p>
      </section>
      <BackToWriFe />
    </main>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return <main className="min-h-screen bg-surface-pupil grid place-items-center p-6">{children}</main>
}
function NotSignedIn() {
  return (
    <Shell>
      <div className="text-center max-w-md">
        <p className="text-pwp-base text-neutral-700 mb-4">You're not signed in.</p>
        <Link to="/account/login" className="btn-wrife-cta btn-wrife-cta--primary inline-block">Sign in →</Link>
      </div>
    </Shell>
  )
}
