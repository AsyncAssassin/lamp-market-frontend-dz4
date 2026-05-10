const FIELD_MAP = {
  customer_name: 'customerName',
  customer_email: 'customerEmail',
  customer_phone: 'customerPhone',
  delivery_address: 'deliveryAddress',
  comment: 'comment',
  product_id: 'productId',
  quantity: 'quantity',
}

function toPlainDetails(value) {
  if (!value || typeof value !== 'object') {
    return value ?? null
  }

  try {
    return JSON.parse(JSON.stringify(value))
  } catch {
    return { message: 'Не удалось прочитать детали ошибки' }
  }
}

function messageFromValidationError(error) {
  if (typeof error?.msg === 'string') {
    return error.msg
  }

  return 'Проверьте заполненные поля'
}

function mapValidationFields(detail) {
  if (!Array.isArray(detail)) {
    return {}
  }

  return detail.reduce((fields, error) => {
    const loc = Array.isArray(error?.loc) ? error.loc : []
    const backendField = loc.at(-1)
    const frontendField = FIELD_MAP[backendField] ?? backendField

    if (frontendField && typeof frontendField === 'string') {
      fields[frontendField] = messageFromValidationError(error)
    }

    return fields
  }, {})
}

function getMessage(status, detail) {
  if ([502, 503, 504].includes(status)) {
    return 'Сервис временно недоступен'
  }

  if (Array.isArray(detail)) {
    return 'Проверьте заполненные поля'
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail
  }

  if (detail && typeof detail === 'object' && typeof detail.detail === 'string') {
    return detail.detail
  }

  if (status === 404) {
    return 'Данные не найдены'
  }

  if (status === 409) {
    return 'Не удалось выполнить действие'
  }

  if (status === 422) {
    return 'Проверьте данные запроса'
  }

  return 'Произошла ошибка'
}

export function normalizeApiError(response, data) {
  const detail = data?.detail ?? data

  return {
    status: response.status,
    message: getMessage(response.status, detail),
    details: toPlainDetails(data),
    fields: mapValidationFields(detail),
    productId: data?.product_id ?? null,
  }
}

export function normalizeNetworkError(error) {
  if (error?.name === 'AbortError') {
    return {
      status: 0,
      message: 'Запрос отменен',
      details: { name: 'AbortError', message: error.message },
      fields: {},
      aborted: true,
    }
  }

  return {
    status: 0,
    message: 'Не удалось подключиться к серверу',
    details: {
      name: error?.name || 'FetchError',
      message: error?.message || 'Fetch failed',
    },
    fields: {},
  }
}

export function toSerializableError(error) {
  if (!error) {
    return {
      status: 0,
      message: 'Произошла ошибка',
      details: null,
      fields: {},
    }
  }

  if (typeof error === 'object' && 'message' in error && 'fields' in error) {
    return toPlainDetails(error)
  }

  return {
    status: 0,
    message: error?.message || 'Произошла ошибка',
    details: {
      name: error?.name || 'Error',
      message: error?.message || 'Unknown error',
    },
    fields: {},
  }
}
