import type { Metadata } from 'next';
import type React from 'react';

export const metadata: Metadata = {
  title: 'Detalhes do Estacionamento - ParkHub',
};

export default function ParkingDetailsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
