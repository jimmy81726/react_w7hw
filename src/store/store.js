import { configureStore } from "@reduxjs/toolkit";
import toastReducer from "../redux/slices/toastSlice";

export const store = configureStore({
  reducer: {
    toast: toastReducer,
  },
});
