import { createSelector } from '@reduxjs/toolkit'

export const selectProducts = (state) => state.products.items
export const selectProductsTotal = (state) => state.products.total
export const selectProductsPage = (state) => state.products.page
export const selectProductsLimit = (state) => state.products.limit
export const selectProductQuery = createSelector(
  [
    (state) => state.products.activeCategoryId,
    (state) => state.products.search,
    (state) => state.products.page,
    (state) => state.products.limit,
  ],
  (activeCategoryId, search, page, limit) => ({
    activeCategoryId,
    search,
    page,
    limit,
  }),
)
export const selectProductsStatus = (state) => state.products.listStatus
export const selectProductsListError = (state) => state.products.listError
export const selectSelectedProduct = (state) => state.products.selectedProduct
export const selectSelectedProductStatus = (state) => state.products.detailsStatus
export const selectProductDetailsError = (state) => state.products.detailsError
export const selectCanShowProductList = (state) =>
  state.products.listStatus === 'succeeded' || state.products.items.length > 0
