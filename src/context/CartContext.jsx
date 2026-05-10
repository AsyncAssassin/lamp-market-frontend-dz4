import { useEffect, useMemo, useState } from 'react'
import { products } from '../data/products.js'
import { getProductById } from '../utils/catalog.js'
import { normalizeCart, readCart, writeCart } from '../utils/storage.js'
import { CartContext } from './cartContext.js'

function normalizeQuantity(product, quantity, fallback = 1) {
  const numeric = Number(quantity)
  const base = Number.isFinite(numeric) ? Math.floor(numeric) : fallback
  const safeQuantity = Math.max(1, base)
  return Math.min(safeQuantity, product.stock)
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => readCart(products))

  useEffect(() => {
    writeCart(cartItems)
  }, [cartItems])

  const cartDetails = useMemo(
    () =>
      cartItems
        .map((item) => {
          const product = getProductById(item.productId)
          if (!product) {
            return null
          }

          return {
            ...item,
            product,
            subtotal: product.price * item.quantity,
          }
        })
        .filter(Boolean),
    [cartItems],
  )

  const cartCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const cartTotal = useMemo(
    () => cartDetails.reduce((total, item) => total + item.subtotal, 0),
    [cartDetails],
  )

  const value = useMemo(
    () => ({
      cartItems,
      addToCart(productId, quantity = 1) {
        const product = getProductById(Number(productId))
        if (!product || product.stock <= 0 || !product.isActive) {
          return
        }

        setCartItems((currentItems) => {
          const current = normalizeCart(currentItems, products)
          const existing = current.find((item) => item.productId === product.id)
          const addQuantity = normalizeQuantity(product, quantity)

          if (!existing) {
            return [...current, { productId: product.id, quantity: addQuantity }]
          }

          return current.map((item) =>
            item.productId === product.id
              ? {
                  ...item,
                  quantity: Math.min(item.quantity + addQuantity, product.stock),
                }
              : item,
          )
        })
      },
      removeFromCart(productId) {
        const safeProductId = Number(productId)
        setCartItems((currentItems) =>
          currentItems.filter((item) => item.productId !== safeProductId),
        )
      },
      updateQuantity(productId, quantity) {
        const safeProductId = Number(productId)
        const product = getProductById(safeProductId)
        if (!product) {
          return
        }

        const rawQuantity = typeof quantity === 'string' ? quantity.trim() : quantity
        if (rawQuantity === '' || !Number.isFinite(Number(rawQuantity))) {
          return
        }

        setCartItems((currentItems) =>
          currentItems.map((item) =>
            item.productId === safeProductId
              ? {
                  ...item,
                  quantity: normalizeQuantity(product, quantity, item.quantity),
                }
              : item,
          ),
        )
      },
      clearCart() {
        setCartItems([])
      },
      getCartCount() {
        return cartCount
      },
      getCartTotal() {
        return cartTotal
      },
      getCartDetails() {
        return cartDetails
      },
    }),
    [cartCount, cartDetails, cartItems, cartTotal],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
