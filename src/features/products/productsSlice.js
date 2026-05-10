import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { PRODUCT_PAGE_SIZE } from '../../shared/config.js'
import { getProduct, getProducts } from '../../shared/api/productApi.js'
import { mapProduct, mapProductList } from '../../shared/utils/mappers.js'
import { toSerializableError } from '../../shared/utils/normalizeError.js'
import { isAbortedAction } from '../../shared/utils/thunkResult.js'

function makeQueryKey({ page = 1, limit = PRODUCT_PAGE_SIZE, categoryId, search }) {
  return JSON.stringify({
    page,
    limit,
    categoryId: categoryId ?? null,
    search: search?.trim() ?? '',
  })
}

function makeStateQueryKey(state) {
  return makeQueryKey({
    page: state.page,
    limit: state.limit,
    categoryId: state.activeCategoryId,
    search: state.search,
  })
}

function isCurrentProductsRequest(state, action) {
  const requestQueryKey = makeQueryKey(action.meta.arg ?? {})

  return (
    state.currentListRequestId === action.meta.requestId &&
    state.currentQueryKey === requestQueryKey &&
    requestQueryKey === makeStateQueryKey(state)
  )
}

const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: PRODUCT_PAGE_SIZE,
  activeCategoryId: null,
  search: '',
  selectedProduct: null,
  selectedProductId: null,
  listStatus: 'idle',
  detailsStatus: 'idle',
  listError: null,
  detailsError: null,
  currentListRequestId: null,
  currentDetailsRequestId: null,
  currentQueryKey: '',
}

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return mapProductList(await getProducts({ ...params, signal }))
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
)

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (productId, { rejectWithValue, signal }) => {
    try {
      return mapProduct(await getProduct(productId, { signal }))
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
)

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setActiveCategory(state, action) {
      state.activeCategoryId = action.payload ?? null
      state.page = 1
    },
    setSearch(state, action) {
      state.search = action.payload
      state.page = 1
    },
    setPage(state, action) {
      state.page = action.payload
    },
    clearSelectedProduct(state) {
      state.selectedProduct = null
      state.selectedProductId = null
      state.detailsError = null
      state.detailsStatus = 'idle'
      state.currentDetailsRequestId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state, action) => {
        state.listStatus = 'loading'
        state.listError = null
        state.currentListRequestId = action.meta.requestId
        state.currentQueryKey = makeQueryKey(action.meta.arg ?? {})
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        if (!isCurrentProductsRequest(state, action)) {
          return
        }

        state.listStatus = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.currentListRequestId = null
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        if (isAbortedAction(action) || !isCurrentProductsRequest(state, action)) {
          return
        }

        state.listStatus = 'failed'
        state.listError = action.payload ?? action.error
        state.currentListRequestId = null
      })
      .addCase(fetchProductById.pending, (state, action) => {
        const productId = Number(action.meta.arg)
        state.detailsStatus = 'loading'
        state.detailsError = null
        state.currentDetailsRequestId = action.meta.requestId
        state.selectedProductId = productId
        if (state.selectedProduct?.id !== productId) {
          state.selectedProduct = null
        }
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        if (state.currentDetailsRequestId !== action.meta.requestId) {
          return
        }

        state.detailsStatus = 'succeeded'
        state.selectedProduct = action.payload
        state.selectedProductId = action.payload.id
        state.currentDetailsRequestId = null
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        if (isAbortedAction(action) || state.currentDetailsRequestId !== action.meta.requestId) {
          return
        }

        state.detailsStatus = 'failed'
        state.detailsError = action.payload ?? action.error
        state.currentDetailsRequestId = null
      })
  },
})

export const { clearSelectedProduct, setActiveCategory, setPage, setSearch } = productsSlice.actions

export default productsSlice.reducer
