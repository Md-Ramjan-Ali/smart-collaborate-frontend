"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../../../lib/store";
import { setCredentials } from "../../../lib/features/auth/authSlice";
import {
  useLoginMutation,
  useSignupMutation,
} from "../../../lib/services/authApi";
import Link from "next/link";

import {
  Mail,
  Lock,
  ChevronRight,
  Sparkles,
  Layers,
  AlertTriangle,
} from "lucide-react";
import Loading from "@/components/share/Loading";

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const auth = useSelector((state: RootState) => state.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [signup] = useSignupMutation();

  useEffect(() => {
    setMounted(true);
    if (auth.token) {
      router.push("/dashboard");
    }
  }, [auth.token, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!email || !password) {
      setFormError("Please enter both email and password.");
      return;
    }

    try {
      const res = await login({ email, password }).unwrap();
      dispatch(
        setCredentials({
          token: res.data.accessToken,
          user: res.data.user,
        }),
      );
      router.push("/dashboard");
    } catch (err: any) {
      setFormError(
        err.data?.message || "Login failed. Please check credentials.",
      );
    }
  };

  const handleDemoLogin = async (
    role: "ADMIN" | "PROJECT_MANAGER" | "TEAM_MEMBER",
  ) => {
    setFormError(null);
    const emailMap = {
      ADMIN: "admin@smart.com",
      PROJECT_MANAGER: "pm@smart.com",
      TEAM_MEMBER: "member@smart.com",
    };
    const nameMap = {
      ADMIN: "Demo Admin",
      PROJECT_MANAGER: "Demo Manager",
      TEAM_MEMBER: "Demo Member",
    };

    const demoEmail = emailMap[role];
    const demoPassword = "demo123Password";

    try {
      const res = await login({
        email: demoEmail,
        password: demoPassword,
      }).unwrap();
      dispatch(
        setCredentials({
          token: res.data.accessToken,
          user: res.data.user,
        }),
      );
      router.push("/dashboard");
    } catch (err: any) {
      if (err.status === 401 || err.status === 400) {
        try {
          await signup({
            name: nameMap[role],
            email: demoEmail,
            password: demoPassword,
            role,
          }).unwrap();

          const resRetry = await login({
            email: demoEmail,
            password: demoPassword,
          }).unwrap();
          dispatch(
            setCredentials({
              token: resRetry.data.accessToken,
              user: resRetry.data.user,
            }),
          );
          router.push("/dashboard");
        } catch (signUpErr: any) {
          setFormError("Failed to initialize sandbox credentials.");
        }
      } else {
        setFormError(err.data?.message || "Connection error.");
      }
    }
  };

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-2">
          <Loading className="w-12 h-12" />
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
            Collaborate. <br />
            <span className="text-indigo-500">Intelligently.</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg leading-relaxed max-w-md">
            A premium, role-based project coordination hub equipped with
            workload optimization, task validation triggers, and analytics
            insights.
          </p>

          <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-md space-y-4 max-w-md">
            <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Quick Sandbox Login
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleDemoLogin("ADMIN")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-indigo-600/20 hover:border-indigo-500 border border-slate-800 transition group text-left cursor-pointer"
              >
                <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                  Admin
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1">
                  Full System
                </span>
              </button>
              <button
                onClick={() => handleDemoLogin("PROJECT_MANAGER")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-purple-600/20 hover:border-purple-500 border border-slate-800 transition group text-left cursor-pointer"
              >
                <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider">
                  PM
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1">
                  Manage PM
                </span>
              </button>
              <button
                onClick={() => handleDemoLogin("TEAM_MEMBER")}
                className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-900 hover:bg-emerald-600/20 hover:border-emerald-500 border border-slate-800 transition group text-left cursor-pointer"
              >
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">
                  Member
                </span>
                <span className="text-xs text-slate-400 font-medium mt-1">
                  Status Update
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Login form */}
        <div className="md:col-span-6 w-full">
          <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl flex flex-col">
            <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-xs text-slate-450 mb-6">
              Enter your details to access the collaboration space.
            </p>

            {formError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {formError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Email Address
                </label>
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
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 active:scale-98 transition rounded-xl font-semibold text-sm cursor-pointer shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isLoggingIn ? "Verifying Account..." : "Sign In"}
                <ChevronRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
              Don&apos;t have an account?{" "}
              <Link
                href="/register"
                className="text-indigo-400 font-bold hover:underline"
              >
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
