import { useEffect, useState, useCallback } from 'react'
import {
  MdSearch, MdCheckCircle, MdBlock, MdPeople,
  MdDelete, MdClose, MdRefresh,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import toast, { Toaster } from 'react-hot-toast'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG = {
  approved: { label: 'Approved', badge: 'bg-green-100 text-green-700'  },
  pending:  { label: 'Pending',  badge: 'bg-yellow-100 text-yellow-700' },
  rejected: { label: 'Rejected', badge: 'bg-red-100 text-red-700'      },
  disabled: { label: 'Disabled', badge: 'bg-orange-100 text-orange-700' },
}

const FILTER_TABS = ['all', 'pending', 'approved', 'rejected', 'disabled']

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
          <div>
            <h3 className="font-bold text-gray-800 text-base">
              {isBulk ? `Permanently Delete ${bulkCount} Accounts` : 'Permanently Delete Account'}
            </h3>
            {!isBulk && target && (
              <p className="text-gray-400 text-xs mt-0.5">{target.full_name} · {target.email}</p>
            )}
          </div>
          <button onClick={onClose} disabled={submitting}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50">
            <MdClose size={20} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 leading-relaxed">
            {isBulk
              ? `You are about to permanently delete ${bulkCount} selected account${bulkCount > 1 ? 's' : ''}. Their login access, profile data, and account history will be removed from the system.`
              : `You are about to permanently delete the account of "${target?.full_name}". Their login access and profile data will be removed immediately.`}
          </div>
          <div className="flex items-start gap-2 text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
            <span className="text-red-500 font-bold mt-0.5">!</span>
            <span>This action is <strong className="text-gray-700">irreversible</strong>. The account cannot be recovered once deleted.</span>
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
            {submitting
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Deleting…
                </span>
              : 'Permanently Delete'}
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

  async function cleanupCustomerRefs(ids) {
    // Nullify orders — preserve history, just remove the customer/driver link
    await supabase.from('orders').update({ customer_id: null }).in('customer_id', ids)
    // Delete all customer-owned records
    await supabase.from('messages').delete().in('sender_id', ids)
    await supabase.from('memberships').delete().in('user_id', ids)
    await supabase.from('redeemed_rewards').delete().in('customer_id', ids)
    await supabase.from('customer_points').delete().in('customer_id', ids)
  }

  async function hardDelete(id) {
    setSubmitting(true)

    // Step 1 — remove all FK-referencing records for this customer
    const { error: cleanErr } = await (async () => {
      try {
        await cleanupCustomerRefs([id])
        return {}
      } catch (e) {
        return { error: e }
      }
    })()
    if (cleanErr) {
      toast.error('Cleanup failed: ' + cleanErr.message)
      setSubmitting(false)
      return
    }

    // Step 2 — delete profile
    const { error: profileErr } = await supabase.from('profiles').delete().eq('id', id)
    if (profileErr) {
      toast.error('Could not remove profile: ' + profileErr.message)
      setSubmitting(false)
      return
    }

    // Step 3 — delete auth user
    const { error: authErr } = await supabase.auth.admin.deleteUser(id)
    if (authErr) {
      toast.error('Profile removed but auth deletion failed: ' + authErr.message)
    } else {
      toast.success('Account permanently deleted.')
    }

    setCustomers(prev => prev.filter(c => c.id !== id))
    setDeleteTarget(null)
    setSubmitting(false)
  }

  async function bulkHardDelete() {
    setSubmitting(true)
    const ids = [...selected]

    // Step 1 — remove all FK-referencing records
    await cleanupCustomerRefs(ids)

    // Step 2 — delete profiles
    await supabase.from('profiles').delete().in('id', ids)

    // Step 3 — delete auth users
    const results = await Promise.all(
      ids.map(id => supabase.auth.admin.deleteUser(id))
    )
    const failed = results.filter(r => r.error).length
    if (failed > 0) {
      toast.error(`${failed} auth account(s) could not be fully deleted.`)
    } else {
      toast.success(`${ids.length} account(s) permanently deleted.`)
    }

    setCustomers(prev => prev.filter(c => !ids.includes(c.id)))
    setSelected(new Set())
    setShowBulkDel(false)
    setSubmitting(false)
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
      <Toaster position="top-right" />
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

                          {/* Delete (all statuses) */}
                          <button onClick={() => setDeleteTarget(customer)}
                            disabled={isBusy}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg
                              bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600
                              text-[11px] font-semibold transition disabled:opacity-50">
                            <MdDelete size={13} />
                            Delete
                          </button>
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
          onConfirm={() => hardDelete(deleteTarget.id)}
          onClose={() => setDeleteTarget(null)}
          submitting={submitting}
        />
      )}

      {/* ── Bulk Delete Modal ── */}
      {showBulkDel && (
        <DeleteModal
          target={null}
          bulkCount={selected.size}
          onConfirm={bulkHardDelete}
          onClose={() => setShowBulkDel(false)}
          submitting={submitting}
        />
      )}
    </AdminLayout>
  )
}
