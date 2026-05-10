import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { selectIsProductAddPending } from '../features/cart/cartSelectors.js'
import { addCartItem, fetchCart } from '../features/cart/cartSlice.js'
import { addNotification } from '../features/notifications/notificationsSlice.js'
import { getRejectedValue, isConditionCancelled, isRejectedAction } from '../shared/utils/thunkResult.js'
import { formatPrice } from '../utils/formatPrice.js'
import { ProductVisual } from './ProductVisual.jsx'

export function ProductCard({ product }) {
  const dispatch = useAppDispatch()
  const isAdding = useAppSelector((state) => selectIsProductAddPending(state, product.id))
  const isAvailable = product.stock > 0

  const handleAdd = async () => {
    try {
      const action = await dispatch(addCartItem({ productId: product.id, quantity: 1 }))
      if (isConditionCancelled(action)) {
        return
      }

      if (isRejectedAction(action)) {
        throw getRejectedValue(action)
      }

      dispatch(addNotification({ type: 'success', message: 'Товар добавлен в корзину' }))
      try {
        await dispatch(fetchCart()).unwrap()
      } catch {
        dispatch(
          addNotification({
            type: 'error',
            message: 'Товар добавлен, но корзину не удалось обновить',
          }),
        )
      }
    } catch (error) {
      await dispatch(fetchCart())
      dispatch(
        addNotification({
          type: 'error',
          message: error?.message || 'Не удалось добавить товар в корзину',
        }),
      )
    }
  }

  return (
    <article className="product-card">
      <Link className="product-card__link" to={`/products/${product.id}`}>
          <ProductVisual product={product} />
          <div className="product-card__body">
            <h2>{product.name}</h2>
            <p className="product-card__category">{product.categoryName}</p>
            <p className="product-card__description">{product.shortDescription}</p>
          </div>
      </Link>
      <div className="product-card__footer">
        <strong>{formatPrice(product.price)}</strong>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          disabled={!isAvailable || isAdding}
          onClick={handleAdd}
        >
          {isAdding ? 'Добавляем' : isAvailable ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    </article>
  )
}
