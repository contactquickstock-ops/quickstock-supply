import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../services/supabase'

export default function ForgotPassword() {
  const [email,   setEmail]   = useState('')
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/auth/callback?type=recovery',
    })

    if (err) {
      setError(err.message)
      setLoading(false)
      return
    }

    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <img src="/logo.jpg" alt="QuickStock Supply" className="h-20 object-contain" />
          <p className="text-gray-400 text-sm">Password Recovery</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">

          {sent ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center
                justify-center mx-auto">
                <span className="text-2xl">✉️</span>
              </div>
              <h2 className="text-gray-800 font-bold text-xl">Check Your Email</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We sent a password reset link to
              </p>
              <p className="text-[#168AFF] font-bold text-sm break-all">{email}</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Click the link in the email to reset your password.
                The link expires in 1 hour.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-[#168AFF] text-sm font-semibold hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center
                  justify-center mx-auto mb-3">
                  <span className="text-2xl">🔑</span>
                </div>
                <h2 className="text-gray-800 font-bold text-xl">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter your email and we'll send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-xs
                    px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                    flex items-center justify-center gap-2"
                >
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending…</>
                    : 'Send Reset Link'
                  }
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Remembered your password?{' '}
          <Link to="/login" className="text-[#168AFF] font-semibold hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}
