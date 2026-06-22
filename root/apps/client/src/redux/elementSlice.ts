import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for state
interface ElementState {
  elements: Element[];
}
export interface Element {
  _id: string;
  name: string;
  imageUrl: string;
  statics: boolean;
  width: number;
  height: number;
}
// Initial state
const initialState: ElementState = {
  elements: [],
};

// Create the slice
const elementSlice = createSlice({
  name: "elements",
  initialState,
  reducers: {
    addElement: (state, action: PayloadAction<Element>) => {
      state.elements.push(action.payload);
    },
    setElements: (state, action: PayloadAction<Element[]>) => {
      state.elements = action.payload;
    },
  },
});

// Export actions
export const { addElement, setElements } = elementSlice.actions;

// Export reducer
export default elementSlice.reducer;
