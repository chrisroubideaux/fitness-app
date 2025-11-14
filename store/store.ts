// store/store.ts

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

// 🔹 Import slices
import userReducer from "./slices/userSlice";
//import testReducer from "./slices/testSlice";
import appointmentsReducer from "./slices/appointmentsSlice";
import membershipsReducer from "./slices/membershipsSlice"; 
import messagesReducer from "./slices/messagesSlice";
import adminReducer from "./slices/adminSlice";

// ✅ Combine all reducers
const rootReducer = combineReducers({
  user: userReducer,
 // test: testReducer,
  appointments: appointmentsReducer, 
  memberships: membershipsReducer, 
  messages: messagesReducer,
   admin: adminReducer,
 
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
