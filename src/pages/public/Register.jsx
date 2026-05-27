import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { MdVisibility, MdVisibilityOff, MdCameraAlt, MdCheckCircle } from 'react-icons/md'
import { supabase } from '../../services/supabase'
import { supabaseAdmin } from '../../services/supabaseAdmin'

// ── Password strength checker ─────────────────────────────────────────────────
function checkStrength(pw) {
  return {
    length:  pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
    number:  /\d/.test(pw),
    special: /[!@#$%^&*()\-_=+{}[\]|;:'",.<>?/\\`~]/.test(pw),
  }
}

function StrengthBar({ score }) {
  const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500']
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
  const color  = colors[score - 1] ?? 'bg-gray-200'
  const label  = score > 0 ? labels[score - 1] : ''

  return (
    <div className="space-y-1.5 mt-2">
      <div className="flex gap-1">
        {[1,2,3,4,5].map(i => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-colors
            ${i <= score ? color : 'bg-gray-100'}`} />
        ))}
      </div>
      {label && (
        <p className={`text-[11px] font-semibold
          ${score <= 2 ? 'text-red-500' : score === 3 ? 'text-yellow-500' : score === 4 ? 'text-blue-500' : 'text-green-600'}`}>
          {label}
        </p>
      )}
    </div>
  )
}

function StrengthRequirement({ met, label }) {
  return (
    <div className={`flex items-center gap-1.5 text-[11px] font-medium
      ${met ? 'text-green-600' : 'text-gray-400'}`}>
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0
        ${met ? 'bg-green-500 border-green-500' : 'border-gray-300'}`}>
        {met && <svg width="7" height="5" viewBox="0 0 7 5" fill="none">
          <path d="M1 2.5L2.5 4L6 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>}
      </div>
      {label}
    </div>
  )
}

function PasswordInput({ label, value, onChange, placeholder, show, onToggle, disabled, autoComplete, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
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
      {hint}
    </div>
  )
}

const INPUT_CLS = `w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
  transition disabled:bg-gray-50 disabled:text-gray-400`

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.startsWith('63')) return '+' + digits
  if (digits.startsWith('0'))  return '+63' + digits.slice(1)
  return '+63' + digits
}

export default function RegisterPage() {
  const avatarRef = useRef(null)

  const [fullName,        setFullName]        = useState('')
  const [email,           setEmail]           = useState('')
  const [contactNumber,   setContactNumber]   = useState('')
  const [storeName,       setStoreName]       = useState('')
  const [addrHouseNo,     setAddrHouseNo]     = useState('')
  const [addrStreet,      setAddrStreet]      = useState('')
  const [addrCity,        setAddrCity]        = useState('')
  const [addrProvince,    setAddrProvince]    = useState('')
  const [addrCountry,     setAddrCountry]     = useState('Philippines')
  const [password,        setPassword]        = useState('')
  const [confirmPass,     setConfirmPass]     = useState('')
  const [showPass,        setShowPass]        = useState(false)
  const [showConfirm,     setShowConfirm]     = useState(false)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)
  const [emailSent,       setEmailSent]       = useState(false)
  const [avatarFile,      setAvatarFile]      = useState(null)
  const [avatarPreview,   setAvatarPreview]   = useState(null)
  const [agreed,          setAgreed]          = useState(false)
  const [showTerms,       setShowTerms]       = useState(false)
  const [showPrivacy,     setShowPrivacy]     = useState(false)
  const [termsScrolled,   setTermsScrolled]   = useState(false)
  const [privacyScrolled, setPrivacyScrolled] = useState(false)
  const [termsRead,       setTermsRead]       = useState(false)
  const [privacyRead,     setPrivacyRead]     = useState(false)

  const strength      = checkStrength(password)
  const strengthScore = Object.values(strength).filter(Boolean).length
  const allStrong     = strengthScore === 5

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  function handleDocScroll(e, setter) {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 16) setter(true)
  }

  async function handleRegister(e) {
    e.preventDefault()

    if (!fullName.trim() || !email.trim() || !contactNumber.trim() ||
        !storeName.trim() || !addrStreet.trim() || !addrCity.trim() ||
        !addrProvince.trim() || !addrCountry.trim() || !password || !confirmPass) {
      setError('All fields are required.')
      return
    }
    const intlPhone = formatPhone(contactNumber)
    if (!/^\+639\d{9}$/.test(intlPhone)) {
      setError('Please enter a valid Philippine mobile number (e.g. 09XXXXXXXXX).')
      return
    }
    if (!allStrong) {
      setError('Password does not meet all strength requirements.')
      return
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.')
      return
    }
    if (!agreed) {
      setError('You must agree to the Terms & Conditions and Privacy Policy.')
      return
    }

    setLoading(true)
    setError(null)

    // Sign up — Supabase sends a confirmation email with a link to /auth/callback
    const { data, error: signUpErr } = await supabase.auth.signUp({
      email:    email.trim(),
      password,
      options: {
        emailRedirectTo: window.location.origin + '/auth/callback',
        data: {
          full_name:       fullName.trim(),
          contact_number:  intlPhone,
          store_name:      storeName.trim(),
          addr_house_no:   addrHouseNo.trim(),
          addr_street:     addrStreet.trim(),
          addr_city:       addrCity.trim(),
          addr_province:   addrProvince.trim(),
          addr_country:    addrCountry.trim(),
        },
      },
    })

    if (signUpErr) {
      setError(signUpErr.message)
      setLoading(false)
      return
    }

    // Supabase returns identities: [] when the email is already registered
    if (data.user?.identities?.length === 0) {
      setError('This email is already registered. Please sign in instead.')
      setLoading(false)
      return
    }

    // Upload avatar and attach URL to user metadata so AuthCallback can save it
    if (avatarFile && data.user?.id) {
      try {
        const fileName = `customer-${data.user.id}.jpg`
        const { error: uploadErr } = await supabaseAdmin.storage
          .from('avatars').upload(fileName, avatarFile, { upsert: true })
        if (!uploadErr) {
          const { data: urlData } = supabaseAdmin.storage.from('avatars').getPublicUrl(fileName)
          await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
            user_metadata: {
              full_name:      fullName.trim(),
              contact_number: intlPhone,
              store_name:     storeName.trim(),
              addr_house_no:  addrHouseNo.trim(),
              addr_street:    addrStreet.trim(),
              addr_city:      addrCity.trim(),
              addr_province:  addrProvince.trim(),
              addr_country:   addrCountry.trim(),
              avatar_url:     urlData.publicUrl,
            },
          })
        }
      } catch { /* avatar upload is non-fatal */ }
    }

    // Sign out any session signUp may have created (only happens if email confirm is OFF)
    await supabase.auth.signOut()

    setEmailSent(true)
    setLoading(false)
  }

  const initials = fullName.trim() ? fullName.trim()[0].toUpperCase() : null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center gap-1 mb-7">
          <img src="/logo.jpg" alt="QuickStock Supply" className="h-20 object-contain" />
          <p className="text-gray-400 text-sm">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

          {/* ── Email sent success screen ── */}
          {emailSent ? (
            <div className="text-center space-y-4 py-4">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="font-bold text-gray-800 text-xl">Check Your Email</h2>
              <p className="text-gray-500 text-sm leading-relaxed">
                We sent a confirmation link to:
              </p>
              <p className="text-[#168AFF] font-bold text-sm break-all">{email}</p>
              <p className="text-gray-400 text-xs leading-relaxed">
                Click the link in your email to confirm your account.
                Once confirmed, your account will be reviewed and approved by our admin
                before you can sign in.
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-700 text-left">
                <strong>Didn't receive it?</strong> Check your spam/junk folder.
                The email is sent from QuickStock Supply.
              </div>
              <Link to="/login"
                className="block w-full py-2.5 bg-[#168AFF] text-white font-bold
                  rounded-xl text-sm hover:bg-[#1270DB] transition text-center">
                Back to Login
              </Link>
            </div>
          ) : (

          <form onSubmit={handleRegister} className="space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Avatar picker */}
            <div className="flex flex-col items-center gap-1.5 pb-1">
              <button type="button" onClick={() => !loading && avatarRef.current?.click()}
                disabled={loading}
                className="relative w-20 h-20 rounded-full overflow-hidden group
                  border-2 border-dashed border-gray-200 hover:border-[#168AFF] transition">
                {avatarPreview
                  ? <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex flex-col items-center justify-center gap-1 bg-gray-50">
                      {initials
                        ? <span className="text-2xl font-black text-gray-300">{initials}</span>
                        : <MdCameraAlt size={24} className="text-gray-300" />}
                    </div>
                }
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition
                  flex items-center justify-center">
                  <MdCameraAlt size={18} className="text-white opacity-0 group-hover:opacity-100 transition" />
                </div>
              </button>
              <p className="text-[11px] text-gray-400">
                {avatarPreview ? 'Tap to change' : 'Profile photo (optional)'}
              </p>
              <input ref={avatarRef} type="file" accept="image/*"
                onChange={handleAvatarChange} disabled={loading} className="hidden" />
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="Juan Dela Cruz" disabled={loading} className={INPUT_CLS} />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" disabled={loading}
                autoComplete="email" className={INPUT_CLS} />
            </div>

            {/* Phone / Contact Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Mobile Number <span className="text-red-400">*</span>
              </label>
              <input type="tel" value={contactNumber} onChange={e => setContactNumber(e.target.value)}
                placeholder="09XXXXXXXXX" disabled={loading}
                autoComplete="tel" className={INPUT_CLS} />
              <p className="text-[11px] text-gray-400 mt-1">
                Drivers will use this to contact you during delivery.
              </p>
            </div>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Store / Business Name <span className="text-red-400">*</span>
              </label>
              <input type="text" value={storeName} onChange={e => setStoreName(e.target.value)}
                placeholder="e.g. Aling Nena's Sari-Sari Store" disabled={loading}
                className={INPUT_CLS} />
            </div>

            {/* Delivery Address */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Store / Delivery Address <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                <input type="text" value={addrHouseNo} onChange={e => setAddrHouseNo(e.target.value)}
                  placeholder="House / Unit No. (optional)" disabled={loading} className={INPUT_CLS} />
                <input type="text" value={addrStreet} onChange={e => setAddrStreet(e.target.value)}
                  placeholder="Street / Barangay *" disabled={loading} className={INPUT_CLS} />
                <div className="grid grid-cols-2 gap-2">
                  <input type="text" value={addrCity} onChange={e => setAddrCity(e.target.value)}
                    placeholder="City / Municipality *" disabled={loading} className={INPUT_CLS} />
                  <input type="text" value={addrProvince} onChange={e => setAddrProvince(e.target.value)}
                    placeholder="Province *" disabled={loading} className={INPUT_CLS} />
                </div>
                <input type="text" value={addrCountry} onChange={e => setAddrCountry(e.target.value)}
                  placeholder="Country *" disabled={loading} className={INPUT_CLS} />
              </div>
            </div>

            {/* Password with strength */}
            <PasswordInput
              label="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Min. 8 characters"
              show={showPass}
              onToggle={() => setShowPass(v => !v)}
              disabled={loading}
              autoComplete="new-password"
              hint={password && (
                <div className="mt-2 space-y-2">
                  <StrengthBar score={strengthScore} />
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1">
                    <StrengthRequirement met={strength.length}  label="8+ characters" />
                    <StrengthRequirement met={strength.upper}   label="Uppercase letter" />
                    <StrengthRequirement met={strength.lower}   label="Lowercase letter" />
                    <StrengthRequirement met={strength.number}  label="Number" />
                    <StrengthRequirement met={strength.special} label="Special character" />
                  </div>
                </div>
              )}
            />

            {/* Confirm Password */}
            <PasswordInput
              label="Confirm Password"
              value={confirmPass}
              onChange={e => setConfirmPass(e.target.value)}
              placeholder="Re-enter your password"
              show={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
              disabled={loading}
              autoComplete="new-password"
              hint={confirmPass && (
                <p className={`text-xs mt-1.5 font-medium
                  ${password === confirmPass ? 'text-green-600' : 'text-red-400'}`}>
                  {password === confirmPass ? '✓ Passwords match' : '✗ Passwords do not match'}
                </p>
              )}
            />

            {/* T&C box */}
            <div className={`rounded-xl border p-4 space-y-3 transition
              ${termsRead && privacyRead ? 'border-[#168AFF]/30 bg-blue-50/50' : 'border-gray-200 bg-gray-50'}`}>
              <p className="text-xs font-semibold text-gray-600">
                Please read both documents before proceeding:
              </p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setTermsScrolled(false); setShowTerms(true) }}
                    className="text-xs text-[#168AFF] font-semibold hover:underline">
                    📄 Terms &amp; Conditions
                  </button>
                  {termsRead
                    ? <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                        <MdCheckCircle size={12} /> Read
                      </span>
                    : <span className="text-[10px] text-gray-400">Tap to read</span>}
                </div>
                <div className="flex items-center justify-between">
                  <button type="button" onClick={() => { setPrivacyScrolled(false); setShowPrivacy(true) }}
                    className="text-xs text-[#168AFF] font-semibold hover:underline">
                    🔒 Privacy Policy
                  </button>
                  {privacyRead
                    ? <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                        <MdCheckCircle size={12} /> Read
                      </span>
                    : <span className="text-[10px] text-gray-400">Tap to read</span>}
                </div>
              </div>
              <label className={`flex items-start gap-3 select-none
                ${termsRead && privacyRead ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}>
                <div className="relative mt-0.5 shrink-0">
                  <input type="checkbox" checked={agreed}
                    onChange={e => setAgreed(e.target.checked)}
                    disabled={loading || !termsRead || !privacyRead} className="sr-only" />
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
                    ${agreed ? 'bg-[#168AFF] border-[#168AFF]'
                      : termsRead && privacyRead ? 'border-gray-300' : 'border-gray-200 bg-gray-100'}`}>
                    {agreed && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>}
                  </div>
                </div>
                <span className="text-xs text-gray-600 leading-relaxed">
                  {termsRead && privacyRead
                    ? 'I have read and agree to the Terms & Conditions and Privacy Policy.'
                    : 'Read both documents above to enable this checkbox.'}
                </span>
              </label>
            </div>

            <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3.5 py-2.5">
              After registering, a confirmation email will be sent to your inbox.
              Click the link to confirm, then wait for admin approval before signing in.
            </p>

            <button type="submit" disabled={loading || !agreed || !allStrong}
              className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl
                text-sm hover:bg-[#1270DB] active:scale-[0.98] transition-all
                shadow-sm disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating Account…</>
                : 'Create Account'}
            </button>
          </form>

          )} {/* end emailSent ternary */}
        </div>

        <p className="text-center text-sm text-gray-400 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#168AFF] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>

      {/* ── Terms Modal ── */}
      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Terms &amp; Conditions</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {termsScrolled ? '✓ Scroll complete — you may agree below' : 'Scroll to the bottom to continue'}
                </p>
              </div>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed"
              onScroll={e => handleDocScroll(e, setTermsScrolled)}>
              <p><strong className="text-gray-800">1. Acceptance of Terms</strong><br />By registering with QuickStock Supply, you agree to these Terms. If you disagree, do not use the platform.</p>
              <p><strong className="text-gray-800">2. Account Registration</strong><br />You must provide accurate information. Your account requires admin approval before you can place orders. You are responsible for maintaining your login credentials.</p>
              <p><strong className="text-gray-800">3. Use of the Platform</strong><br />QuickStock Supply is an online supply ordering platform for sari-sari stores, restaurants, and small businesses. Access is granted only to approved account holders.</p>
              <p><strong className="text-gray-800">4. Orders &amp; Payments</strong><br />Orders are subject to availability and confirmation. We accept Cash on Delivery (COD) only — payment is made in cash upon delivery. Prices are in Philippine Peso (₱) and may change without prior notice.</p>
              <p><strong className="text-gray-800">5. Delivery Policy</strong><br />We offer same-day delivery within business hours (8:00 AM – 8:00 PM). Orders placed after 8:00 PM will be delivered the next business day. Free delivery on orders ₱500+. A ₱25 fee applies below ₱500.</p>
              <p><strong className="text-gray-800">6. Premium Membership &amp; Rewards</strong><br />Only Premium Clients earn reward points. Membership requires ₱1,500 for 2 years (first-time) and ₱1,000/year for renewal. Terms may change with prior notice.</p>
              <p><strong className="text-gray-800">7. Prohibited Conduct</strong><br />You must not misuse the platform, submit false information, or engage in fraud. Violations may result in immediate account suspension.</p>
              <p><strong className="text-gray-800">8. Limitation of Liability</strong><br />QuickStock Supply is not liable for indirect damages arising from service use, delays, or force majeure events.</p>
              <p><strong className="text-gray-800">10. Governing Law</strong><br />These terms are governed by Philippine law. Disputes shall be resolved in the courts of Davao City.</p>
              <p><strong className="text-gray-800">11. Changes to Terms</strong><br />We may update these Terms at any time. Continued use after changes constitutes acceptance.</p>
              <p><strong className="text-gray-800">12. Contact</strong><br />Questions? Email contactquickstock@gmail.com or message us on Facebook.</p>
              <div className="h-2" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
              {!termsScrolled && (
                <p className="text-[11px] text-center text-orange-500 font-medium">
                  ↓ Scroll to the bottom to enable agreement
                </p>
              )}
              <button onClick={() => { setTermsRead(true); setShowTerms(false) }}
                disabled={!termsScrolled}
                className={`w-full py-2.5 font-bold rounded-xl text-sm transition
                  ${termsScrolled ? 'bg-[#168AFF] text-white hover:bg-[#1270DB]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {termsScrolled ? 'I Have Read & Agree to the Terms' : 'Read to the bottom to agree'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Privacy Modal ── */}
      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[82vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h3 className="font-bold text-gray-800 text-base">Privacy Policy</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {privacyScrolled ? '✓ Scroll complete — you may agree below' : 'Scroll to the bottom to continue'}
                </p>
              </div>
              <button onClick={() => setShowPrivacy(false)} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4 text-sm text-gray-600 leading-relaxed"
              onScroll={e => handleDocScroll(e, setPrivacyScrolled)}>
              <p className="text-xs text-gray-400 italic">Effective date: 2025 · QuickStock Supply, Davao City, Philippines</p>
              <p><strong className="text-gray-800">1. Information We Collect</strong><br />We collect your full name, email, contact number, delivery address, and optional profile photo during registration. We also collect order history and transaction data.</p>
              <p><strong className="text-gray-800">2. Legal Basis (RA 10173)</strong><br />Data collection is governed by the Data Privacy Act of 2012. We only collect information necessary for service operation.</p>
              <p><strong className="text-gray-800">3. How We Use Your Information</strong><br />To process orders, manage deliveries, manage your account and rewards, respond to inquiries, and improve our platform.</p>
              <p><strong className="text-gray-800">4. Information Sharing</strong><br />We do not sell your data. We only share necessary delivery information (address, contact) with assigned drivers. No disclosure without consent unless required by law.</p>
              <p><strong className="text-gray-800">5. Data Security</strong><br />We use encryption and access controls to protect your data. Passwords are never stored in plain text.</p>
              <p><strong className="text-gray-800">6. Data Retention</strong><br />We retain data as long as your account is active. You may request deletion by contacting us.</p>
              <p><strong className="text-gray-800">7. Your Rights (RA 10173)</strong><br />You have the right to access, correct, object to processing, and request deletion of your personal data. Contact contactquickstock@gmail.com.</p>
              <p><strong className="text-gray-800">8. Cookies</strong><br />We use cookies to enhance your experience. You may disable them in browser settings, though some features may be affected.</p>
              <p><strong className="text-gray-800">9. Minors</strong><br />This platform is for adults. We do not knowingly collect data from individuals under 18.</p>
              <p><strong className="text-gray-800">10. Policy Updates</strong><br />We may update this policy. Registered users will be notified of significant changes.</p>
              <p><strong className="text-gray-800">11. Contact</strong><br />For privacy concerns: contactquickstock@gmail.com or via our Facebook page.</p>
              <div className="h-2" />
            </div>
            <div className="px-6 py-4 border-t border-gray-100 shrink-0 space-y-2">
              {!privacyScrolled && (
                <p className="text-[11px] text-center text-orange-500 font-medium">
                  ↓ Scroll to the bottom to enable agreement
                </p>
              )}
              <button onClick={() => { setPrivacyRead(true); setShowPrivacy(false) }}
                disabled={!privacyScrolled}
                className={`w-full py-2.5 font-bold rounded-xl text-sm transition
                  ${privacyScrolled ? 'bg-[#168AFF] text-white hover:bg-[#1270DB]' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                {privacyScrolled ? 'I Have Read & Agree to the Privacy Policy' : 'Read to the bottom to agree'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
