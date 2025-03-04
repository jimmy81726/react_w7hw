import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  message: [],
};

const toastSlice = createSlice({
  name: "toast",
  initialState,
  reducers: {
    addToast: (state, action) => {
      state.message.push({
        id: Date.now(),
        text: action.payload.text,
        status: action.payload.status,
      });
    },
    removeToast: (state, action) => {
      state.message = state.message.filter((msg) => msg.id !== action.payload);
    },
  },
});

export default toastSlice.reducer;
export const { addToast, removeToast } = toastSlice.actions;
