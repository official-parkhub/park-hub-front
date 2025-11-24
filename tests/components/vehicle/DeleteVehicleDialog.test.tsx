import type { Vehicle } from '@/services/vehicle/types';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DeleteVehicleDialog from '@/components/vehicle/DeleteVehicleDialog';

describe('deleteVehicleDialog', () => {
  const mockVehicle: Vehicle = {
    id: 'vehicle-1',
    plate: 'ABC-1234',
    name: 'Meu Carro',
    country: 'BR',
  };

  it('should not render when vehicle is null', () => {
    const { container } = render(
      <DeleteVehicleDialog
        vehicle={null}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(container.firstChild).toBeNull();
  });

  it('should not render dialog when open is false', () => {
    render(
      <DeleteVehicleDialog
        vehicle={mockVehicle}
        open={false}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.queryByText('Confirmar Remoção')).not.toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <DeleteVehicleDialog
        vehicle={mockVehicle}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    const dialog = screen.getByRole('alertdialog');

    expect(dialog).toHaveAttribute('aria-labelledby', 'delete-vehicle-title');
    expect(dialog).toHaveAttribute('aria-describedby', 'delete-vehicle-description');
  });

  it('should display vehicle name and plate in confirmation message', () => {
    render(
      <DeleteVehicleDialog
        vehicle={mockVehicle}
        open={true}
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByText(/Meu Carro/)).toBeInTheDocument();
    expect(screen.getByText(/ABC-1234/)).toBeInTheDocument();
  });

  it('should handle keyboard navigation (Escape to close)', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <DeleteVehicleDialog
        vehicle={mockVehicle}
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
      />,
    );

    await user.keyboard('{Escape}');

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
