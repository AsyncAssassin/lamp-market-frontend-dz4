import { useMemo, useState } from 'react'
import { CategoryFilter } from '../components/CategoryFilter.jsx'
import { ProductCard } from '../components/ProductCard.jsx'
import { categories } from '../data/categories.js'
import { getActiveProducts } from '../utils/catalog.js'

export function CatalogPage() {
  const [activeCategoryId, setActiveCategoryId] = useState(null)
  const [search, setSearch] = useState('')

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return getActiveProducts().filter((product) => {
      const matchesCategory = !activeCategoryId || product.categoryId === activeCategoryId
      const matchesSearch =
        !normalizedSearch || product.name.toLowerCase().includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [activeCategoryId, search])

  return (
    <div className="catalog-layout">
      <CategoryFilter
        categories={categories}
        activeCategoryId={activeCategoryId}
        onChange={setActiveCategoryId}
      />

      <section className="catalog-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Лампочки для дома и бизнеса</p>
            <h1>Каталог</h1>
          </div>
          <span>{filteredProducts.length} товаров</span>
        </div>

        <label className="search-field">
          <span>Поиск по названию</span>
          <input
            type="search"
            value={search}
            placeholder="Например, LED или E27"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard product={product} key={product.id} />
            ))}
          </div>
        ) : (
          <div className="inline-empty">
            <h2>Товары не найдены</h2>
            <p>Попробуйте выбрать другую категорию или изменить поиск.</p>
          </div>
        )}
      </section>
    </div>
  )
}
