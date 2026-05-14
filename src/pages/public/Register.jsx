import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff, MdCameraAlt } from 'react-icons/md'
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
          focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
          transition disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button type="button" onClick={onToggle} tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition">
        {show ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
      </button>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
  transition disabled:bg-gray-50 disabled:text-gray-400`

export default function RegisterPage() {
  const navigate     = useNavigate()
  const avatarRef    = useRef(null)

  const [fullName,      setFullName]      = useState('')
  const [email,         setEmail]         = useState('')
  const [contact,       setContact]       = useState('')
  const [address,       setAddress]       = useState('')
  const [password,      setPassword]      = useState('')
  const [confirmPass,   setConfirmPass]   = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [showConfirm,   setShowConfirm]   = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)
  const [avatarFile,    setAvatarFile]    = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [agreed,        setAgreed]        = useState(false)
  const [showTerms,     setShowTerms]     = useState(false)
  const [showPrivacy,   setShowPrivacy]   = useState(false)

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleRegister(e) {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !contact.trim() ||
        !address.trim()  || !password    || !confirmPass) {
      setError('All fields are required.')
      return
    }
    if (!agreed) {
      setError('You must agree to the Terms & Conditions and Privacy Policy to continue.')
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
    const { data, error: signUpErr } = await supabase.auth.signUp({ email: email.trim(), password })
    if (signUpErr) {
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    // 2. Upload avatar if selected
    let avatarUrl = null
    if (avatarFile) {
      try {
        const fileName = `customer-${data.user.id}.jpg`
        const { error: uploadErr } = await supabaseAdmin.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })
        if (!uploadErr) {
          const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(fileName)
          avatarUrl = urlData.publicUrl
        }
      } catch { /* avatar failure won't block registration */ }
    }

    // 3. Insert profile
    const { error: profileErr } = await supabaseAdmin.from('profiles').insert({
      id:             data.user.id,
      full_name:      fullName.trim(),
      email:          email.trim(),
      contact_number: contact.trim(),
      address:        address.trim(),
      avatar_url:     avatarUrl,
      role:           'customer',
      status:         'pending',
    })

    if (profileErr) {
      setError('Profile setup failed. Please contact support.')
      setLoading(false)
      return
    }

    await supabase.auth.signOut()
    toast.success('Account submitted. Please wait for admin approval.', { duration: 5000 })
    navigate('/login')
  }

  const initials = fullName.trim() ? fullName.trim()[0].toUpperCase() : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="flex flex-col items-center gap-1 mb-7">
          <img src="/logo.jpg" alt="QuickStock Supply" className="h-20 object-contain" />
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleRegister} className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-1.5 pb-1">
              <button
                type="button"
                onClick={() => !loading && avatarRef.current?.click()}
                disabled={loading}
                className="relative w-20 h-20 rounded-full overflow-hidden group
                  border-2 border-dashed border-gray-200 hover:border-[#168AFF] transition"
              >
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center
                    gap-1 bg-gray-50">
                    {initials
                      ? <span className="text-2xl font-black text-gray-300">{initials}</span>
                      : <MdCameraAlt size={24} className="text-gray-300" />
                    }
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20
                  transition flex items-center justify-center">
                  <MdCameraAlt size={18} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
              <p className="text-[11px] text-gray-400">
                {avatarPreview ? 'Tap to change photo' : 'Add profile photo (optional)'}
              </p>
              <input
                ref={avatarRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading}
                className="hidden"
              />
            </div>

            <Field label="Full Name">
              <input type="text" value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz" disabled={loading} className={INPUT_CLS} />
            </Field>

            <Field label="Email Address">
              <input type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" disabled={loading}
                autoComplete="email" className={INPUT_CLS} />
            </Field>

            <Field label="Contact Number">
              <input type="tel" value={contact}
                onChange={e => setContact(e.target.value)}
                placeholder="09171234567" disabled={loading} className={INPUT_CLS} />
            </Field>

            <Field label="Delivery Address">
              <textarea value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="House no., street, barangay, city…"
                disabled={loading} rows={3}
                className={`${INPUT_CLS} resize-none`} />
            </Field>

            <Field label="Password">
              <PasswordInput value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" show={showPass}
                onToggle={() => setShowPass(v => !v)} disabled={loading}
                autoComplete="new-password" />
            </Field>

            <Field label="Confirm Password">
              <PasswordInput value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                placeholder="Re-enter your password" show={showConfirm}
                onToggle={() => setShowConfirm(v => !v)} disabled={loading}
                autoComplete="new-password" />
              {confirmPass && (
                <p className={`text-xs mt-1.5 font-medium
                  ${password === confirmPass ? 'text-green-600' : 'text-red-400'}`}>
                  {password === confirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            </Field>

            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3.5 py-2.5">
              Your account will be reviewed by an admin before activation.
            </p>

            {/* Terms & Conditions checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <div className="relative mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={e => setAgreed(e.target.checked)}
                  disabled={loading}
                  className="sr-only"
                />
                <div className={`w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition
                  ${agreed
                    ? 'bg-[#168AFF] border-[#168AFF]'
                    : 'border-gray-300 group-hover:border-[#168AFF]'}`}>
                  {agreed && (
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-xs text-gray-600 leading-relaxed">
                I have read and agree to the{' '}
                <button type="button" onClick={() => setShowTerms(true)}
                  className="text-[#168AFF] font-semibold hover:underline">
                  Terms &amp; Conditions
                </button>
                {' '}and{' '}
                <button type="button" onClick={() => setShowPrivacy(true)}
                  className="text-[#168AFF] font-semibold hover:underline">
                  Privacy Policy
                </button>
                , including the collection and use of my personal information.
              </span>
            </label>

            <button type="submit" disabled={loading || !agreed}
              className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl
                text-sm hover:bg-[#1270DB] active:scale-[0.98] transition-all
                shadow-sm disabled:opacity-60 disabled:cursor-not-allowed">
              {loading ? 'Submitting…' : 'Create Account'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#168AFF] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

      {/* ── Terms & Conditions Modal ── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowTerms(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Terms &amp; Conditions</h3>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">1. Acceptance of Terms</strong><br />By registering an account with QuickStock Supply, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the platform.</p>
              <p><strong className="text-gray-800">2. Account Registration</strong><br />You must provide accurate and complete information during registration. Your account is subject to admin approval before you can place orders. You are responsible for maintaining the confidentiality of your login credentials.</p>
              <p><strong className="text-gray-800">3. Orders &amp; Payments</strong><br />All orders are subject to availability and confirmation. We currently accept Cash on Delivery (COD). Prices are in Philippine Peso (₱) and may change without prior notice.</p>
              <p><strong className="text-gray-800">4. Delivery</strong><br />We aim for same-day delivery for orders placed before 3 PM. Delivery is free for orders ₱500 and above. A ₱25 delivery fee applies to orders below ₱500.</p>
              <p><strong className="text-gray-800">5. Rewards &amp; Membership</strong><br />Premium membership is required to earn reward points. Membership fees and reward terms are subject to change with prior notice to members.</p>
              <p><strong className="text-gray-800">6. Prohibited Conduct</strong><br />You agree not to misuse the platform, submit false information, or engage in any fraudulent activity. Violations may result in account suspension.</p>
              <p><strong className="text-gray-800">7. Limitation of Liability</strong><br />QuickStock Supply is not liable for any indirect, incidental, or consequential damages arising from the use of our services.</p>
              <p><strong className="text-gray-800">8. Changes to Terms</strong><br />We reserve the right to update these Terms at any time. Continued use of the platform after changes constitutes acceptance of the new Terms.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setAgreed(true); setShowTerms(false) }}
                className="w-full py-2.5 bg-[#168AFF] text-white font-bold rounded-xl text-sm hover:bg-[#1270DB] transition">
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Modal ── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) setShowPrivacy(false) }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 text-base">Privacy Policy</h3>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600 transition">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed">
              <p><strong className="text-gray-800">Information We Collect</strong><br />We collect personal information you provide during registration, including your full name, email address, contact number, delivery address, and profile photo. We also collect order history and transaction data.</p>
              <p><strong className="text-gray-800">How We Use Your Information</strong><br />Your information is used to process orders, communicate delivery updates, manage your account, and improve our services. We may also use it to send promotional offers if you have opted in.</p>
              <p><strong className="text-gray-800">Information Sharing</strong><br />We do not sell or share your personal information with third parties except as necessary to fulfill orders (e.g., assigned drivers see your delivery address and contact number). We do not disclose your data without your consent unless required by law.</p>
              <p><strong className="text-gray-800">Data Security</strong><br />We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure. Your password is encrypted and never stored in plain text.</p>
              <p><strong className="text-gray-800">Data Retention</strong><br />We retain your personal information for as long as your account is active or as needed to provide services. You may request account deletion by contacting us.</p>
              <p><strong className="text-gray-800">Your Rights</strong><br />You have the right to access, correct, or delete your personal information. Contact us at contactquickstock@gmail.com for any privacy-related requests.</p>
              <p><strong className="text-gray-800">Contact Us</strong><br />For privacy concerns, email us at contactquickstock@gmail.com or message us on Facebook.</p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100">
              <button onClick={() => { setAgreed(true); setShowPrivacy(false) }}
                className="w-full py-2.5 bg-[#168AFF] text-white font-bold rounded-xl text-sm hover:bg-[#1270DB] transition">
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
