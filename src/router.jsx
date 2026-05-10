import { createBrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { CartPage } from './pages/CartPage.jsx'
import { CatalogPage } from './pages/CatalogPage.jsx'
import { CheckoutPage } from './pages/CheckoutPage.jsx'
import { NotFoundPage } from './pages/NotFoundPage.jsx'
import { OrderSuccessPage } from './pages/OrderSuccessPage.jsx'
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
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
