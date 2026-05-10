import { DEFAULT_USER_ID } from '../config.js'
import { request } from './httpClient.js'

const orderHeaders = {
  'X-User-Id': String(DEFAULT_USER_ID),
}

export function getCart(options = {}) {
  return request('/order-api/api/cart', {
    headers: orderHeaders,
    signal: options.signal,
  })
}

export function addCartItem({ productId, quantity }) {
  return request('/order-api/api/cart/items', {
    method: 'POST',
    headers: orderHeaders,
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  })
}

export function updateCartItem({ itemId, quantity }) {
  return request(`/order-api/api/cart/items/${itemId}`, {
    method: 'PUT',
    headers: orderHeaders,
    body: JSON.stringify({ quantity }),
  })
}

export function deleteCartItem(itemId) {
  return request(`/order-api/api/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: orderHeaders,
  })
}

export function createOrder(payload) {
  return request('/order-api/api/orders', {
    method: 'POST',
    headers: orderHeaders,
    body: JSON.stringify({
      customer_name: payload.customerName,
      customer_email: payload.customerEmail,
      customer_phone: payload.customerPhone,
      delivery_address: payload.deliveryAddress,
      comment: payload.comment || null,
    }),
  })
}

export function getOrders({ page = 1, limit = 20, signal } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })

  return request(`/order-api/api/orders?${params.toString()}`, {
    headers: orderHeaders,
    signal,
  })
}

export function getOrder(orderId, options = {}) {
  return request(`/order-api/api/orders/${orderId}`, {
    headers: orderHeaders,
    signal: options.signal,
  })
}
