import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import HomeNav from '@/components/shell/HomeNav'
import AddPupilForm from '@/components/dashboard/AddPupilForm'
import CreateClassForm from '@/components/dashboard/CreateClassForm'
import CredentialsCard from '@/components/dashboard/CredentialsCard'
import { useHomeAccount } from '@/hooks/useHomeAccount'

interface ClassRow { id: string; class_code: string; name: string; year_group: string | null }
interface PupilRow { id: string; username: string; display_name: string; year_group: string | null; class_id: string }

export default function TeacherView() {
  const { account, loading: accountLoading } = useHomeAccount()
  const [classes, setClasses] = useState<ClassRow[]>([])
  const [pupils, setPupils] = useState<PupilRow[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const [newCreds, setNewCreds] = useState<{ credentials: { class_code: string; username: string; pin: string }; pupilName: string } | null>(null)

  useEffect(() => {
    if (!account) return
    let cancelled = false
    async function load() {
      if (!account) return

      // School teachers own classes via teacher_id (= auth.uid() = profiles.id).
      // Independent teachers own classes via home_account_id (= home_accounts.id).
      let query = supabase.from('classes').select('id, class_code, name, year_group')
      if (account.isSchoolAccount) {
        query = query.eq('teacher_id', account.id)
      } else {
        query = query.eq('home_account_id', account.id)
      }
      const { data: cls } = await query.order('name')

      if (cancelled) return
      const list = (cls ?? []) as ClassRow[]
      setClasses(list)
      if (!selectedClassId && list.length > 0) setSelectedClassId(list[0].id)
      if (list.length > 0) {
        const ids = list.map((c) => c.id)
        const { data: pp } = await supabase.from('pupils').select('id, username, display_name, year_group, class_id').in('class_id', ids)
        setPupils((pp ?? []) as PupilRow[])
      } else {
        setPupils([])
      }
    }
    load()
    return () => { cancelled = true }
  }, [account, refreshTick])

  if (accountLoading) return <Shell><p className="text-pwp-base text-neutral-500">Loading…</p></Shell>
  if (!account) return <NotSignedIn />

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null
  const pupilsInSelected = pupils.filter((p) => p.class_id === selectedClassId)

  return (
    <main className="min-h-screen bg-surface-pupil pb-12">
      <header className="bg-brand-primary text-white px-5 py-4 rounded-b-pwp-banner">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <HomeNav />
            <div>
              <p className="text-pwp-xs opacity-75 font-bold uppercase tracking-wide">Teacher dashboard</p>
              <h1 className="text-pwp-lg font-extrabold">Hi {account.display_name.split(' ')[0]}!</h1>
            </div>
          </div>
          <button onClick={() => supabase.auth.signOut().then(() => location.assign('/'))} className="text-pwp-xs font-bold opacity-80 hover:opacity-100 underline">
            Sign out
          </button>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-5 py-6">
        {newCreds && (
          <CredentialsCard
            classCode={newCreds.credentials.class_code}
            username={newCreds.credentials.username}
            pin={newCreds.credentials.pin}
            pupilName={newCreds.pupilName}
            onDismiss={() => setNewCreds(null)}
          />
        )}

        {classes.length === 0 ? (
          <>
            <p className="text-pwp-base text-neutral-700 mb-4">No classes yet. Create your first class to get started.</p>
            <CreateClassForm account={account} onCreated={() => setRefreshTick((t) => t + 1)} />
          </>
        ) : (
          <>
            <div className="bg-white rounded-pwp-banner border-2 border-brand-primary/15 p-5 mb-5">
              <p className="text-pwp-md font-extrabold text-brand-primary mb-3">Your classes</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {classes.map((c) => (
                  <button key={c.id} onClick={() => setSelectedClassId(c.id)}
                    className={`px-3 py-1.5 rounded-pwp-pill text-pwp-sm font-bold transition-colors ${selectedClassId === c.id ? 'bg-brand-primary text-white' : 'bg-surface-practice-bg text-brand-primary'}`}
                    style={selectedClassId === c.id ? { borderBottom: '3px solid #3d35a0' } : {}}>
                    {c.name} {c.year_group ? `· ${c.year_group}` : ''}
                  </button>
                ))}
              </div>
              {selectedClass && (
                <div className="bg-surface-prompt-chip rounded-pwp-tile p-3 mb-3">
                  <p className="text-pwp-xs font-extrabold text-orange-700 uppercase tracking-wide mb-1">Class code</p>
                  <p className="font-mono font-extrabold text-pwp-lg tracking-widest">{selectedClass.class_code}</p>
                  <p className="text-pwp-xs text-neutral-500 mt-1">Share this with your pupils so they can sign in.</p>
                </div>
              )}
              <p className="text-pwp-sm font-extrabold text-neutral-700 mt-3 mb-2">Pupils in this class</p>
              {pupilsInSelected.length === 0 ? (
                <p className="text-pwp-xs text-neutral-500">No pupils yet — add one below.</p>
              ) : (
                <ul className="space-y-1">
                  {pupilsInSelected.map((p) => (
                    <li key={p.id} className="flex items-center justify-between bg-surface-practice-bg rounded-pwp-tile px-3 py-2">
                      <span className="text-pwp-base font-bold text-neutral-900">{p.display_name}</span>
                      <span className="text-pwp-xs text-neutral-500 font-mono">{p.username} {p.year_group ? `· ${p.year_group}` : ''}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {selectedClassId && (
              <AddPupilForm context="teacher" classId={selectedClassId} onCreated={(r) => { setNewCreds(r); setRefreshTick((t) => t + 1) }} />
            )}

            <CreateClassForm account={account} onCreated={() => setRefreshTick((t) => t + 1)} />
          </>
        )}
      </section>
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
