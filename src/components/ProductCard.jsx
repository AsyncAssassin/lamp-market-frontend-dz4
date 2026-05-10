import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart.js'
import { getCategoryName } from '../utils/catalog.js'
import { formatPrice } from '../utils/formatPrice.js'
import { ProductVisual } from './ProductVisual.jsx'

export function ProductCard({ product }) {
  const { addToCart } = useCart()
  const isAvailable = product.stock > 0

  return (
    <article className="product-card">
      <Link className="product-card__link" to={`/products/${product.id}`}>
        <ProductVisual product={product} />
        <div className="product-card__body">
          <h2>{product.name}</h2>
          <p className="product-card__category">{getCategoryName(product.categoryId)}</p>
          <p className="product-card__description">{product.shortDescription}</p>
        </div>
      </Link>
      <div className="product-card__footer">
        <strong>{formatPrice(product.price)}</strong>
        <button
          className="btn btn-primary btn-sm"
          type="button"
          disabled={!isAvailable}
          onClick={() => addToCart(product.id, 1)}
        >
          {isAvailable ? 'В корзину' : 'Нет в наличии'}
        </button>
      </div>
    </article>
  )
}
