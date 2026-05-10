import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ProductVisual } from '../components/ProductVisual.jsx'
import { QuantityControl } from '../components/QuantityControl.jsx'
import { useCart } from '../context/useCart.js'
import { getCategoryName, getProductById } from '../utils/catalog.js'
import { formatPrice } from '../utils/formatPrice.js'

export function ProductPage() {
  const params = useParams()
  const { addToCart } = useCart()
  const productId = Number(params.id)
  const product = useMemo(
    () => (Number.isInteger(productId) && productId > 0 ? getProductById(productId) : null),
    [productId],
  )
  const [quantity, setQuantity] = useState(1)

  if (!product || !product.isActive) {
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

  const isAvailable = product.stock > 0
  const numericQuantity = Number(quantity)
  const safeQuantity = Math.min(
    Math.max(1, Number.isFinite(numericQuantity) ? Math.floor(numericQuantity) : 1),
    Math.max(product.stock, 1),
  )

  return (
    <article className="product-detail">
      <Link className="back-link" to="/catalog">
        Назад в каталог
      </Link>
      <div className="product-detail__layout">
        <ProductVisual product={product} size="detail" />
        <div className="product-detail__content">
          <p className="eyebrow">{getCategoryName(product.categoryId)}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <strong className="detail-price">{formatPrice(product.price)}</strong>

          <dl className="spec-list">
            <div>
              <dt>Мощность</dt>
              <dd>{product.wattage} Вт</dd>
            </div>
            <div>
              <dt>Температура</dt>
              <dd>{product.colorTemperature} K</dd>
            </div>
            <div>
              <dt>Световой поток</dt>
              <dd>{product.luminousFlux} лм</dd>
            </div>
            <div>
              <dt>Цоколь</dt>
              <dd>{product.socketType}</dd>
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
            />
            <button
              className="btn btn-primary"
              type="button"
              disabled={!isAvailable}
              onClick={() => addToCart(product.id, safeQuantity)}
            >
              {isAvailable ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
