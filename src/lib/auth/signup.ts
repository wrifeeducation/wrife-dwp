import { supabase } from '@/lib/supabase'

export type SignupRole = 'parent' | 'independent_teacher'

export interface SignupArgs {
  email: string
  password: string
  displayName: string
  role: SignupRole
}

export interface SignupResult {
  needsEmailConfirmation: boolean
  email: string
}

export class SignupError extends Error {
  constructor(public code: 'already_registered' | 'weak_password' | 'invalid_email' | 'network' | 'unknown', message: string) {
    super(message); this.name = 'SignupError'
  }
}

/**
 * Sign up a new parent or independent teacher via Supabase Auth.
 *
 * The role + display_name are stored on raw_user_meta_data. The DB trigger
 * on auth.users INSERT then auto-creates the matching home_accounts row.
 *
 * Email confirmation is required by default — Supabase sends the email,
 * the user clicks the link, lands at /auth/confirm, which finalises the
 * session and redirects them based on role.
 */
export async function signupHomeAccount(args: SignupArgs): Promise<SignupResult> {
  const redirectTo = `${import.meta.env.VITE_PUBLIC_SITE_URL}/auth/confirm`
  const { data, error } = await supabase.auth.signUp({
    email: args.email.trim().toLowerCase(),
    password: args.password,
    options: {
      data: { role: args.role, display_name: args.displayName.trim() },
      emailRedirectTo: redirectTo,
    },
  })
  if (error) throw mapSupabaseError(error.message)
  // If Supabase has email confirmation enabled, data.user.identities will be empty
  // (per Supabase docs) when the email is already registered. Guard:
  if (data.user && data.user.identities && data.user.identities.length === 0) {
    throw new SignupError('already_registered', 'That email is already registered. Try signing in instead.')
  }
  const needsEmailConfirmation = !data.session
  return { needsEmailConfirmation, email: args.email }
}

function mapSupabaseError(message: string): SignupError {
  const m = message.toLowerCase()
  if (m.includes('already registered') || m.includes('user already exists')) {
    return new SignupError('already_registered', 'That email is already registered. Try signing in instead.')
  }
  if (m.includes('password') && m.includes('short')) {
    return new SignupError('weak_password', 'Password is too short — at least 8 characters please.')
  }
  if (m.includes('email') && m.includes('invalid')) {
    return new SignupError('invalid_email', 'That email address doesn\'t look right.')
  }
  if (m.includes('network') || m.includes('fetch')) {
    return new SignupError('network', 'We couldn\'t reach the server. Check your connection.')
  }
  return new SignupError('unknown', 'Sign-up failed. Please try again in a moment.')
}
