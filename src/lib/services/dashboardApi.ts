import { api } from './api';

export const dashboardApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardMeta: builder.query({
      query: () => '/dashboard/meta',
      providesTags: ['Dashboard'],
    }),
    getProjectWorkload: builder.query({
      query: (projectId: string) => `/dashboard/workload/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Dashboard' as const, id: projectId }],
    }),
  }),
});

export const {
  useGetDashboardMetaQuery,
  useGetProjectWorkloadQuery,
} = dashboardApi;
