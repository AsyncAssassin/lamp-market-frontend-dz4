import { Link } from 'react-router-dom'

export function EmptyState({
  title,
  text,
  actionText = 'Перейти в каталог',
  actionTo = '/catalog',
  secondaryActionText,
  secondaryActionTo,
}) {
  return (
    <section className="empty-state">
      <span className="empty-state__mark" aria-hidden="true" />
      <h1>{title}</h1>
      <p>{text}</p>
      <div className="empty-state__actions">
        <Link className="btn btn-primary" to={actionTo}>
          {actionText}
        </Link>
        {secondaryActionText && secondaryActionTo && (
          <Link className="btn btn-outline" to={secondaryActionTo}>
            {secondaryActionText}
          </Link>
        )}
      </div>
    </section>
  )
}
