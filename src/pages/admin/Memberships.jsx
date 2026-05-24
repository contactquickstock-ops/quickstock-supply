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
}

const FILTERS = ['all', 'pending', 'active', 'rejected']

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

  const fetchMemberships = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('memberships')
      .select('*, profiles(full_name, email)')
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
    expiry.setFullYear(expiry.getFullYear() + 2)

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
    const matchFilter = filter === 'all' || m.status === filter
    return matchSearch && matchFilter
  })

  const counts = {
    total:    memberships.length,
    pending:  memberships.filter(m => m.status === 'pending').length,
    active:   memberships.filter(m => m.status === 'active').length,
    rejected: memberships.filter(m => m.status === 'rejected').length,
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
            { label: 'Total',    value: counts.total,    color: 'bg-gray-100   text-gray-600'   },
            { label: 'Pending',  value: counts.pending,  color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Active',   value: counts.active,   color: 'bg-green-100  text-green-700'  },
            { label: 'Rejected', value: counts.rejected, color: 'bg-red-100    text-red-700'    },
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
            <div className="flex gap-1">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition
                    ${filter === f
                      ? 'bg-[#168AFF] text-white'
                      : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {f}
                </button>
              ))}
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
                  {['Customer', 'Email', 'Applied', 'Status', 'Payment Proof', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={6} rows={5} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-gray-400 text-sm">
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

                    return (
                      <tr
                        key={m.id}
                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Customer */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-[#168AFF]/10 text-[#168AFF]
                                flex items-center justify-center font-bold text-sm shrink-0"
                            >
                              {initials}
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

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                              text-xs font-medium capitalize
                              ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Payment proof */}
                        <td className="px-5 py-4">
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
                        <td className="px-5 py-4">
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
                              <p className="text-gray-400">Expires</p>
                              <p className="font-medium text-gray-600 whitespace-nowrap">
                                {m.expiry_date
                                  ? new Date(m.expiry_date).toLocaleDateString('en-PH', {
                                      month: 'short', day: 'numeric', year: 'numeric',
                                    })
                                  : '—'}
                              </p>
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
