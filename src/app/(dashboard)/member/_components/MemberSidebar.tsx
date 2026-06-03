'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, ListTodo, Briefcase, LogOut, Sun, Moon } from 'lucide-react';

interface MemberSidebarProps {
  auth: any;
  isSidebarOpen: boolean;
  onClose: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
}

export default function MemberSidebar({ auth, isSidebarOpen, onClose, theme, onToggleTheme, onLogout }: MemberSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isSidebarOpen && (
        <div onClick={onClose} className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-xs" />
      )}
      <aside className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-100 dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-5 shrink-0 transition-all duration-300 h-screen ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block text-slate-900 dark:text-white">Smart Collaborate</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase">Team Member Portal</span>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer text-lg">×</button>
        </div>

        <nav className="flex-1 space-y-1">
          <Link href="/member" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${pathname === '/member' ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50'}`}>
            <ListTodo className="w-4 h-4" />
            My Assignments
          </Link>
          <Link href="/member/projects" onClick={onClose} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition cursor-pointer ${pathname === '/member/projects' || pathname.startsWith('/member/projects') ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800/50'}`}>
            <Briefcase className="w-4 h-4" />
            Projects Hub
          </Link>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 uppercase shrink-0">
                {auth.user?.name?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs block truncate text-slate-800 dark:text-slate-200">{auth.user?.name}</span>
                <span className="text-[10px] block truncate text-slate-500 dark:text-slate-400">{auth.user?.email}</span>
              </div>
            </div>
            <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                TEAM_MEMBER
              </span>
              <div className="flex items-center gap-1.5">
                <button onClick={onToggleTheme} className="p-1.5 rounded text-slate-500 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer" title="Toggle Mode">
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
                </button>
                <button onClick={onLogout} className="text-slate-500 hover:text-rose-500 transition cursor-pointer" title="Log Out">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
