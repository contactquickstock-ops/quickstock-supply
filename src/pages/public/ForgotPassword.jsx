import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdArrowBack, MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const STEP = { EMAIL: 0, OTP: 1, PASSWORD: 2 }
const STEP_LABELS = ['Email', 'Verify Code', 'New Password']

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [step,        setStep]        = useState(STEP.EMAIL)
  const [email,       setEmail]       = useState('')
  const [otp,         setOtp]         = useState(['', '', '', '', '', ''])
  const [password,    setPassword]    = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [showPass,    setShowPass]    = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)
  const otpRefs = useRef([])

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  async function handleEmailSubmit(e) {
    e.preventDefault()
    if (!navigator.onLine) {
      setError('No internet connection. Please check your WiFi or mobile data.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    })

    if (err) {
      const msg = err.message.toLowerCase()
      if (msg.includes('fetch') || msg.includes('network') || msg.includes('failed to fetch')) {
        setError('Connection failed. Please check your internet and try again.')
      } else if (msg.includes('not found') || msg.includes('no user') || msg.includes('signup')) {
        setError('No account found with this email. Please check and try again.')
      } else {
        setError(err.message)
      }
      setLoading(false)
      return
    }

    setStep(STEP.OTP)
    setLoading(false)
  }

  // ── OTP input helpers ────────────────────────────────────────────────────
  function handleOtpChange(i, val) {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    setError(null)
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) {
      otpRefs.current[i - 1]?.focus()
    }
  }

  function handleOtpPaste(e) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = ['', '', '', '', '', '']
    pasted.split('').forEach((ch, idx) => { if (idx < 6) next[idx] = ch })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  // ── Step 2: Verify OTP ───────────────────────────────────────────────────
  async function handleOtpSubmit(e) {
    e.preventDefault()
    const token = otp.join('')
    if (token.length < 6) {
      setError('Please enter the complete 6-digit code.')
      return
    }
    if (!navigator.onLine) {
      setError('No internet connection. Please check your WiFi or mobile data.')
      return
    }
    setLoading(true)
    setError(null)

    const { error: err } = await supabase.auth.verifyOtp({
      email: email.trim().toLowerCase(),
      token,
      type: 'email',
    })

    if (err) {
      const msg = err.message.toLowerCase()
      if (msg.includes('expired') || msg.includes('invalid') || msg.includes('not found')) {
        setError('Invalid or expired code. Please go back and request a new one.')
      } else if (msg.includes('fetch') || msg.includes('network')) {
        setError('Connection failed. Please check your internet and try again.')
      } else {
        setError(err.message)
      }
      setLoading(false)
      return
    }

    setStep(STEP.PASSWORD)
    setLoading(false)
  }

  // ── Step 3: Set new password ─────────────────────────────────────────────
  async function handlePasswordSubmit(e) {
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

  // ── UI ────────────────────────────────────────────────────────────────────
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

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

          {/* Step bar */}
          <div className="flex items-center gap-1.5">
            {STEP_LABELS.map((label, i) => {
              const done   = i < step
              const active = i === step
              return (
                <div key={label} className="flex items-center gap-1.5 flex-1 min-w-0">
                  <div className={`w-6 h-6 rounded-full text-[10px] font-black flex items-center
                    justify-center shrink-0 transition-all
                    ${done   ? 'bg-green-500 text-white'
                    : active ? 'bg-[#168AFF] text-white'
                    :          'bg-gray-100 text-gray-400'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] font-semibold truncate
                    ${active ? 'text-[#168AFF]' : done ? 'text-green-500' : 'text-gray-300'}`}>
                    {label}
                  </span>
                  {i < 2 && (
                    <div className={`flex-1 h-0.5 rounded shrink-0
                      ${done ? 'bg-green-400' : 'bg-gray-100'}`} />
                  )}
                </div>
              )
            })}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs
              px-4 py-3 rounded-xl leading-relaxed">
              {error}
            </div>
          )}

          {/* ── Step 1: Email ── */}
          {step === STEP.EMAIL && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <div className="text-3xl">📧</div>
                <h2 className="font-bold text-gray-800 text-lg mt-1">Forgot Password?</h2>
                <p className="text-gray-500 text-sm">
                  Enter your registered email. We'll send a 6-digit code to verify it's you.
                </p>
              </div>
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
                      rounded-full animate-spin" />Sending Code…</>
                  : 'Send Code'}
              </button>
            </form>
          )}

          {/* ── Step 2: OTP ── */}
          {step === STEP.OTP && (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <div className="text-3xl">🔢</div>
                <h2 className="font-bold text-gray-800 text-lg mt-1">Enter the Code</h2>
                <p className="text-gray-500 text-sm">
                  A 6-digit code was sent to
                </p>
                <p className="text-[#168AFF] font-bold text-sm break-all">{email}</p>
              </div>

              <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    disabled={loading}
                    className="w-11 h-12 text-center text-xl font-black border border-gray-200
                      rounded-xl focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30
                      focus:border-[#168AFF] transition disabled:bg-gray-50 disabled:text-gray-400"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
                  hover:bg-[#1270DB] active:scale-[0.98] transition-all
                  disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white border-t-transparent
                      rounded-full animate-spin" />Verifying…</>
                  : 'Verify Code'}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setStep(STEP.EMAIL)
                  setOtp(['', '', '', '', '', ''])
                  setError(null)
                }}
                className="w-full text-sm text-gray-400 hover:text-[#168AFF]
                  transition font-medium py-1">
                Didn't receive the code? Go back
              </button>
            </form>
          )}

          {/* ── Step 3: New Password ── */}
          {step === STEP.PASSWORD && (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="text-center space-y-1 pb-1">
                <div className="text-3xl">🔒</div>
                <h2 className="font-bold text-gray-800 text-lg mt-1">Set New Password</h2>
                <p className="text-gray-500 text-sm">
                  Choose a strong new password for your account.
                </p>
              </div>

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

              {/* Password match indicator */}
              {confirmPass.length > 0 && (
                <p className={`text-xs font-medium ${password === confirmPass ? 'text-green-600' : 'text-red-500'}`}>
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
                      rounded-full animate-spin" />Updating Password…</>
                  : 'Update Password'}
              </button>
            </form>
          )}

        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} QuickStock Supply. All rights reserved.
        </p>
      </div>
    </div>
  )
}
