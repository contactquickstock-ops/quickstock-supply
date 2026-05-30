import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdDirectionsCar, MdLocationOn, MdPerson, MdPhone,
  MdInventory2, MdRefresh, MdCheckCircle, MdWarning,
  MdClose, MdCameraAlt, MdUpload, MdStar, MdChat, MdStorefront,
} from 'react-icons/md'
import OrderChat from '../../components/OrderChat'
import DriverLayout from '../../layouts/DriverLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { supabase as supabaseRT } from '../../services/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  assigned:   { color: 'bg-purple-100 text-purple-700', label: 'Assigned'   },
  on_the_way: { color: 'bg-orange-100 text-orange-700', label: 'On the Way' },
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
      space-y-4 animate-pulse">
      <div className="flex justify-between">
        <div className="h-4 w-28 bg-gray-100 rounded-lg" />
        <div className="h-6 w-24 bg-gray-100 rounded-full" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-36 bg-gray-100 rounded-lg" />
        <div className="h-3 w-48 bg-gray-100 rounded-lg" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-24 bg-gray-100 rounded-lg" />
        <div className="h-3 w-40 bg-gray-100 rounded-lg" />
      </div>
      <div className="flex gap-2">
        <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
        <div className="flex-1 h-11 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )
}

// ── Customer Profile Popup ────────────────────────────────────────────────────

function CustomerProfilePopup({ customer, fallbackName, onClose }) {
  if (!customer && !fallbackName) return null
  const displayName = customer?.full_name ?? fallbackName ?? '?'
  const initials = displayName[0].toUpperCase()
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-5 w-72 mx-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Customer</p>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 transition">
            <MdClose size={16} />
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-[#168AFF]/10 flex items-center
            justify-center font-bold text-2xl text-[#168AFF] shrink-0 border-2 border-[#168AFF]/20">
            {customer?.avatar_url
              ? <img src={customer.avatar_url} alt={displayName} className="w-full h-full object-cover" />
              : initials}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-sm truncate">{displayName}</p>
            {customer?.contact_number && (
              <a
                href={`tel:${customer.contact_number}`}
                className="flex items-center gap-1.5 text-[#168AFF] text-xs mt-1 hover:underline"
              >
                <MdPhone size={12} />
                {customer.contact_number}
              </a>
            )}
            {customer?.store_name && (
              <div className="flex items-center gap-1.5 text-gray-400 text-xs mt-1">
                <MdStorefront size={12} />
                <span className="truncate">{customer.store_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delivery Card ─────────────────────────────────────────────────────────────

function DeliveryCard({ order, onAccept, onDeliver, onReport, busy, chatOpen, onToggleChat, driverId }) {
  const cfg     = STATUS_CONFIG[order.status] ?? { color: 'bg-gray-100 text-gray-600', label: order.status }
  const items   = order.order_items ?? []
  const [showProfile, setShowProfile] = useState(false)
  const customer = order.customer

  return (
    <>
    <div className={`bg-white rounded-2xl border shadow-sm p-5 space-y-4
      ${order.status === 'on_the_way' ? 'border-orange-200' : 'border-gray-100'}`}>

      {/* Order ID + Status */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-gray-800 font-bold text-sm font-mono tracking-wide">
          #{String(order.id).padStart(6,'0')}
        </p>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full
          text-xs font-semibold whitespace-nowrap ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {/* Customer + Contact + Address + Landmark */}
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => setShowProfile(true)}
          className="flex items-center gap-2.5 w-full text-left hover:opacity-80 transition"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#168AFF]/10 flex items-center
            justify-center font-bold text-sm text-[#168AFF] shrink-0">
            {customer?.avatar_url
              ? <img src={customer.avatar_url} alt={order.customer_name} className="w-full h-full object-cover" />
              : (order.customer_name ?? 'C')[0].toUpperCase()}
          </div>
          <p className="text-gray-700 font-semibold text-sm">
            {order.customer_name ?? '—'}
          </p>
        </button>
        {order.customer?.contact_number && (
          <div className="flex items-center gap-2.5">
            <MdPhone size={15} className="text-gray-400 shrink-0" />
            <a
              href={`tel:${order.customer.contact_number}`}
              className="text-[#168AFF] text-sm font-medium hover:underline"
              onClick={e => e.stopPropagation()}
            >
              {order.customer.contact_number}
            </a>
          </div>
        )}
        <div className="flex items-start gap-2.5">
          <MdLocationOn size={16} className="text-[#168AFF] shrink-0 mt-0.5" />
          <div>
            <p className="text-gray-700 text-sm leading-snug">{order.address ?? '—'}</p>
            {order.landmark && (
              <p className="text-gray-400 text-xs mt-0.5">Landmark: {order.landmark}</p>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <MdInventory2 size={14} className="text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Items ({items.length})
          </p>
        </div>
        {items.length === 0 ? (
          <p className="text-gray-300 text-xs">No items</p>
        ) : (
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0" />
                <span className="font-semibold">{item.quantity}×</span>
                <span className="line-clamp-1">
                  {item.products?.name ?? '—'}
                  {item.products?.unit_type && (
                    <span className="text-gray-400 text-xs"> / {item.products.unit_type}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Total */}
      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
        <span className="text-gray-400 text-xs font-medium">Order Total</span>
        <span className="text-gray-800 font-bold text-base">
          ₱{Number(order.total ?? 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* Reward badge */}
      {order.rewards && (
        <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50
          rounded-xl border border-yellow-100">
          <MdStar size={15} className="text-yellow-500 shrink-0" />
          <div className="min-w-0">
            <p className="text-yellow-800 text-xs font-bold truncate">{order.rewards.name}</p>
            <p className="text-yellow-600 text-[10px]">
              Customer reward · {order.rewards.points_required} pts deducted on delivery
            </p>
          </div>
        </div>
      )}

      {/* Chat toggle */}
      <button
        onClick={onToggleChat}
        className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl
          text-xs font-semibold border transition
          ${chatOpen
            ? 'bg-[#168AFF]/10 border-[#168AFF]/30 text-[#168AFF]'
            : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-blue-50 hover:border-[#168AFF]/30 hover:text-[#168AFF]'}`}
      >
        <MdChat size={15} />
        {chatOpen ? 'Hide Chat' : 'Message Customer'}
      </button>

      {chatOpen && (
        <OrderChat
          orderId={order.id}
          userId={driverId}
          userRole="driver"
          isActive={true}
        />
      )}

      {/* Actions */}
      {order.status === 'assigned' && (
        <button
          onClick={() => onAccept(order.id)}
          disabled={busy}
          className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
            hover:bg-[#1270DB] active:scale-[0.98] transition-all
            disabled:opacity-60 disabled:cursor-not-allowed
            flex items-center justify-center gap-2"
        >
          <MdDirectionsCar size={18} />
          {busy ? 'Updating…' : 'Accept Delivery'}
        </button>
      )}

      {order.status === 'on_the_way' && (
        <div className="flex gap-2">
          <button
            onClick={() => onDeliver(order)}
            disabled={busy}
            className="flex-1 py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
              hover:bg-[#1270DB] active:scale-[0.98] transition-all
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
          >
            <MdCheckCircle size={17} />
            {busy ? 'Processing…' : 'Mark Delivered'}
          </button>
          <button
            onClick={() => onReport(order)}
            disabled={busy}
            className="flex-1 py-3 bg-red-50 text-red-600 font-bold rounded-xl text-sm
              hover:bg-red-100 active:scale-[0.98] transition-all
              disabled:opacity-60 disabled:cursor-not-allowed
              flex items-center justify-center gap-2 border border-red-100"
          >
            <MdWarning size={17} />
            Report Issue
          </button>
        </div>
      )}
    </div>
    {showProfile && (
      <CustomerProfilePopup
        customer={customer}
        fallbackName={order.customer_name}
        onClose={() => setShowProfile(false)}
      />
    )}
    </>
  )
}

// ── Mark as Delivered Modal ────────────────────────────────────────────────────
// Phase 1: Upload photo → saves to orders.delivery_image immediately
// Phase 2: "Mark as Delivered" becomes active → updates status + awards points

function DeliverModal({ order, onClose, onConfirm, confirming }) {
  const [uploadedUrl,  setUploadedUrl]  = useState(order.delivery_image ?? null)
  const [imagePreview, setImagePreview] = useState(order.delivery_image ?? null)
  const [uploading,    setUploading]    = useState(false)
  const [uploadError,  setUploadError]  = useState(null)
  const fileRef = useRef(null)

  const photoReady = Boolean(uploadedUrl)

  // Stable ref so the native listener never captures a stale closure
  const doUploadRef = useRef(null)
  doUploadRef.current = async function doUpload(file) {
    if (!file) return
    setUploading(true)
    setUploadError(null)
    try {
      const type     = file.type || 'image/jpeg'
      const ext      = type.split('/')[1] || 'jpg'
      const fileName = `delivery-${order.id}-${Date.now()}.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('deliveries')
        .upload(fileName, file, { contentType: type })
      if (uploadErr) throw new Error(uploadErr.message)

      const { data: imgData } = supabase.storage.from('deliveries').getPublicUrl(fileName)

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ delivery_image: imgData.publicUrl })
        .eq('id', order.id)
      if (updateErr) throw new Error(updateErr.message)

      setUploadedUrl(imgData.publicUrl)
      setImagePreview(URL.createObjectURL(file))
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    function handle(e) {
      const file = e.target?.files?.[0]
      if (!file) return
      doUploadRef.current(file)
      const input = e.target
      requestAnimationFrame(() => { input.value = '' })
    }
    const el = fileRef.current
    el?.addEventListener('change', handle)
    return () => el?.removeEventListener('change', handle)
  }, [])

  function triggerUpload() { if (fileRef.current) { fileRef.current.value = ''; fileRef.current.click() } }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => {
        if (e.target === e.currentTarget && !uploading && !confirming) onClose()
      }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Confirm Delivery</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              #{String(order.id).padStart(6,'0')} · {order.customer_name ?? '—'}
            </p>
          </div>
          <button onClick={onClose} disabled={uploading || confirming}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            aria-label="Close">
            <MdClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
              ${photoReady ? 'bg-[#168AFF] text-white' : 'bg-gray-200 text-gray-500'}`}>
              {photoReady ? <MdCheckCircle size={16} /> : '1'}
            </div>
            <p className={`text-xs font-semibold ${photoReady ? 'text-[#168AFF]' : 'text-gray-500'}`}>
              Add delivery photo
            </p>
            <div className="flex-1 h-px bg-gray-200 mx-1" />
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
              ${photoReady ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-300'}`}>
              2
            </div>
            <p className={`text-xs font-semibold ${photoReady ? 'text-gray-800' : 'text-gray-300'}`}>
              Confirm delivery
            </p>
          </div>

          {/* ── No photo yet: upload button ── */}
          {!imagePreview && !uploading && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500 text-center">
                Upload a clear photo of the delivered items at the customer's location.
              </p>
              <button
                type="button"
                onClick={triggerUpload}
                disabled={confirming}
                className="w-full flex items-center justify-center gap-3 py-5 px-4
                  bg-[#168AFF] text-white rounded-2xl font-bold text-sm
                  active:opacity-75 transition disabled:opacity-50">
                <MdUpload size={24} />
                Upload Delivery Photo
              </button>
            </div>
          )}

          {/* ── Uploading spinner ── */}
          {uploading && (
            <div className="w-full h-36 rounded-xl border-2 border-gray-100 bg-gray-50
              flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-[#168AFF] border-t-transparent
                rounded-full animate-spin" />
              <span className="text-xs text-gray-400 font-medium">Uploading photo…</span>
            </div>
          )}

          {/* ── Photo preview ── */}
          {imagePreview && !uploading && (
            <div className="space-y-2">
              <div className="relative w-full h-48 rounded-xl overflow-hidden border-2
                border-[#168AFF]/30">
                <img src={imagePreview} alt="Delivery proof"
                  className="w-full h-full object-contain" />
                <div className="absolute top-2.5 right-2.5 bg-[#168AFF] rounded-full p-1">
                  <MdCheckCircle size={16} className="text-white" />
                </div>
              </div>
              <button type="button" onClick={triggerUpload} disabled={confirming}
                className="w-full flex items-center justify-center gap-1.5 py-2 bg-gray-100
                  text-gray-600 rounded-xl text-xs font-semibold
                  active:bg-gray-200 transition disabled:opacity-50">
                <MdUpload size={15} /> Change Photo
              </button>
            </div>
          )}

          {uploadError && (
            <p className="text-red-500 text-xs text-center">{uploadError}</p>
          )}

          <input ref={fileRef} type="file" accept="image/*" className="hidden" />
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} disabled={uploading || confirming}
            className="flex-1 py-3 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50
              transition disabled:opacity-50">
            Cancel
          </button>
          <button
            onClick={() => onConfirm(order)}
            disabled={!photoReady || uploading || confirming}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all
              ${photoReady && !uploading && !confirming
                ? 'bg-[#168AFF] text-white hover:bg-[#1270DB] active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
            {confirming ? 'Confirming…' : 'Mark as Delivered'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Report Issue Modal ────────────────────────────────────────────────────────

function ReportModal({ order, onClose, onConfirm, submitting }) {
  const [reason, setReason]       = useState('')
  const [formError, setFormError] = useState(null)

  function handleConfirm() {
    if (!reason.trim() || reason.trim().length < 10) {
      setFormError('Please describe the issue (at least 10 characters).')
      return
    }
    setFormError(null)
    onConfirm(order, reason.trim())
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
        p-0 sm:p-4 bg-black/50 backdrop-blur-sm"
      onClick={e => { if (e.target === e.currentTarget && !submitting) onClose() }}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl shadow-xl">

        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 className="text-gray-800 font-bold text-base">Report Issue</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              #{String(order.id).padStart(6,'0')} · {order.customer_name ?? '—'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            aria-label="Close"
          >
            <MdClose size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="flex items-start gap-3 bg-red-50 border border-red-100
            rounded-xl px-4 py-3">
            <MdWarning size={18} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-600 text-xs leading-relaxed">
              Reporting will mark this order as <strong>cancelled</strong> and
              notify the admin. This action cannot be undone.
            </p>
          </div>

          {formError && (
            <p className="text-red-500 text-sm">{formError}</p>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Describe the Issue <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="e.g. Customer not home after 3 attempts. Address not found…"
              rows={4}
              disabled={submitting}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400
                transition disabled:bg-gray-50 disabled:text-gray-400 resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-1">
              {reason.trim().length} / min 10 chars
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50
              transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 py-3 text-sm font-semibold text-white
              bg-red-500 rounded-xl hover:bg-red-600
              transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DriverDashboard() {
  const { user }                          = useAuth()
  const [orders, setOrders]               = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState(null)
  const [busyId, setBusyId]               = useState(null)
  const [deliverTarget, setDeliverTarget] = useState(null)
  const [reportTarget, setReportTarget]   = useState(null)
  const [modalBusy, setModalBusy]         = useState(false)
  const [chatOrderId, setChatOrderId]     = useState(null)

  const fetchDeliveries = useCallback(async (silent = false) => {
    if (!user) return
    if (!silent) { setLoading(true); setError(null) }
    const { data, error: err } = await supabase
      .from('orders')
      .select('*, customer:profiles!orders_customer_id_fkey(full_name, contact_number, membership_status, avatar_url, store_name, role), order_items(quantity, products(name, unit_type)), rewards(id, name, points_required)')
      .eq('driver_id', user.id)
      .in('status', ['assigned', 'on_the_way', 'cancelled'])
      .order('created_at', { ascending: false })
    if (err) { if (!silent) setError('Failed to load deliveries.') }
    else setOrders(data ?? [])
    if (!silent) setLoading(false)
  }, [user])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

  // Real-time + polling fallback — silent so no loading flicker on background refreshes
  useEffect(() => {
    if (!user) return
    const channel = supabaseRT
      .channel('driver-orders-rt')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders', filter: `driver_id=eq.${user.id}` },
        () => fetchDeliveries(true))
      .subscribe()
    const poll = setInterval(() => fetchDeliveries(true), 10000)
    return () => { supabaseRT.removeChannel(channel); clearInterval(poll) }
  }, [user, fetchDeliveries])

  // ── Accept Delivery ────────────────────────────────────────────────────────
  async function acceptDelivery(orderId) {
    setBusyId(orderId)
    const { error: err } = await supabase
      .from('orders')
      .update({ status: 'on_the_way' })
      .eq('id', orderId)
    if (err) {
      setError('Failed to update status.')
    } else {
      setOrders(prev =>
        prev.map(o => o.id === orderId ? { ...o, status: 'on_the_way' } : o)
      )
      toast.success('Delivery started — customer can see you\'re on the way!')
    }
    setBusyId(null)
  }

  // ── Confirm Delivered (photo already saved to delivery_image in DB) ────────
  async function confirmDelivered(order) {
    setModalBusy(true)
    try {
      // 1. Update order status to delivered with exact timestamp
      const deliveredAt = new Date().toISOString()
      const { error: orderErr } = await supabase
        .from('orders')
        .update({ status: 'delivered', delivered_at: deliveredAt })
        .eq('id', order.id)
      if (orderErr) throw new Error(orderErr.message)

      // 2. Get current points balance (null → customer has no row yet, treat as 0)
      const { data: currentPts, error: ptsErr } = await supabase
        .from('customer_points')
        .select('total_points')
        .eq('customer_id', order.customer_id)
        .maybeSingle()
      if (ptsErr) throw new Error(ptsErr.message)

      let balance = currentPts?.total_points ?? 0

      // 3. Award points — only active members earn 1 pt per ₱100 spent
      //    Expired / no membership: earns 0 pts but keeps existing balance + can still redeem
      const isActiveMember = order.customer?.membership_status === 'active'
      const pointsEarned   = isActiveMember ? Math.floor((order.total ?? 0) / 100) : 0
      balance += pointsEarned

      // 4. Deduct reward points if a reward was applied (all customers can redeem)
      const reward = order.rewards
      let rewardMsg = ''
      if (reward?.id) {
        balance = Math.max(0, balance - (reward.points_required ?? 0))
        const { error: redeemErr } = await supabase
          .from('redeemed_rewards')
          .insert({
            customer_id: order.customer_id,
            reward_id:   reward.id,
            redeemed_at: new Date().toISOString(),
          })
        if (redeemErr) throw new Error(redeemErr.message)
        rewardMsg = ` · "${reward.name}" redeemed`
      }

      // 5. Save final balance only if something changed (points earned or reward deducted)
      if (pointsEarned > 0 || reward?.id) {
        const { error: upsertErr } = await supabase
          .from('customer_points')
          .upsert(
            { customer_id: order.customer_id, total_points: balance },
            { onConflict: 'customer_id' }
          )
        if (upsertErr) throw new Error(upsertErr.message)
      }

      // 6. Remove from active list
      setOrders(prev => prev.filter(o => o.id !== order.id))
      setDeliverTarget(null)
      const ptsMsg = pointsEarned > 0
        ? `+${pointsEarned} pts earned`
        : isActiveMember ? '+0 pts' : 'No pts (no active membership)'
      toast.success(`Delivered! ${ptsMsg}${rewardMsg}.`)
    } catch (err) {
      toast.error('Failed to confirm delivery: ' + err.message)
    } finally {
      setModalBusy(false)
    }
  }

  // ── Report Issue ───────────────────────────────────────────────────────────
  async function submitReport(order, reason) {
    setModalBusy(true)
    try {
      const { error: err } = await supabase
        .from('orders')
        .update({ status: 'cancelled', cancellation_reason: reason })
        .eq('id', order.id)
      if (err) throw new Error(err.message)

      setOrders(prev => prev.filter(o => o.id !== order.id))
      setReportTarget(null)
      toast.success('Issue reported. Admin has been notified.')
    } catch (err) {
      toast.error('Failed to submit report: ' + err.message)
    } finally {
      setModalBusy(false)
    }
  }

  // Separate active deliveries from recently cancelled ones
  // Show cancelled orders that were updated today (customer may have just cancelled)
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
  const activeOrders    = orders.filter(o => ['assigned', 'on_the_way'].includes(o.status))
  const cancelledOrders = orders.filter(o =>
    o.status === 'cancelled' && new Date(o.updated_at ?? o.created_at) >= todayStart
  )

  const assignedCount = activeOrders.filter(o => o.status === 'assigned').length
  const onWayCount    = activeOrders.filter(o => o.status === 'on_the_way').length

  return (
    <DriverLayout>
      <div className="space-y-5">

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Deliveries</h2>
            {!loading && (
              <p className="text-gray-400 text-sm mt-0.5">
                {activeOrders.length === 0
                  ? 'No active deliveries'
                  : `${assignedCount} assigned · ${onWayCount} on the way`}
              </p>
            )}
          </div>
          <button
            onClick={fetchDeliveries}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 text-gray-400
              hover:bg-gray-50 hover:text-gray-600 transition disabled:opacity-50"
            aria-label="Refresh"
          >
            <MdRefresh size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700
            text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <>
            {/* ── Cancelled orders alert (customer-cancelled today) ── */}
            {cancelledOrders.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-px flex-1 bg-red-100" />
                  <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest px-1">
                    Cancelled Today
                  </span>
                  <div className="h-px flex-1 bg-red-100" />
                </div>
                {cancelledOrders.map(order => (
                  <div key={order.id}
                    className="bg-red-50 border border-red-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-gray-700 font-bold text-sm font-mono tracking-wide">
                        #{String(order.id).padStart(6,'0')}
                      </p>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full
                        text-xs font-semibold bg-red-100 text-red-700 whitespace-nowrap">
                        Cancelled
                      </span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center
                        justify-center font-bold text-xs text-red-500 shrink-0">
                        {(order.customer_name ?? 'C')[0].toUpperCase()}
                      </div>
                      <p className="text-gray-700 text-sm font-semibold">{order.customer_name ?? '—'}</p>
                    </div>
                    {order.address && (
                      <div className="flex items-start gap-2">
                        <MdLocationOn size={14} className="text-gray-400 shrink-0 mt-0.5" />
                        <p className="text-gray-500 text-xs leading-snug">{order.address}</p>
                      </div>
                    )}
                    {order.cancellation_reason && (
                      <div className="bg-white border border-red-100 rounded-xl px-3.5 py-3 space-y-1">
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">
                          Cancellation Reason
                        </p>
                        <p className="text-red-700 text-sm leading-relaxed">
                          {order.cancellation_reason}
                        </p>
                      </div>
                    )}
                    <p className="text-red-400 text-xs text-center font-medium">
                      Do not proceed with this delivery.
                    </p>
                  </div>
                ))}
                <div className="h-1" />
              </div>
            )}

            {/* ── Active deliveries ── */}
            {activeOrders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm
                px-5 py-16 flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <MdDirectionsCar size={30} className="text-gray-300" />
                </div>
                <div>
                  <p className="font-semibold text-gray-500">No active deliveries</p>
                  <p className="text-gray-400 text-xs mt-1">
                    New assignments will appear here automatically.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map(order => (
                  <DeliveryCard
                    key={order.id}
                    order={order}
                    busy={busyId === order.id}
                    onAccept={acceptDelivery}
                    onDeliver={o => setDeliverTarget(o)}
                    onReport={o => setReportTarget(o)}
                    chatOpen={chatOrderId === order.id}
                    onToggleChat={() => setChatOrderId(chatOrderId === order.id ? null : order.id)}
                    driverId={user.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {deliverTarget && (
        <DeliverModal
          order={deliverTarget}
          confirming={modalBusy}
          onClose={() => { if (!modalBusy) setDeliverTarget(null) }}
          onConfirm={confirmDelivered}
        />
      )}

      {reportTarget && (
        <ReportModal
          order={reportTarget}
          submitting={modalBusy}
          onClose={() => { if (!modalBusy) setReportTarget(null) }}
          onConfirm={submitReport}
        />
      )}
    </DriverLayout>
  )
}
