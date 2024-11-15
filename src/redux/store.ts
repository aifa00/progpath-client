import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./userSlice";
import formReducer from "./formSlice";
import alertReducer from "./alertSlice";
import errorReducer from "./errorSlice";
import notifyReducer from "./notifySlice";
import sidebarCollapseReducer from "./sidebarCollapseSlice";
import premiumReducer from "./premiumSlice";
import chatReducer from "./chatSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    form: formReducer,
    alert: alertReducer,
    notify: notifyReducer,
    error: errorReducer,
    sidebarCollapse: sidebarCollapseReducer,
    premiumComponent: premiumReducer,
    chat: chatReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
