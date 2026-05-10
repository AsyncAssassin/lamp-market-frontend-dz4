const IMAGE_FALLBACKS = {
  'led-a60-12w': '/products/led-a60.svg',
  'led-a60-8w': '/products/led-a60-warm.svg',
  'led-c37-7w': '/products/led-candle.svg',
  'led-gu10-5w': '/products/halogen-gu10.svg',
  'led-g9-4w': '/products/halogen-g9.svg',
  'led-a60-15w': '/products/led-a60.svg',
  'inc-60w': '/products/incandescent-a60.svg',
  'inc-95w': '/products/incandescent-a55.svg',
  'inc-40w-e14': '/products/incandescent-candle.svg',
  'inc-75w': '/products/incandescent-a60.svg',
  'hal-jc-50w': '/products/halogen-g9.svg',
  'hal-mr16-35w': '/products/halogen-mr16.svg',
  'hal-jcd-40w': '/products/halogen-g9.svg',
  'flu-spiral-20w': '/products/cfl-e27.svg',
  'flu-spiral-15w': '/products/cfl-e27.svg',
  'flu-spiral-11w': '/products/cfl-e14.svg',
  'fil-a60-8w': '/products/filament-a60.svg',
  'fil-st64-6w': '/products/filament-edison.svg',
  'fil-g45-4w': '/products/filament-globe.svg',
  'fil-c35-4w': '/products/filament-candle.svg',
}

function getCategoryImageFallback(categoryId) {
  if (categoryId === 1) return '/products/led-a60.svg'
  if (categoryId === 2) return '/products/incandescent-a60.svg'
  if (categoryId === 3) return '/products/halogen-g9.svg'
  if (categoryId === 4) return '/products/cfl-e27.svg'
  if (categoryId === 5) return '/products/filament-a60.svg'

  return ''
}

export function resolveProductImage(imageUrl, categoryId) {
  if (!imageUrl) {
    return getCategoryImageFallback(categoryId)
  }

  const matchedKey = Object.keys(IMAGE_FALLBACKS).find((key) => imageUrl.includes(key))
  if (matchedKey) {
    return IMAGE_FALLBACKS[matchedKey]
  }

  if (imageUrl.startsWith('/images/')) {
    return getCategoryImageFallback(categoryId)
  }

  return imageUrl
}

export function mapCategory(category) {
  return {
    id: Number(category.id),
    name: category.name,
    slug: category.slug,
  }
}

export function mapProduct(product) {
  const categoryId = product.category_id ?? null

  return {
    id: Number(product.id),
    name: product.name,
    description: product.description || 'Описание товара пока не заполнено.',
    shortDescription: product.description || 'Лампа для повседневного освещения.',
    price: Number(product.price ?? 0),
    imageUrl: resolveProductImage(product.image_url, categoryId),
    image: resolveProductImage(product.image_url, categoryId),
    categoryId,
    categoryName: product.category_name || 'Без категории',
    wattage: product.wattage ?? null,
    colorTemperature: product.color_temp ?? null,
    luminousFlux: product.luminous_flux ?? null,
    socketType: product.socket_type || null,
    stock: Number(product.stock ?? 0),
    isActive: product.is_active ?? true,
  }
}

export function mapProductList(response) {
  return {
    items: Array.isArray(response?.items) ? response.items.map(mapProduct) : [],
    total: Number(response?.total ?? 0),
    page: Number(response?.page ?? 1),
    limit: Number(response?.limit ?? 20),
  }
}

export function mapCartItem(item) {
  return {
    id: Number(item.id),
    productId: Number(item.product_id),
    productName: item.product_name,
    productPrice: Number(item.product_price ?? 0),
    productImageUrl: resolveProductImage(item.product_image_url, null),
    quantity: Number(item.quantity ?? 0),
    subtotal: Number(item.subtotal ?? 0),
  }
}

export function mapCart(response) {
  return {
    items: Array.isArray(response?.items) ? response.items.map(mapCartItem) : [],
    total: Number(response?.total ?? 0),
  }
}

export function mapOrderItem(item) {
  return {
    id: Number(item.id),
    productId: Number(item.product_id),
    productName: item.product_name,
    productPrice: Number(item.product_price ?? 0),
    quantity: Number(item.quantity ?? 0),
    subtotal: Number(item.subtotal ?? 0),
  }
}

export function mapOrder(order) {
  return {
    id: Number(order.id),
    userId: Number(order.user_id ?? 0),
    status: order.status,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
    deliveryAddress: order.delivery_address,
    comment: order.comment || '',
    totalAmount: Number(order.total_amount ?? 0),
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: Array.isArray(order.items) ? order.items.map(mapOrderItem) : [],
  }
}

export function mapOrderList(response) {
  return {
    items: Array.isArray(response?.items)
      ? response.items.map((order) => ({
          id: Number(order.id),
          userId: Number(order.user_id ?? 0),
          status: order.status,
          totalAmount: Number(order.total_amount ?? 0),
          createdAt: order.created_at,
        }))
      : [],
    total: Number(response?.total ?? 0),
    page: Number(response?.page ?? 1),
    limit: Number(response?.limit ?? 20),
  }
}
