import type { Vehicle } from '@/services/vehicle/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VehicleCard from '@/components/vehicle/VehicleCard';

describe('vehicleCard', () => {
  const mockVehicle: Vehicle = {
    id: 'vehicle-1',
    plate: 'ABC-1234',
    name: 'Meu Carro',
    model: 'Civic',
    year: 2020,
    color: 'Branco',
    country: 'BR',
  };

  const mockVehicleMinimal: Vehicle = {
    id: 'vehicle-2',
    plate: 'XYZ-5678',
    name: 'Moto',
    country: 'BR',
  };

  it('should render vehicle information correctly', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.getByText('Meu Carro')).toBeInTheDocument();
    expect(screen.getByText('ABC-1234')).toBeInTheDocument();
    expect(screen.getByText('Civic')).toBeInTheDocument();
    expect(screen.getByText('2020')).toBeInTheDocument();
    expect(screen.getByText('Branco')).toBeInTheDocument();
  });

  it('should render minimal vehicle information', () => {
    render(<VehicleCard vehicle={mockVehicleMinimal} />);

    expect(screen.getByText('Moto')).toBeInTheDocument();
    expect(screen.getByText('XYZ-5678')).toBeInTheDocument();
  });

  it('should call onViewMetrics when "Ver Métricas" button is clicked', async () => {
    const user = userEvent.setup();
    const onViewMetrics = vi.fn();

    render(<VehicleCard vehicle={mockVehicle} onViewMetrics={onViewMetrics} />);

    const button = screen.getByLabelText(/ver métricas do veículo/i);

    await user.click(button);

    expect(onViewMetrics).toHaveBeenCalledTimes(1);
    expect(onViewMetrics).toHaveBeenCalledWith(mockVehicle);
  });

  it('should call onDelete when "Remover" button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();

    render(<VehicleCard vehicle={mockVehicle} onDelete={onDelete} />);

    const button = screen.getByLabelText(/remover veículo/i);

    await user.click(button);

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(mockVehicle);
  });

  it('should not render "Ver Métricas" button when onViewMetrics is not provided', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.queryByText('Ver Métricas')).not.toBeInTheDocument();
  });

  it('should not render "Remover" button when onDelete is not provided', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.queryByText('Remover')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    const article = screen.getByRole('article');

    expect(article).toHaveAttribute('aria-label', 'Veículo Meu Carro');
  });

  it('should display country code when available', () => {
    render(<VehicleCard vehicle={mockVehicle} />);

    expect(screen.getByText('(BR)')).toBeInTheDocument();
  });

  it('should handle keyboard navigation', async () => {
    const user = userEvent.setup();
    const onViewMetrics = vi.fn();

    render(<VehicleCard vehicle={mockVehicle} onViewMetrics={onViewMetrics} />);

    const button = screen.getByLabelText(/ver métricas do veículo/i);

    button.focus();

    expect(button).toHaveFocus();

    await user.keyboard('{Enter}');

    expect(onViewMetrics).toHaveBeenCalled();
  });

  it('should render with all optional fields', () => {
    const fullVehicle: Vehicle = {
      id: 'vehicle-3',
      plate: 'DEF-9012',
      name: 'Carro Completo',
      model: 'Corolla',
      year: 2021,
      color: 'Preto',
      country: 'BR',
    };

    render(<VehicleCard vehicle={fullVehicle} />);

    expect(screen.getByText('Carro Completo')).toBeInTheDocument();
    expect(screen.getByText('DEF-9012')).toBeInTheDocument();
    expect(screen.getByText('Corolla')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByText('Preto')).toBeInTheDocument();
  });
});
