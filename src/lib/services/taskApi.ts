import { api } from './api';

export const taskApi = api.injectEndpoints({
  endpoints: (builder) => ({
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
    getComments: builder.query({
      query: (taskId: string) => `/tasks/${taskId}/comments`,
      providesTags: (result, error, taskId) => [{ type: 'Task' as const, id: `COMMENTS-${taskId}` }],
    }),
    createComment: builder.mutation({
      query: ({ taskId, content }) => ({
        url: `/tasks/${taskId}/comments`,
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Task' as const, id: `COMMENTS-${taskId}` }],
    }),
    getAttachments: builder.query({
      query: (taskId: string) => `/tasks/${taskId}/attachments`,
      providesTags: (result, error, taskId) => [{ type: 'Task' as const, id: `ATTACHMENTS-${taskId}` }],
    }),
    createAttachment: builder.mutation({
      query: ({ taskId, filename, fileUrl }) => ({
        url: `/tasks/${taskId}/attachments`,
        method: 'POST',
        body: { filename, fileUrl },
      }),
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Task' as const, id: `ATTACHMENTS-${taskId}` }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetMyTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetAttachmentsQuery,
  useCreateAttachmentMutation,
} = taskApi;
