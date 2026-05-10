import { Link, NavLink } from 'react-router-dom'
import { useCart } from '../context/useCart.js'

export function Header({ variant = 'default' }) {
  const { getCartCount } = useCart()
  const cartCount = getCartCount()
  const isSimple = variant === 'simple'

  return (
    <header className={`site-header site-header--${variant}`}>
      <div className="header-inner">
        <Link className="brand" to="/catalog" aria-label="ЛампМаркет, перейти в каталог">
          <span className="brand-mark" aria-hidden="true" />
          <span>ЛампМаркет</span>
        </Link>

        <nav className="header-nav" aria-label="Основная навигация">
          <NavLink to="/catalog">Каталог</NavLink>
          {!isSimple && (
            <NavLink className="cart-link" to="/cart">
              <span>Корзина</span>
              <span className="cart-badge" aria-label={`Товаров в корзине: ${cartCount}`}>
                {cartCount}
              </span>
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  )
}
