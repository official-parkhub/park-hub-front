import type { VehicleMetrics } from '@/services/vehicle/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VehicleMetricsModal from '@/components/vehicle/VehicleMetricsModal';
import { getVehicleMetrics } from '@/services/vehicle/vehicleService';

vi.mock('@/services/vehicle/vehicleService');

describe('vehicleMetricsModal', () => {
  const mockMetrics: VehicleMetrics = {
    total_parking_time_minutes: 120,
    total_parkings: 5,
    total_cost_cents: 5000,
    average_parking_time_minutes: 24,
    last_parking_date: '2024-01-15T10:30:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should display vehicle plate in title', () => {
      vi.mocked(getVehicleMetrics).mockResolvedValue(mockMetrics);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      expect(screen.getByText(/ABC1234/i)).toBeInTheDocument();
    });
  });

  describe('metrics fetching', () => {
    it('should fetch metrics when modal opens', async () => {
      vi.mocked(getVehicleMetrics).mockResolvedValue(mockMetrics);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(getVehicleMetrics).toHaveBeenCalledWith('ABC1234');
      });
    });

    it('should not fetch metrics when modal is closed', () => {
      render(
        <VehicleMetricsModal
          open={false}
          onOpenChange={vi.fn()}
          vehiclePlate="ABC1234"
        />,
      );

      expect(getVehicleMetrics).not.toHaveBeenCalled();
    });

    it('should not fetch metrics when vehiclePlate is null', () => {
      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate={null} />,
      );

      expect(getVehicleMetrics).not.toHaveBeenCalled();
    });

    it('should refetch metrics when vehiclePlate changes', async () => {
      vi.mocked(getVehicleMetrics).mockResolvedValue(mockMetrics);

      const { rerender } = render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(getVehicleMetrics).toHaveBeenCalledWith('ABC1234');
      });

      vi.clearAllMocks();

      rerender(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="XYZ5678" />,
      );

      await waitFor(() => {
        expect(getVehicleMetrics).toHaveBeenCalledWith('XYZ5678');
      });
    });
  });

  describe('loading state', () => {
    it('should show loading indicator while fetching metrics', () => {
      vi.mocked(getVehicleMetrics).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockMetrics), 100);
          }),
      );

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      expect(screen.getByLabelText(/carregando métricas/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide loading indicator after metrics load', async () => {
      vi.mocked(getVehicleMetrics).mockResolvedValue(mockMetrics);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.queryByLabelText(/carregando métricas/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Veículo não encontrado';

      vi.mocked(getVehicleMetrics).mockRejectedValue(new Error(errorMessage));

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show close button on error', async () => {
      vi.mocked(getVehicleMetrics).mockRejectedValue(
        new Error('Erro ao buscar métricas'),
      );

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /fechar/i })).toBeInTheDocument();
      });
    });
  });

  describe('metrics rendering', () => {
    it('should format numbers with thousands separator', async () => {
      const metricsWithLargeNumber: VehicleMetrics = {
        total_cost_cents: 50000,
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithLargeNumber);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/50\.000/)).toBeInTheDocument();
      });
    });

    it('should format dates correctly', async () => {
      const metricsWithDate: VehicleMetrics = {
        last_parking_date: '2024-01-15T10:30:00Z',
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithDate);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        const dateElement = screen.getByText(/15\/01\/2024/);
        expect(dateElement).toBeInTheDocument();
      });
    });

    it('should handle nested objects', async () => {
      const metricsWithNested: VehicleMetrics = {
        statistics: {
          total_parkings: 10,
          average_time: 30,
        },
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithNested);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/statistics/i)).toBeInTheDocument();
        expect(screen.getByText(/total parkings/i)).toBeInTheDocument();
        expect(screen.getByText(/10/)).toBeInTheDocument();
      });
    });

    it('should handle empty metrics', async () => {
      vi.mocked(getVehicleMetrics).mockResolvedValue({});

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/nenhuma métrica disponível/i)).toBeInTheDocument();
      });
    });

    it('should format boolean values', async () => {
      const metricsWithBoolean: VehicleMetrics = {
        is_active: true,
        has_parking: false,
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithBoolean);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/sim/i)).toBeInTheDocument();
        expect(screen.getByText(/não/i)).toBeInTheDocument();
      });
    });
  });

  describe('modal closing', () => {
    it('should call onOpenChange when modal is closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      vi.mocked(getVehicleMetrics).mockResolvedValue(mockMetrics);

      render(
        <VehicleMetricsModal
          open={true}
          onOpenChange={onOpenChange}
          vehiclePlate="ABC1234"
        />,
      );

      const closeButton = screen.getByRole('button', { name: /close/i });
      await user.click(closeButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should clear metrics when modal closes', async () => {
      vi.mocked(getVehicleMetrics).mockResolvedValue(mockMetrics);

      const { rerender } = render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/total parking time minutes/i)).toBeInTheDocument();
      });

      rerender(
        <VehicleMetricsModal
          open={false}
          onOpenChange={vi.fn()}
          vehiclePlate="ABC1234"
        />,
      );

      rerender(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );
      expect(screen.getByLabelText(/carregando métricas/i)).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for loading state', () => {
      vi.mocked(getVehicleMetrics).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockMetrics), 100);
          }),
      );

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      const status = screen.getByRole('status');

      expect(status).toHaveAttribute('aria-label', 'Carregando métricas');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA labels for error state', async () => {
      vi.mocked(getVehicleMetrics).mockRejectedValue(
        new Error('Erro ao buscar métricas'),
      );

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });
    });
  });

  describe('edge cases', () => {
    it('should handle null values', async () => {
      const metricsWithNull: VehicleMetrics = {
        total_parkings: null as unknown as number,
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithNull);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/N\/A/i)).toBeInTheDocument();
      });
    });

    it('should handle undefined values', async () => {
      const metricsWithUndefined: VehicleMetrics = {
        total_parkings: undefined as unknown as number,
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithUndefined);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/N\/A/i)).toBeInTheDocument();
      });
    });

    it('should handle empty arrays', async () => {
      const metricsWithEmptyArray: VehicleMetrics = {
        recent_parkings: [],
      };

      vi.mocked(getVehicleMetrics).mockResolvedValue(metricsWithEmptyArray);

      render(
        <VehicleMetricsModal open={true} onOpenChange={vi.fn()} vehiclePlate="ABC1234" />,
      );

      await waitFor(() => {
        expect(screen.getByText(/vazio/i)).toBeInTheDocument();
      });
    });
  });
});
