'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupMutation } from '../../../lib/services/api';
import Link from 'next/link';

import {
  Mail,
  Lock,
  User as UserIcon,
  ChevronRight,
  Sparkles,
  Layers,
  AlertTriangle,
} from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'PROJECT_MANAGER' | 'TEAM_MEMBER'>('TEAM_MEMBER');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [signup, { isLoading: isSigningUp }] = useSignupMutation();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name || !email || !password) {
      setFormError('All fields are required.');
      return;
    }

    try {
      await signup({
        name,
        email,
        password,
        role,
      }).unwrap();

      // Redirect to login page
      router.push('/login');
    } catch (err: any) {
      setFormError(err.data?.message || 'Registration failed.');
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Layers className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4 min-h-screen bg-slate-950 text-slate-100">
      {/* Background glow templates */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-purple-500/10 blur-[120px]" />

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center z-10 my-10">
        {/* Brand / Intro */}
        <div className="md:col-span-6 space-y-6 text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-semibold tracking-wider uppercase">
            <Sparkles className="w-4.5 h-4.5" />
            Smart Collaboration System
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-none bg-gradient-to-r from-white via-indigo-100 to-purple-400 bg-clip-text text-transparent">
            Create. <br />
            <span className="text-indigo-500">Collaborate.</span>
          </h1>
          
          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
            Join the smart project network and setup your personal or corporate workspace inside our secure neon-themed hub.
          </p>
        </div>

        {/* Register form */}
        <div className="md:col-span-6 w-full">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2">Create Workspace Account</h2>
            <p className="text-xs text-slate-450 mb-6 font-medium">Select your role and initialize your profile details.</p>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Workspace Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition rounded-xl py-3 px-4 text-sm text-slate-400 outline-none cursor-pointer"
                >
                  <option value="TEAM_MEMBER">Team Member (Updates tasks only)</option>
                  <option value="PROJECT_MANAGER">Project Manager (Creates & assigns)</option>
                  <option value="ADMIN">Administrator (Full workspace controls)</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={isSigningUp}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isSigningUp ? 'Setting up workspace...' : 'Complete Registration'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-indigo-400 font-bold hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
