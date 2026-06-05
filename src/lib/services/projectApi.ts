import { api } from './api';

export const projectApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query({
      query: (id: string) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project' as const, id }],
    }),
    createProject: builder.mutation({
      query: (projectData) => ({
        url: '/projects',
        method: 'POST',
        body: projectData,
      }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),
    updateProject: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/projects/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Project', { type: 'Project' as const, id }, 'Dashboard'],
    }),
    addTeamMember: builder.mutation({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/invite`,
        method: 'POST',
        body: { memberId },
      }),
      invalidatesTags: (result, error, { projectId }) => ['Project', { type: 'Project' as const, id: projectId }, 'Dashboard'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useAddTeamMemberMutation,
  useDeleteProjectMutation,
} = projectApi;
