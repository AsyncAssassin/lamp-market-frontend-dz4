export const selectCartItems = (state) => state.cart.items
export const selectCartTotal = (state) => state.cart.total
export const selectCartCount = (state) =>
  state.cart.items.reduce((total, item) => total + item.quantity, 0)
export const selectCartStatus = (state) => state.cart.cartFetchStatus
export const selectCartMutationStatus = (state) => state.cart.mutationStatus
export const selectIsCartEmpty = (state) => state.cart.items.length === 0
export const selectCartFetchError = (state) => state.cart.cartFetchError
export const selectCartMutationError = (state) => state.cart.cartMutationError
export const selectIsProductAddPending = (state, productId) =>
  state.cart.addPendingProductIds.includes(Number(productId))
export const selectIsCartItemPending = (state, itemId) =>
  state.cart.pendingItemIds.includes(Number(itemId))
