import { baseApi } from '../../store/baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    adminProperties: builder.query({
      // Fetch active properties for the admin table.
      query: () => '/admin/properties',
      transformResponse: (response) => response.data,
      providesTags: ['AdminProperty']
    }),
    adminDeleteProperty: builder.mutation({
      // Soft-delete a property as admin.
      query: (id) => ({ url: `/admin/properties/${id}`, method: 'DELETE' }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['AdminProperty', 'Property']
    })
  }),
  // Prevent duplicate endpoint errors during Next.js hot reload.
  overrideExisting: true
});

export const {
  useAdminPropertiesQuery,
  useAdminDeletePropertyMutation
} = adminApi;
