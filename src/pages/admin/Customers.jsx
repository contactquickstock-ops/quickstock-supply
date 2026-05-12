import { useEffect, useState, useCallback } from 'react'
import { MdSearch, MdCheckCircle, MdBlock, MdPeople } from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'

const STATUS_BADGE = {
  approved: 'bg-green-100 text-green-700',
  pending:  'bg-yellow-100 text-yellow-700',
  disabled: 'bg-red-100 text-red-700',
}

function SkeletonRows({ cols = 6, rows = 6 }) {
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

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [updating, setUpdating]   = useState(null)
  const [error, setError]         = useState(null)

  const fetchCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'customer')
      .order('created_at', { ascending: false })
    if (err) {
      setError('Failed to load customers.')
    } else {
      setCustomers(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  async function updateStatus(customerId, newStatus) {
    setUpdating(customerId)
    setError(null)
    const { error: err } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', customerId)
    if (err) {
      setError('Failed to update status. Please try again.')
    } else {
      setCustomers(prev =>
        prev.map(c => c.id === customerId ? { ...c, status: newStatus } : c)
      )
    }
    setUpdating(null)
  }

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    return (
      (c.full_name ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q)
    )
  })

  const counts = {
    total:    customers.length,
    pending:  customers.filter(c => c.status === 'pending').length,
    approved: customers.filter(c => c.status === 'approved').length,
    disabled: customers.filter(c => c.status === 'disabled').length,
  }

  return (
    <AdminLayout pageTitle="Customers">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Page heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Customer Accounts</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage and approve registered customer accounts
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',    value: counts.total,    color: 'bg-gray-100 text-gray-600' },
            { label: 'Pending',  value: counts.pending,  color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Approved', value: counts.approved, color: 'bg-green-100 text-green-700' },
            { label: 'Disabled', value: counts.disabled, color: 'bg-red-100 text-red-700' },
          ].map(({ label, value, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}
            >
              <MdPeople size={13} />
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
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-gray-700 font-semibold text-base">All Customers</h3>
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
                  focus:outline-none focus:ring-2 focus:ring-[#1A2E74]/30 focus:border-[#1A2E74]
                  w-56 transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  {['Customer', 'Email', 'Contact', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={6} rows={6} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-14 text-center text-gray-400 text-sm">
                      {search ? 'No customers match your search.' : 'No customers found.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(customer => {
                    const status    = customer.status ?? 'pending'
                    const isBusy    = updating === customer.id
                    const joined    = new Date(customer.created_at).toLocaleDateString('en-PH', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                    const initials  = (customer.full_name ?? '?')[0].toUpperCase()

                    return (
                      <tr
                        key={customer.id}
                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Customer (photo + name) */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0
                              bg-[#1A2E74]/10 flex items-center justify-center">
                              {customer.avatar_url ? (
                                <img
                                  src={customer.avatar_url}
                                  alt={customer.full_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-[#1A2E74] font-bold text-sm">
                                  {initials}
                                </span>
                              )}
                            </div>
                            <span className="text-gray-700 font-medium whitespace-nowrap">
                              {customer.full_name ?? '—'}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {customer.email ?? '—'}
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {customer.contact_number ?? '—'}
                        </td>

                        {/* Status badge */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                              text-xs font-medium capitalize
                              ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {status}
                          </span>
                        </td>

                        {/* Joined date */}
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {joined}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {status === 'pending' && (
                              <button
                                onClick={() => updateStatus(customer.id, 'approved')}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                  bg-green-50 text-green-700 hover:bg-green-100
                                  text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdCheckCircle size={14} />
                                {isBusy ? 'Approving…' : 'Approve'}
                              </button>
                            )}

                            {status === 'approved' && (
                              <button
                                onClick={() => updateStatus(customer.id, 'disabled')}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                  bg-red-50 text-red-600 hover:bg-red-100
                                  text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdBlock size={14} />
                                {isBusy ? 'Disabling…' : 'Disable'}
                              </button>
                            )}

                            {status === 'disabled' && (
                              <button
                                onClick={() => updateStatus(customer.id, 'approved')}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                  bg-green-50 text-green-700 hover:bg-green-100
                                  text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdCheckCircle size={14} />
                                {isBusy ? 'Enabling…' : 'Enable'}
                              </button>
                            )}
                          </div>
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
              Showing {filtered.length} of {customers.length} customer{customers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>

      </div>
    </AdminLayout>
  )
}
