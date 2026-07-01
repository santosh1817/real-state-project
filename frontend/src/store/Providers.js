'use client';

import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { hydrateAuth, setUser } from '../features/auth/authSlice';
import { API_URL } from '../lib/config';
import { store } from './store';

export default function Providers({ children }) {
  useEffect(() => {
    // Restore auth state from localStorage after the app loads in the browser.
    const user = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    store.dispatch(hydrateAuth({
      user: user ? JSON.parse(user) : null,
      accessToken,
      refreshToken: localStorage.getItem('refreshToken')
    }));

    if (accessToken) {
      // Verify saved token by asking backend for the current user.
      fetch(`${API_URL}/api/auth/me`, {
        headers: { authorization: `Bearer ${accessToken}` }
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((data) => {
          if (data?.data?.user) store.dispatch(setUser({ user: data.data.user }));
        })
        .catch(() => {});
    }
  }, []);

  // Redux Provider makes the store available to all client components.
  return <Provider store={store}>{children}</Provider>;
}
