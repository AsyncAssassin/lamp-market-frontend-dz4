export function validateCheckoutForm(values) {
  const name = values.name.trim()
  const email = values.email.trim()
  const phone = values.phone.trim()
  const address = values.address.trim()
  const errors = {}

  if (name.length < 2) {
    errors.name = 'Введите имя минимум из 2 символов'
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Введите корректный email'
  }

  if (phone.replace(/\D/g, '').length < 7) {
    errors.phone = 'Введите телефон минимум из 7 цифр'
  }

  if (address.length < 5) {
    errors.address = 'Введите адрес доставки'
  }

  return {
    errors,
    sanitizedValues: {
      ...values,
      name,
      email,
      phone,
      address,
      comment: values.comment.trim(),
    },
  }
}
