import { Outlet, useLocation } from 'react-router-dom'
import { Header } from './components/Header.jsx'

const SIMPLE_HEADER_PATHS = new Set(['/checkout', '/order-success'])

export default function App() {
  const { pathname } = useLocation()
  const headerVariant = SIMPLE_HEADER_PATHS.has(pathname) ? 'simple' : 'default'

  return (
    <div className="app-shell">
      <Header variant={headerVariant} />
      <main className="page-shell">
        <Outlet />
      </main>
    </div>
  )
}
