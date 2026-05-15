import { Navigate } from 'react-router-dom'
import { useSession } from '@/hooks/useSession'
import LandingPage from './LandingPage'
import Dashboard from './Dashboard'

/**
 * Smart root route. Unauthenticated visitors see the landing page.
 * Authenticated users land where their role expects them.
 */
export default function Home() {
  const { session, role, loading } = useSession()
  if (loading) return null  // Brief blank — Vite hydration is fast enough

  if (!session) return <LandingPage />
  if (role === 'parent') return <Navigate to="/parent" replace />
  if (role === 'independent_teacher') return <Navigate to="/teacher" replace />
  // Pupil (or unknown) → dashboard
  return <Dashboard />
}
