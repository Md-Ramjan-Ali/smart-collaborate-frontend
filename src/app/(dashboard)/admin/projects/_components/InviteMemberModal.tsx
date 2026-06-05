'use client';

import React, { useState } from 'react';

interface InviteMemberModalProps {
  usersData: any;
  projectDetails: any;
  formError: string | null;
  setFormError: (e: string | null) => void;
  onClose: () => void;
  onSubmit: (memberId: string) => Promise<void>;
}

export default function InviteMemberModal({ usersData, projectDetails, formError, setFormError, onClose, onSubmit }: InviteMemberModalProps) {
  const [memberId, setMemberId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!memberId) { setFormError('Please select a member.'); return; }
    await onSubmit(memberId);
  };

  const available = usersData?.data?.filter(
    (u: any) => !projectDetails?.teamMembers?.some((m: any) => m.id === u.id) && u.id !== projectDetails?.ownerId
  ) || [];

  return (
    <div className="fixed inset-0 bg-slate-950/20 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <span className="font-bold text-sm text-slate-800 dark:text-slate-200">Invite Member</span>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold cursor-pointer">×</button>
        </div>
        {formError && <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-xs font-semibold">{formError}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <select value={memberId} onChange={(e) => setMemberId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-3 text-xs text-slate-500 dark:text-slate-400 outline-none">
            <option value="">Choose User...</option>
            {available.map((u: any) => (
              <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
            ))}
          </select>
          <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white transition rounded-xl font-bold text-xs cursor-pointer">
            Add Member
          </button>
        </form>
      </div>
    </div>
  );
}
