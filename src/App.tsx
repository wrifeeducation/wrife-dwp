import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { detectHubEntry } from '@/lib/auth/hubEntry'
import Dashboard from '@/pages/Dashboard'
import LevelStart from '@/pages/LevelStart'
import StepPractice from '@/pages/StepPractice'
import LevelComplete from '@/pages/LevelComplete'
import DailyPrompt from '@/pages/DailyPrompt'
import Garden from '@/pages/Garden'
import Login from '@/pages/Login'
import HomeSignup from '@/pages/HomeSignup'
import TeacherSignup from '@/pages/TeacherSignup'
import ParentView from '@/pages/ParentView'
import TeacherView from '@/pages/TeacherView'
import NotFound from '@/pages/NotFound'
import AuthConfirm from '@/pages/AuthConfirm'

/**
 * Root component for WriFe Daily Writing Practice.
 *
 * Auth model (per wrife-brand-ecosystem skill):
 *   - Route A: school pupil from wrife.co.uk hub (JWT in URL hash)
 *   - Route B: home learner / indie teacher pupil direct login
 *   - Route C: home learner parent sign-up
 *   - Route D: independent teacher sign-up
 *
 * detectHubEntry() runs once on app init to capture the hash-token and set
 * sessionStorage.entryViaHub so the ← WriFe back button can be shown.
 */
export default function App() {
  useEffect(() => {
    detectHubEntry()
  }, [])

  return (
    <Routes>
      {/* Pupil routes */}
      <Route path="/" element={<Dashboard />} />
      <Route path="/level/:levelId" element={<LevelStart />} />
      <Route path="/level/:levelId/practice" element={<StepPractice />} />
      <Route path="/level/:levelId/complete" element={<LevelComplete />} />
      <Route path="/daily" element={<DailyPrompt />} />
      <Route path="/garden" element={<Garden />} />

      {/* Auth routes — Route B (rejects school pupils), Route C, Route D */}
      <Route path="/login" element={<Login />} />
      <Route path="/home-signup" element={<HomeSignup />} />
      <Route path="/teacher-signup" element={<TeacherSignup />} />

      {/* Adult-facing routes */}
      <Route path="/parent" element={<ParentView />} />
      <Route path="/teacher" element={<TeacherView />} />

      {/* Auth confirmation landing page (email links) */}
      <Route path="/auth/confirm" element={<AuthConfirm />} />

      {/* Fallback */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
