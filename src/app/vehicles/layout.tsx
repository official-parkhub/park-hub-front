import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Meus Veículos - ParkHub',
};

export default function VehiclesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
