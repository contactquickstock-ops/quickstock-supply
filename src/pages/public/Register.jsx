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
  const [agreed,          setAgreed]          = useState(false)
  const [showTerms,       setShowTerms]       = useState(false)
  const [showPrivacy,     setShowPrivacy]     = useState(false)
  const [termsScrolled,   setTermsScrolled]   = useState(false)
  const [privacyScrolled, setPrivacyScrolled] = useState(false)
  const [termsRead,       setTermsRead]       = useState(false)
  const [privacyRead,     setPrivacyRead]     = useState(false)

  function handleDocScroll(e, setter) {
    const el = e.currentTarget
    const atBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + 16
    if (atBottom) setter(true)
  }

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

            {/* Terms & Conditions — read both to unlock checkbox */}
            <div className={`rounded-xl border p-4 space-y-3 transition
              ${termsRead && privacyRead
                ? 'border-[#168AFF]/30 bg-blue-50/50'
                : 'border-gray-200 bg-gray-50'}`}>

              <p className="text-xs font-semibold text-gray-600">
                Before proceeding, please read the following documents:
              </p>

              {/* Document links with read status */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button type="button"
                    onClick={() => { setTermsScrolled(false); setShowTerms(true) }}
                    className="text-xs text-[#168AFF] font-semibold hover:underline flex items-center gap-1.5">
                    📄 Terms &amp; Conditions
                  </button>
                  {termsRead
                    ? <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Read
                      </span>
                    : <span className="text-[10px] text-gray-400">Tap to read</span>
                  }
                </div>
                <div className="flex items-center justify-between">
                  <button type="button"
                    onClick={() => { setPrivacyScrolled(false); setShowPrivacy(true) }}
                    className="text-xs text-[#168AFF] font-semibold hover:underline flex items-center gap-1.5">
                    🔒 Privacy Policy
                  </button>
                  {privacyRead
                    ? <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        Read
                      </span>
                    : <span className="text-[10px] text-gray-400">Tap to read</span>
                  }
                </div>
              </div>

              {/* Checkbox — only unlocked after both are read */}
              <label className={`flex items-start gap-3 select-none
                ${termsRead && privacyRead ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <div className="relative mt-0.5 shrink-0">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    disabled={loading || !termsRead || !privacyRead}
                    className="sr-only"
                  />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
                    ${agreed
                      ? 'bg-[#168AFF] border-[#168AFF]'
                      : termsRead && privacyRead
                        ? 'border-gray-300 hover:border-[#168AFF]'
                        : 'border-gray-200 bg-gray-100'}`}>
                    {agreed && (
                      <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-600 leading-relaxed">
                  {termsRead && privacyRead
                    ? 'I have read and agree to the Terms & Conditions and Privacy Policy, including the collection and use of my personal information.'
                    : 'Read both documents above to enable this checkbox.'}
                </span>
              </label>
            </div>

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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[82vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Terms &amp; Conditions</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {termsScrolled ? '✓ Scroll complete — you may agree below' : 'Please scroll to the bottom to continue'}
                </p>
              </div>
              <button onClick={() => setShowTerms(false)}
                className="text-gray-400 hover:text-gray-600 transition text-lg leading-none">✕</button>
            </div>

            {/* Scrollable body */}
            <div
              className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed"
              onScroll={e => handleDocScroll(e, setTermsScrolled)}
            >
              <p><strong className="text-gray-800">1. Acceptance of Terms</strong><br />By registering an account with QuickStock Supply, you agree to be bound by these Terms and Conditions. If you do not agree, you may not use the platform.</p>
              <p><strong className="text-gray-800">2. Account Registration</strong><br />You must provide accurate and complete information during registration. Your account is subject to admin approval before you can place orders. You are responsible for maintaining the confidentiality of your login credentials.</p>
              <p><strong className="text-gray-800">3. Use of the Platform</strong><br />QuickStock Supply is an online supply ordering platform for sari-sari stores, restaurants, and small businesses in the Philippines. Access is granted only to approved account holders.</p>
              <p><strong className="text-gray-800">4. Orders &amp; Payments</strong><br />All orders are subject to availability and admin confirmation. We currently accept Cash on Delivery (COD) only. Prices are in Philippine Peso (₱) and may change without prior notice.</p>
              <p><strong className="text-gray-800">5. Delivery Policy</strong><br />We aim for same-day delivery for orders placed before 3 PM. Orders placed after 3 PM are delivered the next business day. Delivery is free for orders ₱500 and above. A ₱25 delivery fee applies to orders below ₱500.</p>
              <p><strong className="text-gray-800">6. Premium Membership &amp; Rewards</strong><br />Only Premium Clients are eligible to earn and redeem reward points. Premium membership requires a one-time fee of ₱1,500 for 2 years (promo for first-time members), with annual renewal at ₱1,000. Membership fees and reward terms are subject to change with prior notice.</p>
              <p><strong className="text-gray-800">7. Cancellation Policy</strong><br />Orders may be cancelled only before they are confirmed by an admin. Once confirmed, cancellations must be requested immediately by contacting us. Cancellations after assignment to a driver are subject to admin discretion.</p>
              <p><strong className="text-gray-800">8. Prohibited Conduct</strong><br />You agree not to misuse the platform, submit false information, abuse the rewards system, or engage in any fraudulent activity. Violations may result in immediate account suspension without prior notice.</p>
              <p><strong className="text-gray-800">9. Limitation of Liability</strong><br />QuickStock Supply shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services, including but not limited to delays, product unavailability, or delivery issues caused by force majeure.</p>
              <p><strong className="text-gray-800">10. Governing Law</strong><br />These Terms and Conditions are governed by the laws of the Republic of the Philippines. Any disputes shall be resolved in the appropriate courts of Davao City.</p>
              <p><strong className="text-gray-800">11. Changes to Terms</strong><br />We reserve the right to update these Terms at any time. Continued use of the platform after changes are posted constitutes your acceptance of the revised Terms.</p>
              <p><strong className="text-gray-800">12. Contact</strong><br />For questions about these Terms, contact us at contactquickstock@gmail.com or through our Facebook page.</p>
              {/* Scroll sentinel */}
              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
              {!termsScrolled && (
                <p className="text-[11px] text-center text-orange-500 font-medium">
                  ↓ Scroll down to read all terms before agreeing
                </p>
              )}
              <button
                onClick={() => { setTermsRead(true); setShowTerms(false) }}
                disabled={!termsScrolled}
                className={`w-full py-2.5 font-bold rounded-xl text-sm transition
                  ${termsScrolled
                    ? 'bg-[#168AFF] text-white hover:bg-[#1270DB]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {termsScrolled ? 'I Have Read & Agree to the Terms' : 'Read to the bottom to agree'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Policy Modal ── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[82vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Privacy Policy</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {privacyScrolled ? '✓ Scroll complete — you may agree below' : 'Please scroll to the bottom to continue'}
                </p>
              </div>
              <button onClick={() => setShowPrivacy(false)}
                className="text-gray-400 hover:text-gray-600 transition text-lg leading-none">✕</button>
            </div>

            {/* Scrollable body */}
            <div
              className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed"
              onScroll={e => handleDocScroll(e, setPrivacyScrolled)}
            >
              <p className="text-xs text-gray-400 italic">Effective date: 2025 · QuickStock Supply, Lubogan, Toril, Davao City</p>

              <p><strong className="text-gray-800">1. Information We Collect</strong><br />When you register on QuickStock Supply, we collect personal information including your full name, email address, contact number, home or business delivery address, and optional profile photo. We also collect order history, transaction data, and usage information when you interact with our platform.</p>

              <p><strong className="text-gray-800">2. Why We Collect Your Information</strong><br />Your personal information is collected to comply with Republic Act No. 10173, also known as the Data Privacy Act of 2012 of the Philippines. We collect only information that is necessary for the legitimate operation of our services.</p>

              <p><strong className="text-gray-800">3. How We Use Your Information</strong><br />We use your information to: process and fulfill your orders; assign drivers and communicate delivery updates; manage your account and rewards points; respond to your inquiries and support requests; and improve our platform and services. We will not use your data for any purpose beyond what is stated here without your explicit consent.</p>

              <p><strong className="text-gray-800">4. Information Sharing</strong><br />We do not sell, rent, or trade your personal information to any third party. We only share information strictly necessary to fulfill your orders — for example, assigned delivery drivers will see your delivery address and contact number. We do not disclose your data without your consent unless required by Philippine law or a valid court order.</p>

              <p><strong className="text-gray-800">5. Data Security</strong><br />We implement appropriate technical and organizational security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction. Your password is encrypted using industry-standard methods and is never stored in plain text. Access to personal data is limited to authorized personnel only.</p>

              <p><strong className="text-gray-800">6. Data Retention</strong><br />We retain your personal information for as long as your account remains active or as necessary to provide our services and comply with legal obligations. You may request deletion of your account and associated data at any time by contacting us.</p>

              <p><strong className="text-gray-800">7. Your Rights Under the Data Privacy Act</strong><br />As a data subject under RA 10173, you have the right to: be informed about how your data is processed; access your personal information; correct inaccurate data; object to processing; and request deletion or blocking of your data. To exercise any of these rights, contact us at contactquickstock@gmail.com.</p>

              <p><strong className="text-gray-800">8. Cookies &amp; Usage Data</strong><br />Our platform may use cookies and similar tracking technologies to enhance your browsing experience and analyze how our site is used. You may disable cookies in your browser settings, though this may affect certain features of the platform.</p>

              <p><strong className="text-gray-800">9. Children's Privacy</strong><br />QuickStock Supply is intended for adults and business operators. We do not knowingly collect personal information from individuals under 18 years of age. If we become aware that a minor has provided us with personal data, we will promptly delete it.</p>

              <p><strong className="text-gray-800">10. Changes to This Policy</strong><br />We may update this Privacy Policy from time to time to reflect changes in our practices or applicable law. We will notify registered users of significant changes via email or an in-app notification. Continued use of the platform after updates means you accept the revised policy.</p>

              <p><strong className="text-gray-800">11. Contact &amp; Data Protection Officer</strong><br />For any privacy concerns, data requests, or complaints, please contact us at: <strong>contactquickstock@gmail.com</strong> or message us via our official Facebook page. We will respond to your request within a reasonable time.</p>
              {/* Scroll sentinel */}
              <div className="h-2" />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
              {!privacyScrolled && (
                <p className="text-[11px] text-center text-orange-500 font-medium">
                  ↓ Scroll down to read the full policy before agreeing
                </p>
              )}
              <button
                onClick={() => { setPrivacyRead(true); setShowPrivacy(false) }}
                disabled={!privacyScrolled}
                className={`w-full py-2.5 font-bold rounded-xl text-sm transition
                  ${privacyScrolled
                    ? 'bg-[#168AFF] text-white hover:bg-[#1270DB]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {privacyScrolled ? 'I Have Read & Agree to the Privacy Policy' : 'Read to the bottom to agree'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
