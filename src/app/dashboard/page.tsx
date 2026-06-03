'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../lib/store';
import { Layers } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!auth.token) {
      router.replace('/login');
      return;
    }
    if (auth.user?.role === 'ADMIN') {
      router.replace('/admin');
    } else if (auth.user?.role === 'PROJECT_MANAGER') {
      router.replace('/manager');
    } else {
      router.replace('/member');
    }
  }, [auth.token, auth.user?.role, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3">
        <Layers className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">Redirecting...</span>
      </div>
    </div>
  );
}
