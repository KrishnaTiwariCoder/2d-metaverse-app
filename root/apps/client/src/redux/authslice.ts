import { createSlice } from "@reduxjs/toolkit";

// Define the type for state
interface AuthState {
  token: string;
  myId: string;
  currentUser: {
    id: string;
    name: string;
  };
}

// Initial state
const initialState: AuthState = {
  token: localStorage.getItem("token") || "",
  myId: "",
  currentUser: {
    id: "",
    name: "",
  },
};

// Create the slice
const authSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    storeToken: (state, action) => {
      state.token = action.payload;
      localStorage.setItem("token", action.payload);
    },
    setMyName: (state, action) => {
      state.currentUser.name = action.payload;
    },
    removeToken: (state) => {
      state.token = "";
      localStorage.removeItem("token");
    },
    setMyId: (state, action) => {
      state.myId = action.payload;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
  },
});

// Export actions
export const { storeToken, removeToken, setMyId, setCurrentUser } =
  authSlice.actions;

// Export reducer
export default authSlice.reducer;
