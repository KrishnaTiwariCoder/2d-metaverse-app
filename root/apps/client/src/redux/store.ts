import { configureStore } from "@reduxjs/toolkit";
import chatReducer from "./chatSlice.ts"; // Import your slice reducer
import authReducer from "./authSlice.ts";
import gameReducer from "./gameSlice.ts";
import playerReducer from "./playerSlice.ts";

// Create and export the store
export const store = configureStore({
  reducer: {
    chats: chatReducer, // Add more reducers here
    game: gameReducer,
    auth: authReducer,

    players: playerReducer,
  },
});

// Infer RootState and AppDispatch from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const appDispatch: AppDispatch = store.dispatch;

export default store;
