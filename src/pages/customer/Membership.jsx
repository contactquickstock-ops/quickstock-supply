import { useEffect, useState, useRef } from 'react'
import {
  MdCardMembership, MdCheckCircle, MdPending,
  MdCancel, MdImage, MdStar, MdUpload, MdWarning,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ── Member benefits list ──────────────────────────────────────────────────────

const BENEFITS = [
  'Exclusive member-only discounts',
  'Priority order processing',
  'Earn and redeem reward points',
  'Free delivery on orders ₱500 and above',
  'Access to member-exclusive products',
  'Dedicated customer support',
]

// ── Active Membership Card ────────────────────────────────────────────────────

function ActiveCard({ membership, profile }) {
  const fmtDate = iso =>
    new Date(iso).toLocaleDateString('en-PH', {
      month: 'long', day: 'numeric', year: 'numeric',
    })

  return (
    <div className="space-y-5 max-w-lg mx-auto">

      {/* Membership card */}
      <div className="relative bg-gradient-to-br from-[#168AFF] to-[#007A38]
        rounded-2xl p-6 text-white shadow-lg overflow-hidden">

        {/* Background decoration */}
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full
          bg-white/10 pointer-events-none" />
        <div className="absolute -bottom-10 -left-6 w-40 h-40 rounded-full
          bg-white/5 pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <MdCardMembership size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white/70 text-xs font-medium">QuickStock</p>
              <p className="text-white font-bold text-base leading-tight">Member</p>
            </div>
          </div>
          <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
            ACTIVE
          </span>
        </div>

        {/* Name */}
        <p className="relative z-10 mt-5 text-white font-bold text-xl tracking-wide">
          {profile?.full_name ?? '—'}
        </p>

        {/* Dates */}
        <div className="relative z-10 mt-4 flex gap-8">
          {membership?.start_date && (
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Member Since</p>
              <p className="text-white font-semibold text-sm mt-0.5">
                {fmtDate(membership.start_date)}
              </p>
            </div>
          )}
          {membership?.expiry_date && (
            <div>
              <p className="text-white/60 text-[10px] uppercase tracking-wider">Valid Until</p>
              <p className="text-white font-semibold text-sm mt-0.5">
                {fmtDate(membership.expiry_date)}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-gray-700 font-bold text-sm mb-4 flex items-center gap-2">
          <MdStar size={16} className="text-yellow-400" />
          Your Member Benefits
        </h3>
        <ul className="space-y-2.5">
          {BENEFITS.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <MdCheckCircle size={16} className="text-[#168AFF] shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{b}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── Pending State ─────────────────────────────────────────────────────────────

function PendingCard({ membership }) {
  const submittedDate = membership?.created_at
    ? new Date(membership.created_at).toLocaleDateString('en-PH', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-yellow-100 shadow-sm p-8
        flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center">
          <MdPending size={32} className="text-yellow-500" />
        </div>
        <div>
          <h3 className="text-gray-800 font-bold text-lg">Application Under Review</h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            We received your membership application. Our team will review your
            payment proof and get back to you within 1–3 business days.
          </p>
        </div>
        {submittedDate && (
          <div className="bg-yellow-50 rounded-xl px-4 py-2.5 w-full">
            <p className="text-yellow-700 text-xs font-semibold text-center">
              Submitted on {submittedDate}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Rejected State ────────────────────────────────────────────────────────────

function RejectedCard({ onReapply }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8
        flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <MdCancel size={32} className="text-red-400" />
        </div>
        <div>
          <h3 className="text-gray-800 font-bold text-lg">Application Not Approved</h3>
          <p className="text-gray-400 text-sm mt-2 leading-relaxed">
            Your previous membership application was not approved. Please ensure
            your payment proof is clear and valid, then apply again.
          </p>
        </div>
        <button
          onClick={onReapply}
          className="mt-1 px-6 py-2.5 bg-[#168AFF] text-white rounded-xl
            font-semibold text-sm hover:bg-[#1270DB] transition shadow-sm"
        >
          Apply Again
        </button>
      </div>
    </div>
  )
}

// ── Expired State ─────────────────────────────────────────────────────────────

function ExpiredCard({ membership, onRenew }) {
  const expiredDate = membership?.expiry_date
    ? new Date(membership.expiry_date).toLocaleDateString('en-PH', {
        month: 'long', day: 'numeric', year: 'numeric',
      })
    : null

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8
        flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
          <MdCardMembership size={32} className="text-gray-400" />
        </div>
        <div>
          <h3 className="text-gray-800 font-bold text-lg">Membership Expired</h3>
          {expiredDate && (
            <p className="text-gray-400 text-xs mt-1">Expired on {expiredDate}</p>
          )}
          <p className="text-gray-500 text-sm mt-3 leading-relaxed">
            Your membership has expired. You can no longer earn reward points on new orders,
            but your existing points are still valid — you can still redeem them for rewards.
          </p>
        </div>
        <div className="w-full bg-[#168AFF]/5 border border-[#168AFF]/20 rounded-2xl px-5 py-4 text-left">
          <p className="text-[#168AFF] font-bold text-sm">Renew Membership — ₱1,000</p>
          <p className="text-gray-500 text-xs mt-1 leading-relaxed">
            Pay the ₱1,000 renewal fee and upload your proof of payment.
            Once approved by admin, you'll start earning points again.
          </p>
        </div>
        <button
          onClick={onRenew}
          className="w-full py-3 bg-[#168AFF] text-white rounded-xl
            font-bold text-sm hover:bg-[#1270DB] transition shadow-sm"
        >
          Renew Membership
        </button>
      </div>
    </div>
  )
}

// ── Apply Form ────────────────────────────────────────────────────────────────

function ApplyForm({ onSubmitted, isRenewal = false }) {
  const { user }           = useAuth()
  const [imageFile, setImageFile]     = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [submitting, setSubmitting]   = useState(false)
  const [formError, setFormError]     = useState(null)
  const fileInputRef                  = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    e.target.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!imageFile) {
      setFormError('Please upload your payment proof image.')
      return
    }

    setSubmitting(true)
    setFormError(null)

    try {
      // 1. Upload payment proof to storage
      const ext      = imageFile.type.split('/')[1] || 'jpg'
      const fileName = `proof-${user.id}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('memberships')
        .upload(fileName, imageFile, { contentType: imageFile.type, upsert: false })
      if (uploadErr) throw new Error(uploadErr.message)

      const { data: urlData } = supabase.storage
        .from('memberships')
        .getPublicUrl(fileName)
      const paymentProof = urlData.publicUrl

      // 2. Insert membership application
      const { error: insertErr } = await supabase
        .from('memberships')
        .insert({
          user_id:       user.id,
          status:        'pending',
          payment_proof: paymentProof,
        })
      if (insertErr) throw new Error(insertErr.message)

      toast.success("Application submitted! We'll review it shortly.", { duration: 4000 })
      onSubmitted()
    } catch (err) {
      setFormError(err.message)
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5 max-w-lg mx-auto">

      {/* Benefits preview */}
      <div className="bg-gradient-to-br from-[#168AFF]/8 to-[#168AFF]/3
        border border-[#168AFF]/20 rounded-2xl p-5">
        <h3 className="text-gray-700 font-bold text-sm mb-3 flex items-center gap-2">
          <MdStar size={16} className="text-yellow-400" />
          Membership Benefits
        </h3>
        <ul className="space-y-2">
          {BENEFITS.map((b, i) => (
            <li key={i} className="flex items-start gap-2.5">
              <MdCheckCircle size={15} className="text-[#168AFF] shrink-0 mt-0.5" />
              <span className="text-gray-600 text-sm">{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Application form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <h3 className="text-gray-800 font-bold text-base mb-1">
          {isRenewal ? 'Renew Membership' : 'Apply for Membership'}
        </h3>
        <p className="text-gray-400 text-xs mb-5">
          {isRenewal
            ? 'Pay the ₱1,000 renewal fee and upload your proof of payment (receipt photo or GCash screenshot). Once approved, your membership will be reactivated and you\'ll start earning points again.'
            : 'Upload your payment proof to start your application. This should be a clear photo of your official receipt, or a screenshot of your GCash payment confirmation.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700
              text-sm px-4 py-3 rounded-xl">
              {formError}
            </div>
          )}

          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Payment Proof <span className="text-red-500">*</span>
              <span className="text-gray-400 font-normal ml-1">
                (receipt photo or GCash screenshot)
              </span>
            </label>
            <div
              onClick={() => !submitting && fileInputRef.current?.click()}
              className={`relative w-full h-48 rounded-xl border-2 border-dashed
                flex items-center justify-center overflow-hidden cursor-pointer
                transition-colors group
                ${imagePreview
                  ? 'border-transparent'
                  : 'border-gray-200 hover:border-[#168AFF]'}`}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Payment proof preview"
                    className="w-full h-full object-contain p-2"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                    transition-colors flex items-center justify-center">
                    <span className="text-white text-xs font-semibold opacity-0
                      group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      <MdUpload size={14} />
                      Change image
                    </span>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 select-none px-4 text-center">
                  <MdImage size={36} />
                  <span className="text-xs text-gray-500 font-medium">
                    Click to upload payment proof
                  </span>
                  <span className="text-[11px] text-gray-400 leading-relaxed">
                    Take a photo of your <strong className="text-gray-500">official receipt</strong>, or
                    upload a <strong className="text-gray-500">GCash payment screenshot</strong>
                  </span>
                  <span className="text-[10px] text-gray-300">JPG, PNG, or WEBP</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={submitting}
              className="hidden"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
              hover:bg-[#1270DB] active:scale-[0.98] transition-all shadow-sm
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Application'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Membership() {
  const { user, profile }               = useAuth()
  const [membership, setMembership]     = useState(undefined)
  const [showApply, setShowApply]       = useState(false)
  const [isRenewal, setIsRenewal]       = useState(false)
  const [localExpired, setLocalExpired] = useState(false)

  // ── Fetch latest membership record ─────────────────────────────────────────
  function fetchMembership() {
    if (!user) return
    supabase
      .from('memberships')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setMembership(data ?? null))
  }

  useEffect(() => { fetchMembership() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Lazy expiry: if active membership has passed its expiry_date, expire it ─
  useEffect(() => {
    if (!membership || !user) return
    if (membership.status !== 'active' || !membership.expiry_date) return

    const today  = new Date(); today.setHours(0, 0, 0, 0)
    const expiry = new Date(membership.expiry_date)

    if (today > expiry) {
      setLocalExpired(true)
      setMembership(prev => ({ ...prev, status: 'expired' }))
      supabase.from('memberships').update({ status: 'expired' }).eq('id', membership.id)
      supabase.from('profiles').update({ membership_status: null }).eq('id', user.id)
    }
  }, [membership?.id, membership?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ───────────────────────────────────────────────────────────
  const expiryDate     = membership?.expiry_date ? new Date(membership.expiry_date) : null
  const todayMidnight  = (() => { const d = new Date(); d.setHours(0,0,0,0); return d })()
  const isExpiredByDate = expiryDate && todayMidnight > expiryDate

  const isActive      = profile?.membership_status === 'active' && !isExpiredByDate && !localExpired
  const isExpired     = (membership?.status === 'expired' || isExpiredByDate || localExpired) && !showApply
  const isPending     = !isActive && !isExpired && membership?.status === 'pending'
  const isRejected    = !isActive && !isExpired && membership?.status === 'rejected' && !showApply
  const loading       = membership === undefined

  // Days until expiry — for warning banner when still active
  const msPerDay      = 1000 * 60 * 60 * 24
  const daysUntilExp  = isActive && expiryDate
    ? Math.ceil((expiryDate - new Date()) / msPerDay)
    : null
  const expiringSoon  = daysUntilExp !== null && daysUntilExp >= 0 && daysUntilExp <= 3

  function handleSubmitted() {
    setShowApply(false)
    setIsRenewal(false)
    fetchMembership()
  }

  return (
    <CustomerLayout>
      <div className="space-y-5">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Membership</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            {isActive ? 'Your membership is active' : 'Become a QuickStock member'}
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div className="max-w-lg mx-auto space-y-4">
            <div className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            <div className="h-48 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          </div>

        ) : isActive ? (
          <div className="space-y-4">
            {/* 3-day expiry warning */}
            {expiringSoon && (
              <div className="max-w-lg mx-auto bg-amber-50 border border-amber-200
                rounded-2xl px-5 py-4 flex items-start gap-3">
                <MdWarning size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-bold text-sm">Membership Expiring Soon</p>
                  <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                    {daysUntilExp === 0
                      ? 'Your membership expires today!'
                      : `Your membership expires in ${daysUntilExp} day${daysUntilExp !== 1 ? 's' : ''}.`}
                    {' '}Renew before it expires to keep earning points and enjoying member benefits.
                  </p>
                </div>
              </div>
            )}
            <ActiveCard membership={membership} profile={profile} />
          </div>

        ) : isExpired ? (
          <ExpiredCard
            membership={membership}
            onRenew={() => { setIsRenewal(true); setShowApply(true) }}
          />

        ) : isPending ? (
          <PendingCard membership={membership} />

        ) : isRejected ? (
          <RejectedCard onReapply={() => { setIsRenewal(false); setShowApply(true) }} />

        ) : (
          <ApplyForm isRenewal={isRenewal} onSubmitted={handleSubmitted} />
        )}
      </div>
    </CustomerLayout>
  )
}
