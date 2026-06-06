'use client';

import React, { useState } from 'react';

interface CreateTaskModalProps {
  projectDetails: any;
  formError: string | null;
  setFormError: (e: string | null) => void;
  isCreatingTask: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => Promise<void>;
}

export default function CreateTaskModal({ projectDetails, formError, setFormError, isCreatingTask, onClose, onSubmit }: CreateTaskModalProps) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [assignee, setAssignee] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || !dueDate) { setFormError('Title and Due Date are required.'); return; }

    if (projectDetails) {
      const taskDate = new Date(dueDate);
      const projEndDate = new Date(projectDetails.endDate);
      if (taskDate > projEndDate) {
        setFormError(`Task due date cannot exceed project end date (${projectDetails.endDate.split('T')[0]}).`);
        return;
      }
    }

    await onSubmit({ title, description: desc, priority, status: 'TO_DO', assigneeId: assignee || undefined, dueDate });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Create Task</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer">×</button>
        </div>
        {formError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Task Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="SSL Setup" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-none" />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Description (Optional)</label>
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Task details" className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-800 dark:text-slate-200 outline-none" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Assign Member</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-550 dark:text-slate-450 outline-none cursor-pointer">
                <option value="">Unassigned</option>
                {projectDetails?.teamMembers?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                {projectDetails?.owner && <option value={projectDetails.owner.id}>{projectDetails.owner.name} (Manager)</option>}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-550 dark:text-slate-450 outline-none cursor-pointer">
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-500 dark:text-slate-400 outline-none cursor-pointer" />
            </div>
          </div>
          <button type="submit" disabled={isCreatingTask} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-xl font-bold text-xs cursor-pointer">
            Assign Task
          </button>
        </form>
      </div>
    </div>
  );
}
