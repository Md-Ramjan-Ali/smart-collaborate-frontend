'use client';

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../../../lib/store';
import { logout } from '../../../../lib/features/auth/authSlice';
import { useLogoutMutation } from '../../../../lib/services/authApi';
import { useGetProjectsQuery } from '../../../../lib/services/projectApi';
import { Layers, Calendar, Users } from 'lucide-react';
import MemberSidebar from '../_components/MemberSidebar';

export default function MemberProjectsPage() {
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

  const [logoutApi] = useLogoutMutation();
  const { data: projectsData } = useGetProjectsQuery(undefined);

  const handleLogout = async () => {
    try {
      await logoutApi(undefined).unwrap();
    } catch {}
    dispatch(logout());
    router.push('/login');
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/member/projects/${projectId}`);
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
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">My Projects</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs">Projects where you are mapped as a team member.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {projectsData?.data?.length === 0 ? (
              <div className="col-span-full text-center py-20 bg-white dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-sm">
                You are not assigned to any projects.
              </div>
            ) : (
              projectsData?.data?.map((project: any) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/50 transition cursor-pointer flex flex-col justify-between space-y-4 shadow-sm"
                >
                  <div className="space-y-2">
                    <span className="px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider uppercase bg-slate-100 text-slate-500 dark:bg-slate-500/10 dark:text-slate-400">
                      {project.status}
                    </span>
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
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      {project.teamMembers?.length || 0} Members
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
