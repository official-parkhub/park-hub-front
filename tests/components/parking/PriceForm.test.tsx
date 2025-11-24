import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PriceForm from '@/components/parking/PriceForm';
import { createParkingPrice } from '@/services/company/priceService';
import { toastError, toastSuccess } from '@/utils/toast';

vi.mock('@/services/company/priceService');
vi.mock('@/utils/toast');

describe('priceForm', () => {
  const mockCompanyId = 'company-1';
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByLabelText(/dia da semana/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de início/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de fim/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/é desconto/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByRole('button', { name: /criar preço/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should prevent submission when required fields are missing', async () => {
      const user = userEvent.setup();

      vi.mocked(createParkingPrice).mockResolvedValue(undefined);
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByRole('button', { name: /criar preço/i });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPrice).not.toHaveBeenCalled();
      });
    });

    it('should show validation error when start_hour is out of range', async () => {
      const user = userEvent.setup();

      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '25');
      const submitButton = screen.getByRole('button', { name: /criar preço/i });

      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/horário de início deve ser entre 0 e 23/i),
        ).toBeInTheDocument();
      });
    });

    it('should show validation error when end_hour is less than start_hour', async () => {
      const user = userEvent.setup();

      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '10');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '8');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', { name: /criar preço/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/horário de início deve ser menor que horário de fim/i),
        ).toBeInTheDocument();
      });
    });
    it('should show validation error when price is negative', async () => {
      const user = userEvent.setup();
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '-1.00');
      const submitButton = screen.getByRole('button', { name: /criar preço/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/preço deve ser maior ou igual a zero/i),
        ).toBeInTheDocument();
      });
    });
    it('should clear validation errors when field is corrected', async () => {
      const user = userEvent.setup();
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      const startHourInput = screen.getByLabelText(/horário de início/i);
      const submitButton = screen.getByRole('button', { name: /criar preço/i });
      await user.type(startHourInput, '25');
      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/horário de início deve ser entre 0 e 23/i),
        ).toBeInTheDocument();
      });
      await user.clear(startHourInput);
      await user.type(startHourInput, '8');
      await waitFor(() => {
        expect(
          screen.queryByText(/horário de início deve ser entre 0 e 23/i),
        ).not.toBeInTheDocument();
      });
    });
  });
  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      vi.mocked(createParkingPrice).mockResolvedValue(undefined);
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', { name: /criar preço/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPrice).toHaveBeenCalledWith(mockCompanyId, {
          week_day: 0,
          start_hour: 8,
          end_hour: 18,
          price_cents: 1000,
          is_discount: false,
        });
      });
      expect(toastSuccess).toHaveBeenCalledWith('Preço criado com sucesso!');
      expect(mockOnSuccess).toHaveBeenCalled();
    });
    it('should submit form with is_discount checked', async () => {
      const user = userEvent.setup();
      vi.mocked(createParkingPrice).mockResolvedValue(undefined);
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '5.00');
      const discountCheckbox = screen.getByLabelText(/é desconto/i);
      await user.click(discountCheckbox);
      const submitButton = screen.getByRole('button', { name: /criar preço/i });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPrice).toHaveBeenCalledWith(mockCompanyId, {
          week_day: 0,
          start_hour: 8,
          end_hour: 18,
          price_cents: 500,
          is_discount: true,
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();
      let resolveCreatePrice: () => void;
      const createPricePromise = new Promise<void>((resolve) => {
        resolveCreatePrice = resolve;
      });

      vi.mocked(createParkingPrice).mockReturnValue(createPricePromise);
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', { name: /criar preço/i });
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /criando/i })).toBeInTheDocument();
      });
      expect(submitButton).toBeDisabled();
      resolveCreatePrice!();
      await createPricePromise;
    });
    it('should handle API errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Erro ao criar preço';
      vi.mocked(createParkingPrice).mockRejectedValue(new Error(errorMessage));
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', { name: /criar preço/i });

      await user.click(submitButton);
      await waitFor(() => {
        expect(toastError).toHaveBeenCalledWith(errorMessage);
      });
      expect(screen.getByLabelText(/dia da semana/i)).toBeInTheDocument();
    });
  });

  describe('form cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalled();
    });

    it('should call onCancel when form is cancelled', async () => {
      const user = userEvent.setup();

      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const weekDaySelect = screen.getByLabelText(/dia da semana/i);
      await user.selectOptions(weekDaySelect, '0');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all fields', () => {
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByLabelText(/dia da semana/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de início/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de fim/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/é desconto/i)).toBeInTheDocument();
    });

    it('should associate error messages with fields via aria-describedby', async () => {
      const user = userEvent.setup();
      render(
        <PriceForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByRole('button', { name: /criar preço/i });
      await user.click(submitButton);
      await waitFor(() => {
        const weekDaySelect = screen.getByLabelText(/dia da semana/i);
        expect(weekDaySelect).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
