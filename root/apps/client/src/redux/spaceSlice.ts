import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the type for state
interface Spaces {
    spaces: Space[],
    maps:Map[]
}
export interface Space {
  id: string;
  name: string;
  dimensions: {
    x: number;
    y: number;
  };
  thumbnail: string;
  creator: {
    _id: string;
    username: string;
  };
}
export interface Map {
  id:string,
  name:string
}
// Initial state
const initialState:Spaces = {
    spaces:[],
    maps:[]
};

// Create the slice
const spaceSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    addNewSpace: (state, action: PayloadAction<Space>) => {
      state.spaces.push(action.payload);
    },
    setSpacesState: (state, action: PayloadAction<Space[]>) => {
      state.spaces = [...action.payload] ;
    },
    removeSpace :(state , action :PayloadAction<string>) =>{
        state.spaces = state.spaces.filter(space => space.id != action.payload)
    },
    setMaps:(state, action:PayloadAction<any>)=>{
      state.maps = action.payload;
    }
  },
});

// Export actions
export const { addNewSpace , setSpacesState , removeSpace , setMaps } = spaceSlice.actions;

// Export reducer
export default spaceSlice.reducer;
