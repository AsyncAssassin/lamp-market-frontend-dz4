import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { StatusBlock } from '../components/StatusBlock.jsx'
import {
  selectOrderDetailsError,
  selectSelectedOrder,
  selectSelectedOrderStatus,
} from '../features/orders/ordersSelectors.js'
import { clearSelectedOrder, fetchOrderById } from '../features/orders/ordersSlice.js'
import { formatPrice } from '../utils/formatPrice.js'

const STATUS_LABELS = {
  new: 'Новый',
  confirmed: 'Подтвержден',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}

function formatDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OrderDetailsPage() {
  const params = useParams()
  const dispatch = useAppDispatch()
  const orderId = Number(params.id)
  const order = useAppSelector(selectSelectedOrder)
  const status = useAppSelector(selectSelectedOrderStatus)
  const error = useAppSelector(selectOrderDetailsError)

  useEffect(() => {
    if (Number.isInteger(orderId) && orderId > 0) {
      const request = dispatch(fetchOrderById(orderId))
      return () => {
        request.abort()
        dispatch(clearSelectedOrder())
      }
    }

    return () => {
      dispatch(clearSelectedOrder())
    }
  }, [dispatch, orderId])

  if (!Number.isInteger(orderId) || orderId <= 0) {
    return (
      <section className="detail-not-found">
        <h1>Заказ не найден</h1>
        <p>Проверьте адрес страницы или вернитесь к списку заказов.</p>
        <Link className="btn btn-primary" to="/orders">
          К заказам
        </Link>
      </section>
    )
  }

  if (status === 'loading' && !order) {
    return <StatusBlock title="Загружаем заказ" text="Получаем детали заказа." />
  }

  if (status === 'failed') {
    const isNotFound = error?.status === 404
    return (
      <section className="detail-not-found">
        <h1>{isNotFound ? 'Заказ не найден' : 'Не удалось загрузить заказ'}</h1>
        <p>{error?.message || 'Повторите запрос позднее.'}</p>
        <div className="confirm-actions">
          <Link className="btn btn-primary" to="/orders">
            К заказам
          </Link>
          {!isNotFound && (
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => dispatch(fetchOrderById(orderId))}
            >
              Повторить
            </button>
          )}
        </div>
      </section>
    )
  }

  if (!order) {
    return null
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Заказ №{order.id}</p>
          <h1>{STATUS_LABELS[order.status] ?? order.status}</h1>
        </div>
        <Link className="btn btn-outline" to="/orders">
          К заказам
        </Link>
      </div>

      <div className="order-details-layout">
        <article className="summary-panel order-details-card">
          <h2>Получатель</h2>
          <dl className="order-facts order-facts--stacked">
            <div>
              <dt>Имя</dt>
              <dd>{order.customerName}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{order.customerEmail}</dd>
            </div>
            <div>
              <dt>Телефон</dt>
              <dd>{order.customerPhone}</dd>
            </div>
            <div>
              <dt>Адрес</dt>
              <dd>{order.deliveryAddress}</dd>
            </div>
            {order.comment && (
              <div>
                <dt>Комментарий</dt>
                <dd>{order.comment}</dd>
              </div>
            )}
          </dl>
        </article>

        <aside className="summary-panel">
          <h2>Состав заказа</h2>
          <p className="order-date">{formatDate(order.createdAt)}</p>
          <div className="summary-lines">
            {order.items.map((item) => (
              <div className="summary-line" key={item.id}>
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <strong>{formatPrice(item.subtotal)}</strong>
              </div>
            ))}
          </div>
          <div className="summary-total">
            <span>Итого</span>
            <strong>{formatPrice(order.totalAmount)}</strong>
          </div>
        </aside>
      </div>
    </section>
  )
}
