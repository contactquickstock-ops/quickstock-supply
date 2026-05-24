import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff, MdArrowBack } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

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
    if (notice) { toast.success(notice); sessionStorage.removeItem('auth_notice') }
    if (error)  { toast.error(error);   sessionStorage.removeItem('auth_error')  }
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">

      {/* Back to landing */}
      <Link to="/"
        className="absolute top-4 left-4 flex items-center gap-1.5 text-sm text-gray-500
          hover:text-[#168AFF] transition font-medium">
        <MdArrowBack size={18} />
        Back
      </Link>

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
