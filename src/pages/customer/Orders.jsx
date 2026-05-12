import { useEffect, useState, useCallback } from 'react'
import {
  MdClose, MdLocationOn, MdNotes,
  MdImage, MdReceipt,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700',  label: 'Pending'    },
  confirmed:  { color: 'bg-blue-100   text-blue-700',    label: 'Confirmed'  },
  assigned:   { color: 'bg-purple-100 text-purple-700',  label: 'Assigned'   },
  on_the_way: { color: 'bg-orange-100 text-orange-700',  label: 'On the Way' },
  delivered:  { color: 'bg-green-100  text-green-700',   label: 'Delivered'  },
  cancelled:  { color: 'bg-red-100    text-red-700',     label: 'Cancelled'  },
}

const ORDER_STEPS = ['pending', 'confirmed', 'assigned', 'on_the_way', 'delivered']

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
      <path
        d="M1 4L3.5 6.5L9 1"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function OrderStepper({ status }) {
  const currentIdx = ORDER_STEPS.indexOf(status)
  if (currentIdx === -1) return null           // cancelled — skip stepper

  return (
    <div>
      {/* Dots + connectors */}
      <div className="flex items-center">
        {ORDER_STEPS.map((step, i) => {
          const done = i <= currentIdx
          const last = i === ORDER_STEPS.length - 1
          return (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0
                  transition-colors
                  ${done ? 'border-[#1A2E74] bg-[#1A2E74]' : 'border-gray-200 bg-white'}`}
              >
                {done && <Checkmark />}
              </div>
              {!last && (
                <div
                  className={`h-0.5 flex-1 transition-colors
                    ${i < currentIdx ? 'bg-[#1A2E74]' : 'bg-gray-200'}`}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-1.5">
        {ORDER_STEPS.map(step => (
          <p key={step} className="text-[9px] text-gray-400 text-center w-6 leading-tight">
            {STATUS_CONFIG[step].label.replace(' ', '\n')}
          </p>
        ))}
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

  const fetchOrders = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('orders')
      .select('*, order_items(id)')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
    setOrders(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchOrders() }, [fetchOrders])

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
  }

  const fmtDate = (iso, opts) =>
    new Date(iso).toLocaleDateString('en-PH', opts)

  const fmtMoney = v =>
    Number(v ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })

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

        {/* Order list */}
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <SkeletonOrderCard key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
            px-5 py-16 flex flex-col items-center gap-3 text-center">
            <MdReceipt size={44} className="text-gray-200" />
            <div>
              <p className="font-semibold text-gray-500">No orders yet</p>
              <p className="text-gray-400 text-xs mt-1">
                Place your first order from the Browse page.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map(order => {
              const itemCount = order.order_items?.length ?? 0
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
                        #{order.id.slice(-8).toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {fmtDate(order.created_at, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
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

      {/* ── Order Detail — bottom-sheet on mobile, centered modal on desktop ── */}
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
                  #{selectedOrder.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-gray-400 text-xs mt-0.5">
                  {fmtDate(selectedOrder.created_at, {
                    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
                  })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={selectedOrder.status} />
                <button
                  onClick={closeDetail}
                  aria-label="Close"
                  className="p-1 text-gray-400 hover:text-gray-600 transition"
                >
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
                            <img
                              src={item.products.image_url}
                              alt={item.products.name}
                              className="w-full h-full object-cover"
                            />
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
                  <span className="text-[#1A2E74]">₱{fmtMoney(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Delivery address */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest
                  mb-2 flex items-center gap-1">
                  <MdLocationOn size={12} />
                  Delivery Address
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
                    <MdNotes size={12} />
                    Order Notes
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Delivery proof — only when delivered and image exists */}
              {selectedOrder.status === 'delivered' && selectedOrder.delivery_image && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Delivery Proof
                  </p>
                  <img
                    src={selectedOrder.delivery_image}
                    alt="Delivery proof"
                    className="w-full rounded-xl object-cover max-h-64
                      border border-gray-100 shadow-sm"
                  />
                </div>
              )}

              {/* Bottom padding for mobile overscroll */}
              <div className="h-2" />
            </div>
          </div>
        </div>
      )}
    </CustomerLayout>
  )
}
