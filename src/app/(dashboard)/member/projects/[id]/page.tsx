'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, useParams } from 'next/navigation';
import { RootState } from '../../../../../lib/store';
import { logout } from '../../../../../lib/features/auth/authSlice';
import { useLogoutMutation } from '../../../../../lib/services/authApi';
import { useGetProjectByIdQuery } from '../../../../../lib/services/projectApi';
import { useGetTasksQuery, useUpdateTaskMutation } from '../../../../../lib/services/taskApi';
import { Layers, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import MemberSidebar from '../../_components/MemberSidebar';
import MemberTaskPipeline from '../_components/MemberTaskPipeline';
import TaskDetailsModal from '../../../../../components/share/TaskDetailsModal';
import Header from '@/components/share/Header';
import Loading from '@/components/share/Loading';

export default function MemberProjectDetailsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const auth = useSelector((state: RootState) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('');
  const [sortField, setSortField] = useState('dueDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<{ id: string; title: string } | null>(null);

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
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      <MemberSidebar
        auth={auth}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:h-full md:overflow-hidden md:ml-64">
        <Header
          title={projectDetails?.data ? `Project / ${projectDetails.data.title}` : "Project Details"}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          auth={auth}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
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
              onViewDetails={(taskId, taskTitle) => setSelectedTaskDetails({ id: taskId, title: taskTitle })}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[50vh] gap-3">
            <Loading size={32} />
          </div>
        )}
      </main>

      {selectedTaskDetails && (
        <TaskDetailsModal
          isOpen={!!selectedTaskDetails}
          onClose={() => setSelectedTaskDetails(null)}
          taskId={selectedTaskDetails.id}
          taskTitle={selectedTaskDetails.title}
        />
      )}
      </div>
    </div>
  );
}
