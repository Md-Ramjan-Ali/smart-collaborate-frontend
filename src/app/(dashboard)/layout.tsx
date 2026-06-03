'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { RootState } from '../../lib/store';
import { Layers } from 'lucide-react';

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
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

  return <>{children}</>;
}
