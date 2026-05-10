export const selectCategories = (state) => state.categories.items
export const selectCategoriesStatus = (state) => state.categories.status
export const selectCategoriesError = (state) => state.categories.error
export const selectHasCategories = (state) => state.categories.items.length > 0
