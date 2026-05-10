import { products as defaultProducts } from '../data/products.js'

const CART_STORAGE_KEY = 'lamp-market-cart'
export const LAST_ORDER_STORAGE_KEY = 'lamp-market-last-order'

function clampQuantity(value, product, fallback = 1) {
  const isNumber = typeof value === 'number'
  const isNumericString = typeof value === 'string' && value.trim() !== ''

  if (!isNumber && !isNumericString) {
    return null
  }

  const numeric = Number(value)
  if (!Number.isFinite(numeric)) {
    return null
  }

  const base = Math.floor(numeric)
  if (base < fallback) {
    return null
  }

  const safeQuantity = Math.max(1, base)
  return Math.min(safeQuantity, product.stock)
}

export function normalizeCart(rawCart, products = defaultProducts) {
  if (!Array.isArray(rawCart)) {
    return []
  }

  const productById = new Map(products.map((product) => [product.id, product]))
  const normalized = new Map()

  rawCart.forEach((item) => {
    const productId = Number(item?.productId)
    const product = productById.get(productId)

    if (!product || product.stock <= 0 || !product.isActive) {
      return
    }

    const previousQuantity = normalized.get(productId)?.quantity ?? 0
    const itemQuantity = clampQuantity(item?.quantity, product)
    if (!itemQuantity) {
      return
    }

    const quantity = Math.min(previousQuantity + itemQuantity, product.stock)

    normalized.set(productId, { productId, quantity })
  })

  return Array.from(normalized.values())
}

export function readCart(products = defaultProducts) {
  try {
    const rawValue = window.localStorage.getItem(CART_STORAGE_KEY)
    if (!rawValue) {
      return []
    }
    return normalizeCart(JSON.parse(rawValue), products)
  } catch {
    return []
  }
}

export function writeCart(cartItems) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems))
  } catch {
    // Корзина остается рабочей в памяти, даже если браузер запретил запись.
  }
}

export function saveLastOrder(order) {
  try {
    window.sessionStorage.setItem(LAST_ORDER_STORAGE_KEY, JSON.stringify(order))
  } catch {
    // Подтверждение заказа все равно получит данные через state маршрута.
  }
}

function isValidLastOrder(order) {
  return (
    order &&
    typeof order === 'object' &&
    Number.isFinite(Number(order.id)) &&
    typeof order.status === 'string' &&
    Number.isFinite(Number(order.total)) &&
    Number(order.total) >= 0 &&
    Number.isFinite(Date.parse(order.createdAt)) &&
    Array.isArray(order.items)
  )
}

export function readLastOrder() {
  try {
    const rawValue = window.sessionStorage.getItem(LAST_ORDER_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const order = JSON.parse(rawValue)
    return isValidLastOrder(order) ? order : null
  } catch {
    return null
  }
}
