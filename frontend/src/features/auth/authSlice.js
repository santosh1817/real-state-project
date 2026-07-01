import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // User and tokens are stored in Redux for app-wide access.
  user: null,
  accessToken: null,
  refreshToken: null,
  hydrated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      // Save login/register response in Redux and localStorage.
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
        localStorage.setItem('accessToken', action.payload.accessToken);
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    hydrateAuth(state, action) {
      // Restore auth state after page refresh.
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.hydrated = true;
    },
    setUser(state, action) {
      // Update only the user object after /auth/me verifies the token.
      state.user = action.payload.user;
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    logout(state) {
      // Clear Redux and localStorage on logout.
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.hydrated = true;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
  }
});

export const { hydrateAuth, setCredentials, setUser, logout } = authSlice.actions;
export default authSlice.reducer;
