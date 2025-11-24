import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import VehicleForm from '@/components/vehicle/VehicleForm';
import { createVehicle } from '@/services/vehicle/vehicleService';

vi.mock('@/services/vehicle/vehicleService');
vi.mock('@/utils/toast');
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

describe('vehicleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should not render when open is false', () => {
      render(<VehicleForm open={false} onOpenChange={vi.fn()} />);

      expect(screen.queryByText('Adicionar Veículo')).not.toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      expect(screen.getByLabelText(/placa/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apelido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/modelo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ano/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/país/i)).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      const plateLabel = screen.getByText(/placa/i);
      const nameLabel = screen.getByText(/apelido/i);

      expect(plateLabel).toHaveTextContent('*');
      expect(nameLabel).toHaveTextContent('*');
    });
  });

  describe('validation', () => {
    it('should show validation error when plate is empty', async () => {
      const user = userEvent.setup();

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/placa é obrigatória/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when name is empty', async () => {
      const user = userEvent.setup();

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      const plateInput = screen.getByLabelText(/placa/i);

      await user.type(plateInput, 'ABC1234');

      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/apelido é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when year is out of range', async () => {
      const user = userEvent.setup();

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      const plateInput = screen.getByLabelText(/placa/i);
      await user.type(plateInput, 'ABC1234');
      const nameInput = screen.getByLabelText(/apelido/i);
      await user.type(nameInput, 'Test Vehicle');
      const yearInput = screen.getByLabelText(/ano/i);
      await user.type(yearInput, '1899');
      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/ano deve ser entre 1900 e 2100/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when field is corrected', async () => {
      const user = userEvent.setup();

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      const plateInput = screen.getByLabelText(/placa/i);
      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/placa é obrigatória/i)).toBeInTheDocument();
      });

      await user.type(plateInput, 'ABC1234');
      await waitFor(() => {
        expect(screen.queryByText(/placa é obrigatória/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('form submission', () => {
    it('should submit form with all optional fields', async () => {
      const user = userEvent.setup();

      vi.mocked(createVehicle).mockResolvedValue(undefined);

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      await user.type(screen.getByLabelText(/placa/i), 'ABC1234');
      await user.type(screen.getByLabelText(/apelido/i), 'Meu Carro');
      await user.type(screen.getByLabelText(/modelo/i), 'Honda Civic');
      await user.type(screen.getByLabelText(/ano/i), '2020');
      await user.type(screen.getByLabelText(/cor/i), 'Branco');
      await user.clear(screen.getByLabelText(/país/i));
      await user.type(screen.getByLabelText(/país/i), 'BR');

      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createVehicle).toHaveBeenCalledWith({
          name: 'Meu Carro',
          vehicle: {
            plate: 'ABC1234',
            model: 'Honda Civic',
            year: 2020,
            color: 'Branco',
            country: 'BR',
          },
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      let resolveCreateVehicle: () => void;

      const createVehiclePromise = new Promise<void>((resolve) => {
        resolveCreateVehicle = resolve;
      });

      vi.mocked(createVehicle).mockReturnValue(createVehiclePromise);

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      await user.type(screen.getByLabelText(/placa/i), 'ABC1234');
      await user.type(screen.getByLabelText(/apelido/i), 'Meu Carro');

      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /adicionando/i })).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();
      resolveCreateVehicle!();
      await createVehiclePromise;
    });
  });

  describe('form cancellation', () => {
    it('should close form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<VehicleForm open={true} onOpenChange={onOpenChange} />);

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should clear form when closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <VehicleForm open={true} onOpenChange={onOpenChange} />,
      );

      await user.type(screen.getByLabelText(/placa/i), 'ABC1234');
      await user.type(screen.getByLabelText(/apelido/i), 'Meu Carro');
      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      rerender(<VehicleForm open={true} onOpenChange={onOpenChange} />);

      const plateInput = screen.getByLabelText(/placa/i) as HTMLInputElement;
      const nameInput = screen.getByLabelText(/apelido/i) as HTMLInputElement;

      expect(plateInput.value).toBe('');
      expect(nameInput.value).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all fields', () => {
      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      expect(screen.getByLabelText(/placa/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/apelido/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/modelo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/ano/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cor/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/país/i)).toBeInTheDocument();
    });

    it('should associate error messages with fields via aria-describedby', async () => {
      const user = userEvent.setup();

      render(<VehicleForm open={true} onOpenChange={vi.fn()} />);

      const submitButton = screen.getByRole('button', {
        name: /adicionar veículo/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        const plateInput = screen.getByLabelText(/placa/i);
        expect(plateInput).toHaveAttribute('aria-describedby', 'plate-error');
        expect(plateInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
