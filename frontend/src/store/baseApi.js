import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../lib/config';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    // Automatically attach JWT access token to every API request when logged in.
    const token = getState().auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  }
});

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  // Tags tell RTK Query which cached data should refresh after mutations.
  tagTypes: ['Property', 'Inquiry', 'AdminProperty'],
  endpoints: () => ({})
});
