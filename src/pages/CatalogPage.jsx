import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../app/hooks.js'
import { CategoryFilter } from '../components/CategoryFilter.jsx'
import { ProductCard } from '../components/ProductCard.jsx'
import { StatusBlock } from '../components/StatusBlock.jsx'
import {
  selectCategories,
  selectCategoriesError,
  selectCategoriesStatus,
} from '../features/categories/categoriesSelectors.js'
import { fetchCategories } from '../features/categories/categoriesSlice.js'
import {
  selectCanShowProductList,
  selectProductQuery,
  selectProducts,
  selectProductsListError,
  selectProductsStatus,
  selectProductsTotal,
} from '../features/products/productsSelectors.js'
import { fetchProducts, setActiveCategory, setSearch } from '../features/products/productsSlice.js'

export function CatalogPage() {
  const dispatch = useAppDispatch()
  const categories = useAppSelector(selectCategories)
  const categoriesStatus = useAppSelector(selectCategoriesStatus)
  const categoriesError = useAppSelector(selectCategoriesError)
  const products = useAppSelector(selectProducts)
  const productsTotal = useAppSelector(selectProductsTotal)
  const productsStatus = useAppSelector(selectProductsStatus)
  const productsError = useAppSelector(selectProductsListError)
  const canShowProductList = useAppSelector(selectCanShowProductList)
  const query = useAppSelector(selectProductQuery)
  const isInitialLoading = productsStatus === 'loading' && products.length === 0
  const isRefetching = productsStatus === 'loading' && products.length > 0

  useEffect(() => {
    if (categoriesStatus === 'idle') {
      dispatch(fetchCategories())
    }
  }, [categoriesStatus, dispatch])

  useEffect(() => {
    let request
    const timer = window.setTimeout(() => {
      request = dispatch(
        fetchProducts({
          page: query.page,
          limit: query.limit,
          categoryId: query.activeCategoryId,
          search: query.search,
        }),
      )
    }, 350)

    return () => {
      window.clearTimeout(timer)
      request?.abort()
    }
  }, [dispatch, query.activeCategoryId, query.limit, query.page, query.search])

  const retryProducts = () => {
    dispatch(
      fetchProducts({
        page: query.page,
        limit: query.limit,
        categoryId: query.activeCategoryId,
        search: query.search,
      }),
    )
  }

  return (
    <div className="catalog-layout">
      <CategoryFilter
        categories={categories}
        activeCategoryId={query.activeCategoryId}
        onChange={(categoryId) => dispatch(setActiveCategory(categoryId))}
      />

      <section className="catalog-main">
        <div className="page-heading">
          <div>
            <p className="eyebrow">Лампочки для дома и бизнеса</p>
            <h1>Каталог</h1>
          </div>
          <span>{productsTotal} товаров</span>
        </div>

        {categoriesStatus === 'failed' && (
          <div className="inline-warning">
            {categoriesError?.message || 'Не удалось загрузить категории. Показаны все товары.'}
          </div>
        )}

        <label className="search-field">
          <span>Поиск по названию</span>
          <input
            type="search"
            value={query.search}
            placeholder="Например, LED или E27"
            onChange={(event) => dispatch(setSearch(event.target.value))}
          />
        </label>

        {isInitialLoading && <StatusBlock title="Загружаем каталог" text="Получаем товары из сервиса." />}

        {productsStatus === 'failed' && products.length === 0 && (
          <StatusBlock
            title="Не удалось загрузить каталог"
            text={productsError?.message}
            onAction={retryProducts}
          />
        )}

        {canShowProductList && (
          <>
            {isRefetching && <div className="inline-warning">Обновляем список товаров...</div>}
            {productsStatus === 'failed' && products.length > 0 && (
              <div className="inline-warning inline-warning--action">
                <span>
                  {productsError?.message ||
                    'Не удалось обновить каталог. Сейчас показаны предыдущие товары.'}
                </span>
                <button className="btn btn-outline btn-sm" type="button" onClick={retryProducts}>
                  Повторить
                </button>
              </div>
            )}

            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((product) => (
                  <ProductCard product={product} key={product.id} />
                ))}
              </div>
            ) : (
              <div className="inline-empty">
                <h2>Товары не найдены</h2>
                <p>Попробуйте выбрать другую категорию или изменить поиск.</p>
                <button
                  className="btn btn-outline"
                  type="button"
                  onClick={() => {
                    dispatch(setSearch(''))
                    dispatch(setActiveCategory(null))
                  }}
                >
                  Сбросить фильтры
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
