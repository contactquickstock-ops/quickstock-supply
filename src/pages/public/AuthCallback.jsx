import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'

// Use sessionStorage to pass messages through a full-page redirect after signOut.
// React Router's navigate() can be unreliable right after supabase.auth.signOut()
// because the SIGNED_OUT event triggers an app-wide re-render mid-navigation.
function redirectTo(path, key, message) {
  if (message) sessionStorage.setItem(key, message)
  window.location.replace(path)
}

export default function AuthCallback() {
  const navigate = useNavigate()
  const [status, setStatus] = useState('Signing you in…')
  const handled  = useRef(false)

  useEffect(() => {
    // Check for OAuth errors in URL (e.g. user cancelled Google login)
    const params     = new URLSearchParams(window.location.search)
    const hashParams = new URLSearchParams(
      window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
    )
    const errorDesc =
      params.get('error_description') || hashParams.get('error_description')

    if (errorDesc) {
      redirectTo('/login', 'auth_error', decodeURIComponent(errorDesc))
      return
    }

    async function handleSession(session) {
      if (handled.current) return
      handled.current = true

      if (!session?.user) {
        window.location.replace('/login')
        return
      }

      const user = session.user
      setStatus('Loading your account…')

      // ── Look up profile by auth user ID ───────────────────────────────────
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileErr) {
        await supabase.auth.signOut()
        redirectTo('/login', 'auth_error', 'Failed to load account. Please try again.')
        return
      }

      // ── No profile found by ID — check if email already exists ────────────
      if (!profile) {
        const { data: emailMatch } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', user.email)
          .maybeSingle()

        // Admin or driver account already exists with this email — block Google login
        if (emailMatch && emailMatch.role !== 'customer') {
          await supabase.auth.signOut()
          redirectTo(
            '/login',
            'auth_error',
            'This email is registered as an admin or driver account. Please sign in with your email and password instead.'
          )
          return
        }

        // Brand-new user — create a pending customer profile
        setStatus('Setting up your account…')
        const fullName =
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split('@')[0] ??
          'User'

        const { error: insertErr } = await supabase.from('profiles').insert({
          id:             user.id,
          full_name:      fullName,
          email:          user.email,
          contact_number: '',
          address:        '',
          role:           'customer',
          status:         'pending',
        })

        await supabase.auth.signOut()

        if (insertErr) {
          redirectTo('/login', 'auth_error', 'Account setup failed. Please contact support.')
          return
        }

        redirectTo(
          '/login',
          'auth_notice',
          'Account created! Please wait for admin approval before signing in.'
        )
        return
      }

      // ── Profile found — check status ──────────────────────────────────────
      if (profile.status === 'pending') {
        await supabase.auth.signOut()
        redirectTo('/login', 'auth_notice', 'Your account is awaiting admin approval.')
        return
      }

      if (profile.status === 'disabled') {
        await supabase.auth.signOut()
        redirectTo('/login', 'auth_error', 'Your account has been disabled. Contact admin.')
        return
      }

      // ── All good — redirect by role ───────────────────────────────────────
      if (profile.role === 'superadmin')    navigate('/admin/dashboard',    { replace: true })
      else if (profile.role === 'customer') navigate('/customer/dashboard', { replace: true })
      else if (profile.role === 'driver')   navigate('/driver/dashboard',   { replace: true })
      else {
        await supabase.auth.signOut()
        redirectTo('/login', 'auth_error', 'Unknown account type. Contact admin.')
      }
    }

    // Supabase JS v2 auto-exchanges the PKCE code on client init.
    // Try getSession() immediately; onAuthStateChange fires as fallback.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) handleSession(session)
      }
    )

    // Safety net — if 12 s pass with no session, send back to login
    const timeout = setTimeout(() => {
      if (!handled.current) window.location.replace('/login')
    }, 12000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-5">
        <div className="w-14 h-14 bg-[#00B14F] rounded-2xl flex items-center
          justify-center shadow-lg mx-auto">
          <span className="text-white font-black text-2xl leading-none">Q</span>
        </div>
        <div className="w-7 h-7 rounded-full border-[3px] border-[#00B14F]
          border-t-transparent animate-spin mx-auto" />
        <p className="text-gray-500 text-sm font-medium">{status}</p>
        <p className="text-gray-300 text-xs">QuickStock Supply</p>
      </div>
    </div>
  )
}
