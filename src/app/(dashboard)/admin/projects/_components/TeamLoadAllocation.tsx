'use client';

import React from 'react';

interface TeamLoadAllocationProps {
  workloadData: any[];
}

export default function TeamLoadAllocation({ workloadData }: TeamLoadAllocationProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
      <span className="text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-4 block">Team Load Allocation</span>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {workloadData.map((wl: any) => (
          <div key={wl.member.id} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block truncate">{wl.member.name}</span>
              <span className="text-[9px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-extrabold">{wl.member.role}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold">
              <div className="p-1 rounded bg-slate-200 dark:bg-slate-900">
                <span className="text-slate-600 dark:text-slate-400 block">{wl.totalTasks}</span>
                <span className="text-[8px] text-slate-500 block uppercase">Tasks</span>
              </div>
              <div className="p-1 rounded bg-slate-200 dark:bg-slate-900">
                <span className={`block ${wl.activeTasks > 3 ? 'text-rose-500' : 'text-amber-600 dark:text-amber-400'}`}>{wl.activeTasks}</span>
                <span className="text-[8px] text-slate-500 block uppercase">Active</span>
              </div>
              <div className="p-1 rounded bg-slate-200 dark:bg-slate-900">
                <span className="text-emerald-600 dark:text-emerald-400 block">{wl.completedTasks}</span>
                <span className="text-[8px] text-slate-500 block uppercase">Done</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
