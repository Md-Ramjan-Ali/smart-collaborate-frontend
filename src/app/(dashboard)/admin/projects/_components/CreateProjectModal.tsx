'use client';

import React, { useState } from 'react';

interface CreateProjectModalProps {
  usersData: any;
  auth: any;
  formError: string | null;
  setFormError: (e: string | null) => void;
  isCreatingProject: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

export default function CreateProjectModal({ usersData, auth, formError, setFormError, isCreatingProject, onClose, onSubmit }: CreateProjectModalProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [members, setMembers] = useState<string[]>([]);

  const toggleMember = (id: string) => setMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!title || !desc || !start || !end) { setFormError('Please fill out all fields.'); return; }
    await onSubmit({ title, description: desc, startDate: start, endDate: end, teamMembers: members });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Create New Project</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer">×</button>
        </div>
        {formError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Project Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Summary" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Start Date</label>
              <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-500 dark:text-slate-400 outline-none cursor-pointer" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">End Date</label>
              <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-500 dark:text-slate-400 outline-none cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Map Initial Team Members</label>
            <div className="space-y-1 max-h-[120px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50 dark:bg-slate-950">
              {usersData?.data?.filter((u: any) => u.id !== auth.user?.id).map((u: any) => (
                <div key={u.id} onClick={() => toggleMember(u.id)} className={`p-2 rounded-lg text-xs font-semibold flex items-center justify-between cursor-pointer ${members.includes(u.id) ? 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}>
                  <span>{u.name} ({u.role})</span>
                </div>
              ))}
            </div>
          </div>
          <button type="submit" disabled={isCreatingProject} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 transition rounded-xl font-bold text-xs text-white cursor-pointer">
            {isCreatingProject ? 'Saving Project...' : 'Initialize Project'}
          </button>
        </form>
      </div>
    </div>
  );
}
