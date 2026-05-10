import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '../app/hooks.js'
import { selectLastCreatedOrder } from '../features/orders/ordersSelectors.js'
import { formatPrice } from '../utils/formatPrice.js'

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

const STATUS_LABELS = {
  new: 'Новый',
  confirmed: 'Подтвержден',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}

export function OrderSuccessPage() {
  const location = useLocation()
  const lastCreatedOrder = useAppSelector(selectLastCreatedOrder)
  const order = lastCreatedOrder ?? location.state?.order

  if (!order) {
    return (
      <section className="confirm-card">
        <span className="success-mark" aria-hidden="true" />
        <h1>Заказ пока не сформирован</h1>
        <p>Оформите корзину, чтобы увидеть подтверждение.</p>
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
      <h1>Заказ №{order.id} оформлен</h1>
      <p>Мы свяжемся с вами для подтверждения.</p>

      <dl className="order-facts">
        <div>
          <dt>Дата</dt>
          <dd>{formatDate(order.createdAt)}</dd>
        </div>
        <div>
          <dt>Статус</dt>
          <dd>{STATUS_LABELS[order.status] ?? order.status}</dd>
        </div>
        <div>
          <dt>Сумма</dt>
          <dd>{formatPrice(order.totalAmount)}</dd>
        </div>
      </dl>

      <div className="summary-lines order-success-items">
        {order.items.map((item) => (
          <div className="summary-line" key={item.id}>
            <span>
              {item.productName} x {item.quantity}
            </span>
            <strong>{formatPrice(item.subtotal)}</strong>
          </div>
        ))}
      </div>

      <div className="confirm-actions">
        <Link className="btn btn-primary" to="/catalog">
          Вернуться в каталог
        </Link>
        <Link className="btn btn-outline" to="/orders">
          Мои заказы
        </Link>
      </div>
    </section>
  )
}
