'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, TrendingUp, Briefcase } from 'lucide-react';

interface AdminSidebarProps {
  auth: any;
  isSidebarOpen: boolean;
  onClose: () => void;
}

export default function AdminSidebar({
  auth,
  isSidebarOpen,
  onClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          onClick={onClose}
          className="md:hidden fixed inset-0 bg-black/50 z-[55] backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-[60] w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-5 shrink-0 transition-all duration-305 h-screen ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block text-slate-900 dark:text-white">Smart Collaborate</span>
              <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold tracking-widest uppercase">
                {auth.user?.role === 'PROJECT_MANAGER' ? 'Manager Workspace' : 'Admin Workspace'}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-450 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer text-lg">×</button>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            href={auth.user?.role === 'PROJECT_MANAGER' ? '/manager' : '/admin'}
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isActive('/admin') || isActive('/manager')
                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                : 'text-slate-555 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-202'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Workspace Dashboard
          </Link>
          <Link
            href={auth.user?.role === 'PROJECT_MANAGER' ? '/manager/projects' : '/admin/projects'}
            onClick={onClose}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${
              isActive('/admin/projects') || isActive('/manager/projects')
                ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20'
                : 'text-slate-555 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-202'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Projects Hub
          </Link>
        </nav>

        {/* Profile Info Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-indigo-500/10 dark:bg-indigo-500/5 flex items-center justify-center font-bold text-xs text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
              {auth.user?.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs block truncate text-slate-800 dark:text-slate-200">{auth.user?.name}</span>
              <span className="text-[10px] block truncate text-slate-500 dark:text-slate-400 uppercase font-semibold">{auth.user?.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
