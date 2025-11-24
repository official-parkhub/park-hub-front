'use client';

import type { ActiveVehicle } from '@/services/vehicle/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { listActiveVehicles } from '@/services/vehicle/vehicleService';

type UseActiveVehiclesReturn = {
  activeVehicles: ActiveVehicle[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useVehiclePolling(): UseActiveVehiclesReturn {
  const [activeVehicles, setActiveVehicles] = useState<ActiveVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef<boolean>(true);

  const fetchActiveVehicles = useCallback(async () => {
    if (!isMountedRef.current) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const vehicles = await listActiveVehicles();

      if (isMountedRef.current) {
        setActiveVehicles(vehicles);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const errorMessage
          = err instanceof Error ? err.message : 'Erro ao buscar veículos ativos';
        setError(errorMessage);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchActiveVehicles();
  }, [fetchActiveVehicles]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchActiveVehicles();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchActiveVehicles]);

  return {
    activeVehicles,
    loading,
    error,
    refresh,
  };
}
