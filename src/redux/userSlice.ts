import { createSlice } from "@reduxjs/toolkit";

interface UserState {
  value: boolean;
  username: string;
  isPremiumUser: boolean;
  avatar: string;
}

const initialState = {
  value: false,
  username: "",
  isPremiumUser: false,
  avatar: "/images/avatar.jpg",
} satisfies UserState as UserState;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state) => {
      state.value = true;
    },
    removeUser: (state) => {
      state.value = initialState.value;
      state.username = initialState.username;
      state.isPremiumUser = initialState.isPremiumUser;
      state.avatar = initialState.avatar;
    },
    setPremiumUser: (state, action) => {
      state.isPremiumUser = action.payload;
    },
    setAvatarUrl: (state, action) => {
      state.avatar = action.payload;
    },
    removeAvatarUrl: (state) => {
      state.avatar = initialState.avatar;
    },
    setUsername: (state, action) => {
      state.username = action.payload;
    },
  },
});

export const {
  setUser,
  removeUser,
  setPremiumUser,
  setAvatarUrl,
  removeAvatarUrl,
  setUsername,
} = userSlice.actions;

export default userSlice.reducer;
