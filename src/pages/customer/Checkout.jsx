import { useState, useEffect } from 'react'
import { useNavigate, Navigate, useLocation } from 'react-router-dom'
import {
  MdLocationOn, MdPlace, MdNotes, MdPayment,
  MdCheckCircle, MdShoppingCart, MdStar, MdCardGiftcard,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { supabaseAdmin as supabase } from '../../services/supabaseAdmin'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import toast from 'react-hot-toast'

function calcFees(subtotal) {
  const deliveryFee = subtotal >= 500 ? 0 : 25
  const total       = subtotal + deliveryFee
  return { deliveryFee, total }
}

export default function Checkout() {
  const { user, profile }                                        = useAuth()
  const { cartItems, totalAmount, itemCount, clearCart }         = useCart()
  const navigate                                                 = useNavigate()
  const location                                                 = useLocation()

  const selectedReward = location.state?.selectedReward ?? null

  const [address,  setAddress]  = useState(profile?.address ?? '')
  const [landmark, setLandmark] = useState('')
  const [notes,    setNotes]    = useState('')
  const [placing,  setPlacing]  = useState(false)
  const [error,    setError]    = useState(null)

  // Pre-fill address once profile is available (if it loaded after mount)
  useEffect(() => {
    if (profile?.address && !address) {
      setAddress(profile.address)
    }
  }, [profile?.address])   // eslint-disable-line react-hooks/exhaustive-deps

  // Guard: empty cart should never reach checkout
  if (cartItems.length === 0) {
    return <Navigate to="/customer/cart" replace />
  }

  const subtotal                  = totalAmount
  const { deliveryFee, total }    = calcFees(subtotal)

  async function handlePlaceOrder(e) {
    e.preventDefault()

    if (!address.trim()) {
      setError('Please enter your delivery address.')
      return
    }

    setPlacing(true)
    setError(null)

    try {
      // 1. Insert the order
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .insert({
          customer_id:   user.id,
          customer_name: profile?.full_name ?? '',
          status:        'pending',
          subtotal,
          delivery_fee:  deliveryFee,
          total,
          address:       address.trim(),
          landmark:      landmark.trim() || null,
          notes:         notes.trim() || null,
          reward_id:     selectedReward?.id ?? null,
        })
        .select()
        .single()

      if (orderErr) throw new Error(orderErr.message)

      // 2. Insert all order items
      const items = cartItems.map(({ product, quantity }) => ({
        order_id:   order.id,
        product_id: product.id,
        quantity,
        price:      product.price,
        subtotal:   product.price * quantity,
      }))

      const { error: itemsErr } = await supabase
        .from('order_items')
        .insert(items)

      if (itemsErr) throw new Error(itemsErr.message)

      // 3. Clear cart → toast → redirect
      clearCart()
      toast.success('Order placed successfully!', { duration: 3000 })
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
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <MdLocationOn size={18} className="text-[#168AFF]" />
                Delivery Address
              </h3>
              <textarea
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Enter your complete delivery address…"
                rows={3}
                disabled={placing}
                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-[#168AFF]/30 focus:border-[#168AFF]
                  transition disabled:bg-gray-50 disabled:text-gray-400 resize-none"
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

            {/* Payment method — COD only */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <h3 className="text-gray-700 font-bold text-sm flex items-center gap-2">
                <MdPayment size={18} className="text-[#168AFF]" />
                Payment Method
              </h3>
              <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl
                border-2 border-[#168AFF] bg-[#168AFF]/5">
                <MdCheckCircle size={20} className="text-[#168AFF] shrink-0" />
                <div>
                  <p className="text-gray-800 font-bold text-sm">Cash on Delivery</p>
                  <p className="text-gray-400 text-xs mt-0.5">Pay in cash when your order arrives</p>
                </div>
              </div>
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
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-200">
                          <MdShoppingCart size={14} />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 font-medium text-xs line-clamp-1">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        ×{quantity} · {product.unit_type ?? 'unit'}
                      </p>
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
                      ? <img src={selectedReward.image_url} alt={selectedReward.name} className="w-full h-full object-cover" />
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
                  {deliveryFee === 0
                    ? <span className="text-green-600 font-bold">FREE</span>
                    : <span>₱{deliveryFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>}
                </div>
              </div>

              <div className="border-t border-gray-100" />

              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="font-bold text-xl text-[#168AFF]">
                  ₱{total.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                </span>
              </div>

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
