// store/reduxCheck.ts
// store/reduxCheck.ts
import { store } from "./store";
import { increment } from "./slices/testSlice";

console.log("Before:", store.getState());
store.dispatch(increment());
console.log("After:", store.getState());
