'use client';

import React from 'react';
import AdminDashboard from './AdminDashboard';

interface ManagerDashboardProps {
  auth: any;
}

export default function ManagerDashboard({ auth }: ManagerDashboardProps) {
  // Project Manager dashboard shares matching functional capabilities with Admin dashboard,
  // but acts under restricted backend API permission logic.
  return <AdminDashboard auth={auth} />;
}
