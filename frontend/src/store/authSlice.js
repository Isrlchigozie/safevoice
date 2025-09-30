import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: null,
    token: null,
    isAuthenticated: false
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.admin = action.payload.admin;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      localStorage.setItem('adminToken', action.payload.token);
    },
    logout: (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('adminToken');
    },
    checkAuth: (state) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        state.token = token;
        state.isAuthenticated = true;
      }
    }
  }
});

export const { loginSuccess, logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;