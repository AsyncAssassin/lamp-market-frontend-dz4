export function isConditionCancelled(action) {
  return Boolean(action?.meta?.condition)
}

export function isAbortedAction(action) {
  return Boolean(action?.meta?.aborted || action?.payload?.aborted)
}

export function getRejectedValue(action) {
  return action?.payload ?? action?.error ?? { message: 'Произошла ошибка' }
}

export function isRejectedAction(action) {
  return action?.type?.endsWith('/rejected')
}
