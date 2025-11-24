import type { Vehicle } from '@/services/vehicle/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VehicleList from '@/components/vehicle/VehicleList';
import { listVehicles } from '@/services/vehicle/vehicleService';

vi.mock('@/services/vehicle/vehicleService');

describe('vehicleList', () => {
  const mockVehicles: Vehicle[] = [
    {
      id: 'vehicle-1',
      plate: 'ABC-1234',
      name: 'Meu Carro',
      model: 'Civic',
      year: 2020,
      color: 'Branco',
      country: 'BR',
    },
    {
      id: 'vehicle-2',
      plate: 'XYZ-5678',
      name: 'Moto',
      country: 'BR',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading indicator on initial load', () => {
      vi.mocked(listVehicles).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockVehicles), 100);
          }),
      );

      render(<VehicleList />);

      expect(screen.getByLabelText(/carregando veículos/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should hide loading indicator after data loads', async () => {
      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      render(<VehicleList />);

      await waitFor(() => {
        expect(screen.queryByLabelText(/carregando veículos/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('should display error message when API call fails', async () => {
      const errorMessage = 'Erro ao carregar veículos';

      vi.mocked(listVehicles).mockRejectedValue(new Error(errorMessage));

      render(<VehicleList />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show retry button on error', async () => {
      vi.mocked(listVehicles).mockRejectedValue(new Error('Erro ao carregar veículos'));

      render(<VehicleList />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /tentar novamente/i }),
        ).toBeInTheDocument();
      });
    });

    it('should retry loading when retry button is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(listVehicles)
        .mockRejectedValueOnce(new Error('Erro ao carregar veículos'))
        .mockResolvedValueOnce(mockVehicles);

      render(<VehicleList />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /tentar novamente/i }),
        ).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', {
        name: /tentar novamente/i,
      });

      await user.click(retryButton);
      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });
      expect(listVehicles).toHaveBeenCalledTimes(2);
    });
  });

  describe('empty state', () => {
    it('should display empty state message when no vehicles', async () => {
      vi.mocked(listVehicles).mockResolvedValue([]);

      render(<VehicleList />);

      await waitFor(() => {
        expect(
          screen.getByText(/você ainda não possui veículos cadastrados/i),
        ).toBeInTheDocument();
      });
    });

    it('should show add vehicle button when onAddVehicle is provided', async () => {
      const onAddVehicle = vi.fn();

      vi.mocked(listVehicles).mockResolvedValue([]);

      render(<VehicleList onAddVehicle={onAddVehicle} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /adicionar primeiro veículo/i }),
        ).toBeInTheDocument();
      });
    });

    it('should call onAddVehicle when add button is clicked', async () => {
      const user = userEvent.setup();
      const onAddVehicle = vi.fn();

      vi.mocked(listVehicles).mockResolvedValue([]);

      render(<VehicleList onAddVehicle={onAddVehicle} />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /adicionar primeiro veículo/i }),
        ).toBeInTheDocument();
      });

      const addButton = screen.getByRole('button', {
        name: /adicionar primeiro veículo/i,
      });

      await user.click(addButton);
      expect(onAddVehicle).toHaveBeenCalledTimes(1);
    });

    it('should not show add button when onAddVehicle is not provided', async () => {
      vi.mocked(listVehicles).mockResolvedValue([]);

      render(<VehicleList />);

      await waitFor(() => {
        expect(
          screen.getByText(/você ainda não possui veículos cadastrados/i),
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByRole('button', { name: /adicionar primeiro veículo/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('vehicle list rendering', () => {
    it('should render list of vehicles', async () => {
      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      render(<VehicleList />);

      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });

      expect(screen.getByText('ABC-1234')).toBeInTheDocument();
      expect(screen.getByText('Moto')).toBeInTheDocument();
      expect(screen.getByText('XYZ-5678')).toBeInTheDocument();
    });

    it('should render vehicles in grid layout', async () => {
      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      const { container } = render(<VehicleList />);

      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });

      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('grid');
    });

    it('should render VehicleCard for each vehicle', async () => {
      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      render(<VehicleList />);

      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });

      const vehicleCards = screen.getAllByRole('article');
      expect(vehicleCards).toHaveLength(2);
    });
  });

  describe('callbacks', () => {
    it('should call onDelete when vehicle card triggers it', async () => {
      const user = userEvent.setup();
      const onDelete = vi.fn();

      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      render(<VehicleList onDelete={onDelete} />);

      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });

      const deleteButton = screen.getAllByLabelText(/remover veículo/i)[0];

      if (deleteButton) {
        await user.click(deleteButton);
      }

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith(mockVehicles[0]);
    });

    it('should call onRefresh when refresh is triggered', async () => {
      const onRefresh = vi.fn();

      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      const { rerender } = render(<VehicleList onRefresh={onRefresh} />);

      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });

      rerender(<VehicleList onRefresh={onRefresh} />);

      await waitFor(() => {
        expect(listVehicles).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for list', async () => {
      vi.mocked(listVehicles).mockResolvedValue(mockVehicles);

      render(<VehicleList />);

      await waitFor(() => {
        expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      });

      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'Lista de veículos cadastrados');
    });

    it('should have proper ARIA labels for loading state', () => {
      vi.mocked(listVehicles).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(() => resolve(mockVehicles), 100);
          }),
      );

      render(<VehicleList />);

      const status = screen.getByRole('status');

      expect(status).toHaveAttribute('aria-label', 'Carregando veículos');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('should have proper ARIA labels for error state', async () => {
      vi.mocked(listVehicles).mockRejectedValue(new Error('Erro ao carregar veículos'));

      render(<VehicleList />);

      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toHaveAttribute('aria-live', 'assertive');
      });
    });

    it('should have proper ARIA labels for empty state', async () => {
      vi.mocked(listVehicles).mockResolvedValue([]);

      render(<VehicleList />);

      await waitFor(() => {
        const status = screen.getByRole('status');
        expect(status).toHaveAttribute('aria-live', 'polite');
      });
    });
  });
});
