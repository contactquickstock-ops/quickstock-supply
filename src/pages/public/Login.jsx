import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import toast, { Toaster } from 'react-hot-toast'

const STATUS_MESSAGES = {
  pending:  { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-800', icon: '⏳',
    title: 'Account Pending Approval',
    body:  'Your account has been verified and is awaiting admin approval. You will be notified once approved.' },
  rejected: { bg: 'bg-red-50 border-red-200', text: 'text-red-800', icon: '❌',
    title: 'Account Rejected',
    body:  'Your account registration was not approved. Please contact us for more information.' },
  disabled: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-800', icon: '🚫',
    title: 'Account Disabled',
    body:  'Your account has been disabled. Please contact admin at contactquickstock@gmail.com.' },
  deleted:  { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', icon: '🗑️',
    title: 'Account Not Found',
    body:  'This account no longer exists. Please register a new account or contact support.' },
}

export default function Login() {
  const navigate = useNavigate()

  const [email,      setEmail]      = useState('')
  const [password,   setPassword]   = useState('')
  const [showPass,   setShowPass]   = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [statusInfo, setStatusInfo] = useState(null) // shown instead of toast for account status

  // Show forwarded messages from AuthCallback / OTP flow
  useEffect(() => {
    const notice = sessionStorage.getItem('auth_notice')
    const error  = sessionStorage.getItem('auth_error')
    if (notice) { toast.success(notice, { duration: 7000 }); sessionStorage.removeItem('auth_notice') }
    if (error)  { toast.error(error,   { duration: 7000 }); sessionStorage.removeItem('auth_error')  }
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setStatusInfo(null)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Map common Supabase auth errors to friendly messages
      const msg = error.message.toLowerCase()
      if (msg.includes('invalid login') || msg.includes('invalid credentials')) {
        toast.error('Incorrect email or password. Please try again.')
      } else if (msg.includes('email not confirmed')) {
        toast.error('Account not confirmed. Please contact admin at contactquickstock@gmail.com.')
      } else {
        toast.error(error.message)
      }
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile) {
      toast.error('Could not load your account. Please contact support.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Blocked statuses — show inline card instead of toast
    if (['pending', 'rejected', 'disabled', 'deleted'].includes(profile.status)) {
      await supabase.auth.signOut()
      const info = { ...STATUS_MESSAGES[profile.status] }
      if (profile.status === 'rejected' && profile.rejected_reason) {
        info.body = `Your account was not approved. Reason: "${profile.rejected_reason}"`
      }
      setStatusInfo(info)
      setLoading(false)
      return
    }

    // Remember Me — store flag so AuthContext can handle session on next visit
    if (!rememberMe) {
      sessionStorage.setItem('no_persist_session', '1')
    } else {
      sessionStorage.removeItem('no_persist_session')
    }

    toast.success(`Welcome back, ${profile.full_name?.split(' ')[0] || 'there'}! 👋`)

    if (profile.role === 'superadmin')   navigate('/admin/dashboard')
    else if (profile.role === 'customer') navigate('/customer/dashboard')
    else if (profile.role === 'driver')   navigate('/driver/dashboard')
    else {
      toast.error('Unknown role. Contact admin.')
      await supabase.auth.signOut()
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo:  window.location.origin + '/auth/callback',
        queryParams: { prompt: 'select_account' },
      },
    })
    if (error) toast.error(error.message)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Toaster position="top-center" />

      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <img src="/logo.jpg" alt="QuickStock Supply"
            className="h-24 mx-auto object-contain" />
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        {/* Status inline card (pending / rejected / disabled / deleted) */}
        {statusInfo && (
          <div className={`mb-5 border rounded-2xl px-5 py-4 ${statusInfo.bg}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0 mt-0.5">{statusInfo.icon}</span>
              <div>
                <p className={`font-bold text-sm ${statusInfo.text}`}>{statusInfo.title}</p>
                <p className={`text-xs mt-1 leading-relaxed ${statusInfo.text} opacity-80`}>
                  {statusInfo.body}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleLogin} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input type="email" required value={email}
                onChange={e => { setEmail(e.target.value); setStatusInfo(null) }}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition" />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password"
                  className="text-xs text-[#168AFF] font-medium hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required value={password}
                  onChange={e => { setPassword(e.target.value); setStatusInfo(null) }}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 pr-11 rounded-xl border border-gray-200 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition"
                />
                <button type="button" onClick={() => setShowPass(v => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <label className="flex items-center gap-2.5 cursor-pointer select-none w-fit">
              <div className="relative shrink-0">
                <input type="checkbox" checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)} className="sr-only" />
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
                  ${rememberMe ? 'bg-[#168AFF] border-[#168AFF]' : 'border-gray-300'}`}>
                  {rememberMe && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                    <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>}
                </div>
              </div>
              <span className="text-sm text-gray-600">Remember me</span>
            </label>

            {/* Sign In button */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#168AFF] hover:bg-[#1270DB] disabled:bg-[#168AFF]/60
                text-white font-bold rounded-xl text-sm transition
                flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
                : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400">or continue with</span>
            </div>
          </div>

          {/* Google */}
          <button onClick={handleGoogleLogin}
            className="w-full py-2.5 border border-gray-200 hover:bg-gray-50
              text-gray-700 font-semibold rounded-xl text-sm transition
              flex items-center justify-center gap-2.5">
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#168AFF] font-semibold hover:underline">
              Register here
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} QuickStock Supply. All rights reserved.
        </p>
      </div>
    </div>
  )
}
