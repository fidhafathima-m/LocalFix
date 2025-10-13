import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import technicianReducer from "./slices/technicianSlice";
import adminReducer from "./slices/adminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    technician: technicianReducer,
    admin: adminReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
