import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import { supabaseAdmin } from '../../services/supabaseAdmin'
import toast from 'react-hot-toast'

function PasswordInput({ value, onChange, placeholder, show, onToggle, disabled, autoComplete }) {
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl
          focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
          transition disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onClick={onToggle}
        tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2
          text-gray-400 hover:text-gray-600 transition"
      >
        {show ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
  transition disabled:bg-gray-50 disabled:text-gray-400`

export default function RegisterPage() {
  const navigate = useNavigate()

  const [fullName,     setFullName]     = useState('')
  const [email,        setEmail]        = useState('')
  const [contact,      setContact]      = useState('')
  const [address,      setAddress]      = useState('')
  const [password,     setPassword]     = useState('')
  const [confirmPass,  setConfirmPass]  = useState('')
  const [showPass,     setShowPass]     = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  async function handleRegister(e) {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !contact.trim() ||
        !address.trim()  || !password    || !confirmPass) {
      setError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    setError(null)

    // 1. Create auth user
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
    })

    if (signUpErr) {
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    // 2. Insert profile (use admin client to bypass RLS)
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id:             data.user.id,
      full_name:      fullName.trim(),
      email:          email.trim(),
      contact_number: contact.trim(),
      address:        address.trim(),
      role:           'customer',
      status:         'pending',
    })

    if (profileErr) {
      setError('Profile setup failed. Please contact support.')
      setLoading(false)
      return
    }

    // 3. Sign out immediately — account needs admin approval first
    await supabase.auth.signOut()
    toast.success('Account submitted. Please wait for admin approval.', {
      duration: 5000,
    })
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center gap-2 mb-7">
          <div className="w-12 h-12 bg-[#00B14F] rounded-2xl flex items-center
            justify-center shadow-md">
            <span className="text-white font-black text-xl leading-none">Q</span>
          </div>
          <h1 className="text-gray-800 font-bold text-xl">QuickStock</h1>
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleRegister} className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700
                text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Full Name */}
            <Field label="Full Name">
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz"
                disabled={loading}
                className={INPUT_CLS}
              />
            </Field>

            {/* Email */}
            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                disabled={loading}
                autoComplete="email"
                className={INPUT_CLS}
              />
            </Field>

            {/* Contact */}
            <Field label="Contact Number">
              <input
                type="tel"
                value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="09171234567"
                disabled={loading}
                className={INPUT_CLS}
              />
            </Field>

            {/* Address */}
            <Field label="Delivery Address">
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House no., street, barangay, city…"
                disabled={loading}
                rows={3}
                className={`${INPUT_CLS} resize-none`}
              />
            </Field>

            {/* Password */}
            <Field label="Password">
              <PasswordInput
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                show={showPass}
                onToggle={() => setShowPass(v => !v)}
                disabled={loading}
                autoComplete="new-password"
              />
            </Field>

            {/* Confirm Password */}
            <Field label="Confirm Password">
              <PasswordInput
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Re-enter your password"
                show={showConfirm}
                onToggle={() => setShowConfirm(v => !v)}
                disabled={loading}
                autoComplete="new-password"
              />
              {/* Inline match indicator */}
              {confirmPass && (
                <p className={`text-xs mt-1.5 font-medium
                  ${password === confirmPass ? 'text-green-600' : 'text-red-400'}`}>
                  {password === confirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </Field>

            {/* Notice */}
            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3.5 py-2.5">
              Your account will be reviewed by an admin before activation.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00B14F] text-white font-bold rounded-xl
                text-sm hover:bg-[#009940] active:scale-[0.98] transition-all
                shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#00B14F] font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
