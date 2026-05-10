import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart.js'
import { formatPrice } from '../utils/formatPrice.js'
import { ProductVisual } from './ProductVisual.jsx'
import { QuantityControl } from './QuantityControl.jsx'

export function CartItem({ item }) {
  const { removeFromCart, updateQuantity } = useCart()
  const { product, quantity, subtotal } = item

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
        value={quantity}
        max={product.stock}
        onChange={(nextQuantity) => updateQuantity(product.id, nextQuantity)}
        label={`Количество товара ${product.name}`}
      />
      <strong className="cart-item__subtotal">{formatPrice(subtotal)}</strong>
      <button className="remove-button" type="button" onClick={() => removeFromCart(product.id)}>
        Удалить
      </button>
    </article>
  )
}
