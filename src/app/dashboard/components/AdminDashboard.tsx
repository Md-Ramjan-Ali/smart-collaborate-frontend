'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../../../lib/features/auth/authSlice';
import {
  useLogoutMutation,
  useGetDashboardMetaQuery,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useCreateProjectMutation,
  useUpdateProjectMutation,
  useAddTeamMemberMutation,
  useDeleteProjectMutation,
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetAllUsersQuery,
  useGetProjectWorkloadQuery,
} from '../../../lib/services/api';

import {
  Briefcase,
  CheckCircle,
  Clock,
  LogOut,
  Plus,
  Users,
  AlertTriangle,
  TrendingUp,
  Calendar,
  ListTodo,
  Layers,
  Trash2,
  Sparkles,
  Sun,
  Moon,
  Search,
} from 'lucide-react';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';

const CHART_COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#10b981'];

interface AdminDashboardProps {
  auth: any;
}

export default function AdminDashboard({ auth }: AdminDashboardProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  // Theme support
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
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
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.className = nextTheme;
  };

  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects'>('dashboard');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search, Filters, Sort and Pagination state
  const [searchVal, setSearchVal] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Modals
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [taskWarning, setTaskWarning] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Forms
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projStart, setProjStart] = useState('');
  const [projEnd, setProjEnd] = useState('');
  const [projMembers, setProjMembers] = useState<string[]>([]);

  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskStatus, setTaskStatus] = useState<'TO_DO' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'COMPLETED'>('TO_DO');
  const [taskAssignee, setTaskAssignee] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');

  const [inviteMemberId, setInviteMemberId] = useState('');

  // API hooks
  const [logoutApi] = useLogoutMutation();
  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const [createTaskApi, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const [deleteTaskApi] = useDeleteTaskMutation();
  const [addTeamMemberApi] = useAddTeamMemberMutation();
  const [deleteProjectApi] = useDeleteProjectMutation();

  const { data: dashboardData, refetch: refetchDashboard } = useGetDashboardMetaQuery(undefined);
  const { data: projectsData, refetch: refetchProjects } = useGetProjectsQuery(undefined);
  const { data: usersData } = useGetAllUsersQuery(undefined);

  const { data: projectDetails, refetch: refetchProjectDetails } = useGetProjectByIdQuery(selectedProjectId || '', {
    skip: !selectedProjectId,
  });

  const { data: workloadData, refetch: refetchWorkload } = useGetProjectWorkloadQuery(selectedProjectId || '', {
    skip: !selectedProjectId,
  });

  // Paginated Tasks Query
  const { data: tasksData, refetch: refetchTasks } = useGetTasksQuery(
    {
      projectId: selectedProjectId || undefined,
      searchTerm: searchVal || undefined,
      priority: filterPriority || undefined,
      status: filterStatus || undefined,
      assigneeId: filterAssignee || undefined,
      sortBy: sortField,
      sortOrder: sortDir,
      page: page.toString(),
      limit: '5',
    },
    { skip: !selectedProjectId }
  );

  const handleLogout = async () => {
    try {
      await logoutApi(undefined).unwrap();
    } catch (err) {}
    dispatch(logout());
    router.push('/login');
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!projTitle || !projDesc || !projStart || !projEnd) {
      setFormError('Please fill out all fields.');
      return;
    }
    try {
      await createProject({
        title: projTitle,
        description: projDesc,
        startDate: projStart,
        endDate: projEnd,
        teamMembers: projMembers,
      }).unwrap();
      setShowCreateProject(false);
      setProjTitle('');
      setProjDesc('');
      setProjStart('');
      setProjEnd('');
      setProjMembers([]);
      refetchProjects();
      refetchDashboard();
    } catch (err: any) {
      setFormError(err.data?.message || 'Failed to create project.');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setTaskWarning(null);

    if (!taskTitle || !taskDueDate || !selectedProjectId) {
      setFormError('Title and Due Date are required.');
      return;
    }

    if (projectDetails?.data) {
      const taskDate = new Date(taskDueDate);
      const projEndDate = new Date(projectDetails.data.endDate);
      if (taskDate > projEndDate) {
        setFormError(`Task due date cannot exceed project end date (${projectDetails.data.endDate.split('T')[0]}).`);
        return;
      }
    }

    try {
      const res = await createTaskApi({
        title: taskTitle,
        description: taskDesc,
        priority: taskPriority,
        status: taskStatus,
        projectId: selectedProjectId,
        assigneeId: taskAssignee || undefined,
        dueDate: taskDueDate,
      }).unwrap();

      if (res.data?.warning) {
        setTaskWarning(res.data.warning);
        setTimeout(() => setTaskWarning(null), 10000);
      }

      setShowCreateTask(false);
      setTaskTitle('');
      setTaskDesc('');
      setTaskAssignee('');
      setTaskDueDate('');
      setTaskPriority('MEDIUM');
      setTaskStatus('TO_DO');
      
      refetchProjectDetails();
      refetchDashboard();
      refetchTasks();
      if (workloadData) refetchWorkload();
    } catch (err: any) {
      setFormError(err.data?.message || 'Failed to create task.');
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    setTaskWarning(null);
    try {
      const res = await updateTaskApi({ id: taskId, status: newStatus }).unwrap();
      if (res.data?.warning) {
        setTaskWarning(res.data.warning);
        setTimeout(() => setTaskWarning(null), 10000);
      }
      refetchProjectDetails();
      refetchDashboard();
      refetchTasks();
      if (workloadData) refetchWorkload();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update task status.');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTaskApi(taskId).unwrap();
      refetchProjectDetails();
      refetchDashboard();
      refetchTasks();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete task.');
    }
  };

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!inviteMemberId || !selectedProjectId) {
      setFormError('Please select a member.');
      return;
    }
    try {
      await addTeamMemberApi({ projectId: selectedProjectId, memberId: inviteMemberId }).unwrap();
      setShowInviteMember(false);
      setInviteMemberId('');
      refetchProjectDetails();
      if (workloadData) refetchWorkload();
    } catch (err: any) {
      setFormError(err.data?.message || 'Failed to add member.');
    }
  };

  const toggleProjMember = (id: string) => {
    if (projMembers.includes(id)) {
      setProjMembers(projMembers.filter((mId) => mId !== id));
    } else {
      setProjMembers([...projMembers, id]);
    }
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure? This removes all tasks.')) return;
    try {
      await deleteProjectApi(id).unwrap();
      setSelectedProjectId(null);
      refetchProjects();
      refetchDashboard();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to delete project.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-955 dark:text-slate-100 transition-colors duration-300">
      {taskWarning && (
        <div className="fixed bottom-5 right-5 z-50 p-4.5 rounded-2xl bg-amber-500 border border-amber-400 shadow-2xl text-slate-950 font-bold max-w-sm flex items-start gap-3 animate-bounce">
          <AlertTriangle className="w-6 h-6 shrink-0 text-slate-950" />
          <div className="text-xs">
            <span className="font-extrabold uppercase block mb-0.5 tracking-wider">Overload Alert!</span>
            {taskWarning}
          </div>
          <button onClick={() => setTaskWarning(null)} className="text-sm font-bold opacity-75 hover:opacity-100 ml-2 cursor-pointer">×</button>
        </div>
      )}

      {/* Mobile Top Bar */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Smart Collaborate</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-650 dark:text-slate-350 cursor-pointer"
        >
          <span className="sr-only">Toggle Sidebar</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isSidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>
      </header>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-xs"
        />
      )}
      {/* Sidebar */}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-5 shrink-0 transition-all duration-300 h-screen ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block text-slate-900 dark:text-white">Smart Collaborate</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-404 font-bold tracking-widest uppercase">Admin Workspace</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-450 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer text-lg">×</button>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => { setActiveTab('dashboard'); setSelectedProjectId(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'dashboard' && !selectedProjectId
                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                : 'text-slate-555 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-202'
            }`}
          >
            <TrendingUp className="w-4.5 h-4.5" />
            Workspace Dashboard
          </button>
          <button
            onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'projects' || selectedProjectId
                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-505/20'
                : 'text-slate-555 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-202'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            Projects Hub
          </button>
        </nav>

        {/* Profile Card at the very bottom */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-955 border border-slate-202 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
                {auth.user?.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs block truncate text-slate-800 dark:text-slate-202">{auth.user?.name}</span>
                <span className="text-[10px] block truncate text-slate-555 dark:text-slate-400">{auth.user?.email}</span>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-indigo-650/10 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                {auth.user?.role}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleTheme}
                  className="p-1.5 rounded text-slate-500 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Toggle Mode"
                >
                  {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5" />}
                </button>
                <button onClick={handleLogout} className="text-slate-500 hover:text-rose-500 transition cursor-pointer" title="Log Out">
                  <LogOut className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full md:h-full md:ml-64">
        {activeTab === 'dashboard' && !selectedProjectId && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-850 dark:text-white">Workspace Overview</h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs">Overview metrics, task statuses, and collaboration activities.</p>
              </div>
              <button onClick={() => refetchDashboard()} className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-655 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm">
                Refresh Stats
              </button>
            </div>

            {dashboardData?.data && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Total Projects</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">{dashboardData.data.kpis.projects.total}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-indigo-655 dark:text-indigo-400" />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Active Projects</span>
                    <span className="text-2xl font-black text-amber-605 dark:text-amber-400">{dashboardData.data.kpis.projects.active}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Pending Tasks</span>
                    <span className="text-2xl font-black text-purple-655 dark:text-purple-400">{dashboardData.data.kpis.tasks.pending}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                    <ListTodo className="w-5 h-5 text-purple-655 dark:text-purple-400" />
                  </div>
                </div>
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-455 uppercase tracking-wider block">Completed Tasks</span>
                    <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{dashboardData.data.kpis.tasks.completed}</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-emerald-650 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Task Status Allocation</span>
                <div className="h-[200px] flex items-center justify-center relative">
                  {dashboardData?.data ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.data.statusDistribution.filter((d: any) => d.value > 0)}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={85}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {dashboardData.data.statusDistribution.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#f8fafc' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <span className="text-xs text-slate-500">No active charts data</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-blue-500" /> To Do</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-amber-500" /> In Progress</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-purple-500" /> Under Review</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-emerald-500" /> Completed</div>
                </div>
              </div>

              <div className="lg:col-span-7 p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Project Progress Hub</span>
                <div className="space-y-4 flex-1 overflow-y-auto max-h-[260px] pr-2">
                  {dashboardData?.data?.projectProgress?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No projects registered yet.</div>
                  ) : (
                    dashboardData?.data?.projectProgress?.map((p: any) => (
                      <div key={p.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-800 dark:text-slate-202">{p.title}</span>
                          <span className="font-extrabold text-indigo-655 dark:text-indigo-400">{p.progress}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Upcoming Deadlines (Next 48 Hours)</span>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                  {dashboardData?.data?.upcomingTasks?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No urgent deadlines.</div>
                  ) : (
                    dashboardData?.data?.upcomingTasks?.map((task: any) => (
                      <div key={task.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 flex items-center justify-between">
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-850 dark:text-slate-202 block truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Project: {task.project?.title}</span>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full mb-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-6 p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Workspace Activity Log</span>
                <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                  {dashboardData?.data?.recentActivities?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No events logged.</div>
                  ) : (
                    dashboardData?.data?.recentActivities?.map((log: any) => (
                      <div key={log.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                        <div className="min-w-0 flex-1 text-xs">
                          <p className="font-semibold text-slate-700 dark:text-slate-300">{log.message}</p>
                          <div className="flex items-center justify-between text-[9px] text-slate-500 font-medium mt-1">
                            <span>By {log.user?.name}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'projects' && !selectedProjectId && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-805 dark:text-white">Projects Registry</h2>
                <p className="text-slate-505 dark:text-slate-404 text-xs">Workspace projects, dates, and member setups.</p>
              </div>
              <button
                onClick={() => { setFormError(null); setShowCreateProject(true); }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-650/20"
              >
                <Plus className="w-4.5 h-4.5" />
                Create Project
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectsData?.data?.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-202 dark:border-slate-800 rounded-2xl text-slate-500 text-sm">
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
                          project.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-650 dark:text-emerald-400' :
                          project.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-605 dark:text-amber-400' :
                          'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                        }`}>
                          {project.status.replace('_', ' ')}
                        </span>
                        <button onClick={(e) => handleDeleteProject(project.id, e)} className="p-1 rounded bg-slate-100 dark:bg-slate-955 hover:bg-rose-500/25 text-slate-500 hover:text-rose-600 dark:hover:text-rose-455 transition border border-slate-200 dark:border-slate-800 cursor-pointer">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-202 block truncate">{project.title}</h3>
                      <p className="text-slate-550 dark:text-slate-400 text-xs line-clamp-2">{project.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-550 dark:text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-505 dark:text-indigo-400" />{project.teamMembers?.length || 0} Members</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedProjectId && projectDetails?.data && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200/50 dark:from-slate-900/60 dark:to-slate-900/30 border border-slate-202 dark:border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <button onClick={() => { setSelectedProjectId(null); setTaskWarning(null); }} className="text-xs text-indigo-650 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 mb-2 cursor-pointer">
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-black tracking-tight text-slate-850 dark:text-white">{projectDetails.data.title}</h2>
                  <p className="text-slate-555 dark:text-slate-400 text-xs max-w-xl">{projectDetails.data.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => { setFormError(null); setShowInviteMember(true); }} className="px-3.5 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-101 dark:hover:bg-slate-800 border border-slate-202 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-202 transition rounded-xl flex items-center gap-1.5 cursor-pointer">
                    <Plus className="w-4 h-4 text-indigo-500 dark:text-indigo-400" /> Invite Member
                  </button>
                  <button onClick={() => { setFormError(null); setTaskWarning(null); setShowCreateTask(true); }} className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-605/20">
                    <Plus className="w-4 h-4" /> Create Task
                  </button>
                </div>
              </div>
            </div>

            {workloadData?.data && (
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-202 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-655 dark:text-slate-300 uppercase tracking-wider mb-4 block">Team Load Allocation</span>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {workloadData.data.map((wl: any) => (
                    <div key={wl.member.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800 space-y-3">
                      <div>
                        <span className="font-bold text-xs text-slate-805 dark:text-slate-202 block truncate">{wl.member.name}</span>
                        <span className="text-[9px] text-slate-505 dark:text-slate-400 uppercase tracking-wider font-extrabold">{wl.member.role}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
                        <div className="p-1 rounded bg-slate-200 dark:bg-slate-900"><span className="text-slate-655 dark:text-slate-400 block">{wl.totalTasks}</span><span className="text-[8px] text-slate-505 block uppercase">Tasks</span></div>
                        <div className="p-1 rounded bg-slate-200 dark:bg-slate-900"><span className={`block ${wl.activeTasks > 3 ? 'text-rose-500 dark:text-rose-455' : 'text-amber-600 dark:text-amber-405'}`}>{wl.activeTasks}</span><span className="text-[8px] text-slate-505 block uppercase">Active</span></div>
                        <div className="p-1 rounded bg-slate-200 dark:bg-slate-900"><span className="text-emerald-600 dark:text-emerald-455 block">{wl.completedTasks}</span><span className="text-[8px] text-slate-505 block uppercase">Done</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Pipeline Section */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-202 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-305 uppercase tracking-wider block">Tasks Pipeline</span>
              </div>

              {/* Advanced Search, Filtering, Sorting and Pagination Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-202 dark:border-slate-800/80 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="relative w-full lg:w-48">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => { setSearchVal(e.target.value); setPage(1); }}
                      placeholder="Search title/desc..."
                      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-202 outline-none w-full focus:border-indigo-500 transition"
                    />
                  </div>
                  
                  <select
                    value={filterPriority}
                    onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-655 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="">All Priorities</option>
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                  </select>

                  <select
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-655 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="">All Statuses</option>
                    <option value="TO_DO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="UNDER_REVIEW">Under Review</option>
                    <option value="COMPLETED">Completed</option>
                  </select>

                  <select
                    value={filterAssignee}
                    onChange={(e) => { setFilterAssignee(e.target.value); setPage(1); }}
                    className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-655 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto"
                  >
                    <option value="">All Assignees</option>
                    {projectDetails.data.teamMembers?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                    {projectDetails.data.owner && (
                      <option value={projectDetails.data.owner.id}>{projectDetails.data.owner.name} (Manager)</option>
                    )}
                  </select>
                </div>

                <div className="flex flex-wrap items-center gap-3 justify-between w-full lg:w-auto">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-500 font-semibold">Sort:</span>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-404 outline-none cursor-pointer"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="title">Title</option>
                    </select>
                    <select
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-404 outline-none cursor-pointer"
                    >
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </select>
                  </div>

                  {tasksData?.data?.meta && tasksData.data.meta.totalPages > 1 && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-505">
                      <button
                        disabled={page === 1}
                        onClick={() => setPage(page - 1)}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition font-bold cursor-pointer"
                      >
                        Prev
                      </button>
                      <span>Page {page} of {tasksData.data.meta.totalPages}</span>
                      <button
                        disabled={page === tasksData.data.meta.totalPages}
                        onClick={() => setPage(page + 1)}
                        className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition font-bold cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tasks Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-850 text-slate-550 dark:text-slate-555 uppercase tracking-wider font-bold">
                      <th className="pb-3 font-semibold">Title / Description</th>
                      <th className="pb-3 font-semibold">Assignee</th>
                      <th className="pb-3 font-semibold">Priority</th>
                      <th className="pb-3 font-semibold">Due Date</th>
                      <th className="pb-3 font-semibold text-center">Status Workflow</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!tasksData?.data?.data || tasksData.data.data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-slate-500 font-semibold">No tasks found matching criteria.</td>
                      </tr>
                    ) : (
                      tasksData.data.data.map((task: any) => (
                        <tr key={task.id} className="border-b border-slate-202 dark:border-slate-855 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition group">
                          <td className="py-4 pr-3 max-w-[200px]">
                            <span className="font-bold text-slate-805 dark:text-slate-202 block truncate">{task.title}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">{task.description || 'No description provided.'}</span>
                          </td>
                          <td className="py-4 text-slate-655 dark:text-slate-300 font-semibold">{task.assignee?.name || 'Unassigned'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${
                              task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-455 border border-rose-500/20' :
                              task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20'
                            }`}>{task.priority}</span>
                          </td>
                          <td className="py-4 text-slate-600 dark:text-slate-404 font-semibold">{new Date(task.dueDate).toLocaleDateString()}</td>
                          <td className="py-4 text-center">
                            <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-[11px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-305">
                              <option value="TO_DO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
                          </td>
                          <td className="py-4 text-right">
                            <button onClick={() => handleDeleteTask(task.id)} className="p-1 rounded bg-white dark:bg-slate-950 hover:bg-rose-500/25 text-slate-505 hover:text-rose-650 dark:hover:text-rose-400 transition border border-slate-200 dark:border-slate-800 cursor-pointer">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateProject && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-202">Create New Project</span>
              <button onClick={() => setShowCreateProject(false)} className="text-slate-450 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer">×</button>
            </div>
            {formError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-650 dark:text-rose-300 text-xs font-semibold">{formError}</div>}
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Project Title</label>
                <input type="text" value={projTitle} onChange={(e) => setProjTitle(e.target.value)} placeholder="Title" className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-202 outline-none focus:border-indigo-500" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description</label>
                <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="Summary" className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-805 rounded-xl py-2 px-3 text-xs text-slate-808 dark:text-slate-202 outline-none focus:border-indigo-505" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Start Date</label><input type="date" value={projStart} onChange={(e) => setProjStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-550 dark:text-slate-405 outline-none cursor-pointer" /></div>
                <div><label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">End Date</label><input type="date" value={projEnd} onChange={(e) => setProjEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-555 dark:text-slate-405 outline-none cursor-pointer" /></div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Map Initial Team Members</label>
                <div className="space-y-1 max-h-[120px] overflow-y-auto border border-slate-202 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-955">
                  {usersData?.data?.filter((u: any) => u.id !== auth.user?.id).map((u: any) => (
                    <div key={u.id} onClick={() => toggleProjMember(u.id)} className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${projMembers.includes(u.id) ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-650' : 'text-slate-505 dark:text-slate-405'}`}>
                      <span>{u.name} ({u.role})</span>
                    </div>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={isCreatingProject} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 transition rounded-xl font-bold text-xs text-white cursor-pointer">
                {isCreatingProject ? 'Saving Project...' : 'Initialize Project'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showCreateTask && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-202 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-805 dark:text-slate-202">Create Task</span>
              <button onClick={() => setShowCreateTask(false)} className="text-slate-450 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer">×</button>
            </div>
            {formError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-650 dark:text-rose-300 text-xs font-semibold">{formError}</div>}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Task Title</label>
                <input type="text" value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="SSL Setup" className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-202 outline-none" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Description (Optional)</label>
                <textarea value={taskDesc} onChange={(e) => setTaskDesc(e.target.value)} placeholder="Task details" className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-808 dark:text-slate-202 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Assign Member</label>
                  <select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-550 dark:text-slate-405 outline-none">
                    <option value="">Unassigned</option>
                    {projectDetails?.data?.teamMembers?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                    {projectDetails?.data?.owner && <option value={projectDetails.data.owner.id}>{projectDetails.data.owner.name} (Manager)</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-405 uppercase mb-1.5">Due Date</label>
                  <input type="date" value={taskDueDate} onChange={(e) => setTaskDueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-555 dark:text-slate-405 outline-none" />
                </div>
              </div>
              <button type="submit" disabled={isCreatingTask} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-xl font-bold text-xs cursor-pointer">
                Assign Task
              </button>
            </form>
          </div>
        </div>
      )}

      {showInviteMember && (
        <div className="fixed inset-0 bg-slate-955/80 backdrop-blur-sm z-40 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-202 dark:border-slate-800 pb-3">
              <span className="font-bold text-sm text-slate-808 dark:text-slate-202">Invite Member</span>
              <button onClick={() => setShowInviteMember(false)} className="text-slate-455 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer">×</button>
            </div>
            {formError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-650 dark:text-rose-300 text-xs font-semibold">{formError}</div>}
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <select value={inviteMemberId} onChange={(e) => setInviteMemberId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-550 dark:text-slate-405 outline-none">
                  <option value="">Choose User...</option>
                  {usersData?.data?.filter((u: any) => !projectDetails?.data?.teamMembers?.some((m: any) => m.id === u.id) && u.id !== projectDetails?.data?.ownerId).map((u: any) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-xl font-bold text-xs cursor-pointer">
                Add Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
