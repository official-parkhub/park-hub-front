'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import ParkingLotList from '@/components/parking/ParkingLotList';
import { getLoginRoute } from '@/libs/EnvHelpers';
import { getCurrentUser } from '@/services/auth/authService';
import logger from '@/utils/logger';
import { getToken } from '@/utils/tokenStorage';

export default function HomePage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAccess = async () => {
      const token = getToken();
      if (!token) {
        const loginRoute = getLoginRoute();
        router.push(loginRoute);
        return;
      }

      try {
        const userInfo = await getCurrentUser();

        if (userInfo.organization) {
          router.push('/manager-dashboard');
          return;
        }

        setIsChecking(false);
      } catch (error) {
        logger.error({ error }, 'Error verifying user profile');
        const loginRoute = getLoginRoute();
        router.push(loginRoute);
      }
    };

    verifyAccess();
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div
            className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"
            role="status"
            aria-label="Verificando acesso"
          >
            <span className="sr-only">Verificando acesso...</span>
          </div>
          <p className="text-muted-foreground">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  const handleCompanyClick = (_companyId: string) => {};

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-background" role="main">
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12"
          aria-labelledby="parking-lots-heading"
        >
          <h1
            id="parking-lots-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8"
          >
            Estacionamentos Disponíveis
          </h1>
          <ParkingLotList onCompanyClick={handleCompanyClick} />
        </section>
      </main>
    </>
  );
}
