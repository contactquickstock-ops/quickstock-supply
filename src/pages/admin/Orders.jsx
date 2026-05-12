import { useEffect, useState, useCallback } from 'react'
import {
  MdSearch, MdCheckCircle, MdDirectionsCar, MdCancel,
  MdClose, MdLocationOn, MdNotes, MdImage,
} from 'react-icons/md'
import AdminLayout from '../../layouts/AdminLayout'
import { supabase } from '../../services/supabase'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700',  label: 'Pending'    },
  confirmed:  { color: 'bg-blue-100   text-blue-700',    label: 'Confirmed'  },
  assigned:   { color: 'bg-purple-100 text-purple-700',  label: 'Assigned'   },
  on_the_way: { color: 'bg-orange-100 text-orange-700',  label: 'On the Way' },
  delivered:  { color: 'bg-green-100  text-green-700',   label: 'Delivered'  },
  cancelled:  { color: 'bg-red-100    text-red-700',     label: 'Cancelled'  },
}

const FILTERS = ['all', 'pending', 'confirmed', 'assigned', 'on_the_way', 'delivered', 'cancelled']

const fmtMoney = v =>
  Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })

const fmtDate = (iso, opts) =>
  new Date(iso).toLocaleDateString('en-PH', opts)

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { color: 'bg-gray-100 text-gray-600', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonRows({ cols = 7, rows = 6 }) {
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

function SkeletonItems() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 bg-gray-100 rounded-xl shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
            <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
          </div>
          <div className="h-4 bg-gray-100 rounded-lg w-16" />
        </div>
      ))}
    </div>
  )
}

// ── Order Detail Modal ────────────────────────────────────────────────────────

function OrderDetailModal({ order, items, loadingItems, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4
        bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg
        max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5
          border-b border-gray-100 shrink-0">
          <div>
            <p className="text-gray-800 font-bold text-base font-mono tracking-wide">
              #{order.id.slice(-8).toUpperCase()}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {fmtDate(order.created_at, {
                weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 transition"
              aria-label="Close"
            >
              <MdClose size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

          {/* Customer info */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-[#00B14F]/10 text-[#00B14F]
              flex items-center justify-center font-bold text-sm shrink-0">
              {(order.customer_name ?? '?')[0].toUpperCase()}
            </div>
            <div>
              <p className="text-gray-800 font-semibold text-sm">
                {order.customer_name ?? '—'}
              </p>
              <p className="text-gray-400 text-xs">Customer</p>
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase
              tracking-widest mb-3">
              Items Ordered
            </p>
            {loadingItems ? <SkeletonItems /> : (
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-gray-400 text-xs">No items found.</p>
                ) : items.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl overflow-hidden
                      bg-gray-50 shrink-0">
                      {item.products?.image_url ? (
                        <img
                          src={item.products.image_url}
                          alt={item.products.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center
                          justify-center text-gray-200">
                          <MdImage size={16} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 font-medium text-sm line-clamp-1">
                        {item.products?.name ?? '—'}
                      </p>
                      <p className="text-gray-400 text-xs">
                        ×{item.quantity}
                        {item.products?.unit_type && ` · ${item.products.unit_type}`}
                        {' · ₱'}{fmtMoney(item.price)} each
                      </p>
                    </div>
                    <p className="text-gray-700 font-bold text-sm shrink-0">
                      ₱{fmtMoney(item.subtotal)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-xl px-4 py-3.5 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₱{fmtMoney(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Delivery Fee</span>
              {(order.delivery_fee ?? 0) === 0
                ? <span className="text-green-600 font-semibold">FREE</span>
                : <span>₱{fmtMoney(order.delivery_fee)}</span>}
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between
              font-bold text-gray-800">
              <span>Total</span>
              <span className="text-[#00B14F]">₱{fmtMoney(order.total)}</span>
            </div>
          </div>

          {/* Delivery address */}
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
              mb-1.5 flex items-center gap-1">
              <MdLocationOn size={12} /> Delivery Address
            </p>
            <p className="text-gray-700 text-sm leading-relaxed">
              {order.address ?? '—'}
            </p>
          </div>

          {/* Notes */}
          {order.notes && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
                mb-1.5 flex items-center gap-1">
                <MdNotes size={12} /> Order Notes
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">{order.notes}</p>
            </div>
          )}

          {/* Cancellation reason */}
          {order.status === 'cancelled' && order.cancellation_reason && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-[10px] font-bold text-red-400 uppercase
                tracking-widest mb-1">
                Cancellation Reason
              </p>
              <p className="text-red-700 text-sm">{order.cancellation_reason}</p>
            </div>
          )}

          {/* Delivery proof */}
          {order.status === 'delivered' && order.delivery_image && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase
                tracking-widest mb-2">
                Delivery Proof
              </p>
              <img
                src={order.delivery_image}
                alt="Delivery proof"
                className="w-full rounded-xl object-cover max-h-60
                  border border-gray-100 shadow-sm"
              />
            </div>
          )}

          <div className="h-1" />
        </div>
      </div>
    </div>
  )
}

// ── Assign Driver Modal ───────────────────────────────────────────────────────

function AssignModal({ order, drivers, onClose, onAssign, assigning }) {
  const [driverId, setDriverId] = useState('')

  return (
    <div
      className="fixed inset-0 z-60 flex items-center justify-center p-4
        bg-black/40 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !assigning) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
        <div className="flex items-center justify-between px-6 py-5
          border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Assign Driver</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Order #{order.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={assigning}
            className="p-1 text-gray-400 hover:text-gray-600 transition
              disabled:opacity-50"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="px-6 py-5">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            Select Driver
          </label>
          <select
            value={driverId}
            onChange={e => setDriverId(e.target.value)}
            disabled={assigning}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
              focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30
              focus:border-[#00B14F] transition disabled:bg-gray-50"
          >
            <option value="">— Choose a driver —</option>
            {drivers.map(d => (
              <option key={d.id} value={d.id}>
                {d.full_name}{d.contact_number ? ` · ${d.contact_number}` : ''}
              </option>
            ))}
          </select>
          {drivers.length === 0 && (
            <p className="text-xs text-red-400 mt-1.5">
              No active drivers available.
            </p>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={assigning}
            className="flex-1 py-2.5 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50
              transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign(order.id, driverId)}
            disabled={!driverId || assigning}
            className="flex-1 py-2.5 text-sm font-semibold text-white
              bg-[#00B14F] rounded-xl hover:bg-[#009940]
              transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {assigning ? 'Assigning…' : 'Assign'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function AdminOrders() {
  const [orders, setOrders]               = useState([])
  const [drivers, setDrivers]             = useState([])
  const [loading, setLoading]             = useState(true)
  const [search, setSearch]               = useState('')
  const [filter, setFilter]               = useState('all')
  const [error, setError]                 = useState(null)
  const [updating, setUpdating]           = useState(null)
  const [assignTarget, setAssignTarget]   = useState(null)
  const [assigning, setAssigning]         = useState(false)
  const [detailOrder, setDetailOrder]     = useState(null)
  const [orderItems, setOrderItems]       = useState([])
  const [loadingItems, setLoadingItems]   = useState(false)

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('orders')
      .select('*, driver:profiles!orders_driver_id_fkey(full_name)')
      .order('created_at', { ascending: false })
    if (err) setError('Failed to load orders.')
    else setOrders(data ?? [])
    setLoading(false)
  }, [])

  const fetchDrivers = useCallback(async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, contact_number')
      .eq('role', 'driver')
      .eq('status', 'approved')
      .order('full_name')
    setDrivers(data ?? [])
  }, [])

  useEffect(() => {
    fetchOrders()
    fetchDrivers()
  }, [fetchOrders, fetchDrivers])

  // ── Open order detail ──────────────────────────────────────────────────────
  async function openDetail(order) {
    setDetailOrder(order)
    setOrderItems([])
    setLoadingItems(true)
    const { data } = await supabase
      .from('order_items')
      .select('*, products(name, image_url, unit_type)')
      .eq('order_id', order.id)
    setOrderItems(data ?? [])
    setLoadingItems(false)
  }

  // ── Order actions ──────────────────────────────────────────────────────────
  async function confirmOrder(orderId) {
    setUpdating(orderId)
    const { error: err } = await supabase
      .from('orders').update({ status: 'confirmed' }).eq('id', orderId)
    if (err) setError('Failed to confirm order.')
    else setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'confirmed' } : o
    ))
    setUpdating(null)
  }

  async function assignDriver(orderId, driverId) {
    setAssigning(true)
    const { error: err } = await supabase
      .from('orders')
      .update({ status: 'assigned', driver_id: driverId })
      .eq('id', orderId)
    if (err) {
      setError('Failed to assign driver.')
    } else {
      const driver = drivers.find(d => d.id === driverId)
      setOrders(prev =>
        prev.map(o => o.id === orderId
          ? { ...o, status: 'assigned', driver_id: driverId, driver }
          : o
        )
      )
      setAssignTarget(null)
    }
    setAssigning(false)
  }

  async function cancelOrder(orderId) {
    setUpdating(orderId)
    const { error: err } = await supabase
      .from('orders').update({ status: 'cancelled' }).eq('id', orderId)
    if (err) setError('Failed to cancel order.')
    else setOrders(prev => prev.map(o =>
      o.id === orderId ? { ...o, status: 'cancelled' } : o
    ))
    setUpdating(null)
  }

  // ── Derived state ──────────────────────────────────────────────────────────
  const filtered = orders.filter(o => {
    const q = search.toLowerCase()
    return (
      ((o.customer_name ?? '').toLowerCase().includes(q) ||
       o.id.toLowerCase().includes(q)) &&
      (filter === 'all' || o.status === filter)
    )
  })

  const counts = {
    total:     orders.length,
    pending:   orders.filter(o => o.status === 'pending').length,
    active:    orders.filter(o =>
      ['confirmed', 'assigned', 'on_the_way'].includes(o.status)).length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <AdminLayout pageTitle="Orders">
      <div className="space-y-6 max-w-7xl mx-auto">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Orders</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Manage and track all customer orders
          </p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-3">
          {[
            { label: 'Total',     value: counts.total,     color: 'bg-gray-100   text-gray-600'   },
            { label: 'Pending',   value: counts.pending,   color: 'bg-yellow-100 text-yellow-700' },
            { label: 'Active',    value: counts.active,    color: 'bg-blue-100   text-blue-700'   },
            { label: 'Delivered', value: counts.delivered, color: 'bg-green-100  text-green-700'  },
            { label: 'Cancelled', value: counts.cancelled, color: 'bg-red-100    text-red-700'    },
          ].map(({ label, value, color }) => (
            <span key={label}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5
                rounded-full text-xs font-semibold ${color}`}>
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100
          overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-gray-100 flex flex-wrap
            items-center gap-3 justify-between">
            <div className="flex flex-wrap gap-1">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold
                    capitalize transition
                    ${filter === f
                      ? 'bg-[#00B14F] text-white'
                      : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  {f === 'on_the_way' ? 'On the Way' : f}
                </button>
              ))}
            </div>

            <div className="relative">
              <MdSearch size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2
                  text-gray-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search customer or order ID…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#00B14F]/30
                  focus:border-[#00B14F] w-56 transition"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-xs uppercase tracking-wider">
                  {['Order ID', 'Customer', 'Date', 'Status', 'Total',
                    'Driver', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium
                      whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows cols={7} rows={6} />
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-14 text-center
                      text-gray-400 text-sm">
                      {search || filter !== 'all'
                        ? 'No orders match your filter.'
                        : 'No orders yet.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(order => {
                    const isBusy   = updating === order.id
                    const isActive = !['delivered', 'cancelled'].includes(order.status)

                    return (
                      <tr
                        key={order.id}
                        onClick={() => openDetail(order)}
                        className="border-b border-gray-50 hover:bg-gray-50/70
                          transition-colors cursor-pointer"
                      >
                        {/* Order ID */}
                        <td className="px-5 py-4 font-mono text-xs text-gray-400">
                          #{order.id.slice(-8).toUpperCase()}
                        </td>

                        {/* Customer */}
                        <td className="px-5 py-4 text-gray-700 font-medium
                          whitespace-nowrap">
                          {order.customer_name ?? '—'}
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4 text-gray-400 whitespace-nowrap">
                          {fmtDate(order.created_at, {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })}
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge status={order.status} />
                        </td>

                        {/* Total */}
                        <td className="px-5 py-4 text-gray-700 font-medium
                          whitespace-nowrap">
                          ₱{fmtMoney(order.total)}
                        </td>

                        {/* Driver */}
                        <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                          {order.driver_id
                            ? (order.driver?.full_name ?? '—')
                            : <span className="text-gray-300 text-xs">Unassigned</span>}
                        </td>

                        {/* Actions — stopPropagation so row-click doesn't fire */}
                        <td className="px-5 py-4"
                          onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {order.status === 'pending' && (
                              <button
                                onClick={() => confirmOrder(order.id)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 px-3 py-1.5
                                  rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100
                                  text-xs font-medium transition
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdCheckCircle size={14} />
                                {isBusy ? 'Confirming…' : 'Confirm'}
                              </button>
                            )}

                            {order.status === 'confirmed' && (
                              <button
                                onClick={() => setAssignTarget(order)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 px-3 py-1.5
                                  rounded-lg bg-purple-50 text-purple-700
                                  hover:bg-purple-100 text-xs font-medium transition
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdDirectionsCar size={14} />
                                Assign Driver
                              </button>
                            )}

                            {isActive && (
                              <button
                                onClick={() => cancelOrder(order.id)}
                                disabled={isBusy}
                                className="inline-flex items-center gap-1 px-3 py-1.5
                                  rounded-lg bg-red-50 text-red-600 hover:bg-red-100
                                  text-xs font-medium transition
                                  disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <MdCancel size={14} />
                                {isBusy ? 'Cancelling…' : 'Cancel'}
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

          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-gray-50 text-xs text-gray-400">
              Showing {filtered.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
              <span className="ml-2 text-gray-300">· Click any row to view items</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Order Detail Modal ── */}
      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          items={orderItems}
          loadingItems={loadingItems}
          onClose={() => { setDetailOrder(null); setOrderItems([]) }}
        />
      )}

      {/* ── Assign Driver Modal ── */}
      {assignTarget && (
        <AssignModal
          order={assignTarget}
          drivers={drivers}
          assigning={assigning}
          onClose={() => !assigning && setAssignTarget(null)}
          onAssign={assignDriver}
        />
      )}
    </AdminLayout>
  )
}
