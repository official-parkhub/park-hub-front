import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Estacionamentos Disponíveis - ParkHub',
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
