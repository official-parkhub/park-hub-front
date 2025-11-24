'use client';

import type { PaginatedResponse, VehicleHistoryRecord } from '@/services/vehicle/types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { getCompanyVehicleHistory } from '@/services/vehicle/companyVehicleService';
import { formatDateTimeBrasilia } from '@/utils/dateTimeUtils';
import { toastError } from '@/utils/toast';

type VehicleHistoryProps = {
  companyId: string;
  hideTitle?: boolean;
};

type Statistics = {
  totalEntries: number;
  totalExits: number;
  totalRevenue: number;
  mostFrequentVehicles: Array<{
    vehicleId: string;
    plate?: string;
    count: number;
  }>;
};

const formatPrice = (cents: number): string => {
  const reais = cents / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(reais);
};

const calculateParkingTime = (entranceDate: string, exitDate: string): string => {
  const entrance = new Date(entranceDate);
  const exit = new Date(exitDate);
  const diffMs = exit.getTime() - entrance.getTime();

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

const getMovementType = (record: VehicleHistoryRecord): 'entrance' | 'exit' => {
  return record.ended_at ? 'exit' : 'entrance';
};

const calculateStatistics = (records: VehicleHistoryRecord[]): Statistics => {
  const entries = records.filter(r => !r.ended_at);
  const exits = records.filter(r => r.ended_at !== null);

  const totalEntries = entries.length;
  const totalExits = exits.length;

  const totalRevenue = exits.reduce((sum, r) => {
    return sum + (r.total_price || 0);
  }, 0);

  const vehicleCounts = new Map<string, { count: number; plate?: string }>();
  records.forEach((r) => {
    const existing = vehicleCounts.get(r.vehicle_id) || { count: 0 };
    vehicleCounts.set(r.vehicle_id, {
      count: existing.count + 1,
      plate: r.plate || existing.plate,
    });
  });

  const mostFrequentVehicles = Array.from(vehicleCounts.entries())
    .map(([vehicleId, data]) => ({
      vehicleId,
      plate: data.plate,
      count: data.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    totalEntries,
    totalExits,
    totalRevenue,
    mostFrequentVehicles,
  };
};

export default function VehicleHistory({
  companyId,
  hideTitle = false,
}: VehicleHistoryProps) {
  const [history, setHistory] = useState<VehicleHistoryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    skip: number;
    limit: number;
    total: number;
    currentPage: number;
  }>({
    skip: 0,
    limit: 10,
    total: 0,
    currentPage: 1,
  });

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<VehicleHistoryRecord>
        = await getCompanyVehicleHistory(companyId, {
          skip: pagination.skip,
          limit: pagination.limit,
        });

      setHistory(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.total,
        currentPage: Math.floor(response.skip / response.limit) + 1,
      }));
    } catch (err) {
      const errorMessage
        = err instanceof Error ? err.message : 'Erro ao carregar histórico';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [companyId, pagination.skip, pagination.limit]);

  const statistics = useMemo(() => {
    return calculateStatistics(history);
  }, [history]);

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const handlePageChange = useCallback(
    (page: number) => {
      const newSkip = (page - 1) * pagination.limit;
      setPagination(prev => ({
        ...prev,
        skip: newSkip,
        currentPage: page,
      }));
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading && history.length === 0) {
    return (
      <div
        className="w-full py-8"
        role="status"
        aria-label="Carregando histórico"
        aria-live="polite"
      >
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          <span className="sr-only">Carregando histórico...</span>
        </div>
      </div>
    );
  }

  if (error && history.length === 0) {
    return (
      <div className="w-full py-8" role="alert" aria-live="polite">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error}</p>
          <Button onClick={fetchHistory} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total de Entradas</p>
            <p className="text-3xl font-bold">{statistics.totalEntries}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total de Saídas</p>
            <p className="text-3xl font-bold">{statistics.totalExits}</p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Receita Total</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {formatPrice(statistics.totalRevenue)}
            </p>
          </div>
        </div>
      </div>

      {statistics.mostFrequentVehicles.length > 0 && (
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-lg font-semibold mb-4">Veículos Mais Frequentes</h3>
          <div className="space-y-2">
            {statistics.mostFrequentVehicles.map(({ vehicleId, plate, count }) => (
              <div
                key={vehicleId}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                {plate
                  ? (
                      <span className="text-sm font-medium">{plate}</span>
                    )
                  : (
                      <span className="text-sm font-mono text-muted-foreground">
                        {vehicleId.slice(0, 8)}
                        ...
                      </span>
                    )}
                <span className="text-sm text-muted-foreground">
                  {count}
                  {' '}
                  {count === 1 ? 'movimentação' : 'movimentações'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        {!hideTitle && (
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Histórico de Movimentações</h3>
            {history.length > 0 && (
              <span className="text-sm text-muted-foreground">
                {pagination.total}
                {' '}
                {pagination.total === 1 ? 'registro' : 'registros'}
              </span>
            )}
          </div>
        )}

        {!loading && history.length === 0 && (
          <div
            className="rounded-lg border bg-card p-8 text-center"
            role="status"
            aria-live="polite"
          >
            <p className="text-muted-foreground">Nenhum histórico disponível</p>
          </div>
        )}

        {history.length > 0 && (
          <div className="space-y-3" role="list" aria-label="Histórico de movimentações">
            {history.map((record) => {
              const movementType = getMovementType(record);
              const isEntrance = movementType === 'entrance';

              return (
                <div
                  key={`${record.vehicle_id}-${record.entrance_date}`}
                  className={`rounded-xl border-2 p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${
                    isEntrance
                      ? 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 border-blue-200 dark:border-blue-800'
                      : 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-purple-200 dark:border-purple-800'
                  }`}
                  role="listitem"
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <div
                            className={`h-3 w-3 rounded-full ${
                              isEntrance ? 'bg-blue-500' : 'bg-purple-500'
                            }`}
                          />
                          <span
                            className={`text-sm font-bold uppercase tracking-wide ${
                              isEntrance
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-purple-700 dark:text-purple-300'
                            }`}
                          >
                            {isEntrance ? 'Entrada' : 'Saída'}
                          </span>
                        </div>

                        <div className="text-base">
                          <span className="text-muted-foreground text-sm">Veículo: </span>
                          {record.plate
                            ? (
                                <span className="font-bold text-foreground">
                                  {record.plate}
                                </span>
                              )
                            : (
                                <span className="font-mono text-muted-foreground">
                                  {record.vehicle_id.slice(0, 8)}
                                  ...
                                </span>
                              )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        className={`rounded-lg p-3 border ${
                          isEntrance
                            ? 'bg-white/80 dark:bg-gray-800/80 border-blue-200 dark:border-blue-800'
                            : 'bg-white/60 dark:bg-gray-800/60 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                          <span className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                            Entrada
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {formatDateTimeBrasilia(record.entrance_date)}
                        </p>
                      </div>

                      {record.ended_at
                        ? (
                            <div className="rounded-lg p-3 border bg-white/80 dark:bg-gray-800/80 border-purple-200 dark:border-purple-800">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-purple-700 dark:text-purple-300">
                                  Saída
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {formatDateTimeBrasilia(record.ended_at)}
                              </p>
                            </div>
                          )
                        : (
                            <div className="rounded-lg p-3 border bg-white/40 dark:bg-gray-800/40 border-gray-200 dark:border-gray-700">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                                  Em Estacionamento
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Aguardando saída
                              </p>
                            </div>
                          )}
                    </div>

                    {record.ended_at && (
                      <div className="rounded-lg p-3 border bg-white/80 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Tempo Estacionado:
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {calculateParkingTime(record.entrance_date, record.ended_at)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Taxa Horária:
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatPrice(record.hourly_rate)}
                            /h
                          </span>
                        </div>
                        {record.total_price !== null && (
                          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                Valor Total:
                              </span>
                              <span className="text-base font-bold text-green-700 dark:text-green-400">
                                {formatPrice(record.total_price)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!record.ended_at && (
                      <div className="rounded-lg p-3 border bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Taxa Horária:
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {formatPrice(record.hourly_rate)}
                            /h
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {loading && history.length > 0 && (
          <div
            className="w-full py-6 flex justify-center"
            role="status"
            aria-label="Carregando histórico"
            aria-live="polite"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            <span className="sr-only">Carregando histórico...</span>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            <Button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1 || loading}
              variant="outline"
              size="sm"
              aria-label="Página anterior"
            >
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Página
              {' '}
              {pagination.currentPage}
              {' '}
              de
              {' '}
              {totalPages}
            </span>
            <Button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === totalPages || loading}
              variant="outline"
              size="sm"
              aria-label="Próxima página"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
