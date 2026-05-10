import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { selectNotifications } from '../features/notifications/notificationsSelectors.js'
import { removeNotification } from '../features/notifications/notificationsSlice.js'

export function Notifications() {
  const dispatch = useAppDispatch()
  const notifications = useAppSelector(selectNotifications)

  useEffect(() => {
    const timers = notifications
      .filter((notification) => notification.type !== 'error')
      .map((notification) =>
        window.setTimeout(() => {
          dispatch(removeNotification(notification.id))
        }, 4000),
      )

    return () => timers.forEach(window.clearTimeout)
  }, [dispatch, notifications])

  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="notifications" aria-live="polite" aria-label="Уведомления">
      {notifications.map((notification) => (
        <div
          className={`notification notification--${notification.type}`}
          key={notification.id}
          role={notification.type === 'error' ? 'alert' : 'status'}
        >
          <span>{notification.message}</span>
          <button
            type="button"
            aria-label="Закрыть уведомление"
            onClick={() => dispatch(removeNotification(notification.id))}
          >
            x
          </button>
        </div>
      ))}
    </div>
  )
}
