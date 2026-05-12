import { useNavigate } from 'react-router-dom'
import {
  MdAdd, MdRemove, MdDelete, MdShoppingCart,
  MdLocalShipping, MdCheckCircle,
} from 'react-icons/md'
import CustomerLayout from '../../layouts/CustomerLayout'
import { useCart } from '../../context/CartContext'

// ── Delivery fee logic ────────────────────────────────────────────────────────
function calcFees(subtotal) {
  const deliveryFee = subtotal >= 500 ? 0 : 25
  const grandTotal  = subtotal + deliveryFee
  return { deliveryFee, grandTotal }
}

// ── Empty state ───────────────────────────────────────────────────────────────
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
      <button
        onClick={onBrowse}
        className="mt-1 px-6 py-2.5 bg-[#1A2E74] text-white rounded-xl
          font-semibold text-sm hover:bg-[#162060] transition shadow-sm"
      >
        Browse Products
      </button>
    </div>
  )
}

// ── Cart item row ─────────────────────────────────────────────────────────────
function CartItem({ item, onRemove, onIncrease, onDecrease }) {
  const { product, quantity } = item
  const itemSubtotal = product.price * quantity

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex gap-4">

      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-50 shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-200">
            <MdShoppingCart size={22} />
          </div>
        )}
      </div>

      {/* Info + controls */}
      <div className="flex-1 min-w-0">

        {/* Name + remove */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-[#1A2E74] uppercase tracking-wide">
              {product.category ?? '—'}
            </p>
            <h4 className="text-gray-800 font-bold text-sm leading-snug line-clamp-1 mt-0.5">
              {product.name}
            </h4>
            <p className="text-gray-400 text-xs mt-0.5">
              ₱{Number(product.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              {' '}/{' '}{product.unit_type ?? 'unit'}
            </p>
          </div>
          <button
            onClick={onRemove}
            aria-label="Remove item"
            className="p-1 text-gray-300 hover:text-red-400 transition shrink-0"
          >
            <MdDelete size={18} />
          </button>
        </div>

        {/* Quantity stepper + subtotal */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onDecrease}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition
                ${quantity <= 1
                  ? 'border-gray-100 text-gray-200 cursor-not-allowed'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'}`}
            >
              <MdRemove size={14} />
            </button>

            <span className="w-8 text-center text-sm font-bold text-gray-700">
              {quantity}
            </span>

            <button
              onClick={onIncrease}
              aria-label="Increase quantity"
              className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center
                text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition"
            >
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

// ── Order summary card ────────────────────────────────────────────────────────
function OrderSummary({ subtotal, itemCount, onCheckout, onContinue }) {
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
            Add{' '}
            <span className="font-bold">
              ₱{amountToFree.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
            {' '}more for free delivery!
          </p>
          <div className="mt-2 h-1.5 bg-yellow-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1A2E74] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3
          flex items-center gap-2">
          <MdCheckCircle size={16} className="text-green-500 shrink-0" />
          <p className="text-green-700 text-xs font-semibold">
            You qualify for free delivery!
          </p>
        </div>
      )}

      {/* Line items */}
      <div className="space-y-2.5 text-sm">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
          <span className="font-medium">
            ₱{subtotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between text-gray-600">
          <span className="flex items-center gap-1">
            <MdLocalShipping size={15} className="text-gray-400" />
            Delivery Fee
          </span>
          {deliveryFee === 0 ? (
            <span className="text-green-600 font-bold">FREE</span>
          ) : (
            <span className="font-medium">
              ₱{deliveryFee.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </span>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100" />

      {/* Grand total */}
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-800">Grand Total</span>
        <span className="font-bold text-xl text-[#1A2E74]">
          ₱{grandTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
        </span>
      </div>

      {/* CTA */}
      <button
        onClick={onCheckout}
        className="w-full py-3 bg-[#1A2E74] text-white font-bold rounded-xl text-sm
          hover:bg-[#162060] active:scale-[0.98] transition-all shadow-sm"
      >
        Place Order
      </button>

      <button
        onClick={onContinue}
        className="w-full py-2 text-gray-400 text-sm font-medium
          hover:text-[#1A2E74] transition"
      >
        ← Continue Shopping
      </button>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Cart() {
  const { cartItems, removeFromCart, updateQty, clearCart, itemCount, totalAmount } = useCart()
  const navigate = useNavigate()

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

        {/* Heading */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">My Cart</h2>
            <p className="text-gray-400 text-sm mt-0.5">
              {itemCount} item{itemCount !== 1 ? 's' : ''} in your cart
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition"
          >
            Clear all
          </button>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* Cart items — left 2/3 */}
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

          {/* Summary — right 1/3 */}
          <div className="lg:col-span-1">
            <OrderSummary
              subtotal={totalAmount}
              itemCount={itemCount}
              onCheckout={() => navigate('/customer/checkout')}
              onContinue={() => navigate('/customer/dashboard')}
            />
          </div>
        </div>
      </div>
    </CustomerLayout>
  )
}
