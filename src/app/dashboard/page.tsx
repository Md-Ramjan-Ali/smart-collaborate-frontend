'use client';

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../lib/store';
import Loading from '@/components/share/Loading';

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
        <Loading size={32} className="text-indigo-500" />
      </div>
    </div>
  );
}
