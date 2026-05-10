export function CategoryFilter({ categories, activeCategoryId, onChange }) {
  return (
    <section className="category-filter" aria-label="Фильтр категорий">
      <h2>Категории</h2>
      <div className="category-filter__list">
        <button
          className={!activeCategoryId ? 'filter-button active' : 'filter-button'}
          type="button"
          onClick={() => onChange(null)}
        >
          Все товары
        </button>
        {categories.map((category) => (
          <button
            className={activeCategoryId === category.id ? 'filter-button active' : 'filter-button'}
            type="button"
            key={category.id}
            onClick={() => onChange(category.id)}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  )
}
