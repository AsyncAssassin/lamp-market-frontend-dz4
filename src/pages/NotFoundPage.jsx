import { EmptyState } from '../components/EmptyState.jsx'

export function NotFoundPage() {
  return (
    <EmptyState
      title="Страница не найдена"
      text="Такого маршрута нет в пользовательской части магазина."
    />
  )
}
