import { categories } from '../data/categories.js'
import { products } from '../data/products.js'

export function getCategoryById(categoryId) {
  return categories.find((category) => category.id === categoryId) ?? null
}

export function getCategoryName(categoryId) {
  return getCategoryById(categoryId)?.name ?? 'Без категории'
}

export function getProductById(productId) {
  return products.find((product) => product.id === productId) ?? null
}

export function getActiveProducts() {
  return products.filter((product) => product.isActive)
}
