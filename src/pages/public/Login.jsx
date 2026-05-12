import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const navigate                    = useNavigate()
  const [email, setEmail]           = useState('')
  const [password, setPassword]     = useState('')
  const [showPass, setShowPass]     = useState(false)
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  async function handleLogin(e) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    setError(null)

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (authErr) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      setError('Account not found. Please contact support.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile.status === 'pending') {
      toast.error('Your account is awaiting admin approval.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile.status === 'disabled') {
      toast.error('Your account has been disabled. Contact support.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (profile.role === 'superadmin') navigate('/admin/dashboard')
    else if (profile.role === 'customer') navigate('/customer/dashboard')
    else if (profile.role === 'driver')   navigate('/driver/dashboard')
    else {
      setError('Unknown account role. Please contact support.')
      await supabase.auth.signOut()
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 bg-[#00B14F] rounded-2xl flex items-center
            justify-center shadow-md">
            <span className="text-white font-black text-xl leading-none">Q</span>
          </div>
          <h1 className="text-gray-800 font-bold text-xl">QuickStock</h1>
          <p className="text-gray-400 text-sm">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleLogin} className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700
                text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30
                  focus:border-[#00B14F] transition
                  disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  disabled={loading}
                  autoComplete="current-password"
                  className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200
                    rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30
                    focus:border-[#00B14F] transition
                    disabled:bg-gray-50 disabled:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600 transition"
                  tabIndex={-1}
                >
                  {showPass ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00B14F] text-white font-bold rounded-xl
                text-sm hover:bg-[#009940] active:scale-[0.98] transition-all
                shadow-sm disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-[#00B14F] font-semibold hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
