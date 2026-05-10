import { createSlice } from '@reduxjs/toolkit'

function createId() {
  return crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    items: [],
  },
  reducers: {
    addNotification: {
      reducer(state, action) {
        const exists = state.items.some(
          (item) => item.type === action.payload.type && item.message === action.payload.message,
        )

        if (!exists) {
          state.items.push(action.payload)
        }
      },
      prepare({ type = 'info', message }) {
        return {
          payload: {
            id: createId(),
            type,
            message,
          },
        }
      },
    },
    removeNotification(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
    },
    clearNotifications(state) {
      state.items = []
    },
  },
})

export const { addNotification, clearNotifications, removeNotification } =
  notificationsSlice.actions

export default notificationsSlice.reducer
