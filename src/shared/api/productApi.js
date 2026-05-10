import { PRODUCT_PAGE_SIZE } from '../config.js'
import { request } from './httpClient.js'

export function getCategories(options = {}) {
  return request('/product-api/api/categories', { signal: options.signal })
}

export function getProducts({
  page = 1,
  limit = PRODUCT_PAGE_SIZE,
  categoryId,
  search,
  signal,
} = {}) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  })
  const normalizedSearch = search?.trim()

  if (categoryId) {
    params.set('category_id', String(categoryId))
  }

  if (normalizedSearch) {
    params.set('search', normalizedSearch)
  }

  return request(`/product-api/api/products?${params.toString()}`, { signal })
}

export function getProduct(productId, options = {}) {
  return request(`/product-api/api/products/${productId}`, { signal: options.signal })
}
