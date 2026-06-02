import { useState, useEffect, useRef } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import {
  MdLocationOn, MdPlace, MdNotes, MdPayment,
  MdCheckCircle, MdShoppingCart, MdStar, MdCardGiftcard,
  MdImage, MdUpload, MdSmartphone,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

function calcFees(subtotal, isMember) {
  const deliveryFee = (isMember || subtotal >= 500) ? 0 : 25
  const total       = subtotal + deliveryFee
  return { deliveryFee, total }
}

// ── GCash number to display — update this to your actual GCash number ──────────
const GCASH_NUMBER = '0930-822-0901'
const GCASH_NAME   = 'QuickStock Supply'

export default function Checkout() {
  const { user, profile }                                = useAuth()
  const { cartItems, totalAmount, itemCount, clearCart } = useCart()
  const navigate                                         = useNavigate()
  const location                                         = useLocation()
  const proofRef                                         = useRef(null)

  const selectedReward = location.state?.selectedReward ?? null

  function buildAddress(p) {
    return [p?.address_house_no, p?.address_street, p?.address_city, p?.address_province, p?.address_country]
      .filter(Boolean).join(', ')
  }

  const [address,       setAddress]       = useState(() => buildAddress(profile))
  const [landmark,      setLandmark]      = useState('')
  const [notes,         setNotes]         = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')   // 'cod' | 'gcash'
  const [proofFile,     setProofFile]     = useState(null)
  const [proofPreview,  setProofPreview]  = useState(null)
  const [placing,       setPlacing]       = useState(false)
  const [error,         setError]         = useState(null)

  // Pre-fill address once profile is available
  useEffect(() => {
    const composed = buildAddress(profile)
    if (composed && !address) setAddress(composed)
  }, [profile?.address_street])   // eslint-disable-line react-hooks/exhaustive-deps

  // Guard: empty cart should never reach checkout
  if (cartItems.length === 0) {
    return <Navigate to="/customer/cart" replace />
  }

  const subtotal               = totalAmount
  const isMember               = profile?.membership_status === 'active'
  const { deliveryFee, total } = calcFees(subtotal, isMember)

  function handleProofChange(e) {
    const file = e.target.files[0]
    if (!file) return
    setProofFile(file)
    setProofPreview(URL.createObjectURL(file))
    e.target.value = ''
    setError(null)
  }

  async function handlePlaceOrder(e) {
    e.preventDefault()

    if (!address.trim()) {
      setError('Please enter your delivery address.')
      return
    }
    if (paymentMethod === 'gcash' && !proofFile && !proofPreview) {
      setError('Please upload your GCash payment proof.')
      return
    }

    setPlacing(true)
    setError(null)

    try {
      // 1. Upload GCash proof if needed
      let paymentProofUrl = null
      if (paymentMethod === 'gcash' && proofFile) {
        const ext      = proofFile.type.split('/')[1] || 'jpg'
        const fileName = `gcash-${user.id}-${Date.now()}.${ext}`
        const { error: upErr } = await supabase.storage
          .from('order-payments')
          .upload(fileName, proofFile, { contentType: proofFile.type, upsert: false })
        if (upErr) throw new Error(upErr.message)
        const { data: urlData } = supabase.storage.from('order-payments').getPublicUrl(fileName)
        paymentProofUrl = urlData.publicUrl
      }

      // 2. Insert the order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id:     user.id,
          customer_name:   profile?.full_name ?? '',
          status:          'pending',
          subtotal,
          delivery_fee:    deliveryFee,
          total,
          address:         address.trim(),
          landmark:        landmark.trim() || null,
          notes:           notes.trim() || null,
          reward_id:       selectedReward?.id ?? null,
          payment_method:  paymentMethod,
          payment_proof:   paymentProofUrl,
        })
        .select()
        .single()

      if (orderErr) throw new Error(orderErr.message)

      // 3. Insert all order items
      const items = cartItems.map(({ product, quantity }) => ({
        order_id:   order.id,
        product_id: product.id,
        quantity,
        price:      product.price,
        subtotal:   product.price * quantity,
      }))

      const { error: itemsErr } = await supabase.from('order_items').insert(items)
      if (itemsErr) throw new Error(itemsErr.message)

      // 4. Clear cart → toast → redirect
      clearCart()
      toast.success('Order placed successfully!')
      navigate('/customer/orders')
    } catch (err) {
      setError(err.message)
      setPlacing(false)
    }
  }

  return (
    <CustomerLayout>
      <div className="space-y-5 max-w-4xl mx-auto">

        {/* Heading */}
        <div>
          <h2 className="text-xl font-bold text-gray-800">Checkout</h2>
          <p className="text-gray-400 text-sm mt-0.5">Review your order before placing</p>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-start"
        >

          {/* ── Left col: form fields (3/5) ── */}
          <div className="lg:col-span-3 space-y-4">

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm
                px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Delivery address */}
            <div className={`bg-white rounded-2xl border shadow-sm p-5 space-y-3 transition
              ${error && !address.trim() ? 'border-red-300' : 'border-gray-100'}`}>
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <MdLocationOn size={18} className="text-[#168AFF]" />
                Delivery Address
                <span className="text-red-500">*</span>
              </h3>
              <textarea
                value={address}
                onChange={e => { setAddress(e.target.value); setError(null) }}
                placeholder="Enter your complete delivery address…"
                rows={3}
                required
                disabled={placing}
                className={`w-full px-3.5 py-2.5 text-sm border rounded-xl
                  focus:outline-none focus:ring-2 transition disabled:bg-gray-50
                  disabled:text-gray-400 resize-none
                  ${error && !address.trim()
                    ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-[#168AFF]/30 focus:border-[#168AFF]'}`}
              />
            </div>

            {/* Landmark */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <MdPlace size={18} className="text-[#168AFF]" />
                Landmark
                <span className="text-gray-400 font-normal">(optional)</span>
              </h3>
              <input
                type="text"
                value={landmark}
                onChange={e => setLandmark(e.target.value)}
                placeholder="e.g. Near 7-Eleven, beside the blue gate…"
                disabled={placing}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  transition disabled:bg-gray-50 disabled:text-gray-400"
              />
            </div>

            {/* Order notes */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <MdNotes size={18} className="text-[#168AFF]" />
                Order Notes
                <span className="text-gray-400 font-normal">(optional)</span>
              </h3>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any special instructions for your delivery?"
                rows={3}
                disabled={placing}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  transition disabled:bg-gray-50 disabled:text-gray-400 resize-none"
              />
            </div>

            {/* Payment method */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <MdPayment size={18} className="text-[#168AFF]" />
                Payment Method
              </h3>

              {/* Options */}
              <div className="grid grid-cols-2 gap-3">
                {/* COD */}
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('cod'); setError(null) }}
                  disabled={placing}
                  className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2
                    transition text-center
                    ${paymentMethod === 'cod'
                      ? 'border-[#168AFF] bg-[#168AFF]/5'
                      : 'border-gray-200 hover:border-gray-300'}`}>
                  <MdPayment size={24} className={paymentMethod === 'cod' ? 'text-[#168AFF]' : 'text-gray-400'} />
                  <div>
                    <p className={`font-bold text-sm ${paymentMethod === 'cod' ? 'text-[#168AFF]' : 'text-gray-700'}`}>
                      Cash on Delivery
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Pay in cash upon arrival</p>
                  </div>
                  {paymentMethod === 'cod' && (
                    <MdCheckCircle size={16} className="text-[#168AFF]" />
                  )}
                </button>

                {/* GCash */}
                <button
                  type="button"
                  onClick={() => { setPaymentMethod('gcash'); setError(null) }}
                  disabled={placing}
                  className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl border-2
                    transition text-center
                    ${paymentMethod === 'gcash'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'}`}>
                  <MdSmartphone size={24} className={paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-400'} />
                  <div>
                    <p className={`font-bold text-sm ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-700'}`}>
                      GCash
                    </p>
                    <p className="text-gray-400 text-xs mt-0.5">Pay via GCash transfer</p>
                  </div>
                  {paymentMethod === 'gcash' && (
                    <MdCheckCircle size={16} className="text-blue-500" />
                  )}
                </button>
              </div>

              {/* GCash details + proof upload */}
              {paymentMethod === 'gcash' && (
                <div className="space-y-4">
                  {/* GCash send-to info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3.5 space-y-1.5">
                    <p className="text-blue-800 font-bold text-xs uppercase tracking-wide">
                      Send Payment To
                    </p>
                    <p className="text-blue-700 font-black text-lg tracking-wider">
                      {GCASH_NUMBER}
                    </p>
                    <p className="text-blue-600 font-semibold text-sm">{GCASH_NAME}</p>
                    <p className="text-blue-500 text-xs mt-1">
                      Amount: <strong className="text-blue-700">
                        ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      </strong>
                    </p>
                    <p className="text-blue-400 text-[11px] mt-1 leading-relaxed">
                      After sending, take a screenshot of the GCash confirmation and upload it below.
                      Your order will be reviewed and confirmed by our team.
                    </p>
                  </div>

                  {/* Proof upload */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                      GCash Payment Proof <span className="text-red-500">*</span>
                    </label>
                    <div
                      onClick={() => !placing && proofRef.current?.click()}
                      className={`relative w-full h-48 rounded-xl border-2 border-dashed
                        flex items-center justify-center overflow-hidden cursor-pointer
                        transition-colors group
                        ${proofPreview
                          ? 'border-transparent'
                          : error && paymentMethod === 'gcash' && !proofPreview
                            ? 'border-red-300 hover:border-red-400'
                            : 'border-gray-200 hover:border-blue-400'}`}
                    >
                      {proofPreview ? (
                        <>
                          <img src={proofPreview} alt="Payment proof"
                            className="w-full h-full object-contain p-2" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30
                            transition-colors flex items-center justify-center">
                            <span className="text-white text-xs font-semibold opacity-0
                              group-hover:opacity-100 flex items-center gap-1">
                              <MdUpload size={14} /> Change
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-gray-300 px-4 text-center">
                          <MdImage size={32} />
                          <span className="text-xs text-gray-500 font-medium">
                            Upload GCash screenshot
                          </span>
                          <span className="text-[11px] text-gray-400 leading-relaxed">
                            Take a screenshot of your <strong className="text-gray-500">GCash payment confirmation</strong> and upload it here
                          </span>
                        </div>
                      )}
                    </div>
                    {proofPreview && (
                      <button type="button"
                        onClick={() => { setProofFile(null); setProofPreview(null) }}
                        className="mt-1.5 text-xs text-red-500 hover:underline">
                        Remove
                      </button>
                    )}
                    <input ref={proofRef} type="file" accept="image/*"
                      className="hidden" disabled={placing}
                      onChange={handleProofChange} />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Right col: order summary (2/5) ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
              lg:sticky lg:top-20 space-y-4">

              <h3 className="text-gray-800 font-bold text-base">Order Summary</h3>

              {/* Items */}
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-50 shrink-0">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name}
                          className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <MdShoppingCart size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 font-medium text-xs line-clamp-1">{product.name}</p>
                      <p className="text-gray-400 text-xs">×{quantity} · {product.unit_type ?? 'unit'}</p>
                    </div>
                    <p className="text-gray-700 font-bold text-xs shrink-0">
                      ₱{(product.price * quantity).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100" />

              {/* Applied reward */}
              {selectedReward && (
                <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#168AFF]/5
                  rounded-xl border border-[#168AFF]/20">
                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-white border border-[#168AFF]/20 shrink-0">
                    {selectedReward.image_url
                      ? <img src={selectedReward.image_url} alt={selectedReward.name} className="w-full h-full object-contain p-0.5" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <MdStar size={16} className="text-yellow-400" />
                        </div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <MdCardGiftcard size={12} className="text-[#168AFF] shrink-0" />
                      <p className="text-[10px] font-bold text-[#168AFF] uppercase tracking-wide">Reward Applied</p>
                    </div>
                    <p className="text-xs font-bold text-gray-700 truncate">{selectedReward.name}</p>
                    <p className="text-[10px] text-gray-400">
                      {selectedReward.points_required} pts · redeemed on delivery
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-100" />

              {/* Totals */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
                  <span>₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Fee</span>
                  <span>
                    {deliveryFee === 0
                      ? <span className="text-green-600 font-bold">
                          FREE{isMember && subtotal < 500 ? ' (member)' : ''}
                        </span>
                      : <span>₱{deliveryFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>}
                  </span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Payment</span>
                  <span className={`font-semibold text-xs ${paymentMethod === 'gcash' ? 'text-blue-600' : 'text-gray-600'}`}>
                    {paymentMethod === 'gcash' ? 'GCash' : 'Cash on Delivery'}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-xl text-[#168AFF]">
                  ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>

              {paymentMethod === 'gcash' && !proofPreview && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200
                  rounded-xl px-3 py-2 text-center font-medium">
                  ⚠ Upload your GCash proof to place order
                </p>
              )}

              {/* Place Order */}
              <button
                type="submit"
                disabled={placing}
                className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
                  hover:bg-[#1270DB] active:scale-[0.98] transition-all shadow-sm
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {placing ? 'Placing Order…' : 'Place Order'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/customer/cart')}
                disabled={placing}
                className="w-full py-2 text-gray-400 text-sm font-medium
                  hover:text-[#168AFF] transition disabled:opacity-50"
              >
                ← Back to Cart
              </button>
            </div>
          </div>
        </form>
      </div>
    </CustomerLayout>
  )
}
