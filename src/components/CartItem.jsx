import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { selectIsCartItemPending } from '../features/cart/cartSelectors.js'
import { fetchCart, removeCartItem, updateCartItem } from '../features/cart/cartSlice.js'
import { addNotification } from '../features/notifications/notificationsSlice.js'
import { getRejectedValue, isConditionCancelled, isRejectedAction } from '../shared/utils/thunkResult.js'
import { formatPrice } from '../utils/formatPrice.js'
import { ProductVisual } from './ProductVisual.jsx'
import { QuantityControl } from './QuantityControl.jsx'

export function CartItem({ item }) {
  const dispatch = useAppDispatch()
  const isPending = useAppSelector((state) => selectIsCartItemPending(state, item.id))
  const product = {
    id: item.productId,
    name: item.productName,
    price: item.productPrice,
    imageUrl: item.productImageUrl,
  }

  const handleUpdate = async (quantity) => {
    const numericQuantity = Number(quantity)
    if (!Number.isInteger(numericQuantity) || numericQuantity < 1) {
      return
    }

    try {
      const action = await dispatch(updateCartItem({ itemId: item.id, quantity: numericQuantity }))
      if (isConditionCancelled(action)) {
        return
      }

      if (isRejectedAction(action)) {
        throw getRejectedValue(action)
      }

      try {
        await dispatch(fetchCart()).unwrap()
      } catch {
        dispatch(
          addNotification({
            type: 'error',
            message: 'Количество изменено, но корзину не удалось обновить',
          }),
        )
      }
    } catch (error) {
      await dispatch(fetchCart())
      dispatch(
        addNotification({
          type: 'error',
          message: error?.message || 'Не удалось обновить корзину',
        }),
      )
    }
  }

  const handleRemove = async () => {
    try {
      const action = await dispatch(removeCartItem(item.id))
      if (isConditionCancelled(action)) {
        return
      }

      if (isRejectedAction(action)) {
        throw getRejectedValue(action)
      }

      dispatch(addNotification({ type: 'success', message: 'Позиция удалена из корзины' }))
      try {
        await dispatch(fetchCart()).unwrap()
      } catch {
        dispatch(
          addNotification({
            type: 'error',
            message: 'Позиция удалена, но корзину не удалось обновить',
          }),
        )
      }
    } catch (error) {
      await dispatch(fetchCart())
      dispatch(
        addNotification({
          type: 'error',
          message: error?.message || 'Не удалось удалить позицию',
        }),
      )
    }
  }

  return (
    <article className="cart-item">
      <Link className="cart-item__image" to={`/products/${product.id}`}>
        <ProductVisual product={product} size="small" />
      </Link>
      <div className="cart-item__main">
        <Link to={`/products/${product.id}`}>{product.name}</Link>
        <span>{formatPrice(product.price)} за шт.</span>
      </div>
      <QuantityControl
        value={item.quantity}
        onChange={handleUpdate}
        label={`Количество товара ${product.name}`}
        disabled={isPending}
      />
      <strong className="cart-item__subtotal">{formatPrice(item.subtotal)}</strong>
      <button className="remove-button" type="button" disabled={isPending} onClick={handleRemove}>
        {isPending ? 'Обновляем' : 'Удалить'}
      </button>
    </article>
  )
}
