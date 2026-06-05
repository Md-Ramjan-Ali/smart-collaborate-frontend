'use client';
 
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../lib/store';
import { logout } from '../../../lib/features/auth/authSlice';
import { useLogoutMutation } from '../../../lib/services/authApi';
import { useGetDashboardMetaQuery } from '../../../lib/services/dashboardApi';
import { useGetTasksQuery } from '../../../lib/services/taskApi';
import { Briefcase, CheckCircle, Clock, ListTodo, Layers, Sparkles, TrendingUp, Sun, Moon, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as ChartTooltip } from 'recharts';
import AdminSidebar from './_components/AdminSidebar';
import Header from '@/components/share/Header';
 
const CHART_COLORS = ['#3b82f6', '#f59e0b', '#a855f7', '#10b981'];
 
export default function AdminOverviewPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
 
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [logoutApi] = useLogoutMutation();
  const { data: dashboardData, refetch: refetchDashboard } = useGetDashboardMetaQuery(undefined);
  const { data: highPriorityTasks } = useGetTasksQuery({ priority: 'HIGH', limit: '5' });
 
  const handleLogout = async () => {
    try { await logoutApi(undefined).unwrap(); } catch {}
    dispatch(logout());
    router.push('/login');
  };
 
  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      <AdminSidebar
        auth={auth}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
 
      <div className="flex-1 flex flex-col md:h-full md:overflow-hidden md:ml-64">
        <Header
          title="Workspace Dashboard"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          auth={auth}
        />
 
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Workspace Overview</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Overview metrics, task statuses, and collaboration activities.</p>
            </div>
            <button onClick={() => refetchDashboard()} className="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer shadow-sm">
              Refresh Stats
            </button>
          </div>
 
          {/* KPI Cards */}
          {dashboardData?.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Total Projects</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{dashboardData.data.kpis.projects.total}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Active Projects</span>
                  <span className="text-2xl font-black text-amber-600 dark:text-amber-400">{dashboardData.data.kpis.projects.active}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Pending Tasks</span>
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400">{dashboardData.data.kpis.tasks.pending}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <ListTodo className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Completed Tasks</span>
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{dashboardData.data.kpis.tasks.completed}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block">Overdue Tasks</span>
                  <span className="text-2xl font-black text-rose-600 dark:text-rose-455">{dashboardData.data.kpis.tasks.overdue || 0}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
              </div>
            </div>
          )}
 
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Task Status Allocation</span>
              <div className="h-[200px] flex items-center justify-center">
                {dashboardData?.data ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardData.data.statusDistribution.filter((d: any) => d.value > 0)}
                        cx="50%" cy="50%"
                        innerRadius={60} outerRadius={85}
                        paddingAngle={3} dataKey="value"
                      >
                        {dashboardData.data.statusDistribution.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', fontSize: '12px' }} itemStyle={{ color: '#f8fafc' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : <span className="text-xs text-slate-500">No chart data</span>}
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
                        <span className="font-bold text-slate-800 dark:text-slate-200">{p.title}</span>
                        <span className="font-extrabold text-indigo-600 dark:text-indigo-400">{p.progress}%</span>
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
 
          {/* Deadlines + High Priority + Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Upcoming Deadlines (Next 48 Hours)</span>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                {dashboardData?.data?.upcomingTasks?.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No urgent deadlines.</div>
                ) : (
                  dashboardData?.data?.upcomingTasks?.map((task: any) => (
                    <div key={task.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-200 block truncate">{task.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Project: {task.project?.title}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[9px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full ml-2 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
 
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">High Priority Tasks</span>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                {!highPriorityTasks?.data?.data || highPriorityTasks.data.data.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No high priority tasks.</div>
                ) : (
                  highPriorityTasks.data.data.map((task: any) => (
                    <div key={task.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-200 block truncate">{task.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">Project: {task.project?.title}</span>
                      </div>
                      <span className="inline-flex items-center gap-1 text-[8px] font-extrabold text-rose-600 bg-rose-500/10 px-2.5 py-0.5 rounded-full ml-2 shrink-0 uppercase border border-rose-500/10">
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
 
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 flex flex-col shadow-sm">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Workspace Activity Log</span>
              <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px]">
                {dashboardData?.data?.recentActivities?.length === 0 ? (
                  <div className="text-center py-10 text-xs text-slate-500">No events logged.</div>
                ) : (
                  dashboardData?.data?.recentActivities?.map((log: any) => (
                    <div key={log.id} className="p-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1 text-xs">
                        <p className="font-semibold text-slate-700 dark:text-slate-300">{log.message}</p>
                        <span className="text-[9px] text-slate-500 font-medium">By {log.user?.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
