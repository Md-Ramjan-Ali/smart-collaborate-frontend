'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { RootState } from '../../../../../lib/store';
import { logout } from '../../../../../lib/features/auth/authSlice';
import {
  useLogoutMutation,
  useGetProjectByIdQuery,
  useAddTeamMemberMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetAllUsersQuery,
  useGetProjectWorkloadQuery,
} from '../../../../../lib/services/api';

import { AlertTriangle, Layers, Plus, Calendar, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '../../_components/AdminSidebar';
import CreateTaskModal from '../_components/CreateTaskModal';
import InviteMemberModal from '../_components/InviteMemberModal';
import TeamLoadAllocation from '../_components/TeamLoadAllocation';
import TaskPipeline from '../_components/TaskPipeline';
import ConfirmationModal from '@/components/share/ConfirmationModal';

export default function AdminProjectDetailsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const auth = useSelector((state: RootState) => state.auth);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.className = savedTheme;
    } else {
      document.documentElement.className = 'dark';
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.className = next;
  };

  const [formError, setFormError] = useState<string | null>(null);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  // Confirmation modal state
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<string | null>(null);
  const [confirmDeleteTask, setConfirmDeleteTask] = useState<string | null>(null);

  const [searchVal, setSearchVal] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [logoutApi] = useLogoutMutation();
  const [createTaskApi, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const [deleteTaskApi] = useDeleteTaskMutation();
  const [addTeamMemberApi] = useAddTeamMemberMutation();
  const [deleteProjectApi] = useDeleteProjectMutation();

  const { data: usersData } = useGetAllUsersQuery(undefined);
  const { data: projectDetails, refetch: refetchProjectDetails } = useGetProjectByIdQuery(id, { skip: !id });
  const { data: workloadData, refetch: refetchWorkload } = useGetProjectWorkloadQuery(id, { skip: !id });
  const { data: tasksData, refetch: refetchTasks } = useGetTasksQuery(
    {
      projectId: id || undefined,
      searchTerm: searchVal || undefined,
      priority: filterPriority || undefined,
      status: filterStatus || undefined,
      assigneeId: filterAssignee || undefined,
      sortBy: sortField,
      sortOrder: sortDir,
      page: page.toString(),
      limit: '5',
    },
    { skip: !id }
  );

  const handleLogout = async () => {
    try {
      await logoutApi(undefined).unwrap();
    } catch {}
    dispatch(logout());
    router.push('/login');
  };

  const handleDeleteProject = async (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteProject(projId);
  };

  const confirmProjectDelete = async () => {
    if (!confirmDeleteProject) return;
    try {
      await deleteProjectApi(confirmDeleteProject).unwrap();
      toast.success('Project deleted successfully.');
      const baseRoute = auth.user?.role === 'ADMIN' ? '/admin' : '/manager';
      router.push(`${baseRoute}/projects`);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete project.');
    } finally {
      setConfirmDeleteProject(null);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    try {
      const res = await updateTaskApi({ id: taskId, status: newStatus }).unwrap();
      if (res.data?.warning) {
        toast.warning(res.data.warning, {
          duration: 10000,
          icon: <AlertTriangle className="w-4 h-4" />,
        });
      }
      refetchProjectDetails();
      refetchTasks();
      if (workloadData) refetchWorkload();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    setConfirmDeleteTask(taskId);
  };

  const confirmTaskDelete = async () => {
    if (!confirmDeleteTask) return;
    try {
      await deleteTaskApi(confirmDeleteTask).unwrap();
      refetchProjectDetails();
      refetchTasks();
      toast.success('Task deleted.');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete task.');
    } finally {
      setConfirmDeleteTask(null);
    }
  };

  const handleBackToProjects = () => {
    const baseRoute = auth.user?.role === 'ADMIN' ? '/admin' : '/manager';
    router.push(`${baseRoute}/projects`);
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-955 dark:text-slate-100 transition-colors duration-300">
      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Smart Collaborate</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
            />
          </svg>
        </button>
      </header>

      <AdminSidebar
        auth={auth}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full md:h-full md:ml-64">
        {projectDetails?.data ? (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200/50 dark:from-slate-900/60 dark:to-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <button
                    onClick={handleBackToProjects}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 mb-2 cursor-pointer"
                  >
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    {projectDetails.data.title}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl">
                    {projectDetails.data.description}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setFormError(null);
                      setShowInviteMember(true);
                    }}
                    className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-indigo-500" /> Invite Member
                  </button>
                  <button
                    onClick={() => {
                      setFormError(null);
                      setShowCreateTask(true);
                    }}
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
                  >
                    <Plus className="w-4 h-4" /> Create Task
                  </button>
                </div>
              </div>
            </div>

            {workloadData?.data && <TeamLoadAllocation workloadData={workloadData.data} />}

            <TaskPipeline
              tasksData={tasksData}
              projectDetails={projectDetails.data}
              searchVal={searchVal}
              setSearchVal={setSearchVal}
              filterPriority={filterPriority}
              setFilterPriority={setFilterPriority}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              filterAssignee={filterAssignee}
              setFilterAssignee={setFilterAssignee}
              sortField={sortField}
              setSortField={setSortField}
              sortDir={sortDir}
              setSortDir={setSortDir}
              page={page}
              setPage={setPage}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Loading project details...
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateTask && projectDetails?.data && (
        <CreateTaskModal
          projectDetails={projectDetails.data}
          formError={formError}
          setFormError={setFormError}
          isCreatingTask={isCreatingTask}
          onClose={() => setShowCreateTask(false)}
          onSubmit={async (payload) => {
            try {
              const res = await createTaskApi({ ...payload, projectId: id }).unwrap();
              if (res.data?.warning) {
                toast.warning(res.data.warning, {
                  duration: 10000,
                  icon: <AlertTriangle className="w-4 h-4" />,
                });
              }
              setShowCreateTask(false);
              refetchProjectDetails();
              refetchTasks();
              if (workloadData) refetchWorkload();
              toast.success('Task created successfully!');
            } catch (err: any) {
              setFormError(err.data?.message || 'Failed to create task.');
            }
          }}
        />
      )}

      {showInviteMember && projectDetails?.data && (
        <InviteMemberModal
          usersData={usersData}
          projectDetails={projectDetails.data}
          formError={formError}
          setFormError={setFormError}
          onClose={() => setShowInviteMember(false)}
          onSubmit={async (memberId) => {
            try {
              await addTeamMemberApi({ projectId: id, memberId }).unwrap();
              setShowInviteMember(false);
              refetchProjectDetails();
              if (workloadData) refetchWorkload();
              toast.success('Member added to project!');
            } catch (err: any) {
              setFormError(err.data?.message || 'Failed to add member.');
            }
          }}
        />
      )}

      {/* Delete Project Confirmation */}
      <ConfirmationModal
        isOpen={!!confirmDeleteProject}
        onClose={() => setConfirmDeleteProject(null)}
        title="Delete Project?"
        description="This will permanently delete the project and all its tasks. This action cannot be undone."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmProjectDelete}
      />

      {/* Delete Task Confirmation */}
      <ConfirmationModal
        isOpen={!!confirmDeleteTask}
        onClose={() => setConfirmDeleteTask(null)}
        title="Delete Task?"
        description="This task will be permanently removed from the project."
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={confirmTaskDelete}
      />
    </div>
  );
}
