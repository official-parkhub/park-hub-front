import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VehiclesPage from '@/app/vehicles/page';
import { getCurrentUser } from '@/services/auth/authService';
import { deleteVehicle } from '@/services/vehicle/vehicleService';
import { toastError, toastSuccess } from '@/utils/toast';
import { getToken } from '@/utils/tokenStorage';

vi.mock('@/utils/tokenStorage', () => ({
  getToken: vi.fn(),
}));

vi.mock('@/services/auth/authService', () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock('@/services/vehicle/vehicleService', () => ({
  deleteVehicle: vi.fn(),
}));

vi.mock('@/utils/toast', () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock('@/components/layout/Header', () => ({
  default: ({ currentPath }: { currentPath?: string }) => (
    <header data-testid="header" data-current-path={currentPath}>
      Header
    </header>
  ),
}));

vi.mock('@/components/vehicle/VehicleList', () => ({
  default: ({
    onViewMetrics,
    onDelete,
    onAddVehicle,
  }: {
    onViewMetrics?: (vehicle: any) => void;
    onDelete?: (vehicle: any) => void;
    onAddVehicle?: () => void;
  }) => (
    <div data-testid="vehicle-list">
      <button
        type="button"
        onClick={() =>
          onViewMetrics?.({
            id: 'vehicle-1',
            plate: 'ABC1234',
            name: 'Meu Carro',
          })}
      >
        View Metrics
      </button>
      <button
        type="button"
        onClick={() =>
          onDelete?.({
            id: 'vehicle-1',
            plate: 'ABC1234',
            name: 'Meu Carro',
          })}
      >
        Delete Vehicle
      </button>
      <button type="button" onClick={() => onAddVehicle?.()}>
        Add Vehicle
      </button>
    </div>
  ),
}));

vi.mock('@/components/vehicle/ActiveVehiclesSection', () => ({
  default: () => <div data-testid="active-vehicles-section">Active Vehicles</div>,
}));

vi.mock('@/components/vehicle/VehicleForm', () => ({
  default: ({
    open,
    onOpenChange,
    onSuccess,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess?: () => void;
  }) => (
    <div data-testid="vehicle-form" data-open={open}>
      <button type="button" onClick={() => onOpenChange(false)}>
        Close Form
      </button>
      <button type="button" onClick={() => onSuccess?.()}>
        Success
      </button>
    </div>
  ),
}));

vi.mock('@/components/vehicle/VehicleMetricsModal', () => ({
  default: ({
    open,
    onOpenChange,
    vehiclePlate,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    vehiclePlate: string | null;
  }) => (
    <div data-testid="vehicle-metrics-modal" data-open={open} data-plate={vehiclePlate}>
      <button type="button" onClick={() => onOpenChange(false)}>
        Close Metrics
      </button>
    </div>
  ),
}));

vi.mock('@/components/vehicle/DeleteVehicleDialog', () => ({
  default: ({
    open,
    onOpenChange,
    onConfirm,
    vehicle,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    vehicle: any;
  }) => (
    <div data-testid="delete-vehicle-dialog" data-open={open}>
      {vehicle && <span>{vehicle.name}</span>}
      <button type="button" onClick={() => onOpenChange(false)}>
        Cancel Delete
      </button>
      <button type="button" onClick={() => onConfirm()}>
        Confirm Delete
      </button>
    </div>
  ),
}));

describe('vehiclesPage', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.doMock('next/navigation', () => ({
      useRouter: () => mockRouter,
      usePathname: () => '/vehicles',
    }));
  });

  describe('authentication and access control', () => {
    it('should allow access when user is driver', async () => {
      vi.mocked(getToken).mockReturnValue('valid-token');
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        is_admin: false,
        customer: {
          id: 'customer-1',
          user_id: 'user-1',
          first_name: 'Test',
          last_name: 'User',
          birth_date: '1990-01-01',
        },
        organization: null,
      });
      render(<VehiclesPage />);
      await waitFor(() => {
        expect(screen.getByText('Meus Veículos')).toBeInTheDocument();
      });
    });
  });

  describe('page rendering', () => {
    beforeEach(async () => {
      vi.mocked(getToken).mockReturnValue('valid-token');
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        is_admin: false,
        customer: {
          id: 'customer-1',
          user_id: 'user-1',
          first_name: 'Test',
          last_name: 'User',
          birth_date: '1990-01-01',
        },
        organization: null,
      });
    });

    it('should render header with current path', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        const header = screen.getByTestId('header');
        expect(header).toBeInTheDocument();
        expect(header).toHaveAttribute('data-current-path', '/vehicles');
      });
    });

    it('should render page title', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        expect(screen.getByText('Meus Veículos')).toBeInTheDocument();
      });
    });

    it('should render all vehicle components', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        expect(screen.getByTestId('active-vehicles-section')).toBeInTheDocument();
        expect(screen.getByTestId('vehicle-list')).toBeInTheDocument();
      });
    });

    it('should have proper semantic structure', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
        expect(main).toHaveAttribute('id', 'main-content');
      });
    });
  });

  describe('user interactions', () => {
    beforeEach(async () => {
      vi.mocked(getToken).mockReturnValue('valid-token');
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        is_admin: false,
        customer: {
          id: 'customer-1',
          user_id: 'user-1',
          first_name: 'Test',
          last_name: 'User',
          birth_date: '1990-01-01',
        },
        organization: null,
      });
    });

    it('should open form when add vehicle is triggered from list', async () => {
      const user = userEvent.setup();
      render(<VehiclesPage />);
      await waitFor(() => {
        expect(screen.getByTestId('vehicle-list')).toBeInTheDocument();
      });
      const addButton = screen.getByText('Add Vehicle');
      await user.click(addButton);
      const form = screen.getByTestId('vehicle-form');
      expect(form).toHaveAttribute('data-open', 'true');
    });

    it('should open metrics modal when view metrics is clicked', async () => {
      const user = userEvent.setup();

      render(<VehiclesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-list')).toBeInTheDocument();
      });

      const viewMetricsButton = screen.getByText('View Metrics');
      await user.click(viewMetricsButton);
      const modal = screen.getByTestId('vehicle-metrics-modal');

      expect(modal).toHaveAttribute('data-open', 'true');
      expect(modal).toHaveAttribute('data-plate', 'ABC1234');
    });

    it('should open delete dialog when delete is clicked', async () => {
      const user = userEvent.setup();

      render(<VehiclesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-list')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete Vehicle');
      await user.click(deleteButton);
      const dialog = screen.getByTestId('delete-vehicle-dialog');

      expect(dialog).toHaveAttribute('data-open', 'true');
      expect(screen.getByText('Meu Carro')).toBeInTheDocument();
    });

    it('should delete vehicle and refresh list when confirmed', async () => {
      const user = userEvent.setup();

      vi.mocked(deleteVehicle).mockResolvedValue(undefined);

      render(<VehiclesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-list')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete Vehicle');
      await user.click(deleteButton);
      const confirmButton = screen.getByText('Confirm Delete');
      await user.click(confirmButton);

      await waitFor(() => {
        expect(deleteVehicle).toHaveBeenCalledWith('vehicle-1');
        expect(toastSuccess).toHaveBeenCalledWith('Veículo removido com sucesso!');

        const dialog = screen.getByTestId('delete-vehicle-dialog');

        expect(dialog).toHaveAttribute('data-open', 'false');
      });
    });

    it('should show error toast when delete fails', async () => {
      const user = userEvent.setup();

      vi.mocked(deleteVehicle).mockRejectedValue(new Error('Erro ao remover veículo'));

      render(<VehiclesPage />);

      await waitFor(() => {
        expect(screen.getByTestId('vehicle-list')).toBeInTheDocument();
      });

      const deleteButton = screen.getByText('Delete Vehicle');
      await user.click(deleteButton);
      const confirmButton = screen.getByText('Confirm Delete');
      await user.click(confirmButton);
      await waitFor(() => {
        expect(toastError).toHaveBeenCalledWith('Erro ao remover veículo');
      });
    });
  });

  describe('accessibility', () => {
    beforeEach(async () => {
      vi.mocked(getToken).mockReturnValue('valid-token');
      vi.mocked(getCurrentUser).mockResolvedValue({
        id: 'user-1',
        email: 'test@example.com',
        is_admin: false,
        customer: {
          id: 'customer-1',
          user_id: 'user-1',
          first_name: 'Test',
          last_name: 'User',
          birth_date: '1990-01-01',
        },
        organization: null,
      });
    });

    it('should have proper main landmark', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        const main = screen.getByRole('main');
        expect(main).toBeInTheDocument();
        expect(main).toHaveAttribute('id', 'main-content');
      });
    });

    it('should have proper heading structure', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        const heading = screen.getByRole('heading', { name: /meus veículos/i });
        expect(heading).toBeInTheDocument();
        expect(heading.tagName).toBe('H1');
      });
    });

    it('should have accessible button labels', async () => {
      render(<VehiclesPage />);
      await waitFor(() => {
        const addButton = screen.getByRole('button', {
          name: /adicionar novo veículo/i,
        });
        expect(addButton).toBeInTheDocument();
      });
    });
  });
});
