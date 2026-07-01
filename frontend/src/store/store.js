import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import { baseApi } from './baseApi';

export const store = configureStore({
  // Combine normal Redux auth state with RTK Query API cache.
  reducer: {
    auth: authReducer,
    [baseApi.reducerPath]: baseApi.reducer
  },
  // RTK Query middleware handles caching, invalidation, and request lifecycle.
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware)
});
