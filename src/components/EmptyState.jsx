import { Link } from 'react-router-dom'

export function EmptyState({ title, text, actionText = 'Перейти в каталог', actionTo = '/catalog' }) {
  return (
    <section className="empty-state">
      <span className="empty-state__mark" aria-hidden="true" />
      <h1>{title}</h1>
      <p>{text}</p>
      <Link className="btn btn-primary" to={actionTo}>
        {actionText}
      </Link>
    </section>
  )
}
