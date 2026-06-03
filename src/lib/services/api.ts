import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api/v1',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['User', 'Project', 'Task', 'Dashboard'],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Dashboard'],
    }),
    signup: builder.mutation({
      query: (userData) => ({
        url: '/auth/signup',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['User'],
    }),
    getAllUsers: builder.query({
      query: () => '/auth',
      providesTags: ['User'],
    }),

    // Projects endpoints
    getProjects: builder.query({
      query: () => '/projects',
      providesTags: ['Project'],
    }),
    getProjectById: builder.query({
      query: (id: string) => `/projects/${id}`,
      providesTags: (result, error, id) => [{ type: 'Project', id }],
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
      invalidatesTags: (result, error, { id }) => ['Project', { type: 'Project', id }, 'Dashboard'],
    }),
    addTeamMember: builder.mutation({
      query: ({ projectId, memberId }) => ({
        url: `/projects/${projectId}/invite`,
        method: 'POST',
        body: { memberId },
      }),
      invalidatesTags: (result, error, { projectId }) => ['Project', { type: 'Project', id: projectId }, 'Dashboard'],
    }),
    deleteProject: builder.mutation({
      query: (id) => ({
        url: `/projects/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Project', 'Dashboard'],
    }),

    // Tasks endpoints
    getTasks: builder.query({
      query: (params) => ({
        url: '/tasks',
        params,
      }),
      providesTags: ['Task'],
    }),
    getMyTasks: builder.query({
      query: () => '/tasks/my-tasks',
      providesTags: ['Task'],
    }),
    createTask: builder.mutation({
      query: (taskData) => ({
        url: '/tasks',
        method: 'POST',
        body: taskData,
      }),
      invalidatesTags: ['Task', 'Dashboard', 'Project'],
    }),
    updateTask: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (result, error, { id }) => ['Task', 'Dashboard', 'Project'],
    }),
    deleteTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Task', 'Dashboard', 'Project'],
    }),

    // Dashboard endpoints
    getDashboardMeta: builder.query({
      query: () => '/dashboard/meta',
      providesTags: ['Dashboard'],
    }),
    getProjectWorkload: builder.query({
      query: (projectId: string) => `/dashboard/workload/${projectId}`,
      providesTags: (result, error, projectId) => [{ type: 'Dashboard', id: projectId }],
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useGetAllUsersQuery,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useAddTeamMemberMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useGetMyTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetDashboardMetaQuery,
  useGetProjectWorkloadQuery,
} = api;
export default api;
