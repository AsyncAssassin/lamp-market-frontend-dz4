import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  addCartItem as addCartItemRequest,
  deleteCartItem,
  getCart,
  updateCartItem as updateCartItemRequest,
} from '../../shared/api/orderApi.js'
import { mapCart } from '../../shared/utils/mappers.js'
import { toSerializableError } from '../../shared/utils/normalizeError.js'
import { isAbortedAction } from '../../shared/utils/thunkResult.js'

function removeValue(values, value) {
  return values.filter((item) => item !== value)
}

function hasPendingMutations(state) {
  return state.addPendingProductIds.length > 0 || state.pendingItemIds.length > 0
}

const initialState = {
  items: [],
  total: 0,
  cartFetchStatus: 'idle',
  mutationStatus: 'idle',
  cartFetchError: null,
  cartMutationError: null,
  addPendingProductIds: [],
  pendingItemIds: [],
  currentCartRequestId: null,
}

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue, signal }) => {
  try {
    return mapCart(await getCart({ signal }))
  } catch (error) {
    return rejectWithValue(toSerializableError(error))
  }
})

export const addCartItem = createAsyncThunk(
  'cart/addCartItem',
  async ({ productId, quantity }, { rejectWithValue }) => {
    try {
      await addCartItemRequest({ productId, quantity })
      return { productId }
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
  {
    condition: ({ productId }, { getState }) =>
      !getState().cart.addPendingProductIds.includes(Number(productId)),
  },
)

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity }, { rejectWithValue }) => {
    try {
      await updateCartItemRequest({ itemId, quantity })
      return { itemId }
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
  {
    condition: ({ itemId }, { getState }) => !getState().cart.pendingItemIds.includes(Number(itemId)),
  },
)

export const removeCartItem = createAsyncThunk(
  'cart/removeCartItem',
  async (itemId, { rejectWithValue }) => {
    try {
      await deleteCartItem(itemId)
      return { itemId }
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
  {
    condition: (itemId, { getState }) => !getState().cart.pendingItemIds.includes(Number(itemId)),
  },
)

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartAfterOrder(state) {
      state.items = []
      state.total = 0
      state.cartFetchStatus = 'succeeded'
      state.cartFetchError = null
      state.cartMutationError = null
      state.addPendingProductIds = []
      state.pendingItemIds = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state, action) => {
        state.cartFetchStatus = 'loading'
        state.cartFetchError = null
        state.currentCartRequestId = action.meta.requestId
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        if (state.currentCartRequestId !== action.meta.requestId) {
          return
        }

        state.cartFetchStatus = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        state.currentCartRequestId = null
      })
      .addCase(fetchCart.rejected, (state, action) => {
        if (isAbortedAction(action) || state.currentCartRequestId !== action.meta.requestId) {
          return
        }

        state.cartFetchStatus = 'failed'
        state.cartFetchError = action.payload ?? action.error
        state.currentCartRequestId = null
      })
      .addCase(addCartItem.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.cartMutationError = null
        state.addPendingProductIds.push(Number(action.meta.arg.productId))
      })
      .addCase(addCartItem.fulfilled, (state, action) => {
        state.addPendingProductIds = removeValue(
          state.addPendingProductIds,
          Number(action.meta.arg.productId),
        )
        state.mutationStatus = hasPendingMutations(state) ? 'loading' : 'succeeded'
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.addPendingProductIds = removeValue(
          state.addPendingProductIds,
          Number(action.meta.arg.productId),
        )
        if (!action.meta.condition) {
          state.cartMutationError = action.payload ?? action.error
        }
        state.mutationStatus = hasPendingMutations(state) ? 'loading' : 'failed'
      })
      .addCase(updateCartItem.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.cartMutationError = null
        state.pendingItemIds.push(Number(action.meta.arg.itemId))
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        state.pendingItemIds = removeValue(state.pendingItemIds, Number(action.meta.arg.itemId))
        state.mutationStatus = hasPendingMutations(state) ? 'loading' : 'succeeded'
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.pendingItemIds = removeValue(state.pendingItemIds, Number(action.meta.arg.itemId))
        if (!action.meta.condition) {
          state.cartMutationError = action.payload ?? action.error
        }
        state.mutationStatus = hasPendingMutations(state) ? 'loading' : 'failed'
      })
      .addCase(removeCartItem.pending, (state, action) => {
        state.mutationStatus = 'loading'
        state.cartMutationError = null
        state.pendingItemIds.push(Number(action.meta.arg))
      })
      .addCase(removeCartItem.fulfilled, (state, action) => {
        state.pendingItemIds = removeValue(state.pendingItemIds, Number(action.meta.arg))
        state.mutationStatus = hasPendingMutations(state) ? 'loading' : 'succeeded'
      })
      .addCase(removeCartItem.rejected, (state, action) => {
        state.pendingItemIds = removeValue(state.pendingItemIds, Number(action.meta.arg))
        if (!action.meta.condition) {
          state.cartMutationError = action.payload ?? action.error
        }
        state.mutationStatus = hasPendingMutations(state) ? 'loading' : 'failed'
      })
  },
})

export const { clearCartAfterOrder } = cartSlice.actions

export default cartSlice.reducer
