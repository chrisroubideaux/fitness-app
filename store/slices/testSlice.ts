// store/slices/testSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// 🔹 Define the shape of the test state
interface TestState {
  count: number;
}

// 🔹 Initial state
const initialState: TestState = {
  count: 0,
};

// 🔹 Create the slice
const testSlice = createSlice({
  name: "test",
  initialState,
  reducers: {
    // ✅ Increment count
    increment: (state) => {
      state.count += 1;
    },
    // ✅ Decrement count
    decrement: (state) => {
      state.count -= 1;
    },
    // ✅ Set count to a specific value
    setCount: (state, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
  },
});

// 🔹 Export actions
export const { increment, decrement, setCount } = testSlice.actions;

// 🔹 Export reducer
export default testSlice.reducer;
