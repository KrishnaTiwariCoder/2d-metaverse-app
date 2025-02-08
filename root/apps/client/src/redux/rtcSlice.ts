import { createSlice } from "@reduxjs/toolkit";

import React from "react";

export interface AudioRefs {
  [userId: string]: React.RefObject<HTMLAudioElement>;
}

const initialState: AudioRefs = {};

const rtcSlice = createSlice({
  name: "rtc",
  initialState,
  reducers: {
    addAudioRef: (state, action) => {
      state[action.payload.userId] = action.payload.audioRef;
    },
    removeAudioRef: (state, action) => {
      delete state[action.payload.userId];
    },
  },
});

export const { addAudioRef, removeAudioRef } = rtcSlice.actions;

export default rtcSlice.reducer;
