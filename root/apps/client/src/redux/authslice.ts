import { createSlice , PayloadAction } from "@reduxjs/toolkit";

// Define the type for state
interface AuthState {
  token: string;
  myId: string;
  currentUser: {
    id: string;
    username: string;
  };
}

// Initial state
const initialState: AuthState = {
  token: "",
  myId: "",
  currentUser: {
    id: "",
    username: "",
  },
};

// Create the slice
const authSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    storeToken: (state, action:PayloadAction<any>) => {
      state.token = action.payload;
      localStorage.setItem("token" , action.payload);
    },
    setMyName: (state, action:PayloadAction<any>) => {
      state.currentUser.username = action.payload;
    },
    removeToken: (state) => {
      state.token = "";
      localStorage.removeItem("token")
    },
    setMyId: (state, action:PayloadAction<any>) => {
      state.myId = action.payload;
    },
    setCurrentUser: (state, action:PayloadAction<any>) => {
      state.currentUser = action.payload;
    },
    logOut:()=>{
      localStorage.removeItem("token");
      return initialState;
    }
  },
});

// Export actions
export const { storeToken, removeToken, setMyId, setCurrentUser , logOut } =
  authSlice.actions;

// Export reducer
export default authSlice.reducer;
