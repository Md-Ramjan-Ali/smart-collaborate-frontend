'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';
import { Layers } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (auth.token) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }
  }, [mounted, auth.token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <Layers className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs font-bold tracking-widest uppercase text-indigo-400">Loading Workspace...</span>
      </div>
    </div>
  );
}
