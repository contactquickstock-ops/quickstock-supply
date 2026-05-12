import { createContext, useContext, useState } from 'react'

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
    if (qty < 1) {
      removeFromCart(productId)
      return
    }
    setCartItems(prev =>
      prev.map(i => i.product.id === productId ? { ...i, quantity: qty } : i)
    )
  }

  function clearCart() {
    setCartItems([])
  }

  const itemCount    = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount  = cartItems.reduce((sum, i) => sum + (i.product.price * i.quantity), 0)

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
