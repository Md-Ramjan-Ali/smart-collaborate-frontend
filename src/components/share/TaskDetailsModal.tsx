'use client';

import React, { useState } from 'react';
import { X, Send, Paperclip, MessageSquare, ShieldAlert, FileText } from 'lucide-react';
import {
  useGetCommentsQuery,
  useCreateCommentMutation,
  useGetAttachmentsQuery,
  useCreateAttachmentMutation,
} from '../../lib/services/taskApi';
import { toast } from 'sonner';

interface TaskDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  taskTitle: string;
}

export default function TaskDetailsModal({
  isOpen,
  onClose,
  taskId,
  taskTitle,
}: TaskDetailsModalProps) {
  const [commentVal, setCommentVal] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { data: commentsRes, refetch: refetchComments } = useGetCommentsQuery(taskId, {
    skip: !taskId || !isOpen,
  });
  const { data: attachmentsRes, refetch: refetchAttachments } = useGetAttachmentsQuery(taskId, {
    skip: !taskId || !isOpen,
  });

  const [createCommentApi, { isLoading: isCommenting }] = useCreateCommentMutation();
  const [createAttachmentApi] = useCreateAttachmentMutation();

  if (!isOpen) return null;

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentVal.trim()) return;

    try {
      await createCommentApi({ taskId, content: commentVal.trim() }).unwrap();
      setCommentVal('');
      refetchComments();
      toast.success('Comment posted!');
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to post comment.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 150);

    try {
      // Simulate endpoint post after 600ms
      setTimeout(async () => {
        try {
          await createAttachmentApi({
            taskId,
            filename: file.name,
            fileUrl: `https://example.com/uploads/${encodeURIComponent(file.name)}`,
          }).unwrap();
          
          clearInterval(interval);
          setUploadProgress(100);
          
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
            refetchAttachments();
            toast.success(`Attached ${file.name} successfully!`);
          }, 300);
        } catch (err: any) {
          setIsUploading(false);
          toast.error(err.data?.message || 'Failed to attach file.');
        }
      }, 700);
    } catch (err) {
      setIsUploading(false);
    }
  };

  const comments = commentsRes?.data || [];
  const attachments = attachmentsRes?.data || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 text-slate-850 dark:text-slate-100">
        
        {/* Header */}
        <header className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider block">Task Details & Collaboration</span>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white line-clamp-1">{taskTitle}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          
          {/* Comments Section (Col 7) */}
          <div className="md:col-span-7 flex flex-col space-y-4">
            <h4 className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              Task Comments ({comments.length})
            </h4>

            {/* Comments List */}
            <div className="flex-1 min-h-[220px] max-h-[300px] overflow-y-auto space-y-3.5 pr-1">
              {comments.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 py-12 text-center">
                  <MessageSquare className="w-8 h-8 opacity-40 mb-1" />
                  <span className="text-xs font-semibold">No comments yet. Start the conversation!</span>
                </div>
              ) : (
                comments.map((c: any) => (
                  <div key={c.id} className="text-xs bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold">
                      <span className="text-slate-700 dark:text-slate-350">{c.user?.name}</span>
                      <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">{c.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Post Comment Input */}
            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                value={commentVal}
                onChange={(e) => setCommentVal(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 transition"
              />
              <button
                type="submit"
                disabled={isCommenting || !commentVal.trim()}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          {/* Attachments Section (Col 5) */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <h4 className="text-xs font-bold text-slate-650 dark:text-slate-400 flex items-center gap-1.5 border-b border-slate-150 dark:border-slate-800 pb-2">
              <Paperclip className="w-4 h-4 text-purple-400" />
              File Attachments ({attachments.length})
            </h4>

            {/* Upload Button */}
            <div className="relative">
              <input
                type="file"
                id="task-file-upload"
                onChange={handleFileChange}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="task-file-upload"
                className={`w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer transition bg-slate-50/50 dark:bg-slate-950/20 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5 ${
                  isUploading ? 'pointer-events-none opacity-50' : ''
                }`}
              >
                <Paperclip className="w-5 h-5 text-indigo-500" />
                <span className="text-[10px] font-bold text-slate-650 dark:text-slate-300">Attach Document</span>
                <span className="text-[8px] text-slate-400 font-semibold">PDF, Image, Docs</span>
              </label>

              {isUploading && (
                <div className="absolute inset-0 bg-white/90 dark:bg-slate-900/90 flex flex-col items-center justify-center px-4 rounded-xl">
                  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mb-2 overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-1.5 rounded-full transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-indigo-500">Uploading File ({uploadProgress}%)</span>
                </div>
              )}
            </div>

            {/* Attachments List */}
            <div className="flex-1 max-h-[220px] overflow-y-auto space-y-2 pr-1">
              {attachments.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-center">
                  <FileText className="w-7 h-7 opacity-30 mb-1" />
                  <span className="text-[10px] font-semibold">No attachments yet.</span>
                </div>
              ) : (
                attachments.map((att: any) => (
                  <a
                    key={att.id}
                    href={att.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800/80 hover:border-indigo-500/40 flex items-center gap-2.5 transition text-left group"
                  >
                    <FileText className="w-4 h-4 text-purple-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-slate-700 dark:text-slate-350 block truncate group-hover:text-indigo-500 dark:group-hover:text-indigo-400">
                        {att.filename}
                      </span>
                      <span className="text-[8px] text-slate-400 block font-semibold">
                        Added by {att.user?.name}
                      </span>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
