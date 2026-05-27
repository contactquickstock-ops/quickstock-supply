import { useEffect, useState, useCallback } from 'react'
import {
  MdSearch, MdCheckCircle, MdCancel, MdImage,
  MdClose, MdOpenInNew,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

const STATUS_BADGE = {
  pending:  'bg-yellow-100 text-yellow-700',
  active:   'bg-green-100  text-green-700',
  rejected: 'bg-red-100    text-red-700',
  expired:  'bg-gray-100   text-gray-500',
}

const EXPIRY_WARN_DAYS = 30

function daysUntilExpiry(m) {
  if (m.status !== 'active' || !m.expiry_date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.ceil((new Date(m.expiry_date) - today) / (1000 * 60 * 60 * 24))
}

function isNearExpiry(m) {
  const d = daysUntilExpiry(m)
  return d !== null && d >= 0 && d <= EXPIRY_WARN_DAYS
}

function MembershipDetailModal({ m, onClose, onApprove, onReject, acting }) {
  const isBusy      = acting === m.id
  const status      = m.status ?? 'pending'
  const name        = m.profiles?.full_name ?? '—'
  const initials    = (m.profiles?.full_name ?? '?')[0].toUpperCase()
  const applied     = new Date(m.created_at).toLocaleDateString('en-PH', {
    month: 'long', day: 'numeric', year: 'numeric',
  })
  const [proofOpen, setProofOpen] = useState(false)
  const nearExpiry  = isNearExpiry(m)
  const days        = daysUntilExpiry(m)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Membership Details</h3>
            <p className="text-gray-400 text-xs mt-0.5">Application overview</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Avatar + name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-[#168AFF]/10 text-[#168AFF]
              flex items-center justify-center font-bold text-2xl shrink-0 border-2 border-[#168AFF]/20">
              {m.profiles?.avatar_url
                ? <img src={m.profiles.avatar_url} alt={name} className="w-full h-full object-cover" />
                : initials}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-gray-800 text-base truncate">{name}</p>
              <p className="text-gray-400 text-xs truncate mt-0.5">{m.profiles?.email ?? '—'}</p>
              <span className={`inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full
                text-xs font-medium capitalize ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}>
                {status}
              </span>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {m.profiles?.contact_number && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Contact</p>
                <p className="text-gray-700 font-medium">{m.profiles.contact_number}</p>
              </div>
            )}
            {m.profiles?.store_name && (
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Store</p>
                <p className="text-gray-700 font-medium truncate">{m.profiles.store_name}</p>
              </div>
            )}
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Applied</p>
              <p className="text-gray-700 font-medium">{applied}</p>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">Type</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold
                ${m.is_renewal ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                {m.is_renewal ? 'Renewal' : 'New'}
              </span>
            </div>
            {status === 'active' && m.expiry_date && (
              <div className={`rounded-xl px-4 py-3 col-span-2
                ${nearExpiry ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                <p className={`text-[10px] font-semibold uppercase tracking-wider mb-0.5
                  ${nearExpiry ? 'text-amber-500' : 'text-gray-400'}`}>Expires</p>
                <p className={`font-medium ${nearExpiry ? 'text-amber-700' : 'text-gray-700'}`}>
                  {new Date(m.expiry_date).toLocaleDateString('en-PH', {
                    month: 'long', day: 'numeric', year: 'numeric',
                  })}
                  {nearExpiry && (
                    <span className="ml-2 text-xs font-bold text-amber-600">
                      {days === 0 ? '— Expires today!' : `— ${days} day${days !== 1 ? 's' : ''} left`}
                    </span>
                  )}
                </p>
              </div>
            )}
          </div>

          {/* Near-expiry warning banner */}
          {nearExpiry && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3
              flex items-start gap-2.5">
              <span className="text-amber-500 shrink-0 mt-0.5 text-lg">⚠️</span>
              <div>
                <p className="text-amber-800 font-bold text-xs">Expiring Soon</p>
                <p className="text-amber-700 text-xs mt-0.5 leading-relaxed">
                  This membership will expire in {days === 0 ? 'today' : `${days} day${days !== 1 ? 's' : ''}`}.
                  The customer should renew soon.
                </p>
              </div>
            </div>
          )}

          {/* Payment proof */}
          {m.payment_proof && (
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-2">Payment Proof</p>
              <button
                onClick={() => setProofOpen(true)}
                className="w-full h-40 rounded-xl overflow-hidden border border-gray-100
                  bg-gray-50 hover:border-[#168AFF] hover:ring-2 hover:ring-[#168AFF]/20
                  transition block"
                title="Click to view full size"
              >
                <img
                  src={m.payment_proof}
                  alt="Payment proof"
                  className="w-full h-full object-contain p-2"
                />
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {status === 'pending' && (
          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={() => { onReject(m); onClose() }}
              disabled={isBusy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
                bg-red-50 text-red-600 hover:bg-red-100
                text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdCancel size={16} />
              {isBusy ? 'Rejecting…' : 'Reject'}
            </button>
            <button
              onClick={() => { onApprove(m); onClose() }}
              disabled={isBusy}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl
                bg-green-50 text-green-700 hover:bg-green-100
                text-sm font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdCheckCircle size={16} />
              {isBusy ? 'Approving…' : 'Approve'}
            </button>
          </div>
        )}
        {status !== 'pending' && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full py-2.5 text-sm font-semibold text-gray-600
                border border-gray-200 rounded-xl hover:bg-gray-50 transition"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Proof lightbox */}
      {proofOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setProofOpen(false)}
        >
          <button
            onClick={() => setProofOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10
              hover:bg-white/20 text-white transition"
            aria-label="Close"
          >
            <MdClose size={22} />
          </button>
          <img
            src={m.payment_proof}
            alt="Payment proof"
            className="max-w-full max-h-[82vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <a
            href={m.payment_proof}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute bottom-6 inline-flex items-center gap-2 px-4 py-2
              bg-white/10 hover:bg-white/20 text-white text-sm font-medium
              rounded-xl transition backdrop-blur-sm"
          >
            <MdOpenInNew size={15} />
            Open full size
          </a>
        </div>
      )}
    </div>
  )
}

const FILTERS = ['all', 'pending', 'active', 'expiring', 'expired', 'rejected']

function SkeletonRows({ cols = 6, rows = 5 }) {
  return Array.from({ length: rows }, (_, i) => (
    <tr key={i} className="border-b border-gray-50">
      {Array.from({ length: cols }, (_, j) => (
        <td key={j} className="px-5 py-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded-lg" />
        </td>
      ))}
    </tr>
  ))
}

export default function Memberships() {
  const [memberships, setMemberships] = useState([])
  const [loading, setLoading]         = useState(true)
  const [search, setSearch]           = useState('')
  const [filter, setFilter]           = useState('all')
  const [error, setError]             = useState(null)
  const [acting, setActing]           = useState(null)
  const [lightbox, setLightbox]       = useState(null)
  const [detailItem, setDetailItem]   = useState(null)

  const fetchMemberships = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('memberships')
      .select('*, profiles(full_name, email, avatar_url, contact_number, store_name)')
      .order('created_at', { ascending: false })
    if (err) {
      setError('Failed to load memberships.')
    } else {
      setMemberships(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchMemberships() }, [fetchMemberships])

  async function approve(m) {
    setActing(m.id)
    setError(null)

    const today  = new Date()
    const expiry = new Date(today)
    // Renewals extend by 1 year; new memberships by 2 years
    expiry.setFullYear(expiry.getFullYear() + (m.is_renewal ? 1 : 2))

    const startDate  = today.toISOString().slice(0, 10)
    const expiryDate = expiry.toISOString().slice(0, 10)

    const [{ error: memErr }, { error: profErr }] = await Promise.all([
      supabase
        .from('memberships')
        .update({
          status:            'active',
          payment_validated: true,
          start_date:        startDate,
          expiry_date:       expiryDate,
        })
        .eq('id', m.id),

      supabase
        .from('profiles')
        .update({ membership_status: 'active' })
        .eq('id', m.user_id),
    ])

    if (memErr || profErr) {
      setError('Failed to approve membership. Please try again.')
    } else {
      setMemberships(prev =>
        prev.map(x => x.id === m.id
          ? { ...x, status: 'active', payment_validated: true, start_date: startDate, expiry_date: expiryDate }
          : x
        )
      )
    }
    setActing(null)
  }

  async function reject(m) {
    setActing(m.id)
    setError(null)
    const { error: err } = await supabase
      .from('memberships')
      .update({ status: 'rejected' })
      .eq('id', m.id)
    if (err) {
      setError('Failed to reject membership. Please try again.')
    } else {
      setMemberships(prev =>
        prev.map(x => x.id === m.id ? { ...x, status: 'rejected' } : x)
      )
    }
    setActing(null)
  }

  const filtered = memberships.filter(m => {
    const q           = search.toLowerCase()
    const matchSearch =
      (m.profiles?.full_name ?? '').toLowerCase().includes(q) ||
      (m.profiles?.email     ?? '').toLowerCase().includes(q)
    const matchFilter = filter === 'all'
      ? true
      : filter === 'expiring'
        ? isNearExpiry(m)
        : m.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total:       memberships.length,
    pending:     memberships.filter(m => m.status === 'pending').length,
    active:      memberships.filter(m => m.status === 'active').length,
    expiring:    memberships.filter(m => isNearExpiry(m)).length,
    expired:     memberships.filter(m => m.status === 'expired').length,
    rejected:    memberships.filter(m => m.status === 'rejected').length,
  }

  return (
    <AdminLayout pageTitle="Memberships">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Page heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Membership Applications</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Review and approve customer membership requests
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',         value: counts.total,    color: 'bg-gray-100   text-gray-600'   },
            { label: 'Pending',       value: counts.pending,  color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Active',        value: counts.active,   color: 'bg-green-100  text-green-700'  },
            { label: 'Expiring Soon', value: counts.expiring, color: 'bg-amber-100  text-amber-700'  },
            { label: 'Expired',       value: counts.expired,  color: 'bg-gray-100   text-gray-500'   },
            { label: 'Rejected',      value: counts.rejected, color: 'bg-red-100    text-red-700'    },
          ].map(({ label, value, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}
            >
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap items-center gap-3 justify-between">

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-1">
              {FILTERS.map(f => {
                const label = f === 'expiring' ? 'Expiring Soon' : f
                const isActive = filter === f
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition
                      ${isActive
                        ? f === 'expiring'
                          ? 'bg-amber-500 text-white'
                          : 'bg-[#168AFF] text-white'
                        : f === 'expiring' && counts.expiring > 0
                          ? 'text-amber-600 hover:bg-amber-50 border border-amber-200'
                          : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    {label}
                    {f === 'expiring' && counts.expiring > 0 && (
                      <span className={`ml-1 inline-flex items-center justify-center
                        w-4 h-4 rounded-full text-[10px] font-black
                        ${isActive ? 'bg-white text-amber-600' : 'bg-amber-500 text-white'}`}>
                        {counts.expiring}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Search */}
            <div className="relative">
              <MdSearch
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  w-56 transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  {['Customer', 'Email', 'Applied', 'Type', 'Status', 'Payment Proof', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={7} rows={5} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-gray-400 text-sm">
                      {search || filter !== 'all'
                        ? 'No memberships match your filter.'
                        : 'No membership applications yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(m => {
                    const status   = m.status ?? 'pending'
                    const isBusy   = acting === m.id
                    const name     = m.profiles?.full_name ?? '—'
                    const email    = m.profiles?.email ?? '—'
                    const initials = (m.profiles?.full_name ?? '?')[0].toUpperCase()
                    const applied  = new Date(m.created_at).toLocaleDateString('en-PH', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                    const nearExp  = isNearExpiry(m)
                    const daysLeft = daysUntilExpiry(m)

                    return (
                      <tr
                        key={m.id}
                        onClick={() => setDetailItem(m)}
                        className={`border-b border-gray-50 transition-colors cursor-pointer
                          ${nearExp
                            ? 'bg-amber-50/50 hover:bg-amber-50'
                            : 'hover:bg-gray-50/70'}`}
                      >
                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-[#168AFF]/10 text-[#168AFF]
                              flex items-center justify-center font-bold text-sm shrink-0">
                              {m.profiles?.avatar_url
                                ? <img src={m.profiles.avatar_url} alt={name} className="w-full h-full object-cover" />
                                : initials}
                            </div>
                            <span className="text-gray-700 font-medium whitespace-nowrap">
                              {name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {email}
                        </td>

                        {/* Applied */}
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {applied}
                        </td>

                        {/* Type */}
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                            text-xs font-semibold
                            ${m.is_renewal ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                            {m.is_renewal ? 'Renewal' : 'New'}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                                text-xs font-medium capitalize
                                ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}
                            >
                              {status}
                            </span>
                            {nearExp && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full
                                text-[10px] font-bold bg-amber-100 text-amber-700">
                                ⚠ {daysLeft === 0 ? 'Today' : `${daysLeft}d`}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Payment proof */}
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          {m.payment_proof ? (
                            <button
                              onClick={() => setLightbox(m.payment_proof)}
                              className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100
                                bg-gray-50 hover:border-[#168AFF] hover:ring-2 hover:ring-[#168AFF]/20
                                transition block shrink-0"
                              title="View payment proof"
                            >
                              <img
                                src={m.payment_proof}
                                alt="Payment proof"
                                className="w-full h-full object-contain p-1"
                              />
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-gray-300">
                              <MdImage size={16} />
                              None
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4" onClick={e => e.stopPropagation()}>
                          {status === 'pending' && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => approve(m)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                  bg-green-50 text-green-700 hover:bg-green-100
                                  text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdCheckCircle size={14} />
                                {isBusy ? 'Approving…' : 'Approve'}
                              </button>
                              <button
                                onClick={() => reject(m)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                  bg-red-50 text-red-600 hover:bg-red-100
                                  text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdCancel size={14} />
                                {isBusy ? 'Rejecting…' : 'Reject'}
                              </button>
                            </div>
                          )}

                          {status === 'active' && (
                            <div className="text-xs">
                              <p className={nearExp ? 'text-amber-500 font-semibold' : 'text-gray-400'}>
                                {nearExp ? '⚠ Expiring' : 'Expires'}
                              </p>
                              <p className={`font-medium whitespace-nowrap
                                ${nearExp ? 'text-amber-700' : 'text-gray-600'}`}>
                                {m.expiry_date
                                  ? new Date(m.expiry_date).toLocaleDateString('en-PH', {
                                      month: 'short', day: 'numeric', year: 'numeric',
                                    })
                                  : '—'}
                              </p>
                              {nearExp && (
                                <p className="text-amber-500 font-bold mt-0.5">
                                  {daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                                </p>
                              )}
                            </div>
                          )}

                          {status === 'rejected' && (
                            <span className="text-xs text-gray-400 italic">Rejected</span>
                          )}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {memberships.length} application{memberships.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* ── Membership Detail Modal ── */}
      {detailItem && (
        <MembershipDetailModal
          m={detailItem}
          onClose={() => setDetailItem(null)}
          onApprove={approve}
          onReject={reject}
          acting={acting}
        />
      )}

      {/* ── Payment Proof Lightbox ── */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10
              hover:bg-white/20 text-white transition"
            aria-label="Close"
          >
            <MdClose size={22} />
          </button>

          <img
            src={lightbox}
            alt="Payment proof"
            className="max-w-full max-h-[82vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />

          <a
            href={lightbox}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="absolute bottom-6 inline-flex items-center gap-2 px-4 py-2
              bg-white/10 hover:bg-white/20 text-white text-sm font-medium
              rounded-xl transition backdrop-blur-sm"
          >
            <MdOpenInNew size={15} />
            Open full size
          </a>
        </div>
      )}
    </AdminLayout>
  )
}
