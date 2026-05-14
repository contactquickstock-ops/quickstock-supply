import { useEffect, useState, useCallback } from 'react'
import {
  MdSearch, MdCheckCircle, MdBlock, MdPeople,
  MdDelete, MdClose, MdRefresh, MdSelectAll,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  approved: { label: 'Approved', badge: 'bg-green-100 text-green-700'  },
  pending:  { label: 'Pending',  badge: 'bg-yellow-100 text-yellow-700' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700'      },
  disabled: { label: 'Disabled', badge: 'bg-orange-100 text-orange-700' },
  deleted:  { label: 'Deleted',  badge: 'bg-gray-100 text-gray-500'    },
}

const FILTER_TABS = ['all', 'pending', 'approved', 'rejected', 'disabled', 'deleted']

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRows({ cols = 7, rows = 6 }) {
  return Array.from({ length: rows }, (_, i) => (
    <tr key={i} className="border-b border-gray-50">
      {Array.from({ length: cols }, (_, j) => (
        <td key={j} className="px-4 py-4">
          <div className="h-4 bg-gray-100 animate-pulse rounded-lg" />
        </td>
      ))}
    </tr>
  ))
}

// ── Reject Modal ──────────────────────────────────────────────────────────────

function RejectModal({ customer, onConfirm, onClose, submitting }) {
  const [reason, setReason] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !submitting) onClose() }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-800 text-base">Reject Account</h3>
            <p className="text-gray-400 text-xs mt-0.5">{customer.full_name} · {customer.email}</p>
          </div>
          <button onClick={onClose} disabled={submitting}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50">
            <MdClose size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700">
            This account will be rejected and the user will not be able to log in.
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Rejection Reason <span className="text-gray-400 font-normal">(shown to user)</span>
            </label>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              placeholder="e.g. Incomplete information, duplicate account…"
              rows={3} disabled={submitting}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-red-400
                transition disabled:bg-gray-50 resize-none" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={() => onConfirm(customer.id, reason.trim())} disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white
              bg-red-500 rounded-xl hover:bg-red-600 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Rejecting…' : 'Confirm Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Delete Confirmation Modal ─────────────────────────────────────────────────

function DeleteModal({ target, bulkCount, onConfirm, onClose, submitting }) {
  const isBulk = bulkCount > 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !submitting) onClose() }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-base">
            {isBulk ? `Delete ${bulkCount} Accounts` : 'Delete Account'}
          </h3>
          <button onClick={onClose} disabled={submitting}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50">
            <MdClose size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-700 leading-relaxed">
            {isBulk
              ? `You are about to delete ${bulkCount} selected account${bulkCount > 1 ? 's' : ''}. This action marks them as deleted and blocks all future logins.`
              : `You are about to delete the account of "${target?.full_name}". This will block their login immediately.`}
            <span className="block mt-2 font-semibold">This action can be reviewed later by the admin.</span>
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50 transition disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={submitting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-white
              bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Deleting…' : 'Confirm Delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Customers() {
  const [customers,    setCustomers]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [search,       setSearch]       = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selected,     setSelected]     = useState(new Set())
  const [updating,     setUpdating]     = useState(null)
  const [submitting,   setSubmitting]   = useState(false)
  const [error,        setError]        = useState(null)

  // Modals
  const [rejectTarget,  setRejectTarget]  = useState(null)
  const [deleteTarget,  setDeleteTarget]  = useState(null)  // null = bulk
  const [showBulkDel,   setShowBulkDel]   = useState(false)

  // ── Fetch ────────────────────────────────────────────────────────────────────

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
    if (err) setError('Failed to load customers.')
    else     setCustomers(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  // ── Status actions ───────────────────────────────────────────────────────────

  async function setStatus(id, status) {
    setUpdating(id)
    await supabase.from('profiles').update({ status }).eq('id', id)
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    setUpdating(null)
  }

  async function rejectCustomer(id, reason) {
    setSubmitting(true)
    await supabase.from('profiles')
      .update({ status: 'rejected', rejected_reason: reason || null })
      .eq('id', id)
    setCustomers(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'rejected', rejected_reason: reason || null } : c
    ))
    setRejectTarget(null)
    setSubmitting(false)
  }

  async function softDelete(id) {
    setSubmitting(true)
    await supabase.from('profiles')
      .update({ status: 'deleted', deleted_at: new Date().toISOString() })
      .eq('id', id)
    setCustomers(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'deleted', deleted_at: new Date().toISOString() } : c
    ))
    setDeleteTarget(null)
    setSubmitting(false)
  }

  async function bulkSoftDelete() {
    setSubmitting(true)
    const ids = [...selected]
    const now = new Date().toISOString()
    await supabase.from('profiles')
      .update({ status: 'deleted', deleted_at: now })
      .in('id', ids)
    setCustomers(prev => prev.map(c =>
      ids.includes(c.id) ? { ...c, status: 'deleted', deleted_at: now } : c
    ))
    setSelected(new Set())
    setShowBulkDel(false)
    setSubmitting(false)
  }

  async function restoreCustomer(id) {
    setUpdating(id)
    await supabase.from('profiles')
      .update({ status: 'pending', deleted_at: null })
      .eq('id', id)
    setCustomers(prev => prev.map(c =>
      c.id === id ? { ...c, status: 'pending', deleted_at: null } : c
    ))
    setUpdating(null)
  }

  // ── Selection helpers ────────────────────────────────────────────────────────

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === visibleIds.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(visibleIds))
    }
  }

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = (c.full_name ?? '').toLowerCase().includes(q) ||
                        (c.email ?? '').toLowerCase().includes(q)
    const matchFilter = activeFilter === 'all' || c.status === activeFilter
    return matchSearch && matchFilter
  })

  const visibleIds = filtered.map(c => c.id)
  const allChecked = visibleIds.length > 0 && visibleIds.every(id => selected.has(id))
  const someChecked = selected.size > 0

  const counts = FILTER_TABS.reduce((acc, f) => {
    acc[f] = f === 'all' ? customers.length : customers.filter(c => c.status === f).length
    return acc
  }, {})

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <AdminLayout pageTitle="Customers">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Heading */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Customer Accounts</h2>
            <p className="text-gray-400 text-sm mt-0.5">Manage, approve, reject, or remove customers</p>
          </div>
          <button onClick={fetchCustomers} disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200
              text-gray-500 text-sm font-medium hover:bg-gray-50 transition disabled:opacity-50">
            <MdRefresh size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1.5">
          {FILTER_TABS.map(f => (
            <button key={f} onClick={() => { setActiveFilter(f); setSelected(new Set()) }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition
                ${activeFilter === f
                  ? 'bg-[#168AFF] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-500 hover:border-[#168AFF] hover:text-[#168AFF]'}`}>
              {f === 'all' ? 'All' : STATUS_CFG[f]?.label} ({counts[f] ?? 0})
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <h3 className="text-gray-700 font-semibold text-base">
                {filtered.length} {activeFilter === 'all' ? '' : STATUS_CFG[activeFilter]?.label + ' '}
                customer{filtered.length !== 1 ? 's' : ''}
              </h3>
              {someChecked && (
                <span className="text-xs text-[#168AFF] font-semibold">
                  {selected.size} selected
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk delete button */}
              {someChecked && (
                <button onClick={() => setShowBulkDel(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl
                    bg-red-50 text-red-600 border border-red-100 text-xs font-semibold
                    hover:bg-red-100 transition">
                  <MdDelete size={14} />
                  Delete Selected ({selected.size})
                </button>
              )}

              {/* Search */}
              <div className="relative">
                <MdSearch size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input type="text" placeholder="Search name or email…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                    w-48 transition" />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  {/* Select all checkbox */}
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleSelectAll}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition
                        ${allChecked ? 'bg-[#168AFF] border-[#168AFF]' : 'border-gray-300 hover:border-[#168AFF]'}`}>
                      {allChecked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                        <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>}
                    </button>
                  </th>
                  {['Customer', 'Email', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={7} rows={6} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center text-gray-400 text-sm">
                      {search ? 'No customers match your search.' : `No ${activeFilter === 'all' ? '' : activeFilter + ' '}customers yet.`}
                    </td>
                  </tr>
                ) : filtered.map(customer => {
                  const status   = customer.status ?? 'pending'
                  const cfg      = STATUS_CFG[status] ?? STATUS_CFG.pending
                  const isBusy   = updating === customer.id
                  const isChecked = selected.has(customer.id)
                  const initials = (customer.full_name ?? '?')[0].toUpperCase()
                  const joined   = new Date(customer.created_at).toLocaleDateString('en-PH', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  })

                  return (
                    <tr key={customer.id}
                      className={`border-b border-gray-50 transition-colors
                        ${isChecked ? 'bg-blue-50/40' : 'hover:bg-gray-50/70'}`}>

                      {/* Checkbox */}
                      <td className="px-4 py-4">
                        <button onClick={() => toggleSelect(customer.id)}
                          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition shrink-0
                            ${isChecked ? 'bg-[#168AFF] border-[#168AFF]' : 'border-gray-300 hover:border-[#168AFF]'}`}>
                          {isChecked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                            <path d="M1 3.5L3.2 5.5L8 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>}
                        </button>
                      </td>

                      {/* Name + avatar */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden shrink-0
                            bg-[#168AFF]/10 text-[#168AFF] flex items-center justify-center font-bold text-sm">
                            {customer.avatar_url
                              ? <img src={customer.avatar_url} alt={customer.full_name} className="w-full h-full object-cover" />
                              : initials}
                          </div>
                          <div className="min-w-0">
                            <p className="text-gray-700 font-medium truncate max-w-30">
                              {customer.full_name ?? '—'}
                            </p>
                            {status === 'rejected' && customer.rejected_reason && (
                              <p className="text-[10px] text-red-400 truncate max-w-30" title={customer.rejected_reason}>
                                ✗ {customer.rejected_reason}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {customer.email ?? '—'}
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                        {customer.contact_number ?? '—'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                          text-xs font-semibold ${cfg.badge}`}>
                          {cfg.label}
                        </span>
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-4 text-gray-400 text-xs whitespace-nowrap">
                        {joined}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">

                          {/* Approve (pending, rejected) */}
                          {['pending', 'rejected'].includes(status) && (
                            <button onClick={() => setStatus(customer.id, 'approved')}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-green-50 text-green-700 hover:bg-green-100
                                text-[11px] font-semibold transition disabled:opacity-50">
                              <MdCheckCircle size={13} />
                              {isBusy ? '…' : 'Approve'}
                            </button>
                          )}

                          {/* Reject (pending only) */}
                          {status === 'pending' && (
                            <button onClick={() => setRejectTarget(customer)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-red-50 text-red-600 hover:bg-red-100
                                text-[11px] font-semibold transition disabled:opacity-50">
                              <MdClose size={13} />
                              Reject
                            </button>
                          )}

                          {/* Disable (approved only) */}
                          {status === 'approved' && (
                            <button onClick={() => setStatus(customer.id, 'disabled')}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-orange-50 text-orange-600 hover:bg-orange-100
                                text-[11px] font-semibold transition disabled:opacity-50">
                              <MdBlock size={13} />
                              {isBusy ? '…' : 'Disable'}
                            </button>
                          )}

                          {/* Enable (disabled only) */}
                          {status === 'disabled' && (
                            <button onClick={() => setStatus(customer.id, 'approved')}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-green-50 text-green-700 hover:bg-green-100
                                text-[11px] font-semibold transition disabled:opacity-50">
                              <MdCheckCircle size={13} />
                              {isBusy ? '…' : 'Enable'}
                            </button>
                          )}

                          {/* Restore (deleted only) */}
                          {status === 'deleted' && (
                            <button onClick={() => restoreCustomer(customer.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-blue-50 text-blue-600 hover:bg-blue-100
                                text-[11px] font-semibold transition disabled:opacity-50">
                              <MdRefresh size={13} />
                              {isBusy ? '…' : 'Restore'}
                            </button>
                          )}

                          {/* Delete (all except already deleted) */}
                          {status !== 'deleted' && (
                            <button onClick={() => setDeleteTarget(customer)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                                bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600
                                text-[11px] font-semibold transition disabled:opacity-50">
                              <MdDelete size={13} />
                              Delete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400 flex items-center justify-between">
              <span>
                Showing {filtered.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
              </span>
              {someChecked && (
                <span className="text-[#168AFF] font-semibold">
                  {selected.size} selected
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Reject Modal ── */}
      {rejectTarget && (
        <RejectModal
          customer={rejectTarget}
          onConfirm={rejectCustomer}
          onClose={() => setRejectTarget(null)}
          submitting={submitting}
        />
      )}

      {/* ── Single Delete Modal ── */}
      {deleteTarget && (
        <DeleteModal
          target={deleteTarget}
          bulkCount={0}
          onConfirm={() => softDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
          submitting={submitting}
        />
      )}

      {/* ── Bulk Delete Modal ── */}
      {showBulkDel && (
        <DeleteModal
          target={null}
          bulkCount={selected.size}
          onConfirm={bulkSoftDelete}
          onClose={() => setShowBulkDel(false)}
          submitting={submitting}
        />
      )}
    </AdminLayout>
  )
}
