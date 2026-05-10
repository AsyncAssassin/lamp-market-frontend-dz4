import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice.js'

export function CartSummary({ items, total, action = 'cart' }) {
  return (
    <aside className="summary-panel" aria-label="Итог заказа">
      <h2>Итого</h2>
      <div className="summary-lines">
        {items.map((item) => (
          <div className="summary-line" key={item.product.id}>
            <span>
              {item.product.name} x {item.quantity}
            </span>
            <strong>{formatPrice(item.subtotal)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <span>К оплате</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      {action === 'cart' && (
        <Link className="btn btn-primary btn-full" to="/checkout">
          Оформить заказ
        </Link>
      )}
    </aside>
  )
}
