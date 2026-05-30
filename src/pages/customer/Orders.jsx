import { useEffect, useState, useCallback } from 'react'
import {
  MdClose, MdLocationOn, MdNotes,
  MdImage, MdReceipt, MdFilterList, MdChat, MdCheckCircle,
  MdCancel,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import OrderChat from '../../components/OrderChat'
import toast from 'react-hot-toast'

// ── Status config ─────────────────────────────────────────────────────────────

// Customer-facing statuses — internal "confirmed" and "assigned" both show as "Pending"
const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700', label: 'Pending'    },
  confirmed:  { color: 'bg-yellow-100 text-yellow-700', label: 'Pending'    },
  assigned:   { color: 'bg-yellow-100 text-yellow-700', label: 'Pending'    },
  on_the_way: { color: 'bg-orange-100 text-orange-700', label: 'On the Way' },
  delivered:  { color: 'bg-green-100  text-green-700',  label: 'Delivered'  },
  cancelled:  { color: 'bg-red-100    text-red-700',    label: 'Cancelled'  },
}

// Customer sees 3 steps only
const ORDER_STEPS = ['pending', 'on_the_way', 'delivered']

// Map internal status → customer step index
function toCustomerStep(status) {
  if (['pending', 'confirmed', 'assigned'].includes(status)) return 0
  if (status === 'on_the_way') return 1
  if (status === 'delivered')  return 2
  return -1
}

// Statuses the customer is allowed to cancel
const CANCELLABLE = new Set(['pending', 'confirmed', 'assigned'])

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { color: 'bg-gray-100 text-gray-600', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
      text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
      {cfg.label}
    </span>
  )
}

function Checkmark() {
  return (
    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const STEP_LABELS = ['Pending', 'On the\nWay', 'Delivered']

function OrderStepper({ status }) {
  const currentIdx = toCustomerStep(status)
  if (currentIdx === -1) return null

  const progressPct = currentIdx === 0
    ? 0
    : (currentIdx / (ORDER_STEPS.length - 1)) * 80

  return (
    <div className="relative">
      <div className="absolute top-3 left-[10%] right-[10%] h-0.5 bg-gray-200" />
      <div
        className="absolute top-3 left-[10%] h-0.5 bg-[#168AFF] transition-all"
        style={{ width: `${progressPct}%` }}
      />
      <div className="relative flex">
        {ORDER_STEPS.map((step, i) => {
          const done = i <= currentIdx
          return (
            <div key={step} className="flex-1 flex flex-col items-center gap-1.5">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                ${done ? 'border-[#168AFF] bg-[#168AFF]' : 'border-gray-200 bg-white'}`}>
                {done && <Checkmark />}
              </div>
              <p className="text-[9px] text-gray-400 text-center leading-tight whitespace-pre-line">
                {STEP_LABELS[i]}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Cancel Order Modal ────────────────────────────────────────────────────────

function CancelModal({ order, onClose, onConfirm, cancelling }) {
  const [reason,    setReason]    = useState('')
  const [formError, setFormError] = useState(null)

  function handleSubmit() {
    if (!reason.trim() || reason.trim().length < 5) {
      setFormError('Please provide a reason (at least 5 characters).')
      return
    }
    setFormError(null)
    onConfirm(order.id, reason.trim())
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center
        p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !cancelling) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Cancel Order</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              #{String(order.id).padStart(6, '0')}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={cancelling}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <p className="text-red-700 text-xs leading-relaxed">
              ⚠ This action <strong>cannot be undone</strong>. Your order will be cancelled
              immediately and the assigned team will be notified.
            </p>
          </div>

          {formError && (
            <p className="text-red-500 text-sm">{formError}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Reason for Cancellation <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => { setReason(e.target.value); setFormError(null) }}
              placeholder="Please tell us why you're cancelling this order…"
              rows={4}
              disabled={cancelling}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
                transition disabled:bg-gray-50 disabled:text-gray-400 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {reason.trim().length} / min 5 chars
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={cancelling}
            className="flex-1 py-3 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50
              transition disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={handleSubmit}
            disabled={cancelling}
            className="flex-1 py-3 text-sm font-semibold text-white
              bg-red-500 rounded-xl hover:bg-red-600
              transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {cancelling ? 'Cancelling…' : 'Cancel Order'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonOrderCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="h-4 w-28 bg-gray-100 rounded-lg" />
          <div className="h-3 w-20 bg-gray-100 rounded-lg" />
        </div>
        <div className="h-6 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-14 bg-gray-100 rounded-lg" />
        <div className="h-5 w-24 bg-gray-100 rounded-lg" />
      </div>
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
            <div className="h-3 w-3/4 bg-gray-100 rounded-lg" />
            <div className="h-3 w-1/2 bg-gray-100 rounded-lg" />
          </div>
          <div className="h-4 w-16 bg-gray-100 rounded-lg" />
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function Orders() {
  const { user }                              = useAuth()
  const [orders, setOrders]                   = useState([])
  const [loading, setLoading]                 = useState(true)
  const [selectedOrder, setSelectedOrder]     = useState(null)
  const [orderItems, setOrderItems]           = useState([])
  const [loadingItems, setLoadingItems]       = useState(false)
  const [showChat, setShowChat]               = useState(false)
  const [dateFrom, setDateFrom]               = useState('')
  const [dateTo, setDateTo]                   = useState('')
  const [cancelTarget, setCancelTarget]       = useState(null)
  const [cancelling, setCancelling]           = useState(false)

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(quantity)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  // Real-time: update this customer's orders live
  useEffect(() => {
    if (!user) return
    const channel = supabase
      .channel('customer-orders-rt')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` },
        (payload) => {
          setOrders(prev => prev.map(o =>
            o.id === payload.new.id ? { ...o, ...payload.new } : o
          ))
          // Refresh detail if it's currently open for this order
          setSelectedOrder(prev => prev?.id === payload.new.id ? { ...prev, ...payload.new } : prev)
        })
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `customer_id=eq.${user.id}` },
        () => fetchOrders())
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [user, fetchOrders])

  async function openOrder(order) {
    setSelectedOrder(order)
    setOrderItems([])
    setLoadingItems(true)
    const { data } = await supabase
      .from('order_items')
      .select('*, products(name, image_url, unit_type)')
      .eq('order_id', order.id)
    setOrderItems(data ?? [])
    setLoadingItems(false)
  }

  function closeDetail() {
    setSelectedOrder(null)
    setOrderItems([])
    setShowChat(false)
  }

  // ── Cancel order ────────────────────────────────────────────────────────────
  async function handleCancelOrder(orderId, reason) {
    setCancelling(true)
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({ status: 'cancelled', cancellation_reason: reason })
        .eq('id', orderId)

      if (err) throw new Error(err.message)

      // Update local state
      const updated = { ...selectedOrder, status: 'cancelled', cancellation_reason: reason }
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled', cancellation_reason: reason } : o))
      setSelectedOrder(updated)
      setCancelTarget(null)
      toast.success('Order cancelled successfully.')
    } catch (err) {
      toast.error('Failed to cancel: ' + err.message)
    } finally {
      setCancelling(false)
    }
  }

  const filteredOrders = orders.filter(o => {
    const d = o.created_at?.slice(0, 10)
    if (dateFrom && d < dateFrom) return false
    if (dateTo   && d > dateTo)   return false
    return true
  })

  const ACTIVE_STATUSES = ['pending', 'confirmed', 'assigned', 'on_the_way']
  const isChatActive = selectedOrder ? ACTIVE_STATUSES.includes(selectedOrder.status) : false

  const fmtDate  = (iso, opts) => new Date(iso).toLocaleDateString('en-PH', opts)
  const fmtMoney = v => Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })

  return (
    <CustomerLayout>
      <div className="space-y-5 max-w-2xl mx-auto">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Orders</h2>
          <p className="text-gray-400 text-sm mt-0.5">
            Track your orders and view delivery details
          </p>
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

        {/* Order list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
            px-5 py-16 flex flex-col items-center gap-3 text-center">
            <MdReceipt size={44} className="text-gray-200" />
            <div>
              <p className="font-semibold text-gray-500">No orders yet</p>
              <p className="text-gray-400 text-xs mt-1">Place your first order from the Browse page.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map(order => {
              const itemCount = order.order_items?.reduce((sum, i) => sum + (i.quantity ?? 0), 0) ?? 0
              const canCancel = CANCELLABLE.has(order.status)
              return (
                <button
                  key={order.id}
                  onClick={() => openOrder(order)}
                  className="w-full text-left bg-white rounded-2xl border border-gray-100
                    shadow-sm p-5 hover:shadow-md hover:border-gray-200
                    transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-gray-800 font-bold text-sm font-mono tracking-wide">
                        #{String(order.id).padStart(6, '0')}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {fmtDate(order.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {canCancel && (
                        <span className="text-[10px] text-gray-400 font-medium">Tap to view</span>
                      )}
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-gray-400 text-xs">
                      {itemCount} item{itemCount !== 1 ? 's' : ''}
                    </p>
                    <p className="text-gray-800 font-bold text-base">
                      ₱{fmtMoney(order.total)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
            bg-black/40 backdrop-blur-sm p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) closeDetail() }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl
            shadow-2xl max-h-[92vh] flex flex-col">

            {/* Modal header */}
            <div className="flex items-start justify-between px-6 py-5
              border-b border-gray-100 shrink-0">
              <div>
                <p className="text-gray-800 font-bold text-base font-mono tracking-wide">
                  #{String(selectedOrder.id).padStart(6, '0')}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {fmtDate(selectedOrder.created_at, {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedOrder.status} />
                <button onClick={closeDetail} aria-label="Close"
                  className="p-1 text-gray-400 hover:text-gray-600 transition">
                  <MdClose size={20} />
                </button>
              </div>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">

              {/* Status stepper */}
              {selectedOrder.status !== 'cancelled' && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                    Order Progress
                  </p>
                  <OrderStepper status={selectedOrder.status} />
                </div>
              )}

              {/* Cancellation reason (shown when cancelled) */}
              {selectedOrder.status === 'cancelled' && (
                <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3.5 space-y-1">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                    Order Cancelled
                  </p>
                  {selectedOrder.cancellation_reason && (
                    <p className="text-red-700 text-sm leading-relaxed">
                      {selectedOrder.cancellation_reason}
                    </p>
                  )}
                </div>
              )}

              {/* Items */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Items Ordered
                </p>
                {loadingItems ? <SkeletonItems /> : (
                  <div className="space-y-3">
                    {orderItems.map(item => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-50 shrink-0">
                          {item.products?.image_url ? (
                            <img src={item.products.image_url} alt={item.products.name}
                              className="w-full h-full object-contain p-1" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-200">
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
                            {' · '}
                            ₱{fmtMoney(item.price)} / {item.products?.unit_type ?? 'unit'}
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
                  <span>₱{fmtMoney(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  {(selectedOrder.delivery_fee ?? 0) === 0
                    ? <span className="text-green-600 font-semibold">FREE</span>
                    : <span>₱{fmtMoney(selectedOrder.delivery_fee)}</span>}
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between
                  font-bold text-gray-800">
                  <span>Total</span>
                  <span className="text-[#168AFF]">₱{fmtMoney(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Delivery address */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
                  mb-2 flex items-center gap-1">
                  <MdLocationOn size={12} /> Delivery Address
                </p>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {selectedOrder.address ?? '—'}
                </p>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
                    mb-2 flex items-center gap-1">
                    <MdNotes size={12} /> Order Notes
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">{selectedOrder.notes}</p>
                </div>
              )}

              {/* Delivered timestamp */}
              {selectedOrder.status === 'delivered' && selectedOrder.delivered_at && (
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50
                  border border-green-100 rounded-xl">
                  <MdCheckCircle size={16} className="text-green-500 shrink-0" />
                  <div>
                    <p className="text-green-700 text-xs font-bold">Order Delivered</p>
                    <p className="text-green-600 text-xs mt-0.5">
                      {new Date(selectedOrder.delivered_at).toLocaleString('en-PH', {
                        weekday: 'short', month: 'short', day: 'numeric',
                        year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              )}

              {/* Delivery proof */}
              {selectedOrder.status === 'delivered' && selectedOrder.delivery_image && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Delivery Proof
                  </p>
                  <img src={selectedOrder.delivery_image} alt="Delivery proof"
                    className="w-full rounded-xl object-contain max-h-72
                      border border-gray-100 shadow-sm bg-gray-50" />
                </div>
              )}

              {/* ── Cancel Order ── */}
              {CANCELLABLE.has(selectedOrder.status) && (
                <div className="pt-1">
                  <div className="border-t border-gray-100 mb-4" />
                  <button
                    onClick={() => setCancelTarget(selectedOrder)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl
                      text-sm font-semibold text-red-600 border border-red-200
                      hover:bg-red-50 transition"
                  >
                    <MdCancel size={16} />
                    Cancel Order
                  </button>
                </div>
              )}

              {/* Can't cancel — on the way */}
              {selectedOrder.status === 'on_the_way' && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl
                  px-4 py-3 text-center">
                  <p className="text-orange-700 text-xs font-semibold">
                    Your order is already on the way — cancellation is no longer possible.
                  </p>
                  <p className="text-orange-500 text-xs mt-1">
                    Contact us at 09304453799 if you have a concern.
                  </p>
                </div>
              )}

              {/* ── Chat with Driver ── */}
              {selectedOrder.driver_id && (
                <div>
                  <button
                    onClick={() => setShowChat(v => !v)}
                    className="flex items-center gap-2 text-[10px] font-bold
                      text-gray-400 uppercase tracking-widest mb-2 hover:text-[#168AFF] transition">
                    <MdChat size={13} />
                    {isChatActive ? 'Message Driver' : 'Chat History'}
                    <span className={`ml-1 text-[10px] font-normal normal-case
                      ${showChat ? 'text-[#168AFF]' : 'text-gray-400'}`}>
                      {showChat ? '▲ hide' : '▼ show'}
                    </span>
                  </button>
                  {showChat && (
                    <OrderChat
                      orderId={selectedOrder.id}
                      userId={user.id}
                      userRole="customer"
                      isActive={isChatActive}
                    />
                  )}
                </div>
              )}

              <div className="h-2" />
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirm Modal ── */}
      {cancelTarget && (
        <CancelModal
          order={cancelTarget}
          cancelling={cancelling}
          onClose={() => { if (!cancelling) setCancelTarget(null) }}
          onConfirm={handleCancelOrder}
        />
      )}
    </CustomerLayout>
  )
}
