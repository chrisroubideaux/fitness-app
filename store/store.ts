// store/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 🔹 Import slices
import userReducer from "./slices/userSlice";
import testReducer from "./slices/testSlice";
import appointmentsReducer from "./slices/appointmentsSlice"; // ✅ Add this line

// ✅ Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
  test: testReducer,
  appointments: appointmentsReducer, // ✅ Register appointments slice here
  // admin: adminReducer,
  // memberships: membershipsReducer,
  // payments: paymentsReducer,
  // calendar: calendarReducer,
  // ui: uiReducer,
});

// ✅ redux-persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // ✅ keep persisting only user slice for now
};

// ✅ Wrap root reducer with persist capabilities
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist non-serializable values
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// ✅ Persistor for <PersistGate>
export const persistor = persistStore(store);

// ✅ Typed hooks support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


{/*
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage"; // uses localStorage by default

// 🔹 Import slices
import userReducer from "./slices/userSlice";
import testReducer from "./slices/testSlice";
// import adminReducer from "./slices/adminSlice";
// import membershipsReducer from "./slices/membershipsSlice";
// import paymentsReducer from "./slices/paymentsSlice";
// import calendarReducer from "./slices/calendarSlice";
// import uiReducer from "./slices/uiSlice";

// ✅ Combine all reducers here
const rootReducer = combineReducers({
  user: userReducer,
  test: testReducer, // ✅ added test slice
  // admin: adminReducer,
  // memberships: membershipsReducer,
  // payments: paymentsReducer,
  // calendar: calendarReducer,
  // ui: uiReducer,
});

// ✅ redux-persist configuration
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["user"], // only persist user auth/profile state for now
};

// ✅ Wrap root reducer with persist capabilities
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ✅ Configure the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // needed for redux-persist non-serializable values
    }),
  devTools: process.env.NODE_ENV !== "production",
});

// ✅ Persistor for <PersistGate>
export const persistor = persistStore(store);

// ✅ Typed hooks support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

*/}