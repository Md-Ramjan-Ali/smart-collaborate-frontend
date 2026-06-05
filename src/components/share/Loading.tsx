"use client"
import React from 'react';
import { Loader } from 'lucide-react';

interface LoadingProps {
  className?: string;
  size?: number | string;
  fullScreen?: boolean;
}

export default function Loading({
  className = '',
  size = 24,
  fullScreen = false,
}: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xs">
        <Loader 
          className={`animate-spin text-slate-500 dark:text-slate-400 ${className}`} 
          size={size} 
        />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4 w-full h-full">
      <Loader 
        className={`animate-spin text-slate-500 dark:text-slate-400 ${className}`} 
        size={size} 
      />
    </div>
  );
}
