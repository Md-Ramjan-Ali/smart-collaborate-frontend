'use client';

import React, { useState } from 'react';
import { Bell, Check, X } from 'lucide-react';
import {
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
} from '../../lib/services/notificationApi';
import { toast } from 'sonner';

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notificationsRes, refetch } = useGetNotificationsQuery(undefined, {
    pollingInterval: 10000, // Poll notifications every 10 seconds for real-time notifications
  });
  const [markAsReadApi] = useMarkNotificationAsReadMutation();

  const notifications = notificationsRes?.data || [];
  const unreadCount = notifications.filter((n: any) => !n.isRead).length;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadApi(id).unwrap();
      refetch();
      toast.success('Notification cleared.');
    } catch {}
  };

  return (
    <div className="relative">
      {/* Bell Toggle Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1.5 rounded relative text-slate-500 hover:text-indigo-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center border border-white dark:border-slate-900 animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Overlay Dropdown */}
      {isOpen && (
        <>
          <div 
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-40 bg-transparent"
          />
          <div className="absolute top-full mt-2 right-0 z-50 w-72 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-850 dark:text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Bell className="w-3.5 h-3.5 text-indigo-500" />
                Alert Notifications
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-2 pr-0.5">
              {notifications.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-[10px] font-semibold">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif: any) => (
                  <div
                    key={notif.id}
                    className={`p-2.5 rounded-lg border text-[10px] flex gap-2.5 justify-between items-start transition ${
                      notif.isRead
                        ? 'bg-slate-50/50 dark:bg-slate-900/10 border-slate-100 dark:border-slate-900/60 opacity-60'
                        : 'bg-indigo-50/40 dark:bg-indigo-950/10 border-indigo-100 dark:border-indigo-950/40'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <p className="text-slate-650 dark:text-slate-350 leading-relaxed font-semibold">
                        {notif.message}
                      </p>
                      <span className="text-[8px] text-slate-400 font-semibold block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        className="p-1 rounded bg-indigo-500 text-white hover:bg-indigo-600 transition shrink-0 cursor-pointer"
                        title="Mark as read"
                      >
                        <Check className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
