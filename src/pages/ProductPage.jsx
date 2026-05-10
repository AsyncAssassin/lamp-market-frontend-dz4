import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { ProductVisual } from '../components/ProductVisual.jsx'
import { QuantityControl } from '../components/QuantityControl.jsx'
import { StatusBlock } from '../components/StatusBlock.jsx'
import { selectIsProductAddPending } from '../features/cart/cartSelectors.js'
import { addCartItem, fetchCart } from '../features/cart/cartSlice.js'
import { addNotification } from '../features/notifications/notificationsSlice.js'
import {
  selectProductDetailsError,
  selectSelectedProduct,
  selectSelectedProductStatus,
} from '../features/products/productsSelectors.js'
import { clearSelectedProduct, fetchProductById } from '../features/products/productsSlice.js'
import { getRejectedValue, isConditionCancelled, isRejectedAction } from '../shared/utils/thunkResult.js'
import { formatPrice } from '../utils/formatPrice.js'

function specValue(value, suffix = '') {
  return value ? `${value}${suffix}` : '—'
}

export function ProductPage() {
  const params = useParams()
  const dispatch = useAppDispatch()
  const productId = Number(params.id)
  const product = useAppSelector(selectSelectedProduct)
  const detailsStatus = useAppSelector(selectSelectedProductStatus)
  const detailsError = useAppSelector(selectProductDetailsError)
  const isAdding = useAppSelector((state) => selectIsProductAddPending(state, productId))
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (Number.isInteger(productId) && productId > 0) {
      const request = dispatch(fetchProductById(productId))
      return () => {
        request.abort()
        dispatch(clearSelectedProduct())
      }
    }

    return () => {
      dispatch(clearSelectedProduct())
    }
  }, [dispatch, productId])

  if (!Number.isInteger(productId) || productId <= 0) {
    return (
      <section className="detail-not-found">
        <h1>Товар не найден</h1>
        <p>Проверьте адрес страницы или вернитесь в каталог.</p>
        <Link className="btn btn-primary" to="/catalog">
          Вернуться в каталог
        </Link>
      </section>
    )
  }

  if (detailsStatus === 'loading' && !product) {
    return <StatusBlock title="Загружаем товар" text="Получаем карточку товара из сервиса." />
  }

  if (detailsStatus === 'failed') {
    const isNotFound = detailsError?.status === 404
    return (
      <section className="detail-not-found">
        <h1>{isNotFound ? 'Товар не найден' : 'Не удалось загрузить товар'}</h1>
        <p>{detailsError?.message || 'Проверьте адрес страницы или повторите запрос.'}</p>
        <div className="confirm-actions">
          <Link className="btn btn-primary" to="/catalog">
            Вернуться в каталог
          </Link>
          {!isNotFound && (
            <button
              className="btn btn-outline"
              type="button"
              onClick={() => dispatch(fetchProductById(productId))}
            >
              Повторить
            </button>
          )}
        </div>
      </section>
    )
  }

  if (!product) {
    return null
  }

  const isAvailable = product.stock > 0
  const numericQuantity = Number(quantity)
  const safeQuantity = Math.min(
    Math.max(1, Number.isFinite(numericQuantity) ? Math.floor(numericQuantity) : 1),
    Math.max(product.stock, 1),
  )

  const handleAdd = async () => {
    try {
      const action = await dispatch(addCartItem({ productId: product.id, quantity: safeQuantity }))
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
    <article className="product-detail">
      <Link className="back-link" to="/catalog">
        Назад в каталог
      </Link>
      <div className="product-detail__layout">
        <ProductVisual product={product} size="detail" />
        <div className="product-detail__content">
          <p className="eyebrow">{product.categoryName}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>

          <dl className="spec-list">
            <div>
              <dt>Мощность</dt>
              <dd>{specValue(product.wattage, ' Вт')}</dd>
            </div>
            <div>
              <dt>Температура</dt>
              <dd>{specValue(product.colorTemperature, ' K')}</dd>
            </div>
            <div>
              <dt>Световой поток</dt>
              <dd>{specValue(product.luminousFlux, ' лм')}</dd>
            </div>
            <div>
              <dt>Цоколь</dt>
              <dd>{specValue(product.socketType)}</dd>
            </div>
            <div>
              <dt>Остаток</dt>
              <dd>{product.stock} шт.</dd>
            </div>
          </dl>

          <div className="detail-actions">
            <QuantityControl
              value={safeQuantity}
              max={Math.max(product.stock, 1)}
              onChange={setQuantity}
              label={`Количество товара ${product.name}`}
              disabled={!isAvailable || isAdding}
            />
            <button
              className="btn btn-primary"
              type="button"
              disabled={!isAvailable || isAdding}
              onClick={handleAdd}
            >
              {isAdding ? 'Добавляем' : isAvailable ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
