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
} from 'lucide-react';

interface MemberDashboardProps {
  auth: any;
}

export default function MemberDashboard({ auth }: MemberDashboardProps) {
  const dispatch = useDispatch();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'projects' | 'mytasks'>('mytasks');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [taskWarning, setTaskWarning] = useState<string | null>(null);

  // API hooks
  const [logoutApi] = useLogoutMutation();
  const [updateTaskApi] = useUpdateTaskMutation();

  const { data: projectsData, refetch: refetchProjects } = useGetProjectsQuery(undefined);
  const { data: myTasksData, refetch: refetchMyTasks } = useGetMyTasksQuery(undefined);
  
  const { data: projectDetails, refetch: refetchProjectDetails } = useGetProjectByIdQuery(selectedProjectId || '', {
    skip: !selectedProjectId,
  });

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
    } catch (err: any) {
      alert(err.data?.message || 'Failed to update task status.');
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full min-h-screen">
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

      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-5 shrink-0">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white block">Smart Collaborate</span>
            <span className="text-[10px] text-emerald-400 font-bold tracking-widest uppercase">Team Member Portal</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-indigo-400 uppercase">
              {auth.user?.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-slate-200 block truncate">{auth.user?.name}</span>
              <span className="text-[10px] text-slate-400 block truncate">{auth.user?.email}</span>
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {auth.user?.role}
            </span>
            <button onClick={handleLogout} className="text-slate-500 hover:text-rose-400 transition cursor-pointer">
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <button
            onClick={() => { setActiveTab('mytasks'); setSelectedProjectId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'mytasks'
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <ListTodo className="w-4.5 h-4.5" />
            My Assignments
          </button>
          <button
            onClick={() => { setActiveTab('projects'); setSelectedProjectId(null); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              activeTab === 'projects' || selectedProjectId
                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4.5 h-4.5" />
            Projects Hub
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-slate-950 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'projects' && !selectedProjectId && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">My Projects</h2>
              <p className="text-slate-400 text-xs">Projects where you are mapped as a team member.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectsData?.data?.length === 0 ? (
                <div className="col-span-full text-center py-20 bg-slate-900/30 border border-slate-800 rounded-2xl text-slate-500 text-sm">
                  You are not assigned to any projects.
                </div>
              ) : (
                projectsData?.data?.map((project: any) => (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProjectId(project.id)}
                    className="p-5 rounded-2xl bg-slate-900/40 hover:bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-2">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-slate-500/10 text-slate-400`}>
                        {project.status}
                      </span>
                      <h3 className="font-extrabold text-base text-slate-200 block truncate">{project.title}</h3>
                      <p className="text-slate-400 text-xs line-clamp-2">{project.description}</p>
                    </div>
                    <div className="pt-4 border-t border-slate-850 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{new Date(project.endDate).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5 text-indigo-400" />{project.teamMembers?.length || 0} Members</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {selectedProjectId && projectDetails?.data && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900/60 to-slate-900/30 border border-slate-800 backdrop-blur-md space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <button onClick={() => { setSelectedProjectId(null); setTaskWarning(null); }} className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 mb-2 cursor-pointer">
                    ← Back to Projects
                  </button>
                  <h2 className="text-2xl font-black tracking-tight text-white">{projectDetails.data.title}</h2>
                  <p className="text-slate-400 text-xs max-w-xl">{projectDetails.data.description}</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 block">Tasks Pipeline</span>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-850 text-slate-500 uppercase tracking-wider font-bold">
                      <th className="pb-3 font-semibold">Title / Description</th>
                      <th className="pb-3 font-semibold">Assignee</th>
                      <th className="pb-3 font-semibold">Priority</th>
                      <th className="pb-3 font-semibold">Due Date</th>
                      <th className="pb-3 font-semibold text-center">Status Workflow</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDetails.data.tasks?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500 font-semibold">No tasks created.</td>
                      </tr>
                    ) : (
                      projectDetails.data.tasks?.map((task: any) => (
                        <tr key={task.id} className="border-b border-slate-850 hover:bg-slate-900/30 transition group">
                          <td className="py-4 pr-3 max-w-[200px]">
                            <span className="font-bold text-slate-200 block truncate">{task.title}</span>
                          </td>
                          <td className="py-4 text-slate-300 font-semibold">{task.assignee?.name || 'Unassigned'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${
                              task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-500/10 text-slate-400'
                            }`}>{task.priority}</span>
                          </td>
                          <td className="py-4 text-slate-400 font-semibold">{new Date(task.dueDate).toLocaleDateString()}</td>
                          <td className="py-4 text-center">
                            <select
                              value={task.status}
                              disabled={task.assigneeId !== auth.user?.id}
                              onChange={(e) => handleStatusChange(task.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 rounded-lg py-1 px-2.5 text-[11px] font-bold outline-none cursor-pointer text-slate-300"
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
              <h2 className="text-2xl font-black tracking-tight text-white">My Tasks</h2>
              <p className="text-slate-400 text-xs">Personal dashboard listing your active assignments.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* To Do */}
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-850 flex flex-col space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">To Do Pipeline</span>
                <div className="space-y-3 overflow-y-auto max-h-[450px]">
                  {myTasksData?.data?.todo?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No tasks in your queue.</div>
                  ) : (
                    myTasksData?.data?.todo?.map((task: any) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-550/10 text-slate-450">{task.priority} Priority</span>
                          <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-200 block truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                          <span className="text-[9px] font-bold text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold">Update Status:</span>
                          <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-300">
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
              <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-855 flex flex-col space-y-4">
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest block border-b border-slate-800 pb-2">Active In-Progress</span>
                <div className="space-y-3 overflow-y-auto max-h-[450px]">
                  {myTasksData?.data?.inProgress?.length === 0 ? (
                    <div className="text-center py-10 text-xs text-slate-500">No active tasks.</div>
                  ) : (
                    myTasksData?.data?.inProgress?.map((task: any) => (
                      <div key={task.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="px-2 py-0.5 rounded text-[8px] font-extrabold uppercase tracking-wider bg-slate-550/10 text-slate-450">{task.priority} Priority</span>
                          <span className="text-[10px] text-slate-500 font-bold">{new Date(task.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div>
                          <span className="font-bold text-xs text-slate-200 block truncate">{task.title}</span>
                          <span className="text-[10px] text-slate-400 block line-clamp-2 mt-0.5">{task.description}</span>
                          <span className="text-[9px] font-bold text-indigo-400 block mt-2">Project: {task.project?.title}</span>
                        </div>
                        <div className="pt-3 border-t border-slate-900/80 flex items-center justify-between">
                          <span className="text-[9px] text-slate-500 font-bold">Update Status:</span>
                          <select value={task.status} onChange={(e) => handleStatusChange(task.id, e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg py-1 px-2 text-[10px] font-bold outline-none cursor-pointer text-slate-300">
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
