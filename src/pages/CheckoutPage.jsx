import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CartSummary } from '../components/CartSummary.jsx'
import { EmptyState } from '../components/EmptyState.jsx'
import { useCart } from '../context/useCart.js'
import { saveLastOrder } from '../utils/storage.js'
import { validateCheckoutForm } from '../utils/validators.js'

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
  comment: '',
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const { clearCart, getCartDetails, getCartTotal } = useCart()
  const items = getCartDetails()
  const total = getCartTotal()
  const [formValues, setFormValues] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})

  if (items.length === 0) {
    return (
      <EmptyState
        title="Оформление недоступно"
        text="Корзина пуста. Добавьте товары из каталога и вернитесь к оформлению."
      />
    )
  }

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({ ...currentValues, [field]: value }))
    setErrors((currentErrors) => {
      if (!currentErrors[field]) {
        return currentErrors
      }

      const nextErrors = { ...currentErrors }
      delete nextErrors[field]
      return nextErrors
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const { errors: nextErrors, sanitizedValues } = validateCheckoutForm(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    const order = {
      id: Date.now(),
      customer: sanitizedValues,
      items: items.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      total,
      status: 'Новый',
      createdAt: new Date().toISOString(),
    }

    saveLastOrder(order)
    clearCart()
    navigate('/order-success', { state: { order } })
  }

  return (
    <section>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Данные покупателя</p>
          <h1>Оформление заказа</h1>
        </div>
        <Link className="btn btn-outline" to="/cart">
          Вернуться в корзину
        </Link>
      </div>

      <div className="checkout-layout">
        <form className="checkout-form" noValidate onSubmit={handleSubmit}>
          <label>
            <span>Имя</span>
            <input
              type="text"
              value={formValues.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
            {errors.name && <small>{errors.name}</small>}
          </label>

          <label>
            <span>Телефон</span>
            <input
              type="tel"
              value={formValues.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
            {errors.phone && <small>{errors.phone}</small>}
          </label>

          <label>
            <span>Email</span>
            <input
              type="email"
              value={formValues.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
            {errors.email && <small>{errors.email}</small>}
          </label>

          <label>
            <span>Адрес доставки</span>
            <textarea
              rows="4"
              value={formValues.address}
              onChange={(event) => updateField('address', event.target.value)}
            />
            {errors.address && <small>{errors.address}</small>}
          </label>

          <label>
            <span>Комментарий</span>
            <textarea
              rows="3"
              value={formValues.comment}
              onChange={(event) => updateField('comment', event.target.value)}
            />
          </label>

          <button className="btn btn-primary btn-full" type="submit">
            Подтвердить заказ
          </button>
        </form>

        <CartSummary items={items} total={total} action="readonly" />
      </div>
    </section>
  )
}
