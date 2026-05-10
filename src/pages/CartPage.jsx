import { Link } from 'react-router-dom'
import { CartItem } from '../components/CartItem.jsx'
import { CartSummary } from '../components/CartSummary.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useCart } from '../context/useCart.js'

export function CartPage() {
  const { getCartDetails, getCartTotal } = useCart()
  const items = getCartDetails()
  const total = getCartTotal()

  if (items.length === 0) {
    return (
      <EmptyState
        title="Корзина пуста"
        text="Добавьте товары из каталога, чтобы перейти к оформлению заказа."
      />
    )
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Покупка</p>
          <h1>Корзина</h1>
        </div>
        <Link className="btn btn-outline" to="/catalog">
          Продолжить покупки
        </Link>
      </div>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartItem item={item} key={item.product.id} />
          ))}
        </div>
        <CartSummary items={items} total={total} />
      </div>
    </section>
  )
}
