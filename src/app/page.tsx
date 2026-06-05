'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '../lib/store';
import Loading from '@/components/share/Loading';

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
        <Loading size={32} className="text-indigo-500" />
      </div>
    </div>
  );
}
