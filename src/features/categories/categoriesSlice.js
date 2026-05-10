import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getCategories } from '../../shared/api/productApi.js'
import { mapCategory } from '../../shared/utils/mappers.js'
import { toSerializableError } from '../../shared/utils/normalizeError.js'
import { isAbortedAction, isConditionCancelled } from '../../shared/utils/thunkResult.js'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async (_, { rejectWithValue, signal }) => {
    try {
      const categories = await getCategories({ signal })
      return categories.map(mapCategory)
    } catch (error) {
      return rejectWithValue(toSerializableError(error))
    }
  },
  {
    condition: (_, { getState }) => getState().categories.status !== 'loading',
  },
)

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        if (isAbortedAction(action) || isConditionCancelled(action)) {
          return
        }

        state.status = 'failed'
        state.error = action.payload ?? action.error
      })
  },
})

export default categoriesSlice.reducer
