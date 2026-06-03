'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../lib/store';
import { Layers } from 'lucide-react';

import AdminDashboard from './components/AdminDashboard';
import ManagerDashboard from './components/ManagerDashboard';
import MemberDashboard from './components/MemberDashboard';

export default function DashboardPage() {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !auth.token) {
      router.push('/login');
    }
  }, [auth.token, mounted, router]);

  if (!mounted || !auth.token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <Layers className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  // Render dashboard according to user role
  if (auth.user?.role === 'ADMIN') {
    return <AdminDashboard auth={auth} />;
  }
  
  if (auth.user?.role === 'PROJECT_MANAGER') {
    return <ManagerDashboard auth={auth} />;
  }

  // Fallback to team member dashboard
  return <MemberDashboard auth={auth} />;
}
