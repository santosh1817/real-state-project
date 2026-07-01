import { baseApi } from '../../store/baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation({
      // Create account and receive user + tokens.
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
      transformResponse: (response) => response.data
    }),
    login: builder.mutation({
      // Login and receive user + tokens.
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
      transformResponse: (response) => response.data
    })
  }),
  // Prevent duplicate endpoint errors during Next.js hot reload.
  overrideExisting: true
});

export const {
  useRegisterMutation,
  useLoginMutation
} = authApi;
