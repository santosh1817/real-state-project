import { baseApi } from '../../store/baseApi';

export const uploadApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadImage: builder.mutation({
      // Upload FormData with an "image" field and receive a URL.
      query: (formData) => ({ url: '/uploads/images', method: 'POST', body: formData }),
      transformResponse: (response) => response.data
    })
  }),
  // Prevent duplicate endpoint errors during Next.js hot reload.
  overrideExisting: true
});

export const { useUploadImageMutation } = uploadApi;
