import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../services/supabase'
import { supabaseAdmin } from '../../services/supabaseAdmin'
import toast from 'react-hot-toast'

const OTP_LENGTH    = 6
const RESEND_DELAY  = 60   // seconds
const MAX_ATTEMPTS  = 5

export default function OtpVerification() {
  const location  = useLocation()
  const navigate  = useNavigate()

  // Email + registration payload forwarded from Register page
  const { email, payload } = location.state ?? {}

  const [otp,        setOtp]        = useState(Array(OTP_LENGTH).fill(''))
  const [verifying,  setVerifying]  = useState(false)
  const [resending,  setResending]  = useState(false)
  const [cooldown,   setCooldown]   = useState(RESEND_DELAY)
  const [attempts,   setAttempts]   = useState(0)
  const [error,      setError]      = useState(null)
  const inputRefs = useRef([])

  // Redirect if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true })
  }, [email, navigate])

  // Countdown timer for resend button
  useEffect(() => {
    if (cooldown <= 0) return
    const t = setInterval(() => setCooldown(v => v - 1), 1000)
    return () => clearInterval(t)
  }, [cooldown])

  // Focus first box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  function handleChange(index, value) {
    if (!/^\d?$/.test(value)) return
    const next = [...otp]
    next[index] = value
    setOtp(next)
    setError(null)
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const next = [...otp]
        next[index] = ''
        setOtp(next)
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    if (e.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus()
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setOtp(next)
    const focusIdx = Math.min(pasted.length, OTP_LENGTH - 1)
    inputRefs.current[focusIdx]?.focus()
  }

  async function handleVerify(e) {
    e?.preventDefault()
    const token = otp.join('')
    if (token.length < OTP_LENGTH) {
      setError('Please enter the complete 6-digit code.')
      return
    }
    if (attempts >= MAX_ATTEMPTS) {
      setError('Too many failed attempts. Please request a new code.')
      return
    }

    setVerifying(true)
    setError(null)

    const { error: verifyErr } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    })

    if (verifyErr) {
      setAttempts(v => v + 1)
      setError(verifyErr.message.includes('expired')
        ? 'This code has expired. Please request a new one.'
        : 'Invalid code. Please check and try again.')
      setVerifying(false)
      return
    }

    // OTP verified — create profile as pending
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      ...payload,
      status: 'pending',
    })

    if (profileErr) {
      setError('Account verified but profile setup failed. Contact support.')
      setVerifying(false)
      return
    }

    // Sign out — account needs admin approval
    await supabase.auth.signOut()

    sessionStorage.setItem('auth_notice',
      'Email verified! Your account is now awaiting admin approval.')
    navigate('/login', { replace: true })
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return
    setResending(true)
    setError(null)

    const { error: resendErr } = await supabase.auth.resend({
      type:  'signup',
      email,
    })

    if (resendErr) {
      toast.error('Could not resend code: ' + resendErr.message)
    } else {
      toast.success('A new verification code has been sent.')
      setCooldown(RESEND_DELAY)
      setOtp(Array(OTP_LENGTH).fill(''))
      setAttempts(0)
      inputRefs.current[0]?.focus()
    }
    setResending(false)
  }

  const filled = otp.filter(Boolean).length
  const tooManyAttempts = attempts >= MAX_ATTEMPTS

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center gap-1 mb-8">
          <img src="/logo.jpg" alt="QuickStock Supply" className="h-20 object-contain" />
          <p className="text-gray-400 text-sm">Email Verification</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-7 space-y-6">

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center
              justify-center mx-auto mb-3">
              <span className="text-2xl">📧</span>
            </div>
            <h2 className="text-gray-800 font-bold text-xl">Check Your Email</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              We sent a 6-digit verification code to
            </p>
            <p className="text-[#168AFF] font-bold text-sm break-all">{email}</p>
            <p className="text-gray-400 text-xs">
              The code expires in 5 minutes.
            </p>
          </div>

          {/* OTP inputs */}
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex justify-center gap-2.5">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => { inputRefs.current[i] = el }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  onPaste={i === 0 ? handlePaste : undefined}
                  disabled={verifying || tooManyAttempts}
                  className={`w-11 h-14 text-center text-xl font-black rounded-xl border-2
                    focus:outline-none transition
                    ${digit
                      ? 'border-[#168AFF] bg-blue-50 text-[#168AFF]'
                      : 'border-gray-200 text-gray-800'}
                    ${tooManyAttempts ? 'opacity-40 cursor-not-allowed' : 'focus:border-[#168AFF]'}
                    disabled:opacity-50`}
                />
              ))}
            </div>

            {/* Attempt counter */}
            {attempts > 0 && attempts < MAX_ATTEMPTS && (
              <p className="text-xs text-center text-orange-500">
                {MAX_ATTEMPTS - attempts} attempt{MAX_ATTEMPTS - attempts !== 1 ? 's' : ''} remaining
              </p>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs
                px-4 py-3 rounded-xl text-center">
                {error}
              </div>
            )}

            {/* Verify button */}
            <button
              type="submit"
              disabled={verifying || filled < OTP_LENGTH || tooManyAttempts}
              className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
                hover:bg-[#1270DB] active:scale-[0.98] transition-all
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {verifying
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying…</>
                : 'Verify Code'
              }
            </button>
          </form>

          {/* Resend */}
          <div className="text-center space-y-2">
            <p className="text-gray-500 text-xs">Didn't receive the code?</p>
            {cooldown > 0 ? (
              <p className="text-gray-400 text-xs">
                Resend available in <span className="font-bold text-[#168AFF]">{cooldown}s</span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={resending || tooManyAttempts}
                className="text-[#168AFF] text-sm font-semibold hover:underline
                  disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending…' : 'Resend Code'}
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-5">
          <Link to="/register" className="text-sm text-gray-400 hover:text-[#168AFF] transition">
            ← Back to Registration
          </Link>
        </div>
      </div>
    </div>
  )
}
