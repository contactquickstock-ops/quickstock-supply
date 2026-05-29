import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const [ready,       setReady]       = useState(false)

  // Make sure we have a valid recovery session before showing the form
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setReady(true)
      } else {
        // No valid session — reset link may have expired or already been used
        sessionStorage.setItem('auth_error', 'Reset link expired or already used. Please request a new one.')
        window.location.replace('/forgot-password')
      }
    })
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.')
      return
    }
    if (!navigator.onLine) {
      setError('No internet connection. Please check your WiFi or mobile data.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.updateUser({ password })

    if (err) {
      const msg = err.message.toLowerCase()
      if (msg.includes('fetch') || msg.includes('network')) {
        setError('Connection failed. Please check your internet and try again.')
      } else {
        setError(err.message)
      }
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    toast.success('Password updated! Please sign in with your new password.')
    navigate('/login')
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <img src="/logo.jpg" alt="QuickStock Supply"
            className="h-16 mx-auto object-contain" />
          <div className="w-7 h-7 border-[3px] border-[#168AFF] border-t-transparent
            rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Verifying your reset link…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="QuickStock Supply"
            className="h-20 mx-auto object-contain" />
          <p className="text-gray-400 text-sm mt-1">Set your new password</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-5">

          <div className="text-center space-y-1">
            <div className="text-3xl">🔒</div>
            <h2 className="font-bold text-gray-800 text-xl mt-1">New Password</h2>
            <p className="text-gray-500 text-sm">
              Choose a strong new password for your account.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs
              px-4 py-3 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  autoFocus
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(null) }}
                  placeholder="At least 6 characters"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 pr-11 text-sm border border-gray-200
                    rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                    focus:border-[#168AFF] transition disabled:bg-gray-50"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600">
                  {showPass ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPass}
                  onChange={e => { setConfirmPass(e.target.value); setError(null) }}
                  placeholder="Re-enter your new password"
                  disabled={loading}
                  className="w-full px-3.5 py-2.5 pr-11 text-sm border border-gray-200
                    rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                    focus:border-[#168AFF] transition disabled:bg-gray-50"
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    text-gray-400 hover:text-gray-600">
                  {showConfirm ? <MdVisibilityOff size={18} /> : <MdVisibility size={18} />}
                </button>
              </div>
            </div>

            {confirmPass.length > 0 && (
              <p className={`text-xs font-semibold ${
                password === confirmPass ? 'text-green-600' : 'text-red-500'
              }`}>
                {password === confirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !password || !confirmPass || password !== confirmPass}
              className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
                hover:bg-[#1270DB] active:scale-[0.98] transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent
                    rounded-full animate-spin" />Updating…</>
                : 'Update Password'}
            </button>
          </form>

        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} QuickStock Supply. All rights reserved.
        </p>
      </div>
    </div>
  )
}
