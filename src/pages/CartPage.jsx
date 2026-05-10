import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { CartItem } from '../components/CartItem.jsx'
import { CartSummary } from '../components/CartSummary.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { StatusBlock } from '../components/StatusBlock.jsx'
import {
  selectCartFetchError,
  selectCartItems,
  selectCartMutationStatus,
  selectCartStatus,
  selectCartTotal,
} from '../features/cart/cartSelectors.js'
import { fetchCart } from '../features/cart/cartSlice.js'

export function CartPage() {
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)
  const status = useAppSelector(selectCartStatus)
  const mutationStatus = useAppSelector(selectCartMutationStatus)
  const error = useAppSelector(selectCartFetchError)
  const isCartConfirmed = status === 'succeeded' && mutationStatus !== 'loading'

  if (status === 'loading' && items.length === 0) {
    return <StatusBlock title="Загружаем корзину" text="Получаем актуальные позиции заказа." />
  }

  if (status === 'failed' && items.length === 0) {
    return (
      <StatusBlock
        title="Не удалось загрузить корзину"
        text={error?.message}
        onAction={() => dispatch(fetchCart())}
      />
    )
  }

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

      {status === 'loading' && <div className="inline-warning">Обновляем корзину...</div>}
      {status === 'failed' && (
        <div className="inline-warning">{error?.message || 'Корзина показана по старым данным.'}</div>
      )}

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <CartItem item={item} key={item.id} />
          ))}
        </div>
        <CartSummary
          items={items}
          total={total}
          disabled={!isCartConfirmed}
          disabledText="Дождитесь обновления корзины перед оформлением."
        />
      </div>
    </section>
  )
}
