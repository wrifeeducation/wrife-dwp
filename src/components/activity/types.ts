import type { DwpLevel } from '@/types/dwp'

export interface ActivityProps {
  level: DwpLevel
  onSubmit: (submission: unknown) => void
  submitting: boolean
}
