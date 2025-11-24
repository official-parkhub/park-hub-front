import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Minhas Empresas - ParkHub',
};

export default function ManagerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
