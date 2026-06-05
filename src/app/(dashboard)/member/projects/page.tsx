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
import Header from '@/components/share/Header';

export default function MemberProjectsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    <div className="flex flex-col md:flex-row md:h-screen md:overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      <MemberSidebar
        auth={auth}
        isSidebarOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:h-full md:overflow-hidden md:ml-64">
        <Header
          title="Projects Hub"
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
          auth={auth}
        />

        <main className="flex-1 p-6 overflow-y-auto max-w-7xl w-full">
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
    </div>
  );
}
