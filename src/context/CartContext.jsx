import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import toast from 'react-hot-toast'

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])

  function addToCart(product, qty = 1) {
    setCartItems(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) {
        return prev.map(i =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + qty }
            : i
        )
      }
      return [...prev, { product, quantity: qty }]
    })
  }

  function removeFromCart(productId) {
    setCartItems(prev => prev.filter(i => i.product.id !== productId))
  }

  function updateQty(productId, qty) {
    if (qty < 1) { removeFromCart(productId); return }
    setCartItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i)
    )
  }

  function clearCart() { setCartItems([]) }

  // When admin changes a product price, update it in the cart in real-time
  useEffect(() => {
    const channel = supabase
      .channel('cart-product-prices')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'products' },
        (payload) => {
          const updated = payload.new
          setCartItems(prev => {
            const inCart = prev.find(i => i.product.id === updated.id)
            if (!inCart) return prev
            if (inCart.product.price === updated.price) return prev
            // Price changed — update cart item and toast the customer
            toast(`Price updated: ${updated.name} is now ₱${Number(updated.price).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`, {
              icon: updated.price > inCart.product.price ? '↑' : '↓',
              duration: 6000,
            })
            return prev.map(i =>
              i.product.id === updated.id
                ? { ...i, product: { ...i.product, ...updated } }
                : i
            )
          })
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const itemCount   = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = cartItems.reduce((sum, i) => sum + (i.product.price * i.quantity), 0)

  return (
    <CartContext.Provider value={{
      cartItems, addToCart, removeFromCart, updateQty, clearCart,
      itemCount, totalAmount,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
