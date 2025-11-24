'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import ParkingLotDetails from '@/components/parking/ParkingLotDetails';
import { getLoginRoute } from '@/libs/EnvHelpers';
import { getToken } from '@/utils/tokenStorage';

export default function ParkingDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const companyId = params?.id as string;

  useEffect(() => {
    const token = getToken();
    if (!token) {
      const loginRoute = getLoginRoute();
      router.push(loginRoute);
    }
  }, [router]);

  useEffect(() => {
    if (!companyId) {
      router.push('/home');
    }
  }, [companyId, router]);

  if (!companyId) {
    return null;
  }

  return (
    <>
      <Header />
      <main id="main-content" className="min-h-screen bg-background" role="main">
        <ParkingLotDetails companyId={companyId} />
      </main>
    </>
  );
}
