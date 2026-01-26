import { BANNERS_URL, UPLOAD_URL } from '../constants';
import { apiSlice } from './apiSlice';

export const bannersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBanners: builder.query({
      query: () => ({
        url: BANNERS_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Banner'],
    }),
    createBanner: builder.mutation({
      query: (data) => ({
        url: BANNERS_URL,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Banner'],
    }),
    deleteBanner: builder.mutation({
      query: (id) => ({
        url: `${BANNERS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Banner'],
    }),
    uploadBannerImage: builder.mutation({
      query: (data) => ({
        url: UPLOAD_URL,
        method: 'POST',
        body: data,
      }),
    }),
  }),
});

export const {
  useGetBannersQuery,
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
} = bannersApiSlice;