'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../../lib/store';
import { logout } from '../../../../lib/features/auth/authSlice';
import { useLogoutMutation, useGetAllUsersQuery } from '../../../../lib/services/authApi';
import {
  useGetProjectsQuery,
  useCreateProjectMutation,
  useDeleteProjectMutation,
} from '../../../../lib/services/projectApi';

import { Layers, Plus, Calendar, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import AdminSidebar from '../_components/AdminSidebar';
import CreateProjectModal from './_components/CreateProjectModal';
import ConfirmationModal from '@/components/share/ConfirmationModal';
import Header from '@/components/share/Header';

export default function AdminProjectsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
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
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [confirmDeleteProject, setConfirmDeleteProject] = useState<string | null>(null);

  const [logoutApi] = useLogoutMutation();
  const [createProject, { isLoading: isCreatingProject }] = useCreateProjectMutation();
  const [deleteProjectApi] = useDeleteProjectMutation();

  const { data: projectsData, refetch: refetchProjects } = useGetProjectsQuery(undefined);
  const { data: usersData } = useGetAllUsersQuery(undefined);

  const handleLogout = async () => {
    try {
      await logoutApi(undefined).unwrap();
    } catch {}
    dispatch(logout());
    router.push('/login');
  };

  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteProject(id);
  };

  const confirmProjectDelete = async () => {
    if (!confirmDeleteProject) return;
    try {
      await deleteProjectApi(confirmDeleteProject).unwrap();
      refetchProjects();
      toast.success('Project deleted successfully.');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete project.');
    } finally {
      setConfirmDeleteProject(null);
    }
  };

  const handleProjectClick = (projectId: string) => {
    const baseRoute = auth.user?.role === 'ADMIN' ? 'admin' : 'manager';
    router.push(`/${baseRoute}/projects/${projectId}`);
  };

  return (
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-955 dark:text-slate-100 transition-colors duration-300">
      
      <AdminSidebar
        auth={auth}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:h-full md:overflow-hidden md:ml-64">
        <Header
          title="Projects Hub"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={handleLogout}
          auth={auth}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Projects Registry</h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Workspace projects, dates, and member setups.</p>
            </div>
            <button
              onClick={() => {
                setFormError(null);
                setShowCreateProject(true);
              }}
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
                  onClick={() => handleProjectClick(project.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-100 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase ${
                          project.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : project.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-500/10 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                      <button
                        onClick={(e) => handleDeleteProject(project.id, e)}
                        className="p-1 rounded bg-slate-100 dark:bg-slate-950 hover:bg-rose-500/25 text-slate-500 hover:text-rose-600 transition border border-slate-200 dark:border-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-200 block truncate">
                      {project.title}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">{project.description}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-bold">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                      {project.teamMembers?.length || 0} Members
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
      </div>
    </div>
  );
}
