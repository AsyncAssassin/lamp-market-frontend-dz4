import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { EmptyState } from '../components/EmptyState.jsx'
import { StatusBlock } from '../components/StatusBlock.jsx'
import {
  selectOrders,
  selectOrdersListError,
  selectOrdersStatus,
  selectOrdersTotal,
} from '../features/orders/ordersSelectors.js'
import { fetchOrders } from '../features/orders/ordersSlice.js'
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
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function OrdersPage() {
  const dispatch = useAppDispatch()
  const orders = useAppSelector(selectOrders)
  const total = useAppSelector(selectOrdersTotal)
  const status = useAppSelector(selectOrdersStatus)
  const error = useAppSelector(selectOrdersListError)

  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 20 }))
  }, [dispatch])

  if (status === 'loading' && orders.length === 0) {
    return <StatusBlock title="Загружаем заказы" text="Получаем историю заказов." />
  }

  if (status === 'failed' && orders.length === 0) {
    return (
      <StatusBlock
        title="Не удалось загрузить заказы"
        text={error?.message}
        onAction={() => dispatch(fetchOrders({ page: 1, limit: 20 }))}
      />
    )
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        title="Заказов пока нет"
        text="Оформите корзину, и заказ появится в этом списке."
      />
    )
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">История покупок</p>
          <h1>Заказы</h1>
        </div>
        <span>{total} заказов</span>
      </div>

      {status === 'loading' && <div className="inline-warning">Обновляем список заказов...</div>}
      {status === 'failed' && orders.length > 0 && (
        <div className="inline-warning inline-warning--action">
          <span>{error?.message || 'Не удалось обновить список. Показаны предыдущие заказы.'}</span>
          <button
            className="btn btn-outline btn-sm"
            type="button"
            onClick={() => dispatch(fetchOrders({ page: 1, limit: 20 }))}
          >
            Повторить
          </button>
        </div>
      )}

      <div className="orders-list">
        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <div>
              <p className="eyebrow">Заказ №{order.id}</p>
              <h2>{STATUS_LABELS[order.status] ?? order.status}</h2>
            </div>
            <dl>
              <div>
                <dt>Дата</dt>
                <dd>{formatDate(order.createdAt)}</dd>
              </div>
              <div>
                <dt>Сумма</dt>
                <dd>{formatPrice(order.totalAmount)}</dd>
              </div>
            </dl>
            <Link className="btn btn-outline" to={`/orders/${order.id}`}>
              Детали
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
