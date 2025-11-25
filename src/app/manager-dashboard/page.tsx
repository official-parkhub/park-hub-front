'use client';

import type { NavLink } from '@/components/layout/Header';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CompanyForm from '@/components/company/CompanyForm';
import CreateCompanyFAB from '@/components/company/CreateCompanyFAB';
import Header from '@/components/layout/Header';
import ParkingLotList from '@/components/parking/ParkingLotList';
import { getLoginRoute } from '@/libs/EnvHelpers';
import { getCurrentUser } from '@/services/auth/authService';
import { listOwnedCompanies } from '@/services/company/companyService';
import { getToken } from '@/utils/tokenStorage';

export default function ManagerDashboardPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const orgNavLinks: NavLink[] = [
    {
      href: '/manager-dashboard',
      label: 'Minhas Empresas',
      ariaLabel: 'Ver minhas empresas',
    },
  ];

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

        if (userInfo.customer) {
          router.push('/home');
          return;
        }

        if (!userInfo.organization) {
          router.push('/home');
          return;
        }

        setIsChecking(false);
      } catch (error) {
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

  const handleCompanyClick = (companyId: string) => {
    router.push(`/parking/${companyId}`);
  };

  const handleFABClick = () => {
    setIsFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
  };

  const handleFormSuccess = (_companyId: string) => {};

  return (
    <>
      <Header navLinks={orgNavLinks} />
      <main id="main-content" className="min-h-screen bg-background" role="main">
        <section
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12"
          aria-labelledby="companies-heading"
        >
          <h1
            id="companies-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-6 sm:mb-8"
          >
            Minhas Empresas
          </h1>
          <ParkingLotList
            onCompanyClick={handleCompanyClick}
            fetchFn={listOwnedCompanies}
            emptyMessage="Você ainda não possui empresas cadastradas"
          />
        </section>

        <CreateCompanyFAB onClick={handleFABClick} />

        <CompanyForm
          open={isFormOpen}
          onOpenChange={handleFormClose}
          onSuccess={handleFormSuccess}
        />
      </main>
    </>
  );
}
