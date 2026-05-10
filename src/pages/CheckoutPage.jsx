import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
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
import { clearCartAfterOrder, fetchCart } from '../features/cart/cartSlice.js'
import { addNotification } from '../features/notifications/notificationsSlice.js'
import { selectOrderCreateStatus } from '../features/orders/ordersSelectors.js'
import { createOrder, fetchOrders } from '../features/orders/ordersSlice.js'
import { getRejectedValue, isConditionCancelled, isRejectedAction } from '../shared/utils/thunkResult.js'
import { validateCheckoutForm } from '../utils/validators.js'

const INITIAL_FORM = {
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  deliveryAddress: '',
  comment: '',
}

const FIELD_LABELS = {
  customerName: 'Имя',
  customerPhone: 'Телефон',
  customerEmail: 'Email',
  deliveryAddress: 'Адрес доставки',
  comment: 'Комментарий',
}

export function CheckoutPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector(selectCartItems)
  const total = useAppSelector(selectCartTotal)
  const cartStatus = useAppSelector(selectCartStatus)
  const cartMutationStatus = useAppSelector(selectCartMutationStatus)
  const cartFetchError = useAppSelector(selectCartFetchError)
  const createStatus = useAppSelector(selectOrderCreateStatus)
  const [formValues, setFormValues] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const fieldRefs = useRef({})
  const isCartSyncing = cartStatus === 'loading' || cartMutationStatus === 'loading'
  const isSubmitting = createStatus === 'loading' || isCartSyncing

  if ((cartStatus === 'idle' || cartStatus === 'loading') && items.length === 0) {
    return <StatusBlock title="Проверяем корзину" text="Перед оформлением получаем актуальные данные." />
  }

  if (cartStatus === 'failed' && items.length === 0) {
    return (
      <StatusBlock
        title="Не удалось проверить корзину"
        text={cartFetchError?.message || 'Повторите запрос перед оформлением.'}
        tone="error"
        onAction={() => dispatch(fetchCart())}
      />
    )
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="Оформление недоступно"
        text="Корзина пуста. Добавьте товары из каталога и вернитесь к оформлению."
      />
    )
  }

  const focusFirstError = (nextErrors) => {
    const firstField = Object.keys(FIELD_LABELS).find((field) => nextErrors[field])
    if (firstField) {
      fieldRefs.current[firstField]?.focus()
    }
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    const { errors: nextErrors, sanitizedValues } = validateCheckoutForm(formValues)

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      focusFirstError(nextErrors)
      return
    }

    try {
      const cartAction = await dispatch(fetchCart())
      if (isRejectedAction(cartAction)) {
        throw getRejectedValue(cartAction)
      }

      if (cartAction.payload.items.length === 0) {
        setErrors({ form: 'Корзина пуста. Добавьте товары перед оформлением.' })
        return
      }

      const action = await dispatch(createOrder(sanitizedValues))
      if (isConditionCancelled(action)) {
        return
      }

      if (isRejectedAction(action)) {
        throw getRejectedValue(action)
      }

      const order = action.payload
      dispatch(clearCartAfterOrder())
      await dispatch(fetchCart())
      dispatch(addNotification({ type: 'success', message: 'Заказ оформлен' }))
      navigate('/order-success', { state: { order } })
    } catch (error) {
      if (error?.fields && Object.keys(error.fields).length > 0) {
        setErrors(error.fields)
        focusFirstError(error.fields)
      }

      if ([0, 404, 409].includes(error?.status)) {
        await dispatch(fetchCart())
      }

      if (error?.status === 0) {
        await dispatch(fetchOrders({ page: 1, limit: 20 }))
      }

      if ([404, 409].includes(error?.status)) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          form: error?.message || 'Проверьте актуальность корзины',
        }))
      } else if (!error?.fields || Object.keys(error.fields).length === 0) {
        setErrors((currentErrors) => ({
          ...currentErrors,
          form: error?.message || 'Не удалось проверить корзину',
        }))
      }

      dispatch(
        addNotification({
          type: 'error',
          message:
            error?.status === 0
              ? 'Не получили ответ от сервера. Проверьте заказы и корзину.'
              : error?.message || 'Не удалось оформить заказ',
        }),
      )
    }
  }

  const renderFieldError = (field) =>
    errors[field] ? (
      <small className="field-error" id={`${field}-error`}>
        {errors[field]}
      </small>
    ) : null

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
          <div className="form-errors" aria-live="assertive">
            {Object.values(errors).length > 0 && Object.values(errors)[0]}
            {cartStatus === 'failed' && items.length > 0
              ? cartFetchError?.message || 'Корзина показана по старым данным.'
              : ''}
          </div>

          <label>
            <span>Имя</span>
            <input
              ref={(element) => {
                fieldRefs.current.customerName = element
              }}
              type="text"
              value={formValues.customerName}
              aria-invalid={Boolean(errors.customerName)}
              aria-describedby={errors.customerName ? 'customerName-error' : undefined}
              onChange={(event) => updateField('customerName', event.target.value)}
            />
            {renderFieldError('customerName')}
          </label>

          <label>
            <span>Телефон</span>
            <input
              ref={(element) => {
                fieldRefs.current.customerPhone = element
              }}
              type="tel"
              value={formValues.customerPhone}
              aria-invalid={Boolean(errors.customerPhone)}
              aria-describedby={errors.customerPhone ? 'customerPhone-error' : undefined}
              onChange={(event) => updateField('customerPhone', event.target.value)}
            />
            {renderFieldError('customerPhone')}
          </label>

          <label>
            <span>Email</span>
            <input
              ref={(element) => {
                fieldRefs.current.customerEmail = element
              }}
              type="email"
              value={formValues.customerEmail}
              aria-invalid={Boolean(errors.customerEmail)}
              aria-describedby={errors.customerEmail ? 'customerEmail-error' : undefined}
              onChange={(event) => updateField('customerEmail', event.target.value)}
            />
            {renderFieldError('customerEmail')}
          </label>

          <label>
            <span>Адрес доставки</span>
            <textarea
              ref={(element) => {
                fieldRefs.current.deliveryAddress = element
              }}
              rows="4"
              value={formValues.deliveryAddress}
              aria-invalid={Boolean(errors.deliveryAddress)}
              aria-describedby={errors.deliveryAddress ? 'deliveryAddress-error' : undefined}
              onChange={(event) => updateField('deliveryAddress', event.target.value)}
            />
            {renderFieldError('deliveryAddress')}
          </label>

          <label>
            <span>Комментарий</span>
            <textarea
              ref={(element) => {
                fieldRefs.current.comment = element
              }}
              rows="3"
              value={formValues.comment}
              aria-invalid={Boolean(errors.comment)}
              aria-describedby={errors.comment ? 'comment-error' : undefined}
              onChange={(event) => updateField('comment', event.target.value)}
            />
            {renderFieldError('comment')}
          </label>

          <button className="btn btn-primary btn-full" type="submit" disabled={isSubmitting}>
            {isCartSyncing
              ? 'Проверяем корзину'
              : createStatus === 'loading'
                ? 'Оформляем заказ'
                : 'Подтвердить заказ'}
          </button>
        </form>

        <CartSummary items={items} total={total} action="readonly" />
      </div>
    </section>
  )
}
