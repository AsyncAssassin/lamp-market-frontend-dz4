import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './components/Header.jsx'
import { Notifications } from './components/Notifications.jsx'
import { useAppDispatch } from './app/hooks.js'
import { fetchCart } from './features/cart/cartSlice.js'
import { useEffect } from 'react'

const SIMPLE_HEADER_PATHS = new Set(['/checkout', '/order-success'])

export default function App() {
  const { pathname } = useLocation()
  const dispatch = useAppDispatch()
  const headerVariant = SIMPLE_HEADER_PATHS.has(pathname) ? 'simple' : 'default'

  useEffect(() => {
    dispatch(fetchCart())
  }, [dispatch])

  return (
    <div className="app-shell">
      <Header variant={headerVariant} />
      <main className="page-shell">
        <Outlet />
      </main>
      <Notifications />
    </div>
  )
}
