import type { ActiveVehicle } from '@/services/vehicle/types';
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useVehiclePolling } from '@/hooks/useVehiclePolling';
import { listActiveVehicles } from '@/services/vehicle/vehicleService';

vi.mock('@/services/vehicle/vehicleService', () => ({
  listActiveVehicles: vi.fn(),
}));

describe('useVehiclePolling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockActiveVehicles: ActiveVehicle[] = [
    {
      vehicle: {
        id: 'vehicle-1',
        plate: 'ABC1234',
        name: 'Meu Carro',
        country: 'BR',
      },
      company: {
        id: 'company-1',
        name: 'Estacionamento Teste',
        address: 'Rua Teste, 123',
      },
      current_price_cents: 500,
    },
  ];

  describe('initialization', () => {
    it('should fetch active vehicles on mount', async () => {
      vi.mocked(listActiveVehicles).mockResolvedValue(mockActiveVehicles);

      const { result } = renderHook(() => useVehiclePolling());

      expect(result.current.loading).toBe(true);
      expect(result.current.activeVehicles).toEqual([]);

      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 },
      );

      expect(listActiveVehicles).toHaveBeenCalledTimes(1);
      expect(result.current.activeVehicles).toEqual(mockActiveVehicles);
      expect(result.current.error).toBeNull();
    });
  });

  describe('manual refresh', () => {
    it('should allow manual refresh', async () => {
      vi.mocked(listActiveVehicles).mockResolvedValue(mockActiveVehicles);

      const { result } = renderHook(() => useVehiclePolling());
      await waitFor(
        () => {
          expect(listActiveVehicles).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 },
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(listActiveVehicles).toHaveBeenCalledTimes(2);
    });

    it('should update data on manual refresh', async () => {
      const initialVehicles = mockActiveVehicles;
      const updatedVehicles: ActiveVehicle[] = [
        ...mockActiveVehicles,
        {
          vehicle: {
            id: 'vehicle-2',
            plate: 'XYZ5678',
            name: 'Outro Carro',
            country: 'BR',
          },
          company: {
            id: 'company-2',
            name: 'Outro Estacionamento',
            address: 'Rua Outra, 456',
          },
          current_price_cents: 300,
        },
      ];

      vi.mocked(listActiveVehicles)
        .mockResolvedValueOnce(initialVehicles)
        .mockResolvedValueOnce(updatedVehicles);

      const { result } = renderHook(() => useVehiclePolling());
      await waitFor(
        () => {
          expect(result.current.activeVehicles).toEqual(initialVehicles);
        },
        { timeout: 3000 },
      );

      await act(async () => {
        await result.current.refresh();
      });

      expect(result.current.activeVehicles).toEqual(updatedVehicles);
    });
  });

  describe('error handling', () => {
    it('should handle errors during fetch', async () => {
      const errorMessage = 'Erro de conexão';

      vi.mocked(listActiveVehicles).mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useVehiclePolling());
      await waitFor(
        () => {
          expect(result.current.loading).toBe(false);
        },
        { timeout: 3000 },
      );

      expect(result.current.error).toBe(errorMessage);
      expect(result.current.activeVehicles).toEqual([]);
    });

    it('should preserve last successful data on error', async () => {
      vi.mocked(listActiveVehicles)
        .mockResolvedValueOnce(mockActiveVehicles)
        .mockRejectedValueOnce(new Error('Erro'));

      const { result } = renderHook(() => useVehiclePolling());
      await waitFor(
        () => {
          expect(result.current.activeVehicles).toEqual(mockActiveVehicles);
        },
        { timeout: 3000 },
      );

      await act(async () => {
        await result.current.refresh();
      });

      await waitFor(
        () => {
          expect(result.current.error).toBeTruthy();
        },
        { timeout: 3000 },
      );

      expect(result.current.activeVehicles).toEqual(mockActiveVehicles);
    });
  });

  describe('cleanup', () => {
    it('should cleanup on unmount', async () => {
      vi.mocked(listActiveVehicles).mockResolvedValue(mockActiveVehicles);

      const { unmount } = renderHook(() => useVehiclePolling());
      await waitFor(
        () => {
          expect(listActiveVehicles).toHaveBeenCalledTimes(1);
        },
        { timeout: 3000 },
      );

      unmount();
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(listActiveVehicles).toHaveBeenCalledTimes(1);
    });
  });
});
