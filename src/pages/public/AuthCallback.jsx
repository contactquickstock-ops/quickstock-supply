import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../services/supabase'

export default function AuthCallback() {
  const navigate  = useNavigate()
  const [status, setStatus] = useState('Signing you in…')
  const handled   = useRef(false)

  useEffect(() => {
    // Check if Google cancelled or returned an error in the URL
    const params    = new URLSearchParams(window.location.search)
    const hashStr   = window.location.hash.startsWith('#') ? window.location.hash.slice(1) : ''
    const hashParams = new URLSearchParams(hashStr)
    const errorDesc = params.get('error_description') || hashParams.get('error_description')

    if (errorDesc) {
      navigate('/login', { state: { error: errorDesc } })
      return
    }

    async function handleSession(session) {
      if (handled.current) return
      handled.current = true

      if (!session?.user) {
        navigate('/login')
        return
      }

      const user = session.user
      setStatus('Loading your account…')

      // Does a profile already exist for this user?
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (profileErr) {
        navigate('/login', { state: { error: 'Failed to load account. Please try again.' } })
        return
      }

      // ── New Google user — create a pending customer profile ───────────────
      if (!profile) {
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
          navigate('/login', { state: { error: 'Account setup failed. Please contact support.' } })
          return
        }

        navigate('/login', {
          state: {
            notice: 'Account created! Please wait for admin approval before signing in.',
          },
        })
        return
      }

      // ── Existing profile — check status ───────────────────────────────────
      if (profile.status === 'pending') {
        await supabase.auth.signOut()
        navigate('/login', {
          state: { notice: 'Your account is awaiting admin approval.' },
        })
        return
      }

      if (profile.status === 'disabled') {
        await supabase.auth.signOut()
        navigate('/login', {
          state: { error: 'Your account has been disabled. Contact admin.' },
        })
        return
      }

      // ── All good — redirect by role ───────────────────────────────────────
      if (profile.role === 'superadmin')  navigate('/admin/dashboard')
      else if (profile.role === 'customer') navigate('/customer/dashboard')
      else if (profile.role === 'driver')   navigate('/driver/dashboard')
      else {
        await supabase.auth.signOut()
        navigate('/login', { state: { error: 'Unknown account type. Contact admin.' } })
      }
    }

    // Supabase JS v2 automatically exchanges the PKCE code on init.
    // Try getSession() first (already resolved), then listen as fallback.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) handleSession(session)
      }
    )

    // Safety timeout — if nothing happens in 12 s, go back to login
    const timeout = setTimeout(() => {
      if (!handled.current) navigate('/login')
    }, 12000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center space-y-5">

        {/* Brand mark */}
        <div className="w-14 h-14 bg-[#00B14F] rounded-2xl flex items-center
          justify-center shadow-lg mx-auto">
          <span className="text-white font-black text-2xl leading-none">Q</span>
        </div>

        {/* Spinner */}
        <div className="w-7 h-7 rounded-full border-[3px] border-[#00B14F]
          border-t-transparent animate-spin mx-auto" />

        {/* Dynamic message */}
        <p className="text-gray-500 text-sm font-medium">{status}</p>
        <p className="text-gray-300 text-xs">QuickStock Supply</p>
      </div>
    </div>
  )
}
