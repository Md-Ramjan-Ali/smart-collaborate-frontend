'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useRouter } from 'next/navigation';
import { logout } from '../../../lib/features/auth/authSlice';
import {
  useLogoutMutation,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useGetMyTasksQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '../../../lib/services/api';

import {
  Briefcase,
  LogOut,
  Users,
  AlertTriangle,
  Calendar,
  ListTodo,
  Layers,
  Clock,
  Sun,
  Moon,
  Search,
} from 'lucide-react';

interface MemberDashboardProps {
  auth: any;
}

export default function MemberDashboard({ auth }: MemberDashboardProps) {
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

  const [activeTab, setActiveTab] = useState<'projects' | 'mytasks'>('mytasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskWarning, setTaskWarning] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Search, Filters, Sort and Pagination state for Projects pipeline
  const [searchVal, setSearchVal] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // API hooks
  const [logoutApi] = useLogoutMutation();
  const [updateTaskApi] = useUpdateTaskMutation();

  const { data: projectsData, refetch: refetchProjects } = useGetProjectsQuery(undefined);
  const { data: myTasksData, refetch: refetchMyTasks } = useGetMyTasksQuery(undefined);
  
  const { data: projectDetails, refetch: refetchProjectDetails } = useGetProjectByIdQuery(selectedProjectId || '', {
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

  const handleStatusChange = async (taskId: string, newStatus: any) => {
    setTaskWarning(null);
    try {
      const res = await updateTaskApi({ id: taskId, status: newStatus }).unwrap();
      if (res.data?.warning) {
        setTaskWarning(res.data.warning);
        setTimeout(() => setTaskWarning(null), 10000);
      }
      refetchProjectDetails();
      refetchMyTasks();
      if (selectedProjectId) refetchTasks();
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update task status.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-955 dark:text-slate-100 transition-colors duration-300">
      {taskWarning && (
        <div className="fixed bottom-5 right-5 z-50 p-4.5 rounded-2xl bg-amber-500 border border-amber-400 shadow-2xl text-slate-955 font-bold max-w-sm flex items-start gap-3 animate-bounce">
          <AlertTriangle className="w-6 h-6 shrink-0 text-slate-955" />
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
          className="p-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-655 dark:text-slate-350 cursor-pointer"
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
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-505/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block text-slate-900 dark:text-white">Smart Collaborate</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase">Team Member Portal</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-450 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer text-lg">×</button>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => { setActiveTab('mytasks'); setSelectedProjectId(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'mytasks'
                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-505/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-855 dark:hover:text-slate-202'
            }`}
          >
            <ListTodo className="w-4.5 h-4.5" />
            My Assignments
          </button>
          <button
            onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); setIsSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'projects' || selectedProjectId
                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-505/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-855 dark:hover:text-slate-202'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            Projects Hub
          </button>
        </nav>

        {/* Profile Card at the very bottom */}
        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-955 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
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
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-emerald-650/10 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-205 dark:border-emerald-500/20">
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
        {activeTab === 'projects' && !selectedProjectId && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-805 dark:text-white">My Projects</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Projects where you are mapped as a team member.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectsData?.data?.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-202 dark:border-slate-800 rounded-2xl text-slate-500 text-sm shadow-sm">
                  You are not assigned to any projects.
                </div>
              ) : (
                projectsData?.data?.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => { setSelectedProjectId(project.id); setPage(1); }}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-105 dark:hover:bg-slate-900/60 border border-slate-202 dark:border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-slate-105 text-slate-505 dark:bg-slate-500/10 dark:text-slate-400`}>
                        {project.status}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-202 block truncate">{project.title}</h3>
                      <p className="text-slate-555 dark:text-slate-400 text-xs line-clamp-2">{project.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-850 flex items-center justify-between text-[10px] text-slate-550 dark:text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />{project.teamMembers?.length || 0} Members</span>
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
                  <button onClick={() => { setSelectedProjectId(null); setTaskWarning(null); }} className="text-xs text-indigo-605 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 mb-2 cursor-pointer">
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-black tracking-tight text-slate-855 dark:text-white">{projectDetails.data.title}</h2>
                  <p className="text-slate-555 dark:text-slate-400 text-xs max-w-xl">{projectDetails.data.description}</p>
                </div>
              </div>
            </div>

            {/* Tasks Pipeline Section */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-202 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-305 uppercase tracking-wider block">Tasks Pipeline</span>
              </div>

              {/* Advanced Search, Filtering, Sorting and Pagination Bar */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-202 dark:border-slate-800/80 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="relative w-full lg:w-48">
                    <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchVal}
                      onChange={(e) => { setSearchVal(e.target.value); setPage(1); }}
                      placeholder="Search title/desc..."
                      className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-202 outline-none w-full focus:border-indigo-505 transition"
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
                    className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-805 rounded-lg px-2.5 py-1.5 text-xs text-slate-655 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto"
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
                    <span className="text-slate-505 font-semibold">Sort:</span>
                    <select
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                      className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-805 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-404 outline-none cursor-pointer"
                    >
                      <option value="dueDate">Due Date</option>
                      <option value="priority">Priority</option>
                      <option value="title">Title</option>
                    </select>
                    <select
                      value={sortDir}
                      onChange={(e) => setSortDir(e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-202 dark:border-slate-805 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-404 outline-none cursor-pointer"
                    >
                      <option value="asc">Asc</option>
                      <option value="desc">Desc</option>
                    </select>
                  </div>

                  {tasksData?.data?.meta && tasksData.data.meta.totalPages > 1 && (
                    <div className="flex items-center gap-2.5 text-xs text-slate-500">
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
                    <tr className="border-b border-slate-200 dark:border-slate-855 text-slate-550 dark:text-slate-500 uppercase tracking-wider font-bold">
                      <th className="pb-3 font-semibold">Title / Description</th>
                      <th className="pb-3 font-semibold">Assignee</th>
                      <th className="pb-3 font-semibold">Priority</th>
                      <th className="pb-3 font-semibold">Due Date</th>
                      <th className="pb-3 font-semibold text-center">Status Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {!tasksData?.data?.data || tasksData.data.data.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500 font-semibold">No tasks found matching criteria.</td>
                      </tr>
                    ) : (
                      tasksData.data.data.map((task: any) => (
                        <tr key={task.id} className="border-b border-slate-202 dark:border-slate-855 hover:bg-slate-55 dark:hover:bg-slate-900/30 transition group">
                          <td className="py-4 pr-3 max-w-[200px]">
                            <span className="font-bold text-slate-800 dark:text-slate-202 block truncate">{task.title}</span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">{task.description || 'No description.'}</span>
                          </td>
                          <td className="py-4 text-slate-655 dark:text-slate-300 font-semibold">{task.assignee?.name || 'Unassigned'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${
                              task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-650 dark:text-rose-455 border border-rose-500/20' :
                              task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                              'bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-500/20'
                            }`}>{task.priority}</span>
                          </td>
                          <td className="py-4 text-slate-600 dark:text-slate-404 font-semibold">{new Date(task.dueDate).toLocaleDateString()}</td>
                          <td className="py-4 text-center">
                            <select
                              value={task.status}
                              disabled={task.assigneeId !== auth.user?.id}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-[11px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              <option value="TO_DO">To Do</option>
                              <option value="IN_PROGRESS">In Progress</option>
                              <option value="UNDER_REVIEW">Under Review</option>
                              <option value="COMPLETED">Completed</option>
                            </select>
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

        {activeTab === 'mytasks' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-855 dark:text-white">My Tasks</h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Personal dashboard listing your active assignments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* To Do */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-202 dark:border-slate-850 flex flex-col space-y-4 shadow-sm">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">To Do Pipeline</span>
                <div className="space-y-3 overflow-y-auto max-h-[450px]">
                  {myTasksData?.data?.todo?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No tasks in your queue.</div>
                  ) : (
                    myTasksData?.data?.todo?.map((task: any) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-55 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-500/10 text-slate-650 dark:text-slate-400">{task.priority} Priority</span>
                          <span className="text-[10px] text-slate-505 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-805 dark:text-slate-202 block truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-555 dark:text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                          <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-900/80 flex items-center justify-between">
                          <span className="text-[9px] text-slate-550 font-bold">Update Status:</span>
                          <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-305">
                            <option value="TO_DO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* In Progress */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-202 dark:border-slate-855 flex flex-col space-y-4 shadow-sm">
                <span className="text-xs font-black text-slate-505 dark:text-slate-404 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">Active In-Progress</span>
                <div className="space-y-3 overflow-y-auto max-h-[450px]">
                  {myTasksData?.data?.inProgress?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-505">No active tasks.</div>
                  ) : (
                    myTasksData?.data?.inProgress?.map((task: any) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-55 dark:bg-slate-955 border border-slate-202 dark:border-slate-800 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-500/10 text-slate-655 dark:text-slate-404">{task.priority} Priority</span>
                          <span className="text-[10px] text-slate-505 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-202 block truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-555 dark:text-slate-404 block line-clamp-2 mt-0.5">{task.description}</span>
                          <span className="text-[9px] font-bold text-indigo-650 dark:text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-900/80 flex items-center justify-between">
                          <span className="text-[9px] text-slate-550 font-bold">Update Status:</span>
                          <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-305">
                            <option value="TO_DO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="UNDER_REVIEW">Under Review</option>
                            <option value="COMPLETED">Completed</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
