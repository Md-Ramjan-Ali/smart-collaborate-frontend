'use client';

import React, { useState } from 'react';
import { Menu, Sun, Moon, LogOut, User } from 'lucide-react';
import NotificationCenter from './NotificationCenter';

interface HeaderProps {
  title: string;
  onToggleSidebar: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onLogout: () => void;
  auth: any;
}

export default function Header({
  title,
  onToggleSidebar,
  theme,
  onToggleTheme,
  onLogout,
  auth,
}: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/70 dark:bg-slate-950/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-6 py-3 flex items-center justify-between transition-colors duration-300">
      
      {/* Left: Hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right: Actions (Notification, Theme, User Avatar Dropdown) */}
      <div className="flex items-center gap-4">
        {/* Notification Center */}
        <NotificationCenter />

        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-1.5 rounded text-slate-500 hover:text-indigo-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Toggle Mode"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer focus:outline-none"
          >
            {/* User Avatar Image */}
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt={auth.user?.name || 'User'}
              className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 object-cover"
            />
          </button>

          {isDropdownOpen && (
            <>
              {/* Invisible overlay to close dropdown */}
              <div 
                onClick={() => setIsDropdownOpen(false)}
                className="fixed inset-0 z-40 bg-transparent"
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 z-50 w-56 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-2.5 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-850 dark:text-slate-100">
                <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1">
                  <span className="font-bold text-xs block text-slate-900 dark:text-white truncate">
                    {auth.user?.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {auth.user?.email}
                  </span>
                  <span className="inline-block px-2 py-0.5 mt-1.5 rounded-full text-[8px] font-extrabold tracking-wider bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-500/20 uppercase">
                    {auth.user?.role}
                  </span>
                </div>

                {/* Logout Action */}
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
