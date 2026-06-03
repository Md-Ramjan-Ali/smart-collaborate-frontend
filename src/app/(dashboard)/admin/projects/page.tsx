'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../../lib/store';
import { logout } from '../../../../lib/features/auth/authSlice';
import {
  useLogoutMutation,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useAddTeamMemberMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetAllUsersQuery,
  useGetProjectWorkloadQuery,
} from '../../../../lib/services/api';

import { AlertTriangle, Layers, Plus, Calendar, Users, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '../_components/AdminSidebar';
import CreateProjectModal from './_components/CreateProjectModal';
import CreateTaskModal from './_components/CreateTaskModal';
import InviteMemberModal from './_components/InviteMemberModal';
import TeamLoadAllocation from './_components/TeamLoadAllocation';
import TaskPipeline from './_components/TaskPipeline';

export default function AdminProjectsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light';
    if (savedTheme) { setTheme(savedTheme); document.documentElement.className = savedTheme; }
    else document.documentElement.className = 'dark';
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next); localStorage.setItem('theme', next); document.documentElement.className = next;
  };

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);

  const [searchVal, setSearchVal] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const [logoutApi] = useLogoutMutation();
  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const [createTaskApi, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const [deleteTaskApi] = useDeleteTaskMutation();
  const [addTeamMemberApi] = useAddTeamMemberMutation();
  const [deleteProjectApi] = useDeleteProjectMutation();

  const { data: projectsData, refetch: refetchProjects } = useGetProjectsQuery(undefined);
  const { data: usersData } = useGetAllUsersQuery(undefined);
  const { data: projectDetails, refetch: refetchProjectDetails } = useGetProjectByIdQuery(selectedProjectId || '', { skip: !selectedProjectId });
  const { data: workloadData, refetch: refetchWorkload } = useGetProjectWorkloadQuery(selectedProjectId || '', { skip: !selectedProjectId });
  const { data: tasksData, refetch: refetchTasks } = useGetTasksQuery(
    { projectId: selectedProjectId || undefined, searchTerm: searchVal || undefined, priority: filterPriority || undefined, status: filterStatus || undefined, assigneeId: filterAssignee || undefined, sortBy: sortField, sortOrder: sortDir, page: page.toString(), limit: '5' },
    { skip: !selectedProjectId }
  );

  const handleLogout = async () => {
    try { await logoutApi(undefined).unwrap(); } catch {}
    dispatch(logout()); router.push('/login');
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure? This removes all tasks.')) return;
    try {
      await deleteProjectApi(id).unwrap();
      setSelectedProjectId(null); refetchProjects();
      toast.success('Project deleted successfully.');
    } catch (err: any) { toast.error(err.data?.message || 'Failed to delete project.'); }
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
      refetchProjectDetails(); refetchTasks();
      if (workloadData) refetchWorkload();
    } catch (err: any) { toast.error(err.data?.message || 'Failed to update task status.'); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try { await deleteTaskApi(taskId).unwrap(); refetchProjectDetails(); refetchTasks(); toast.success('Task deleted.'); }
    catch (err: any) { toast.error(err.data?.message || 'Failed to delete task.'); }
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Smart Collaborate</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 cursor-pointer">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </header>

      <AdminSidebar auth={auth} isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} theme={theme} onToggleTheme={toggleTheme} onLogout={handleLogout} />

      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full md:h-full md:ml-64">
        {/* Project List */}
        {!selectedProjectId && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Projects Registry</h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Workspace projects, dates, and member setups.</p>
              </div>
              <button
                onClick={() => { setFormError(null); setShowCreateProject(true); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Plus className="w-4 h-4" /> Create Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectsData?.data?.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-sm">
                  No projects available. Click &quot;Create Project&quot; to begin.
                </div>
              ) : (
                projectsData?.data?.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => { setSelectedProjectId(project.id); setPage(1); }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase ${
                          project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                          project.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                          'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <button onClick={(e) => handleDeleteProject(project.id, e)} className="p-1 rounded bg-slate-100 dark:bg-slate-950 hover:bg-rose-500/25 text-slate-500 hover:text-rose-600 transition border border-slate-200 dark:border-slate-800 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 block truncate">{project.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">{project.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />{project.teamMembers?.length || 0} Members</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Project Detail */}
        {selectedProjectId && projectDetails?.data && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200/50 dark:from-slate-900/60 dark:to-slate-900/30 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <button onClick={() => setSelectedProjectId(null)} className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 mb-2 cursor-pointer">
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{projectDetails.data.title}</h2>
                  <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl">{projectDetails.data.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => { setFormError(null); setShowInviteMember(true); }} className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 transition rounded-xl flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-4 h-4 text-indigo-500" /> Invite Member
                  </button>
                  <button onClick={() => { setFormError(null); setShowCreateTask(true); }} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/20">
                    <Plus className="w-4 h-4" /> Create Task
                  </button>
                </div>
              </div>
            </div>

            {workloadData?.data && <TeamLoadAllocation workloadData={workloadData.data} />}

            <TaskPipeline
              tasksData={tasksData}
              projectDetails={projectDetails.data}
              searchVal={searchVal} setSearchVal={setSearchVal}
              filterPriority={filterPriority} setFilterPriority={setFilterPriority}
              filterStatus={filterStatus} setFilterStatus={setFilterStatus}
              filterAssignee={filterAssignee} setFilterAssignee={setFilterAssignee}
              sortField={sortField} setSortField={setSortField}
              sortDir={sortDir} setSortDir={setSortDir}
              page={page} setPage={setPage}
              onStatusChange={handleStatusChange}
              onDeleteTask={handleDeleteTask}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateProject && (
        <CreateProjectModal
          usersData={usersData}
          auth={auth}
          formError={formError}
          setFormError={setFormError}
          isCreatingProject={isCreatingProject}
          onClose={() => setShowCreateProject(false)}
          onSubmit={async (payload) => {
            try {
              await createProject(payload).unwrap();
              setShowCreateProject(false);
              refetchProjects();
              toast.success('Project created successfully!');
            } catch (err: any) {
              setFormError(err.data?.message || 'Failed to create project.');
            }
          }}
        />
      )}

      {showCreateTask && selectedProjectId && (
        <CreateTaskModal
          projectDetails={projectDetails?.data}
          formError={formError}
          setFormError={setFormError}
          isCreatingTask={isCreatingTask}
          onClose={() => setShowCreateTask(false)}
          onSubmit={async (payload) => {
            try {
              const res = await createTaskApi({ ...payload, projectId: selectedProjectId }).unwrap();
              if (res.data?.warning) {
                toast.warning(res.data.warning, {
                  duration: 10000,
                  icon: <AlertTriangle className="w-4 h-4" />,
                });
              }
              setShowCreateTask(false);
              refetchProjectDetails(); refetchTasks();
              if (workloadData) refetchWorkload();
              toast.success('Task created successfully!');
            } catch (err: any) {
              setFormError(err.data?.message || 'Failed to create task.');
            }
          }}
        />
      )}

      {showInviteMember && selectedProjectId && (
        <InviteMemberModal
          usersData={usersData}
          projectDetails={projectDetails?.data}
          formError={formError}
          setFormError={setFormError}
          onClose={() => setShowInviteMember(false)}
          onSubmit={async (memberId) => {
            try {
              await addTeamMemberApi({ projectId: selectedProjectId, memberId }).unwrap();
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
    </div>
  );
}
