const productBaseUrl = process.env.PRODUCT_BASE_URL || 'http://localhost:8001'
const orderBaseUrl = process.env.ORDER_BASE_URL || 'http://localhost:8002'
const userId =
  process.env.SMOKE_USER_ID || String(Math.floor(Math.random() * 1_000_000) + 10_000)

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  })
  const text = await response.text()
  const data = text ? JSON.parse(text) : null

  if (!response.ok) {
    throw new Error(`${options.method || 'GET'} ${url} -> ${response.status}: ${text}`)
  }

  return data
}

const orderHeaders = {
  'Content-Type': 'application/json',
  'X-User-Id': userId,
}

await request(`${productBaseUrl}/health`)
await request(`${orderBaseUrl}/health`)

const products = await request(`${productBaseUrl}/api/products?search=LED&category_id=1`)
if (!Array.isArray(products.items) || products.items.length === 0) {
  throw new Error('Seed products are not available')
}

const productId = products.items[0].id
const cartItem = await request(`${orderBaseUrl}/api/cart/items`, {
  method: 'POST',
  headers: orderHeaders,
  body: JSON.stringify({ product_id: productId, quantity: 1 }),
})

await request(`${orderBaseUrl}/api/cart/items/${cartItem.id}`, {
  method: 'PUT',
  headers: orderHeaders,
  body: JSON.stringify({ quantity: 2 }),
})

const cart = await request(`${orderBaseUrl}/api/cart`, {
  headers: { 'X-User-Id': userId },
})
if (cart.items.length !== 1 || cart.items[0].quantity !== 2) {
  throw new Error('Cart was not updated correctly')
}

const order = await request(`${orderBaseUrl}/api/orders`, {
  method: 'POST',
  headers: orderHeaders,
  body: JSON.stringify({
    customer_name: 'Иван Петров',
    customer_email: 'ivan@example.ru',
    customer_phone: '+79991234567',
    delivery_address: 'Москва, Тверская, 1',
    comment: 'Smoke test',
  }),
})

const orders = await request(`${orderBaseUrl}/api/orders?page=1&limit=20`, {
  headers: { 'X-User-Id': userId },
})
const details = await request(`${orderBaseUrl}/api/orders/${order.id}`, {
  headers: { 'X-User-Id': userId },
})

if (!orders.items.some((item) => item.id === order.id) || details.items.length === 0) {
  throw new Error('Order was not persisted correctly')
}

console.log(`Integration smoke passed for X-User-Id: ${userId}`)
