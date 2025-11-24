'use client';

import type { CompanyActiveVehicle, PaginatedResponse } from '@/services/vehicle/types';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { listCompanyActiveVehicles } from '@/services/vehicle/companyVehicleService';
import { formatDateTimeBrasilia } from '@/utils/dateTimeUtils';
import { toastError } from '@/utils/toast';

type ActiveVehiclesListProps = {
  companyId: string;
  companyTotalSpots: number;
  onRegisterExit?: (plate: string) => void;
  onRefresh?: () => void;
  hideTitle?: boolean;
  hideOccupancy?: boolean;
};

const formatPrice = (cents?: number): string => {
  if (cents === undefined || cents === null) {
    return 'Preço não disponível';
  }

  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
};

const calculateParkingTime = (entranceDate: string): string => {
  const entrance = new Date(entranceDate);
  const now = new Date();
  const diffMs = now.getTime() - entrance.getTime();

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (hours === 0) {
    return `${minutes}min`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}min`;
};

export default function ActiveVehiclesList({
  companyId,
  companyTotalSpots,
  onRegisterExit,
  onRefresh,
  hideTitle = false,
  hideOccupancy = false,
}: ActiveVehiclesListProps) {
  const [vehicles, setVehicles] = useState<CompanyActiveVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    skip: number;
    limit: number;
    total: number;
  }>({
    skip: 0,
    limit: 10,
    total: 0,
  });

  const fetchActiveVehicles = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<CompanyActiveVehicle>
        = await listCompanyActiveVehicles(companyId, {
          skip: pagination.skip,
          limit: pagination.limit,
        });

      setVehicles(response.data);
      setPagination({
        skip: response.skip,
        limit: response.limit,
        total: response.total,
      });
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao carregar veículos ativos';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, pagination.skip, pagination.limit]);

  const handleRefresh = useCallback(async () => {
    await fetchActiveVehicles();
    onRefresh?.();
  }, [fetchActiveVehicles, onRefresh]);

  const handleRegisterExit = useCallback(
    (plate: string) => {
      onRegisterExit?.(plate);
    },
    [onRegisterExit],
  );

  const occupancy = {
    total: companyTotalSpots,
    active: vehicles.length,
    available: Math.max(0, companyTotalSpots - vehicles.length),
    percentage:
      companyTotalSpots > 0 ? Math.round((vehicles.length / companyTotalSpots) * 100) : 0,
  };

  useEffect(() => {
    fetchActiveVehicles();
  }, [fetchActiveVehicles]);

  if (loading && vehicles.length === 0) {
    return (
      <div
        className="w-full py-8"
        role="status"
        aria-label="Carregando veículos ativos"
        aria-live="polite"
      >
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="sr-only">Carregando veículos ativos...</span>
        </div>
      </div>
    );
  }

  if (error && vehicles.length === 0) {
    return (
      <div className="w-full py-8" role="alert" aria-live="polite">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      {!hideOccupancy && (
        <div className="rounded-lg border bg-muted/50 p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Ocupação do Estacionamento</h3>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
              aria-label="Atualizar lista de veículos ativos"
            >
              {loading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Capacidade Total</p>
              <p className="text-2xl font-bold">{occupancy.total}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Veículos Ativos</p>
              <p className="text-2xl font-bold text-primary">{occupancy.active}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Vagas Disponíveis</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {occupancy.available}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Ocupação</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">
                  {occupancy.percentage}
                  %
                </p>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      occupancy.percentage >= 90
                        ? 'bg-destructive'
                        : occupancy.percentage >= 70
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(occupancy.percentage, 100)}%` }}
                    aria-label={`${occupancy.percentage}% de ocupação`}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!hideTitle && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Veículos Ativos</h3>
            {vehicles.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {vehicles.length}
                {' '}
                {vehicles.length === 1 ? 'veículo' : 'veículos'}
              </span>
            )}
          </div>
        )}

        {!loading && vehicles.length === 0 && (
          <div
            className="rounded-lg border bg-card p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">Nenhum veículo ativo no momento</p>
          </div>
        )}

        {vehicles.length > 0 && (
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            role="list"
            aria-label="Lista de veículos ativos"
          >
            {vehicles.map(vehicle => (
              <div
                key={vehicle.vehicle_id}
                className="rounded-lg border bg-card p-4 space-y-3"
                role="listitem"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <h4 className="font-semibold text-lg">
                      {vehicle.plate || 'Placa não disponível'}
                    </h4>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Entrada:</span>
                    <span>{formatDateTimeBrasilia(vehicle.entrance_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tempo Estacionado:</span>
                    <span className="font-medium">
                      {calculateParkingTime(vehicle.entrance_date)}
                    </span>
                  </div>
                  {vehicle.current_price_cents !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Preço Atual:</span>
                      <span className="font-medium">
                        {formatPrice(vehicle.current_price_cents)}
                      </span>
                    </div>
                  )}
                  {vehicle.hourly_rate !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Taxa Horária:</span>
                      <span className="font-medium">
                        {formatPrice(vehicle.hourly_rate)}
                        /h
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleRegisterExit(vehicle.plate || '')}
                  variant="outline"
                  size="sm"
                  className="w-full"
                  aria-label={`Registrar saída do veículo ${vehicle.plate || ''}`}
                >
                  Registrar Saída
                </Button>
              </div>
            ))}
          </div>
        )}

        {loading && vehicles.length > 0 && (
          <div
            className="w-full py-6 flex justify-center"
            role="status"
            aria-label="Atualizando lista de veículos ativos"
            aria-live="polite"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="sr-only">Atualizando lista de veículos ativos...</span>
          </div>
        )}

        {pagination.total > pagination.limit && (
          <div className="text-center text-sm text-muted-foreground">
            Mostrando
            {' '}
            {vehicles.length}
            {' '}
            de
            {' '}
            {pagination.total}
            {' '}
            veículos ativos
          </div>
        )}
      </div>
    </div>
  );
}
