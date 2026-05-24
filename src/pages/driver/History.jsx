import { useEffect, useState, useCallback } from 'react'
import {
  MdCheckCircle, MdCancel, MdClose,
  MdLocationOn, MdNotes, MdImage, MdFilterList,
} from 'react-icons/md'
import DriverLayout from '../../layouts/DriverLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'

const STATUS_CONFIG = {
  delivered: { color: 'bg-green-100 text-green-700', icon: MdCheckCircle, label: 'Delivered' },
  cancelled: { color: 'bg-red-100 text-red-700',     icon: MdCancel,      label: 'Cancelled'  },
}

const FILTERS = ['all', 'delivered', 'cancelled']

const fmtMoney = v =>
  Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })

const fmtDate = (iso, opts) =>
  new Date(iso).toLocaleDateString('en-PH', opts)

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { color: 'bg-gray-100 text-gray-600', label: status }
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full
      text-xs font-semibold ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse space-y-3">
      <div className="flex justify-between">
        <div className="h-4 bg-gray-100 rounded-lg w-28" />
        <div className="h-5 bg-gray-100 rounded-full w-20" />
      </div>
      <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-100 rounded-lg w-1/2" />
    </div>
  )
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

function OrderDetailModal({ order, items, loadingItems, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full
        max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-start justify-between px-5 py-4
          border-b border-gray-100 shrink-0">
          <div>
            <p className="text-gray-800 font-bold text-sm font-mono tracking-wide">
              #{String(order.id).padStart(6,'0')}
            </p>
            <p className="text-gray-400 text-xs mt-0.5">
              {fmtDate(order.created_at, {
                weekday: 'short', month: 'long', day: 'numeric', year: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
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
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

          {/* Customer info */}
          <div className="flex items-center gap-3 py-3 px-4 bg-gray-50 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-[#168AFF]/10 text-[#168AFF]
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
              tracking-widest mb-3">Items</p>
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
                          className="w-full h-full object-contain p-1"
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
              <span className="text-[#168AFF]">₱{fmtMoney(order.total)}</span>
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
            {order.landmark && (
              <p className="text-gray-400 text-xs mt-1">
                Landmark: {order.landmark}
              </p>
            )}
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
                tracking-widest mb-1">Cancellation Reason</p>
              <p className="text-red-700 text-sm">{order.cancellation_reason}</p>
            </div>
          )}

          {/* Delivery proof */}
          {order.status === 'delivered' && order.delivery_image && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase
                tracking-widest mb-2">Delivery Proof</p>
              <img
                src={order.delivery_image}
                alt="Delivery proof"
                className="w-full rounded-xl object-contain max-h-64
                  border border-gray-100 shadow-sm bg-gray-50"
              />
            </div>
          )}

          <div className="h-1" />
        </div>
      </div>
    </div>
  )
}

export default function DriverHistory() {
  const { user } = useAuth()
  const [orders, setOrders]             = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('all')
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')
  const [error, setError]               = useState(null)
  const [detailOrder, setDetailOrder]   = useState(null)
  const [orderItems, setOrderItems]     = useState([])
  const [loadingItems, setLoadingItems] = useState(false)

  const fetchHistory = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('orders')
      .select('*')
      .eq('driver_id', user.id)
      .in('status', ['delivered', 'cancelled'])
      .order('created_at', { ascending: false })
    if (err) setError('Failed to load delivery history.')
    else setOrders(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchHistory() }, [fetchHistory])

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

  const filtered = orders
    .filter(o => filter === 'all' || o.status === filter)
    .filter(o => {
      const d = o.created_at?.slice(0, 10)
      if (dateFrom && d < dateFrom) return false
      if (dateTo   && d > dateTo)   return false
      return true
    })

  const counts = {
    total:     orders.length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }

  return (
    <DriverLayout>
      <div className="space-y-5">

        {/* Heading */}
        <div>
          <h1 className="text-gray-800 font-bold text-lg">Delivery History</h1>
          <p className="text-gray-400 text-sm mt-0.5">Your completed and cancelled deliveries</p>
        </div>

        {/* Summary chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Total',     value: counts.total,     color: 'bg-gray-100   text-gray-600'   },
            { label: 'Delivered', value: counts.delivered, color: 'bg-green-100  text-green-700'  },
            { label: 'Cancelled', value: counts.cancelled, color: 'bg-red-100    text-red-700'    },
          ].map(({ label, value, color }) => (
            <span key={label}
              className={`inline-flex items-center gap-1 px-3 py-1.5
                rounded-full text-xs font-semibold ${color}`}>
              {loading ? '—' : value} {label}
            </span>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition
                ${filter === f
                  ? 'bg-[#168AFF] text-white'
                  : 'bg-white border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <MdFilterList size={15} className="text-gray-400 shrink-0" />
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition" />
          <span className="text-gray-400 text-xs">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-xs border border-gray-200 rounded-xl px-3 py-2
              focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF] transition" />
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo('') }}
              className="text-xs text-[#168AFF] font-semibold hover:underline">
              Clear
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Order list */}
        <div className="space-y-3">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100
              shadow-sm px-5 py-14 text-center">
              <p className="text-gray-400 text-sm">
                {filter !== 'all'
                  ? `No ${filter} deliveries yet.`
                  : 'No delivery history yet.'}
              </p>
            </div>
          ) : (
            filtered.map(order => (
              <button
                key={order.id}
                onClick={() => openDetail(order)}
                className="w-full text-left bg-white rounded-2xl border border-gray-100
                  shadow-sm p-4 hover:shadow-md active:scale-[0.99]
                  transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="min-w-0">
                    <p className="text-gray-800 font-bold text-sm">
                      {order.customer_name ?? '—'}
                    </p>
                    <p className="font-mono text-xs text-gray-400 mt-0.5">
                      #{String(order.id).padStart(6,'0')}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <p className="text-gray-500 text-xs line-clamp-1 mb-2.5">
                  {order.address ?? '—'}
                </p>

                <div className="flex items-center justify-between">
                  <p className="text-[#168AFF] font-bold text-sm">
                    ₱{fmtMoney(order.total)}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {fmtDate(order.created_at, {
                      month: 'short', day: 'numeric', year: 'numeric',
                    })}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {detailOrder && (
        <OrderDetailModal
          order={detailOrder}
          items={orderItems}
          loadingItems={loadingItems}
          onClose={() => { setDetailOrder(null); setOrderItems([]) }}
        />
      )}
    </DriverLayout>
  )
}
