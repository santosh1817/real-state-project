import { baseApi } from '../../store/baseApi';

export const inquiryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createInquiry: builder.mutation({
      // Send a contact message for one property.
      query: ({ propertyId, ...body }) => ({
        url: `/properties/${propertyId}/inquiries`,
        method: 'POST',
        body
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: ['Inquiry']
    }),
    myInquiries: builder.query({
      // Fetch leads received for the logged-in owner's listings.
      query: () => '/inquiries/mine',
      transformResponse: (response) => response.data,
      providesTags: ['Inquiry']
    })
  }),
  // Prevent duplicate endpoint errors during Next.js hot reload.
  overrideExisting: true
});

export const {
  useCreateInquiryMutation,
  useMyInquiriesQuery
} = inquiryApi;
