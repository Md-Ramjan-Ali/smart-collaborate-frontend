'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { RootState } from '../../../../../lib/store';
import { logout } from '../../../../../lib/features/auth/authSlice';
import {
  useLogoutMutation,
  useGetProjectByIdQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from '../../../../../lib/services/api';
import { Layers, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import MemberSidebar from '../../_components/MemberSidebar';
import MemberTaskPipeline from '../_components/MemberTaskPipeline';

export default function MemberProjectDetailsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const auth = useSelector((state: RootState) => state.auth);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

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

  const [logoutApi] = useLogoutMutation();
  const [updateTaskApi] = useUpdateTaskMutation();

  const { data: projectDetails } = useGetProjectByIdQuery(id, { skip: !id });
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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const res = await updateTaskApi({ id: taskId, status: newStatus }).unwrap();
      if (res.data?.warning) {
        toast.warning(res.data.warning, {
          duration: 10000,
          icon: <AlertTriangle className="w-4 h-4" />,
        });
      }
      refetchTasks();
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update task status.');
    }
  };

  const handleBackToProjects = () => {
    router.push('/member/projects');
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300">
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center">
            <Layers className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white">Smart Collaborate</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-1 rounded bg-slate-200 dark:bg-slate-800 cursor-pointer"
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

      <MemberSidebar
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
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-100 to-slate-200/50 dark:from-slate-900/60 dark:to-slate-900/30 border border-slate-200 dark:border-slate-800">
              <button
                onClick={handleBackToProjects}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold flex items-center gap-1 mb-3 cursor-pointer"
              >
                ← Back to Projects
              </button>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                {projectDetails.data.title}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                {projectDetails.data.description}
              </p>
            </div>

            <MemberTaskPipeline
              tasksData={tasksData}
              projectDetails={projectDetails.data}
              auth={auth}
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
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Loading project details...
          </div>
        )}
      </main>
    </div>
  );
}
