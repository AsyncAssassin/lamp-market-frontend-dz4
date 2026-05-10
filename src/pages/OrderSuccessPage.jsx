import { Link, useLocation } from 'react-router-dom'
import { formatPrice } from '../utils/formatPrice.js'
import { readLastOrder } from '../utils/storage.js'

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OrderSuccessPage() {
  const location = useLocation()
  const order = location.state?.order ?? readLastOrder()

  if (!order) {
    return (
      <section className="confirm-card">
        <span className="success-mark" aria-hidden="true" />
        <h1>Заказ пока не сформирован</h1>
        <p>Оформите заказ через корзину, чтобы увидеть подтверждение.</p>
        <div className="confirm-actions">
          <Link className="btn btn-primary" to="/catalog">
            В каталог
          </Link>
          <Link className="btn btn-outline" to="/cart">
            Открыть корзину
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="confirm-card">
      <span className="success-mark" aria-hidden="true" />
      <h1>Заказ №{order.id} оформлен!</h1>
      <p>Мы свяжемся с вами для подтверждения.</p>

      <dl className="order-facts">
        <div>
          <dt>Дата</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt>Статус</dt>
          <dd>{order.status}</dd>
        </div>
        <div>
          <dt>Сумма</dt>
          <dd>{formatPrice(order.total)}</dd>
        </div>
      </dl>

      <Link className="btn btn-primary" to="/catalog">
        Вернуться в каталог
      </Link>
    </section>
  )
}
