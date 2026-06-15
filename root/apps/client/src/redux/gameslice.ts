import { createSlice , PayloadAction } from "@reduxjs/toolkit";

export interface Player {
  id: string;
  x: number; // spawn.x
  y: number; // spawn.y
  isMuted: boolean;
  isDeafened: boolean;
  isSpeaking: boolean;
  name: string;
  connection?: RTCPeerConnection;
}

// Define the type for state
interface GameState {
  spaceId: string;
  spaceDimensions: {
    width: number;
    height: number;
  };
  error: string;
  connectionStatus: string;
  currentPosition: {
    x: number;
    y: number;
  };
}

// Initial state
const initialState: GameState = {
  spaceId: "",
  spaceDimensions: {
    width: 800,
    height: 600,
  },
  error: "",
  connectionStatus: "connecting",
  currentPosition: {
    x: 0,
    y: 0,
  },
};

// Create the slice
const gameSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSpaceId: (state, action : PayloadAction<string>) => {
      state.spaceId = action.payload;
    },
    setSpaceDimensions: (state, action:PayloadAction<any>) => {
      state.spaceDimensions = action.payload;
    },
    setError: (state, action:PayloadAction<any>) => {
      state.error = action.payload;
    },
    setConnectionStatus: (state, action:PayloadAction<any>) => {
      state.connectionStatus = action.payload;
    },

    setCurrentPosition: (state, action:PayloadAction<any>) => {
      state.currentPosition = action.payload;
    },
  },
});

export const {
  setSpaceId,
  setSpaceDimensions,
  setError,
  setConnectionStatus,
  setCurrentPosition,
} = gameSlice.actions;

// Export reducer
export default gameSlice.reducer;
