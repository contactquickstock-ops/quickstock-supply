import { useState } from 'react'
import { Link } from 'react-router-dom'
import { MdArrowBack } from 'react-icons/md'
import { supabase } from '../../services/supabase'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!navigator.onLine) {
      setError('No internet connection. Please check your WiFi or mobile data.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/auth/callback',
    })

    if (err) {
      const msg = err.message.toLowerCase()
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
        setError('Connection failed. Please check your internet and try again.')
      } else {
        setError(err.message)
      }
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <Link to="/login"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500
            hover:text-[#168AFF] transition font-medium mb-6">
          <MdArrowBack size={18} /> Back to Login
        </Link>

        <div className="text-center mb-6">
          <img src="/logo.jpg" alt="QuickStock Supply"
            className="h-20 mx-auto object-contain" />
          <p className="text-gray-400 text-sm mt-1">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7">

          {sent ? (
            /* ── Success state ── */
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center
                justify-center mx-auto">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="font-bold text-gray-800 text-xl">Check Your Email</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We sent a password reset link to
              </p>
              <p className="text-[#168AFF] font-bold text-sm break-all">{email}</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Click the link in your email to set a new password.
                The link expires in 1 hour.
              </p>
              <p className="text-gray-400 text-xs">
                Didn't receive it? Check your spam folder.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-[#168AFF] text-sm font-semibold hover:underline">
                Use a different email
              </button>
            </div>
          ) : (
            /* ── Email form ── */
            <div className="space-y-5">
              <div className="text-center space-y-1">
                <div className="text-3xl mb-2">🔑</div>
                <h2 className="font-bold text-gray-800 text-xl">Forgot Password?</h2>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Enter your registered email and we'll send you a link to reset your password.
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
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    autoFocus
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(null) }}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                      transition disabled:bg-gray-50 disabled:text-gray-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
                    hover:bg-[#1270DB] active:scale-[0.98] transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed
                    flex items-center justify-center gap-2">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent
                        rounded-full animate-spin" />Sending…</>
                    : 'Send Reset Link'}
                </button>
              </form>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} QuickStock Supply. All rights reserved.
        </p>
      </div>
    </div>
  )
}
