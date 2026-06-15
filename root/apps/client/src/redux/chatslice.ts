import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for state
interface MessageState {
  messages: Message[];
}

export interface Message {
  senderId: string;
  message: string;
  timestamp: string;
  senderName: string;
}

// Initial state
const initialState: MessageState = {
  messages: [],
};

// Create the slice
const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    receive: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
    send: (state, action: PayloadAction<Message>) => {
      state.messages.push(action.payload);
    },
  },
});

// Export actions
export const { receive, send } = chatSlice.actions;

// Export reducer
export default chatSlice.reducer;
