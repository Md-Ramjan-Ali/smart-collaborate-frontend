'use client';

import React from 'react';
import { Search, Trash2 } from 'lucide-react';

interface TaskPipelineProps {
  tasksData: any;
  projectDetails: any;
  searchVal: string; setSearchVal: (v: string) => void;
  filterPriority: string; setFilterPriority: (v: string) => void;
  filterStatus: string; setFilterStatus: (v: string) => void;
  filterAssignee: string; setFilterAssignee: (v: string) => void;
  sortField: string; setSortField: (v: string) => void;
  sortDir: 'asc' | 'desc'; setSortDir: (v: 'asc' | 'desc') => void;
  page: number; setPage: (p: number) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskPipeline({
  tasksData, projectDetails,
  searchVal, setSearchVal,
  filterPriority, setFilterPriority,
  filterStatus, setFilterStatus,
  filterAssignee, setFilterAssignee,
  sortField, setSortField,
  sortDir, setSortDir,
  page, setPage,
  onStatusChange, onDeleteTask,
}: TaskPipelineProps) {
  return (
    <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4">
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">Tasks Pipeline</span>

      {/* Filters Bar */}
      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-4 items-center justify-between shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full lg:w-48">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text" value={searchVal}
              onChange={(e) => { setSearchVal(e.target.value); setPage(1); }}
              placeholder="Search title/desc..."
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none w-full focus:border-indigo-500 transition"
            />
          </div>
          <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto">
            <option value="">All Priorities</option>
            <option value="LOW">Low Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="HIGH">High Priority</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto">
            <option value="">All Statuses</option>
            <option value="TO_DO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <select value={filterAssignee} onChange={(e) => { setFilterAssignee(e.target.value); setPage(1); }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 outline-none cursor-pointer w-full sm:w-auto">
            <option value="">All Assignees</option>
            {projectDetails?.teamMembers?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
            {projectDetails?.owner && <option value={projectDetails.owner.id}>{projectDetails.owner.name} (Manager)</option>}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3 justify-between w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-semibold">Sort:</span>
            <select value={sortField} onChange={(e) => setSortField(e.target.value)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-400 outline-none cursor-pointer">
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="title">Title</option>
            </select>
            <select value={sortDir} onChange={(e) => setSortDir(e.target.value as any)} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-400 outline-none cursor-pointer">
              <option value="asc">Asc</option>
              <option value="desc">Desc</option>
            </select>
          </div>

          {tasksData?.data?.meta && tasksData.data.meta.totalPages > 1 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition font-bold cursor-pointer">Prev</button>
              <span>Page {page} of {tasksData.data.meta.totalPages}</span>
              <button disabled={page === tasksData.data.meta.totalPages} onClick={() => setPage(page + 1)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:text-slate-900 dark:hover:text-white disabled:opacity-40 transition font-bold cursor-pointer">Next</button>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-bold">
              <th className="pb-3 font-semibold">Title / Description</th>
              <th className="pb-3 font-semibold">Assignee</th>
              <th className="pb-3 font-semibold">Priority</th>
              <th className="pb-3 font-semibold">Due Date</th>
              <th className="pb-3 font-semibold text-center">Status Workflow</th>
              <th className="pb-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!tasksData?.data?.data || tasksData.data.data.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-slate-500 font-semibold">No tasks found matching criteria.</td></tr>
            ) : (
              tasksData.data.data.map((task: any) => (
                <tr key={task.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30 transition">
                  <td className="py-4 pr-3 max-w-[200px]">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate">{task.title}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">{task.description || 'No description provided.'}</span>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-300 font-semibold">{task.assignee?.name || 'Unassigned'}</td>
                  <td className="py-4">
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold tracking-wider ${
                      task.priority === 'HIGH' ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20' :
                      task.priority === 'MEDIUM' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    }`}>{task.priority}</span>
                  </td>
                  <td className="py-4 text-slate-600 dark:text-slate-400 font-semibold">{new Date(task.dueDate).toLocaleDateString()}</td>
                  <td className="py-4 text-center">
                    <select value={task.status} onChange={(e) => onStatusChange(task.id, e.target.value)} className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-1 px-2.5 text-[11px] font-bold outline-none cursor-pointer text-slate-700 dark:text-slate-300">
                      <option value="TO_DO">To Do</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="UNDER_REVIEW">Under Review</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  </td>
                  <td className="py-4 text-right">
                    <button onClick={() => onDeleteTask(task.id)} className="p-1 rounded bg-white dark:bg-slate-950 hover:bg-rose-500/25 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition border border-slate-200 dark:border-slate-800 cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
