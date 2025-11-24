'use client';

import type { Vehicle } from '@/services/vehicle/types';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { listVehicles } from '@/services/vehicle/vehicleService';
import VehicleCard from './VehicleCard';

type VehicleListProps = {
  onViewMetrics?: (vehicle: Vehicle) => void;
  onDelete?: (vehicle: Vehicle) => void;
  onRefresh?: () => void;
  onAddVehicle?: () => void;
};

export default function VehicleList({
  onViewMetrics,
  onDelete,
  onRefresh,
  onAddVehicle,
}: VehicleListProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const vehiclesList = await listVehicles();

      setVehicles(Array.isArray(vehiclesList) ? vehiclesList : []);
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao carregar veículos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    await fetchVehicles();
    onRefresh?.();
  }, [fetchVehicles, onRefresh]);

  const handleDelete = useCallback(
    (vehicle: Vehicle) => {
      onDelete?.(vehicle);
    },
    [onDelete],
  );

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const vehiclesArray = Array.isArray(vehicles) ? vehicles : [];

  if (loading && vehiclesArray.length === 0) {
    return (
      <div
        className="w-full py-8"
        role="status"
        aria-label="Carregando veículos"
        aria-live="polite"
      >
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="sr-only">Carregando veículos...</span>
        </div>
      </div>
    );
  }

  if (error && vehiclesArray.length === 0) {
    return (
      <div className="w-full py-8" role="alert" aria-live="assertive">
        <div className="bg-destructive/10 border border-destructive/20 rounded-3xl p-6 text-center">
          <p className="text-destructive-foreground font-medium mb-4">{error}</p>
          <p className="text-sm text-muted-foreground mb-4">
            Tente recarregar a lista ou verifique sua conexão.
          </p>
          <Button onClick={handleRefresh} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  if (vehiclesArray.length === 0 && !loading) {
    return (
      <div className="w-full py-8" role="status" aria-live="polite">
        <div className="text-center">
          <p className="text-lg font-medium text-foreground mb-2">
            Você ainda não possui veículos cadastrados
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Adicione seu primeiro veículo para começar a usar o sistema.
          </p>
          {onAddVehicle && (
            <Button onClick={onAddVehicle} size="lg">
              Adicionar Primeiro Veículo
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6"
        role="list"
        aria-label="Lista de veículos cadastrados"
      >
        {vehiclesArray.map(vehicle => (
          <div key={vehicle.id} role="listitem">
            <VehicleCard
              vehicle={vehicle}
              onViewMetrics={onViewMetrics}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>

      {loading && vehiclesArray.length > 0 && (
        <div
          className="w-full py-6 flex justify-center"
          role="status"
          aria-label="Atualizando lista de veículos"
          aria-live="polite"
        >
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <span className="sr-only">Atualizando lista de veículos...</span>
        </div>
      )}
    </div>
  );
}
