import { createSlice, PayloadAction } from "@reduxjs/toolkit";

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
    storeToken: (
      state,
      action: PayloadAction<{ token: string; myId: string; name: string }>
    ) => {
      state.token = action.payload.token;
      state.myId = action.payload.myId;
      state.currentUser.id = action.payload.myId;
      state.currentUser.name = action.payload.name;
      localStorage.setItem("token", action.payload.token);
    },
    removeToken: (state) => {
      state.token = "";
      localStorage.removeItem("token");
    },
    setMyId: (state, action) => {
      state.myId = action.payload;
    },
  },
});

// Export actions
export const { storeToken, removeToken, setMyId } = authSlice.actions;

// Export reducer
export default authSlice.reducer;
