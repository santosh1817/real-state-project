import { baseApi } from '../../store/baseApi';

export const propertyApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listProperties: builder.query({
      query: (params) => ({ url: '/properties', params }),
      transformResponse: (response) => response.data,
      // Keep all cursor pages under the same cache key for the current filter set.
      serializeQueryArgs: ({ endpointName, queryArgs }) => `${endpointName}-${JSON.stringify({ ...queryArgs, cursor: undefined })}`,
      merge: (currentCache, newItems, { arg }) => {
        if (!currentCache.items || !newItems.items) return newItems;
        // A normal refetch should replace the list; only "Load more" should append.
        if (!arg?.cursor) {
          currentCache.items = newItems.items;
          currentCache.nextCursor = newItems.nextCursor;
          return;
        }
        currentCache.items.push(...newItems.items);
        currentCache.nextCursor = newItems.nextCursor;
      },
      forceRefetch({ currentArg, previousArg }) {
        // Refetch when search, filters, sorting, or cursor changes.
        return JSON.stringify(currentArg) !== JSON.stringify(previousArg);
      },
      providesTags: ['Property']
    }),
    propertyDetail: builder.query({
      query: (id) => `/properties/${id}`,
      transformResponse: (response) => response.data,
      providesTags: (result, error, id) => [{ type: 'Property', id }]
    }),
    createProperty: builder.mutation({
      query: (body) => ({ url: '/properties', method: 'POST', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Property', 'AdminProperty']
    }),
    updateProperty: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/properties/${id}`, method: 'PATCH', body }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { id }) => ['Property', 'AdminProperty', { type: 'Property', id }]
    }),
    deleteProperty: builder.mutation({
      query: (id) => ({ url: `/properties/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, id) => ['Property', 'AdminProperty', { type: 'Property', id }]
    })
  }),
  // Prevent Next.js dev hot reload from crashing when endpoints are injected again.
  overrideExisting: true
});

export const {
  useListPropertiesQuery,
  usePropertyDetailQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation
} = propertyApi;
