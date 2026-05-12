import { useEffect, useState, useCallback } from 'react'
import {
  MdSearch, MdCheckCircle, MdBlock, MdDirectionsCar,
  MdAdd, MdClose, MdVisibility, MdVisibilityOff,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabase } from '../../services/supabase'
import { supabaseAdmin } from '../../services/supabaseAdmin'

const STATUS_BADGE = {
  approved: 'bg-green-100 text-green-700',
  disabled: 'bg-red-100 text-red-700',
}

const EMPTY_FORM = { fullName: '', email: '', password: '', contact: '' }

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

export default function Drivers() {
  const [drivers, setDrivers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [updating, setUpdating]   = useState(null)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [formError, setFormError] = useState(null)
  const [creating, setCreating]   = useState(false)
  const [showPass, setShowPass]   = useState(false)

  const fetchDrivers = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'driver')
      .order('created_at', { ascending: false })
    if (err) {
      setError('Failed to load drivers.')
    } else {
      setDrivers(data ?? [])
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchDrivers() }, [fetchDrivers])

  async function updateStatus(driverId, newStatus) {
    setUpdating(driverId)
    setError(null)
    const { error: err } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', driverId)
    if (err) {
      setError('Failed to update status. Please try again.')
    } else {
      setDrivers(prev =>
        prev.map(d => d.id === driverId ? { ...d, status: newStatus } : d)
      )
    }
    setUpdating(null)
  }

  function openModal() {
    setForm(EMPTY_FORM)
    setFormError(null)
    setShowPass(false)
    setShowModal(true)
  }

  function closeModal() {
    if (creating) return
    setShowModal(false)
  }

  async function handleCreate(e) {
    e.preventDefault()
    const { fullName, email, password, contact } = form

    if (!fullName.trim() || !email.trim() || !password || !contact.trim()) {
      setFormError('All fields are required.')
      return
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    setCreating(true)
    setFormError(null)

    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
    })

    if (authErr) {
      setFormError(authErr.message)
      setCreating(false)
      return
    }

    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        full_name: fullName.trim(),
        email: email.trim(),
        contact_number: contact.trim(),
        role: 'driver',
        status: 'approved',
      })
      .select()
      .single()

    if (profileErr) {
      setFormError('Auth user created but profile setup failed: ' + profileErr.message)
      setCreating(false)
      return
    }

    setDrivers(prev => [profileData, ...prev])
    setCreating(false)
    setShowModal(false)
  }

  const filtered = drivers.filter(d => {
    const q = search.toLowerCase()
    return (
      (d.full_name ?? '').toLowerCase().includes(q) ||
      (d.email ?? '').toLowerCase().includes(q)
    )
  })

  const counts = {
    total:    drivers.length,
    active:   drivers.filter(d => d.status === 'approved').length,
    disabled: drivers.filter(d => d.status === 'disabled').length,
  }

  return (
    <AdminLayout pageTitle="Drivers">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Page heading */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Driver Accounts</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              Create and manage driver accounts
            </p>
          </div>
          <button
            onClick={openModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-[#00B14F] text-white text-sm font-semibold
              hover:bg-[#009940] transition shadow-sm"
          >
            <MdAdd size={18} />
            Add Driver
          </button>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',    value: counts.total,    color: 'bg-gray-100 text-gray-600' },
            { label: 'Active',   value: counts.active,   color: 'bg-green-100 text-green-700' },
            { label: 'Disabled', value: counts.disabled, color: 'bg-red-100 text-red-700' },
          ].map(({ label, value, color }) => (
            <span
              key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${color}`}
            >
              <MdDirectionsCar size={13} />
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
            <h3 className="text-gray-700 font-semibold text-base">All Drivers</h3>
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
                  focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                  w-56 transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  {['Name', 'Email', 'Contact', 'Status', 'Created', 'Actions'].map(h => (
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
                      {search
                        ? 'No drivers match your search.'
                        : 'No drivers yet. Click "Add Driver" to create one.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(driver => {
                    const status   = driver.status ?? 'approved'
                    const isBusy   = updating === driver.id
                    const created  = new Date(driver.created_at).toLocaleDateString('en-PH', {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })
                    const initials = (driver.full_name ?? '?')[0].toUpperCase()

                    return (
                      <tr
                        key={driver.id}
                        className="border-b border-gray-50 hover:bg-gray-50/70 transition-colors"
                      >
                        {/* Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-full bg-[#00B14F]/10 text-[#00B14F]
                                flex items-center justify-center font-bold text-sm shrink-0"
                            >
                              {initials}
                            </div>
                            <span className="text-gray-700 font-medium whitespace-nowrap">
                              {driver.full_name ?? '—'}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {driver.email ?? '—'}
                        </td>

                        {/* Contact */}
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {driver.contact_number ?? '—'}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full
                              text-xs font-medium capitalize
                              ${STATUS_BADGE[status] ?? 'bg-gray-100 text-gray-600'}`}
                          >
                            {status === 'approved' ? 'Active' : status}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {created}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          {status === 'approved' && (
                            <button
                              onClick={() => updateStatus(driver.id, 'disabled')}
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
                              onClick={() => updateStatus(driver.id, 'approved')}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                bg-green-50 text-green-700 hover:bg-green-100
                                text-xs font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <MdCheckCircle size={14} />
                              {isBusy ? 'Enabling…' : 'Enable'}
                            </button>
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
              Showing {filtered.length} of {drivers.length} driver{drivers.length !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Driver Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={e => { if (e.target === e.currentTarget) closeModal() }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h3 className="text-gray-800 font-bold text-base">Add New Driver</h3>
                <p className="text-gray-400 text-xs mt-0.5">Account will be active immediately</p>
              </div>
              <button
                onClick={closeModal}
                disabled={creating}
                className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                aria-label="Close"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Modal form */}
            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">

              {formError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Juan Dela Cruz"
                  value={form.fullName}
                  onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                    transition disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="driver@example.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                    transition disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    disabled={creating}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm border border-gray-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                      transition disabled:bg-gray-50 disabled:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    tabIndex={-1}
                  >
                    {showPass ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 09171234567"
                  value={form.contact}
                  onChange={e => setForm(f => ({ ...f, contact: e.target.value }))}
                  disabled={creating}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                    focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30 focus:border-[#00B14F]
                    transition disabled:bg-gray-50 disabled:text-gray-400"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600
                    border border-gray-200 rounded-xl hover:bg-gray-50
                    transition disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 text-sm font-semibold text-white
                    bg-[#00B14F] rounded-xl hover:bg-[#009940]
                    transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {creating ? 'Creating…' : 'Create Driver'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
