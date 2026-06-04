'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Layers, ListTodo, Briefcase } from 'lucide-react';

interface MemberSidebarProps {
  auth: any;
  isSidebarOpen: boolean;
  onClose: () => void;
}

export default function MemberSidebar({ auth, isSidebarOpen, onClose }: MemberSidebarProps) {
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

        {/* Profile Info Footer */}
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-center font-bold text-xs text-emerald-600 dark:text-emerald-400 uppercase shrink-0">
              {auth.user?.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-xs block truncate text-slate-800 dark:text-slate-202">{auth.user?.name}</span>
              <span className="text-[10px] block truncate text-slate-500 dark:text-slate-400 uppercase font-semibold">{auth.user?.role}</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
