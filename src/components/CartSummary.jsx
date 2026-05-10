import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice.js'

export function CartSummary({ items, total, action = 'cart', disabled = false, disabledText = '' }) {
  return (
    <aside className="summary-panel" aria-label="Итог заказа">
      <h2>Итого</h2>
      <div className="summary-lines">
        {items.map((item) => (
          <div className="summary-line" key={item.id ?? item.productId}>
            <span>
              {item.productName ?? item.product?.name} x {item.quantity}
            </span>
            <strong>{formatPrice(item.subtotal)}</strong>
          </div>
        ))}
      </div>
      <div className="summary-total">
        <span>К оплате</span>
        <strong>{formatPrice(total)}</strong>
      </div>
      {action === 'cart' && !disabled && (
        <Link className="btn btn-primary btn-full" to="/checkout">
          Оформить заказ
        </Link>
      )}
      {action === 'cart' && disabled && (
        <>
          <button className="btn btn-primary btn-full" type="button" disabled>
            Оформить заказ
          </button>
          {disabledText && <p className="summary-hint">{disabledText}</p>}
        </>
      )}
    </aside>
  )
}
