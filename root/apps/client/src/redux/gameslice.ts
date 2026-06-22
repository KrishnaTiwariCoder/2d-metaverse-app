import { createSlice , PayloadAction } from "@reduxjs/toolkit";
import { Element } from "./elementSlice";
import { addElementToSpace } from "../utils/spaces";
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
  elements: {
    element: Element;
    x: number;
    y: number;
  }[];
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
  elements:[] 
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
    setGameElements: (state, action:PayloadAction<any>) => {
      state.elements = action.payload;
    },
    setCurrentPosition: (state, action:PayloadAction<any>) => {
      state.currentPosition = action.payload;
    },
    addGameElement: (state, action:PayloadAction<{element: Element; x: number; y: number}>) => {
      state.elements.push(action.payload);
      addElementToSpace(state.spaceId, action.payload)
      .then(response => {
      if(response.status==200){
        console.log('Element added to space:', response);
      }
      })
      .catch(error => {
      console.error('Error adding element to space:', error);
      });
    }
  },
});

export const {
  setSpaceId,
  setSpaceDimensions,
  setError,
  setConnectionStatus,
  setCurrentPosition,
  setGameElements,
  addGameElement
} = gameSlice.actions;

// Export reducer
export default gameSlice.reducer;
