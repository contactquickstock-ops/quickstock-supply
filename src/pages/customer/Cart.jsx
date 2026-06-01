import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  MdAdd, MdRemove, MdDelete, MdShoppingCart,
  MdLocalShipping, MdCheckCircle, MdStar, MdCardGiftcard,
  MdArrowUpward, MdArrowDownward,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { supabaseAdmin } from '../../services/supabaseAdmin'

function calcFees(subtotal) {
  const deliveryFee = subtotal >= 500 ? 0 : 25
  const grandTotal  = subtotal + deliveryFee
  return { deliveryFee, grandTotal }
}

function EmptyCart({ onBrowse }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <MdShoppingCart size={38} className="text-gray-300" />
      </div>
      <div className="text-center">
        <h3 className="text-gray-700 font-bold text-lg">Your cart is empty</h3>
        <p className="text-gray-400 text-sm mt-1">
          Browse our products and add items to get started.
        </p>
      </div>
      <button onClick={onBrowse}
        className="mt-1 px-6 py-2.5 bg-[#168AFF] text-white rounded-xl
          font-semibold text-sm hover:bg-[#1270DB] transition shadow-sm">
        Browse Products
      </button>
    </div>
  )
}

function CartItem({ item, onRemove, onIncrease, onDecrease }) {
  const { product, quantity } = item
  const itemSubtotal = product.price * quantity
  const [expanded, setExpanded] = useState(false)
  const longDesc = (product.description ?? '').length > 60

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-contain p-1" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdShoppingCart size={22} />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-[#168AFF] uppercase tracking-wide">
              {product.category ?? '—'}
            </p>
            <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-1 mt-0.5">
              {product.name}
            </h4>
            {product.description && (
              <div className="mt-0.5">
                <p className={`text-gray-400 text-[11px] leading-relaxed ${expanded ? '' : 'line-clamp-2'}`}>
                  {product.description}
                </p>
                {longDesc && (
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
                    className="text-[#168AFF] text-[10px] font-semibold hover:underline mt-0.5">
                    {expanded ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            )}
            {/* Price — strikethrough + arrow if admin changed it */}
            {(() => {
              const prev    = product.previous_price
              const curr    = product.price
              const changed = prev != null && Number(prev) !== Number(curr)
              const up      = changed && Number(curr) > Number(prev)
              return changed ? (
                <div className="mt-0.5">
                  <span className="inline-block bg-green-500 text-white text-[9px] font-black
                    px-1.5 py-0.5 rounded leading-tight tracking-wide mb-0.5">
                    NEW PRICE
                  </span>
                  <div className="flex items-center gap-1">
                    <p className="text-gray-800 font-bold text-sm">
                      ₱{Number(curr).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                      <span className="text-gray-400 font-normal text-xs"> / {product.unit_type ?? 'unit'}</span>
                    </p>
                    {up
                      ? <MdArrowUpward size={14} className="text-red-500 shrink-0" />
                      : <MdArrowDownward size={14} className="text-green-600 shrink-0" />}
                  </div>
                  <p className="text-red-400 text-[11px] line-through leading-tight">
                    ₱{Number(prev).toLocaleString('en-PH', { minimumFractionDigits: 2 })} / {product.unit_type ?? 'unit'}
                  </p>
                </div>
              ) : (
                <p className="text-gray-400 text-xs mt-0.5">
                  ₱{Number(curr).toLocaleString('en-PH', { minimumFractionDigits: 2 })} / {product.unit_type ?? 'unit'}
                </p>
              )
            })()}
          </div>
          <button onClick={onRemove} aria-label="Remove item"
            className="p-1 text-gray-300 hover:text-red-400 transition shrink-0">
            <MdDelete size={18} />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={onDecrease} disabled={quantity <= 1}
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition
                ${quantity <= 1
                  ? 'border-gray-100 text-gray-200 cursor-not-allowed'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}>
              <MdRemove size={14} />
            </button>
            <span className="w-8 text-center text-sm font-bold text-gray-700">{quantity}</span>
            <button onClick={onIncrease}
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition">
              <MdAdd size={14} />
            </button>
          </div>
          <p className="text-gray-800 font-bold text-sm">
            ₱{itemSubtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  )
}

function OrderSummary({ subtotal, itemCount, myPoints, rewards, selectedReward, onSelectReward, onCheckout, onContinue }) {
  const { deliveryFee, grandTotal } = calcFees(subtotal)
  const amountToFree = Math.max(0, 500 - subtotal)
  const progress     = Math.min(100, (subtotal / 500) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5
      lg:sticky lg:top-20 space-y-4">

      <h3 className="text-gray-800 font-bold text-base">Order Summary</h3>

      {/* Free delivery progress */}
      {amountToFree > 0 ? (
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
          <p className="text-yellow-700 text-xs font-medium">
            Add <span className="font-bold">
              ₱{amountToFree.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span> more for free delivery!
          </p>
          <div className="mt-2 h-1.5 bg-yellow-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#168AFF] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <MdCheckCircle size={16} className="text-green-500 shrink-0" />
          <p className="text-green-700 text-xs font-semibold">You qualify for free delivery!</p>
        </div>
      )}

      {/* Line items */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span className="font-medium">₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1">
            <MdLocalShipping size={15} className="text-gray-400" /> Delivery Fee
          </span>
          {deliveryFee === 0
            ? <span className="text-green-600 font-bold">FREE</span>
            : <span className="font-medium">₱{deliveryFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>}
        </div>
      </div>

      {/* ── Rewards Selector ── */}
      {rewards.length > 0 && (
        <>
          <div className="border-t border-gray-100" />
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <MdCardGiftcard size={16} className="text-[#168AFF]" />
                <span className="text-sm font-bold text-gray-700">Redeem a Reward</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5
                bg-yellow-50 text-yellow-700 text-xs font-bold rounded-full">
                <MdStar size={11} /> {myPoints} pts
              </span>
            </div>

            <div className="space-y-2">
              {rewards.map(reward => {
                const canRedeem = myPoints >= reward.points_required
                const isSelected = selectedReward?.id === reward.id
                return (
                  <button
                    key={reward.id}
                    onClick={() => canRedeem && onSelectReward(isSelected ? null : reward)}
                    disabled={!canRedeem}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border transition
                      flex items-center gap-3
                      ${isSelected
                        ? 'border-[#168AFF] bg-[#168AFF]/5 ring-1 ring-[#168AFF]/30'
                        : canRedeem
                          ? 'border-gray-200 hover:border-[#168AFF]/50 hover:bg-blue-50/50'
                          : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      {reward.image_url
                        ? <img src={reward.image_url} alt={reward.name} className="w-full h-full object-contain p-0.5" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <MdStar size={16} className="text-yellow-400" />
                          </div>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-[#168AFF]' : 'text-gray-700'}`}>
                        {reward.name}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {canRedeem ? `${reward.points_required} pts required` : `Need ${reward.points_required - myPoints} more pts`}
                      </p>
                    </div>
                    {isSelected && (
                      <MdCheckCircle size={18} className="text-[#168AFF] shrink-0" />
                    )}
                  </button>
                )
              })}
            </div>

            {selectedReward && (
              <div className="flex items-center gap-2 px-3 py-2 bg-[#168AFF]/5
                rounded-xl border border-[#168AFF]/20">
                <MdCheckCircle size={14} className="text-[#168AFF] shrink-0" />
                <p className="text-xs text-[#168AFF] font-semibold flex-1">
                  Reward applied: {selectedReward.name}
                </p>
                <button onClick={() => onSelectReward(null)}
                  className="text-[10px] text-gray-400 hover:text-red-400 font-medium transition">
                  Remove
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <div className="border-t border-gray-100" />

      {/* Grand total */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800">Grand Total</span>
        <span className="font-bold text-xl text-[#168AFF]">
          ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      </div>

      <button onClick={onCheckout}
        className="w-full py-3 bg-[#168AFF] text-white font-bold rounded-xl text-sm
          hover:bg-[#1270DB] active:scale-[0.98] transition-all shadow-sm">
        Proceed to Checkout
      </button>

      <button onClick={onContinue}
        className="w-full py-2 text-gray-400 text-sm font-medium hover:text-[#168AFF] transition">
        ← Continue Shopping
      </button>
    </div>
  )
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQty, clearCart, itemCount, totalAmount } = useCart()
  const { user }    = useAuth()
  const navigate    = useNavigate()

  const [myPoints,       setMyPoints]       = useState(0)
  const [rewards,        setRewards]        = useState([])
  const [selectedReward, setSelectedReward] = useState(null)

  useEffect(() => {
    if (!user) return
    async function loadRewards() {
      const [{ data: pts }, { data: rwds }] = await Promise.all([
        supabaseAdmin
          .from('customer_points')
          .select('total_points')
          .eq('customer_id', user.id)
          .maybeSingle(),
        supabaseAdmin
          .from('rewards')
          .select('id, name, description, points_required, image_url')
          .eq('is_active', true)
          .order('points_required', { ascending: true }),
      ])
      setMyPoints(pts?.total_points ?? 0)
      setRewards(rwds ?? [])
    }
    loadRewards()
  }, [user])

  function handleCheckout() {
    navigate('/customer/checkout', {
      state: { selectedReward: selectedReward ?? null },
    })
  }

  if (cartItems.length === 0) {
    return (
      <CustomerLayout>
        <EmptyCart onBrowse={() => navigate('/customer/dashboard')} />
      </CustomerLayout>
    )
  }

  return (
    <CustomerLayout>
      <div className="space-y-5">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Cart</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition">
            Clear all
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Cart items */}
          <div className="lg:col-span-2 space-y-3">
            {cartItems.map(item => (
              <CartItem
                key={item.product.id}
                item={item}
                onRemove={() => removeFromCart(item.product.id)}
                onIncrease={() => updateQty(item.product.id, item.quantity + 1)}
                onDecrease={() => updateQty(item.product.id, item.quantity - 1)}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={totalAmount}
              itemCount={itemCount}
              myPoints={myPoints}
              rewards={rewards}
              selectedReward={selectedReward}
              onSelectReward={setSelectedReward}
              onCheckout={handleCheckout}
              onContinue={() => navigate('/customer/dashboard')}
            />
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
