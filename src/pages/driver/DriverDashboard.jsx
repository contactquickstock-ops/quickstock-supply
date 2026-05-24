import { useEffect, useState, useCallback, useRef } from 'react'
import {
  MdDirectionsCar, MdLocationOn, MdPerson, MdPhone,
  MdInventory2, MdRefresh, MdCheckCircle, MdWarning,
  MdClose, MdCameraAlt, MdUpload, MdStar, MdChat,
} from 'react-icons/md'
import OrderChat from '../../components/OrderChat'
import DriverLayout from '../../layouts/DriverLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
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

// ── Delivery Card ─────────────────────────────────────────────────────────────

function DeliveryCard({ order, onAccept, onDeliver, onReport, busy, chatOpen, onToggleChat, driverId }) {
  const cfg   = STATUS_CONFIG[order.status] ?? { color: 'bg-gray-100 text-gray-600', label: order.status }
  const items = order.order_items ?? []

  return (
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
        <div className="flex items-start gap-2.5">
          <MdPerson size={16} className="text-gray-400 shrink-0 mt-0.5" />
          <p className="text-gray-700 font-semibold text-sm">
            {order.customer_name ?? '—'}
          </p>
        </div>
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
  )
}

// ── Mark as Delivered Modal ────────────────────────────────────────────────────
// Phase 1: Upload photo → saves to orders.delivery_image immediately
// Phase 2: "Mark as Delivered" becomes active → updates status + awards points

function DeliverModal({ order, onClose, onConfirm, confirming }) {
  // Seed with photo already in DB (driver may have uploaded but not confirmed)
  const [uploadedUrl, setUploadedUrl]     = useState(order.delivery_image ?? null)
  const [imagePreview, setImagePreview]   = useState(order.delivery_image ?? null)
  const [uploading, setUploading]         = useState(false)
  const [uploadError, setUploadError]     = useState(null)
  const fileInputRef                      = useRef(null)

  const photoReady = Boolean(uploadedUrl)

  async function handleFileChange(e) {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setUploadError(null)

    try {
      // 1. Upload delivery image to storage
      const ext      = file.type.split('/')[1] || 'jpg'
      const fileName = `delivery-${order.id}-${Date.now()}.${ext}`
      const { error: uploadErr } = await supabase.storage
        .from('deliveries')
        .upload(fileName, file, { contentType: file.type })
      if (uploadErr) throw new Error(uploadErr.message)

      const { data: imgData } = supabase.storage
        .from('deliveries')
        .getPublicUrl(fileName)
      const imageUrl = imgData.publicUrl

      // 2. Save URL to orders.delivery_image immediately
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ delivery_image: imageUrl })
        .eq('id', order.id)
      if (updateErr) throw new Error(updateErr.message)

      setUploadedUrl(imageUrl)
      setImagePreview(URL.createObjectURL(file))
    } catch (err) {
      setUploadError(err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

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
          <button
            onClick={onClose}
            disabled={uploading || confirming}
            className="p-1 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
            aria-label="Close"
          >
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
              Upload delivery photo
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

          {/* Photo upload area */}
          <div>
            <div
              onClick={() => !uploading && !confirming && fileInputRef.current?.click()}
              className={`relative w-full h-48 rounded-xl border-2 overflow-hidden
                flex items-center justify-center transition-colors group
                ${imagePreview
                  ? 'border-transparent cursor-pointer'
                  : uploading
                    ? 'border-gray-200 cursor-not-allowed'
                    : 'border-dashed border-gray-200 hover:border-[#168AFF] cursor-pointer'}`}
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Delivery proof"
                    className="w-full h-full object-cover"
                  />
                  {/* Uploaded checkmark */}
                  {!uploading && (
                    <div className="absolute top-2.5 right-2.5 bg-[#168AFF] rounded-full p-1">
                      <MdCheckCircle size={16} className="text-white" />
                    </div>
                  )}
                  {/* Change overlay */}
                  {!uploading && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                      transition-colors flex items-center justify-center">
                      <span className="text-white text-xs font-semibold opacity-0
                        group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <MdUpload size={14} /> Change photo
                      </span>
                    </div>
                  )}
                </>
              ) : uploading ? (
                <div className="flex flex-col items-center gap-3 text-gray-400 select-none">
                  <div className="w-8 h-8 border-2 border-[#168AFF] border-t-transparent
                    rounded-full animate-spin" />
                  <span className="text-xs">Uploading photo…</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-300 select-none">
                  <MdCameraAlt size={40} />
                  <span className="text-sm font-semibold text-gray-400">
                    Tap to take / upload photo
                  </span>
                  <span className="text-[10px] text-gray-300 text-center px-4">
                    Take a clear photo showing delivered items at the customer's location
                  </span>
                </div>
              )}
            </div>

            {uploadError && (
              <p className="text-red-500 text-xs mt-2">{uploadError}</p>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              disabled={uploading || confirming}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading || confirming}
            className="flex-1 py-3 text-sm font-semibold text-gray-600
              border border-gray-200 rounded-xl hover:bg-gray-50
              transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(order)}
            disabled={!photoReady || uploading || confirming}
            className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all
              ${photoReady && !uploading && !confirming
                ? 'bg-[#168AFF] text-white hover:bg-[#1270DB] active:scale-[0.98]'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
          >
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

  const fetchDeliveries = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    const { data, error: err } = await supabase
      .from('orders')
      .select('*, customer:profiles!orders_customer_id_fkey(contact_number), order_items(quantity, products(name, unit_type)), rewards(id, name, points_required)')
      .eq('driver_id', user.id)
      .in('status', ['assigned', 'on_the_way'])
      .order('created_at', { ascending: false })
    if (err) setError('Failed to load deliveries.')
    else setOrders(data ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchDeliveries() }, [fetchDeliveries])

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
      // 1. Update order status to delivered
      const { error: orderErr } = await supabase
        .from('orders')
        .update({ status: 'delivered' })
        .eq('id', order.id)
      if (orderErr) throw new Error(orderErr.message)

      // 2. Get current customer points
      const { data: currentPts } = await supabase
        .from('customer_points')
        .select('total_points')
        .eq('customer_id', order.customer_id)
        .maybeSingle()

      let balance = currentPts?.total_points ?? 0

      // 3. Award points earned from this order (₱100 = 1 pt)
      const pointsEarned = Math.floor((order.total ?? 0) / 100)
      balance += pointsEarned

      // 4. Deduct reward points if a reward was applied
      const reward = order.rewards
      let rewardMsg = ''
      if (reward?.id) {
        balance = Math.max(0, balance - (reward.points_required ?? 0))
        await supabase
          .from('redeemed_rewards')
          .insert({
            customer_id: order.customer_id,
            reward_id:   reward.id,
            redeemed_at: new Date().toISOString(),
          })
        rewardMsg = ` · "${reward.name}" redeemed`
      }

      // 5. Save final points balance
      await supabase
        .from('customer_points')
        .upsert(
          { customer_id: order.customer_id, total_points: balance },
          { onConflict: 'customer_id' }
        )

      // 6. Remove from active list
      setOrders(prev => prev.filter(o => o.id !== order.id))
      setDeliverTarget(null)
      toast.success(`Delivered! +${pointsEarned} pts earned${rewardMsg}.`)
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

  const assignedCount = orders.filter(o => o.status === 'assigned').length
  const onWayCount    = orders.filter(o => o.status === 'on_the_way').length

  return (
    <DriverLayout>
      <div className="space-y-5">

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Deliveries</h2>
            {!loading && (
              <p className="text-gray-400 text-sm mt-0.5">
                {orders.length === 0
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
        ) : orders.length === 0 ? (
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
            {orders.map(order => (
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
