'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../lib/store';
import { logout } from '../../../lib/features/auth/authSlice';
import { useLogoutMutation } from '../../../lib/services/authApi';
import { useGetMyTasksQuery, useUpdateTaskMutation } from '../../../lib/services/taskApi';
import { Layers, AlertTriangle, CheckCircle2, Clock, ClipboardList, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import MemberSidebar from './_components/MemberSidebar';
import Header from '@/components/share/Header';

export default function MemberMyAssignmentsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const [logoutApi] = useLogoutMutation();
  const [updateTaskApi] = useUpdateTaskMutation();
  const { data: myTasksData, refetch: refetchMyTasks } = useGetMyTasksQuery(undefined);

  const handleLogout = async () => {
    try { await logoutApi(undefined).unwrap(); } catch {}
    dispatch(logout()); router.push('/login');
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
      refetchMyTasks();
    } catch (err: any) { toast.error(err.data?.message || 'Failed to update task status.'); }
  };

  // Get tasks counts
  const todoCount = myTasksData?.data?.todo?.length || 0;
  const inProgressCount = myTasksData?.data?.inProgress?.length || 0;
  const underReviewCount = myTasksData?.data?.underReview?.length || 0;
  const completedCount = myTasksData?.data?.completed?.length || 0;

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      <MemberSidebar
        auth={auth}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:h-full md:overflow-hidden md:ml-64">
        <Header
          title="My Assignments"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          auth={auth}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">My Tasks</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Personal dashboard listing your active assignments.</p>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">To Do</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{todoCount}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">In Progress</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{inProgressCount}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">Under Review</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{underReviewCount}</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center gap-3 shadow-sm">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold block uppercase tracking-wider">Completed</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">{completedCount}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* To Do Column */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 shadow-sm">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">To Do Pipeline</span>
              <div className="space-y-3 overflow-y-auto max-h-[450px]">
                {myTasksData?.data?.todo?.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No tasks in your queue.</div>
                ) : (
                  myTasksData?.data?.todo?.map((task: any) => (
                    <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400">{task.priority} Priority</span>
                        <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{task.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-bold">Update Status:</span>
                        <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300">
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

            {/* In Progress Column */}
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 shadow-sm">
              <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">Active In-Progress</span>
              <div className="space-y-3 overflow-y-auto max-h-[450px]">
                {myTasksData?.data?.inProgress?.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No active tasks.</div>
                ) : (
                  myTasksData?.data?.inProgress?.map((task: any) => (
                    <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400">{task.priority} Priority</span>
                        <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div>
                        <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{task.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                        <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[9px] text-slate-500 font-bold">Update Status:</span>
                        <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300">
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

          {/* Toggle Button for Completed & Under Review Tasks */}
          <div className="pt-4 flex justify-center">
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer shadow-sm"
            >
              {showCompleted ? 'Hide Completed & Under Review Tasks' : 'Show Completed & Under Review Tasks'}
              <span className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-[10px] text-indigo-600 dark:text-indigo-400 font-extrabold">
                {underReviewCount + completedCount}
              </span>
            </button>
          </div>

          {/* Collapsible Section */}
          {showCompleted && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              {/* Under Review Column */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 shadow-sm">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">Under Review Pipeline</span>
                <div className="space-y-3 overflow-y-auto max-h-[450px]">
                  {myTasksData?.data?.underReview?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No tasks under review.</div>
                  ) : (
                    myTasksData?.data?.underReview?.map((task: any) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400">{task.priority} Priority</span>
                          <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold">Update Status:</span>
                          <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300">
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

              {/* Completed Column */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col space-y-4 shadow-sm">
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block border-b border-slate-200 dark:border-slate-800 pb-2">Completed Archive</span>
                <div className="space-y-3 overflow-y-auto max-h-[450px]">
                  {myTasksData?.data?.completed?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No completed tasks.</div>
                  ) : (
                    myTasksData?.data?.completed?.map((task: any) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm opacity-75 hover:opacity-100 transition">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-200 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400">{task.priority} Priority</span>
                          <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate line-through decoration-slate-400 dark:decoration-slate-600">{task.title}</span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                          <span className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold">Update Status:</span>
                          <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300">
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
          )}
        </div>
      </main>
      </div>
    </div>

  );
}
