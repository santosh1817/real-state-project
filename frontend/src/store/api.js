import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_URL } from '../lib/config';

const baseQuery = fetchBaseQuery({
  baseUrl: `${API_URL}/api`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  }
});

export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Property', 'Inquiry', 'Me'],
  endpoints: (builder) => ({
    register: builder.mutation({ query: (body) => ({ url: '/auth/register', method: 'POST', body }) }),
    login: builder.mutation({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
    me: builder.query({ query: () => '/auth/me', providesTags: ['Me'] }),
    listProperties: builder.query({
      query: (params) => ({ url: '/properties', params }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${JSON.stringify({ ...queryArgs, cursor: undefined })}`,
      merge: (currentCache, newItems) => {
        if (!currentCache.data || !newItems.data) return newItems;
        currentCache.data.push(...newItems.data);
        currentCache.nextCursor = newItems.nextCursor;
      },
      forceRefetch({ currentArg, previousArg }) {
        return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
      },
      providesTags: ['Property']
    }),
    propertyDetail: builder.query({ query: (id) => `/properties/${id}`, providesTags: (result, error, id) => [{ type: 'Property', id }] }),
    createProperty: builder.mutation({ query: (body) => ({ url: '/properties', method: 'POST', body }), invalidatesTags: ['Property'] }),
    updateProperty: builder.mutation({ query: ({ id, ...body }) => ({ url: `/properties/${id}`, method: 'PATCH', body }), invalidatesTags: ['Property'] }),
    deleteProperty: builder.mutation({ query: (id) => ({ url: `/properties/${id}`, method: 'DELETE' }), invalidatesTags: ['Property'] }),
    createInquiry: builder.mutation({ query: ({ propertyId, ...body }) => ({ url: `/properties/${propertyId}/inquiries`, method: 'POST', body }), invalidatesTags: ['Inquiry'] }),
    myInquiries: builder.query({ query: () => '/inquiries/mine', providesTags: ['Inquiry'] })
  })
});

export const {
  useRegisterMutation,
  useLoginMutation,
  useMeQuery,
  useListPropertiesQuery,
  usePropertyDetailQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useCreateInquiryMutation,
  useMyInquiriesQuery
} = api;
