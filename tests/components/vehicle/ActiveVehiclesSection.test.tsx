import type { ActiveVehicle } from '@/services/vehicle/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ActiveVehiclesSection from '@/components/vehicle/ActiveVehiclesSection';
import { useVehiclePolling } from '@/hooks/useVehiclePolling';

vi.mock('@/hooks/useVehiclePolling');

describe('activeVehiclesSection', () => {
  const mockActiveVehicles: ActiveVehicle[] = [
    {
      vehicle: {
        id: 'vehicle-1',
        plate: 'ABC-1234',
        name: 'Meu Carro',
        country: 'BR',
      },
      company: {
        id: 'company-1',
        name: 'Estacionamento Central',
        address: 'Rua Principal, 123',
      },
      current_price_cents: 500,
    },
    {
      vehicle: {
        id: 'vehicle-2',
        plate: 'XYZ-5678',
        name: 'Moto',
        country: 'BR',
      },
      company: {
        id: 'company-2',
        name: 'Estacionamento Shopping',
        address: 'Av. Comercial, 456',
      },
      current_price_cents: 750,
    },
  ];

  const mockRefresh = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useVehiclePolling).mockReturnValue({
      activeVehicles: [],
      loading: false,
      error: null,
      refresh: mockRefresh,
    });
  });

  describe('loading state', () => {
    it('should show loading indicator on initial load', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByLabelText(/carregando veículos ativos/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should show section title even when loading', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText('Veículos Ativos')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should display error message when API call fails', () => {
      const errorMessage = 'Erro ao carregar veículos ativos';

      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: false,
        error: errorMessage,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show retry button on error', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: false,
        error: 'Erro ao carregar veículos ativos',
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(
        screen.getByRole('button', { name: /tentar novamente/i }),
      ).toBeInTheDocument();
    });

    it('should call refresh when retry button is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: false,
        error: 'Erro ao carregar veículos ativos',
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const retryButton = screen.getByRole('button', {
        name: /tentar novamente/i,
      });

      await user.click(retryButton);

      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  describe('empty state', () => {
    it('should display empty state message when no active vehicles', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(
        screen.getByText(/nenhum veículo estacionado no momento/i),
      ).toBeInTheDocument();
    });

    it('should show section title in empty state', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [],
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText('Veículos Ativos')).toBeInTheDocument();
    });
  });

  describe('active vehicles rendering', () => {
    it('should render list of active vehicles', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText('Meu Carro')).toBeInTheDocument();
      expect(screen.getByText('ABC-1234')).toBeInTheDocument();
      expect(screen.getByText('Moto')).toBeInTheDocument();
      expect(screen.getByText('XYZ-5678')).toBeInTheDocument();
    });

    it('should display parking lot information', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText('Estacionamento Central')).toBeInTheDocument();
      expect(screen.getByText('Rua Principal, 123')).toBeInTheDocument();
      expect(screen.getByText('Estacionamento Shopping')).toBeInTheDocument();
      expect(screen.getByText('Av. Comercial, 456')).toBeInTheDocument();
    });

    it('should display active badge for each vehicle', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const badges = screen.getAllByText('Ativo');

      expect(badges).toHaveLength(2);
    });

    it('should render vehicles in grid layout', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      const { container } = render(<ActiveVehiclesSection />);
      const list = container.querySelector('[role="list"]');

      expect(list).toBeInTheDocument();
      expect(list).toHaveClass('grid');
    });
  });

  describe('price formatting', () => {
    it('should format price correctly in Brazilian Real', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText(/R\$\s*5,00/i)).toBeInTheDocument();
      expect(screen.getByText(/R\$\s*7,50/i)).toBeInTheDocument();
    });

    it('should handle missing price', () => {
      const vehicleWithoutPrice: ActiveVehicle = {
        vehicle: {
          id: 'vehicle-3',
          plate: 'DEF-9012',
          name: 'Carro Sem Preço',
          country: 'BR',
        },
        company: {
          id: 'company-3',
          name: 'Estacionamento Teste',
          address: 'Rua Teste, 789',
        },
      };

      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [vehicleWithoutPrice],
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText(/preço não disponível/i)).toBeInTheDocument();
    });

    it('should format zero price correctly', () => {
      const vehicleWithZeroPrice: ActiveVehicle = {
        vehicle: {
          id: 'vehicle-4',
          plate: 'GHI-3456',
          name: 'Carro Grátis',
          country: 'BR',
        },
        company: {
          id: 'company-4',
          name: 'Estacionamento Grátis',
          address: 'Rua Grátis, 000',
        },
        current_price_cents: 0,
      };

      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: [vehicleWithZeroPrice],
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByText(/R\$\s*0,00/i)).toBeInTheDocument();
    });
  });

  describe('refresh functionality', () => {
    it('should display refresh button', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByRole('button', { name: /atualizar/i })).toBeInTheDocument();
    });

    it('should call refresh when refresh button is clicked', async () => {
      const user = userEvent.setup();

      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const refreshButton = screen.getByRole('button', { name: /atualizar/i });
      await user.click(refreshButton);
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });

    it('should disable refresh button when loading', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const refreshButton = screen.getByRole('button', { name: /atualizar/i });

      expect(refreshButton).toBeDisabled();
    });

    it('should show loading indicator during refresh', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: true,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);
      expect(screen.getByLabelText(/atualizando veículos ativos/i)).toBeInTheDocument();
    });
  });

  describe('hook integration', () => {
    it('should call useVehiclePolling without parameters', () => {
      render(<ActiveVehiclesSection />);
      expect(useVehiclePolling).toHaveBeenCalledWith();
    });

    it('should update when polling returns new data', () => {
      const { rerender } = render(<ActiveVehiclesSection />);

      expect(
        screen.getByText(/nenhum veículo estacionado no momento/i),
      ).toBeInTheDocument();

      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });
      rerender(<ActiveVehiclesSection />);
      expect(screen.getByText('Meu Carro')).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have proper ARIA labels for section', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const section = screen.getByRole('region', { name: /veículos ativos/i });

      expect(section).toBeInTheDocument();
    });

    it('should have proper ARIA labels for list', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const list = screen.getByRole('list', {
        name: /lista de veículos ativos/i,
      });
      expect(list).toBeInTheDocument();
    });

    it('should have proper ARIA labels for active badge', () => {
      vi.mocked(useVehiclePolling).mockReturnValue({
        activeVehicles: mockActiveVehicles,
        loading: false,
        error: null,
        refresh: mockRefresh,
      });

      render(<ActiveVehiclesSection />);

      const badges = screen.getAllByLabelText('Veículo ativo');

      expect(badges.length).toBeGreaterThan(0);
    });
  });
});
