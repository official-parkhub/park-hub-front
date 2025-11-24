import type { Metadata } from 'next';
import AuthPageContent from './AuthPageContent';

export const metadata: Metadata = {
  title: 'Login - ParkHub',
  description: 'Faça login ou crie sua conta no ParkHub',
};

export default function LoginPage() {
  return <AuthPageContent />;
}
