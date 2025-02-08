import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice"; // Import your slice reducer
import authReducer from "./authSlice";
import gameReducer from "./gameSlice";
import rtcReducer from "./rtcSlice";
import playerReducer from "./playerSlice";

// Create and export the store
export const store = configureStore({
  reducer: {
    chats: chatReducer, // Add more reducers here
    game: gameReducer,
    auth: authReducer,
    rtc: rtcReducer,
    players: playerReducer,
  },
});

// Infer RootState and AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const appDispatch: AppDispatch = store.dispatch;

export default store;
