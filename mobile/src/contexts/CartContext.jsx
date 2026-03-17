import AsyncStorage from '@react-native-async-storage/async-storage'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const CART_KEY = 'cc-mobile-cart-items'
const CartContext = createContext(null)

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([])
  const [cartReady, setCartReady] = useState(false)

  useEffect(() => {
    let mounted = true

    async function loadCart() {
      try {
        const raw = await AsyncStorage.getItem(CART_KEY)
        const parsed = raw ? JSON.parse(raw) : []
        if (mounted) {
          setCartItems(Array.isArray(parsed) ? parsed : [])
        }
      } catch {
        if (mounted) setCartItems([])
      } finally {
        if (mounted) setCartReady(true)
      }
    }

    loadCart()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    if (!cartReady) return
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cartItems)).catch(() => {})
  }, [cartItems, cartReady])

  function addToCart(product, quantity = 1) {
    setCartItems((prev) => {
      if (prev.length > 0 && prev[0].merchant_id !== product.merchant_id) {
        return prev
      }

      const existing = prev.find((item) => item.product_id === product.$id)
      const currentQty = existing ? existing.quantity : 0
      if (currentQty + quantity > (product.stock || 0)) {
        return prev
      }

      if (existing) {
        return prev.map((item) =>
          item.product_id === product.$id ? { ...item, quantity: item.quantity + quantity } : item
        )
      }

      return [
        ...prev,
        {
          product_id: product.$id,
          name: product.name,
          price: product.price,
          image_id: product.image_id,
          stock: product.stock,
          merchant_id: product.merchant_id,
          quantity
        }
      ]
    })

    return true
  }

  function updateQuantity(productId, quantity) {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product_id === productId) {
          if (quantity > item.stock) {
            return item
          }
          return { ...item, quantity }
        }
        return item
      })
    )
  }

  function removeFromCart(productId) {
    setCartItems((prev) => prev.filter((item) => item.product_id !== productId))
  }

  function clearCart() {
    setCartItems([])
  }

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const merchantId = cartItems.length > 0 ? cartItems[0].merchant_id : null

  const value = useMemo(
    () => ({
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      itemCount,
      merchantId,
      cartReady
    }),
    [cartItems, cartTotal, itemCount, merchantId, cartReady]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
