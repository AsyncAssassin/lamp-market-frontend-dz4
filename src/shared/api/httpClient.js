import { normalizeApiError, normalizeNetworkError } from '../utils/normalizeError.js'

function parseSuccessJson(text, response) {
  try {
    return JSON.parse(text)
  } catch (error) {
    throw {
      status: response.status,
      message: 'Некорректный ответ сервера',
      details: {
        raw: text,
        parseError: {
          name: error?.name || 'SyntaxError',
          message: error?.message || 'Invalid JSON',
        },
      },
      fields: {},
    }
  }
}

function parseErrorBody(text, response) {
  if (!text) {
    return { detail: response.statusText || 'Ошибка сервера' }
  }

  try {
    return JSON.parse(text)
  } catch {
    return {
      detail: text || response.statusText || 'Ошибка сервера',
      raw: text,
    }
  }
}

export async function request(path, options = {}) {
  const { body, headers, ...restOptions } = options
  const requestHeaders = {
    Accept: 'application/json',
    ...headers,
  }

  if (body !== undefined) {
    requestHeaders['Content-Type'] = 'application/json'
  }

  let response

  try {
    response = await fetch(path, {
      ...restOptions,
      body,
      headers: requestHeaders,
    })
  } catch (error) {
    throw normalizeNetworkError(error)
  }

  if (response.status === 204) {
    return null
  }

  let text

  try {
    text = await response.text()
  } catch (error) {
    throw normalizeNetworkError(error)
  }

  if (!response.ok) {
    throw normalizeApiError(response, parseErrorBody(text, response))
  }

  return text ? parseSuccessJson(text, response) : null
}
