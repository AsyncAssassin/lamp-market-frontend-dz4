export function validateCheckoutForm(values) {
  const customerName = values.customerName.trim()
  const customerEmail = values.customerEmail.trim()
  const customerPhone = values.customerPhone.trim()
  const deliveryAddress = values.deliveryAddress.trim()
  const comment = values.comment.trim()
  const errors = {}

  if (customerName.length < 2 || customerName.length > 200) {
    errors.customerName = 'Введите имя получателя'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
    errors.customerEmail = 'Введите корректную почту'
  }

  if (customerPhone.length > 20 || customerPhone.replace(/\D/g, '').length < 7) {
    errors.customerPhone = 'Введите корректный телефон'
  }

  if (deliveryAddress.length < 5 || deliveryAddress.length > 500) {
    errors.deliveryAddress = 'Введите адрес доставки'
  }

  if (comment.length > 1000) {
    errors.comment = 'Комментарий слишком длинный'
  }

  return {
    errors,
    sanitizedValues: {
      customerName,
      customerEmail,
      customerPhone,
      deliveryAddress,
      comment,
    },
  }
}
