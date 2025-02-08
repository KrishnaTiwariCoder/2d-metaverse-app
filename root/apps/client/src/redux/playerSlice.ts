import { createSlice } from "@reduxjs/toolkit";

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
interface PlayerState {
  players: Player[];
}

// Initial state
const initialState: PlayerState = { players: [] };

// Create the slice
const playerSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addPlayer: (state, action) => {
      state.players.push(action.payload);
    },
    removeUser: (state, action) => {
      state.players = state.players.filter(
        (p: Player) => p.id !== action.payload.userId
      );
    },
    setPlayers: (state, action) => {
      console.log(action.payload);
      state.players = action.payload;
    },
    setPlayer: (state, action) => {
      state.players = state.players.map((p) => {
        if (p.id === action.payload.id) {
          return { ...action.payload };
        } else {
          return p;
        }
      });
    },
  },
});

export const { addPlayer, removeUser, setPlayers, setPlayer } =
  playerSlice.actions;

// Export reducer
export default playerSlice.reducer;
