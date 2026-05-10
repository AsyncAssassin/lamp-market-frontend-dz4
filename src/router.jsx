import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { OrderDetailsPage } from './pages/OrderDetailsPage.jsx'
import { OrderSuccessPage } from './pages/OrderSuccessPage.jsx'
import { OrdersPage } from './pages/OrdersPage.jsx'
import { ProductPage } from './pages/ProductPage.jsx'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <CatalogPage /> },
      { path: 'catalog', element: <CatalogPage /> },
      { path: 'products/:id', element: <ProductPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order-success', element: <OrderSuccessPage /> },
      { path: 'orders', element: <OrdersPage /> },
      { path: 'orders/:id', element: <OrderDetailsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
