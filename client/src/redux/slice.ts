import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: localStorage.getItem("user-login")
    ? JSON.parse(localStorage.getItem("user-login")!)
    : null,
};

const slice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload;
      localStorage.setItem("user-login", JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      localStorage.removeItem("user-login");
    },
  },
});

export const { login, logout } = slice.actions;
export default slice.reducer;
