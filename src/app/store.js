import { configureStore } from '@reduxjs/toolkit'
import cartReducer from '../features/cart/cartSlice.js'
import categoriesReducer from '../features/categories/categoriesSlice.js'
import notificationsReducer from '../features/notifications/notificationsSlice.js'
import ordersReducer from '../features/orders/ordersSlice.js'
import productsReducer from '../features/products/productsSlice.js'

export const store = configureStore({
  reducer: {
    products: productsReducer,
    categories: categoriesReducer,
    cart: cartReducer,
    orders: ordersReducer,
    notifications: notificationsReducer,
  },
})
