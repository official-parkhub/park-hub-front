'use client';

import type { Vehicle } from '@/services/vehicle/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import ActiveVehiclesSection from '@/components/vehicle/ActiveVehiclesSection';
import DeleteVehicleDialog from '@/components/vehicle/DeleteVehicleDialog';
import VehicleForm from '@/components/vehicle/VehicleForm';
import VehicleList from '@/components/vehicle/VehicleList';
import VehicleMetricsModal from '@/components/vehicle/VehicleMetricsModal';
import { getLoginRoute } from '@/libs/EnvHelpers';
import { getCurrentUser } from '@/services/auth/authService';
import { deleteVehicle } from '@/services/vehicle/vehicleService';
import logger from '@/utils/logger';
import { toastError, toastSuccess } from '@/utils/toast';
import { getToken } from '@/utils/tokenStorage';

export default function VehiclesPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedVehicleForDelete, setSelectedVehicleForDelete]
    = useState<Vehicle | null>(null);
  const [selectedVehiclePlate, setSelectedVehiclePlate] = useState<string | null>(null);

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

  const handleRefreshList = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleAddVehicle = useCallback(() => {
    setIsFormOpen(true);
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    handleRefreshList();
    toastSuccess('Veículo adicionado com sucesso!');
  }, [handleRefreshList]);

  const handleViewMetrics = useCallback((vehicle: Vehicle) => {
    setSelectedVehiclePlate(vehicle.plate);
    setIsMetricsModalOpen(true);
  }, []);

  const handleDeleteVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicleForDelete(vehicle);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedVehicleForDelete) {
      return;
    }

    if (!selectedVehicleForDelete.id) {
      toastError('ID do veículo não encontrado. Não é possível remover.');
      return;
    }

    try {
      await deleteVehicle(selectedVehicleForDelete.id);
      toastSuccess('Veículo removido com sucesso!');
      setIsDeleteDialogOpen(false);
      setSelectedVehicleForDelete(null);
      handleRefreshList();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover veículo';
      toastError(errorMessage);
    }
  }, [selectedVehicleForDelete, handleRefreshList]);

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

  return (
    <>
      <Header currentPath="/vehicles" />
      <main id="main-content" className="min-h-screen bg-background" role="main">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <h1
              id="vehicles-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground"
            >
              Meus Veículos
            </h1>
            <Button
              onClick={handleAddVehicle}
              size="lg"
              className="w-full sm:w-auto"
              aria-label="Adicionar novo veículo"
            >
              <svg
                className="size-4 sm:size-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Adicionar Veículo
            </Button>
          </div>

          <section className="mb-4 sm:mb-6" aria-labelledby="active-vehicles-heading">
            <ActiveVehiclesSection />
          </section>

          <section aria-labelledby="vehicles-list-heading" className="mb-8">
            <h2
              id="vehicles-list-heading"
              className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6"
            >
              Lista de Veículos
            </h2>
            <VehicleList
              key={refreshKey}
              onViewMetrics={handleViewMetrics}
              onDelete={handleDeleteVehicle}
              onAddVehicle={handleAddVehicle}
            />
          </section>
        </div>
      </main>

      <VehicleForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
      />

      <VehicleMetricsModal
        open={isMetricsModalOpen}
        onOpenChange={setIsMetricsModalOpen}
        vehiclePlate={selectedVehiclePlate}
      />

      <DeleteVehicleDialog
        vehicle={selectedVehicleForDelete}
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
