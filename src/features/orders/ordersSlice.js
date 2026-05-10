import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
  createOrder as createOrderRequest,
  getOrder,
  getOrders,
} from '../../shared/api/orderApi.js'
import { mapOrder, mapOrderList } from '../../shared/utils/mappers.js'
import { toSerializableError } from '../../shared/utils/normalizeError.js'
import { isAbortedAction } from '../../shared/utils/thunkResult.js'

const initialState = {
  items: [],
  total: 0,
  page: 1,
  limit: 20,
  selectedOrder: null,
  selectedOrderId: null,
  lastCreatedOrder: null,
  listStatus: 'idle',
  createStatus: 'idle',
  detailsStatus: 'idle',
  ordersListError: null,
  createError: null,
  detailsError: null,
  currentOrdersRequestId: null,
  currentOrderDetailsRequestId: null,
  currentCreateOrderRequestId: null,
}

export const createOrder = createAsyncThunk(
  'orders/createOrder',
  async (payload, { rejectWithValue }) => {
    try {
      return mapOrder(await createOrderRequest(payload))
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
  {
    condition: (_, { getState }) => getState().orders.createStatus !== 'loading',
  },
)

export const fetchOrders = createAsyncThunk(
  'orders/fetchOrders',
  async (params = {}, { rejectWithValue, signal }) => {
    try {
      return mapOrderList(await getOrders({ ...params, signal }))
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
)

export const fetchOrderById = createAsyncThunk(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue, signal }) => {
    try {
      return mapOrder(await getOrder(orderId, { signal }))
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
)

const ordersSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearSelectedOrder(state) {
      state.selectedOrder = null
      state.selectedOrderId = null
      state.detailsError = null
      state.detailsStatus = 'idle'
      state.currentOrderDetailsRequestId = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state, action) => {
        state.createStatus = 'loading'
        state.createError = null
        state.currentCreateOrderRequestId = action.meta.requestId
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        if (state.currentCreateOrderRequestId !== action.meta.requestId) {
          return
        }

        state.createStatus = 'succeeded'
        state.lastCreatedOrder = action.payload
        state.currentCreateOrderRequestId = null
      })
      .addCase(createOrder.rejected, (state, action) => {
        if (action.meta.condition || state.currentCreateOrderRequestId !== action.meta.requestId) {
          return
        }

        state.createStatus = 'failed'
        state.createError = action.payload ?? action.error
        state.currentCreateOrderRequestId = null
      })
      .addCase(fetchOrders.pending, (state, action) => {
        state.listStatus = 'loading'
        state.ordersListError = null
        state.currentOrdersRequestId = action.meta.requestId
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        if (state.currentOrdersRequestId !== action.meta.requestId) {
          return
        }

        state.listStatus = 'succeeded'
        state.items = action.payload.items
        state.total = action.payload.total
        state.page = action.payload.page
        state.limit = action.payload.limit
        state.currentOrdersRequestId = null
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        if (isAbortedAction(action) || state.currentOrdersRequestId !== action.meta.requestId) {
          return
        }

        state.listStatus = 'failed'
        state.ordersListError = action.payload ?? action.error
        state.currentOrdersRequestId = null
      })
      .addCase(fetchOrderById.pending, (state, action) => {
        const orderId = Number(action.meta.arg)
        state.detailsStatus = 'loading'
        state.detailsError = null
        state.currentOrderDetailsRequestId = action.meta.requestId
        state.selectedOrderId = orderId
        if (state.selectedOrder?.id !== orderId) {
          state.selectedOrder = null
        }
      })
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        if (state.currentOrderDetailsRequestId !== action.meta.requestId) {
          return
        }

        state.detailsStatus = 'succeeded'
        state.selectedOrder = action.payload
        state.selectedOrderId = action.payload.id
        state.currentOrderDetailsRequestId = null
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        if (isAbortedAction(action) || state.currentOrderDetailsRequestId !== action.meta.requestId) {
          return
        }

        state.detailsStatus = 'failed'
        state.detailsError = action.payload ?? action.error
        state.currentOrderDetailsRequestId = null
      })
  },
})

export const { clearSelectedOrder } = ordersSlice.actions

export default ordersSlice.reducer
