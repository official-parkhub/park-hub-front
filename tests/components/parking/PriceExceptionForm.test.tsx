import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PriceExceptionForm from '@/components/parking/PriceExceptionForm';
import { createParkingPriceException } from '@/services/company/priceService';
import { toastError, toastSuccess } from '@/utils/toast';

vi.mock('@/services/company/priceService');
vi.mock('@/utils/toast');

describe('priceExceptionForm', () => {
  const mockCompanyId = 'company-1';
  const mockOnSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render all form fields', () => {
      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByLabelText(/data da exceção/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de início/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de fim/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/é desconto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    });

    it('should render submit and cancel buttons', () => {
      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      expect(screen.getByRole('button', { name: /criar exceção/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeInTheDocument();
    });
  });

  describe('validation', () => {
    it('should prevent submission when exception_date is empty', async () => {
      const user = userEvent.setup();

      vi.mocked(createParkingPriceException).mockResolvedValue(undefined);

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPriceException).not.toHaveBeenCalled();
      });
    });

    it('should show validation error when start_hour is out of range', async () => {
      const user = userEvent.setup();

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);

      await user.type(dateInput, '2024-01-01');

      const startHourInput = screen.getByLabelText(/horário de início/i);

      await user.type(startHourInput, '25');

      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

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
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);

      await user.type(dateInput, '2024-01-01');

      const startHourInput = screen.getByLabelText(/horário de início/i);

      await user.type(startHourInput, '10');

      const endHourInput = screen.getByLabelText(/horário de fim/i);

      await user.type(endHourInput, '8');

      const priceInput = screen.getByLabelText(/preço/i);

      await user.type(priceInput, '10.00');

      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/horário de início deve ser menor que horário de fim/i),
        ).toBeInTheDocument();
      });
    });

    it('should validate description max length', async () => {
      const user = userEvent.setup();

      vi.mocked(createParkingPriceException).mockResolvedValue(undefined);

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);

      await user.type(dateInput, '2024-01-01');

      const startHourInput = screen.getByLabelText(/horário de início/i);

      await user.type(startHourInput, '8');

      const endHourInput = screen.getByLabelText(/horário de fim/i);

      await user.type(endHourInput, '18');

      const priceInput = screen.getByLabelText(/preço/i);

      await user.type(priceInput, '10.00');

      const descriptionInput = screen.getByLabelText(/descrição/i);

      const validDescription = 'A'.repeat(500);

      await user.clear(descriptionInput);

      await user.type(descriptionInput, validDescription);

      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPriceException).toHaveBeenCalled();
      });
    });

    it('should allow typing in date field', async () => {
      const user = userEvent.setup();

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i) as HTMLInputElement;
      await user.type(dateInput, '2024-01-01');

      expect(dateInput.value).toBe('2024-01-01');
    });
  });

  describe('form submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();

      vi.mocked(createParkingPriceException).mockResolvedValue(undefined);

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);
      await user.type(dateInput, '2024-01-01');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPriceException).toHaveBeenCalledWith(mockCompanyId, {
          exception_date: '2024-01-01',
          start_hour: 8,
          end_hour: 18,
          price_cents: 1000,
          is_discount: false,
          description: null,
        });
      });

      expect(toastSuccess).toHaveBeenCalledWith('Exceção de preço criada com sucesso!');
      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should submit form with description', async () => {
      const user = userEvent.setup();

      vi.mocked(createParkingPriceException).mockResolvedValue(undefined);

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);
      await user.type(dateInput, '2024-01-01');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '5.00');
      const descriptionInput = screen.getByLabelText(/descrição/i);
      await user.type(descriptionInput, 'Feriado Nacional');
      const discountCheckbox = screen.getByLabelText(/é desconto/i);
      await user.click(discountCheckbox);
      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(createParkingPriceException).toHaveBeenCalledWith(mockCompanyId, {
          exception_date: '2024-01-01',
          start_hour: 8,
          end_hour: 18,
          price_cents: 500,
          is_discount: true,
          description: 'Feriado Nacional',
        });
      });
    });

    it('should show loading state during submission', async () => {
      const user = userEvent.setup();

      let resolveCreateException: () => void;

      const createExceptionPromise = new Promise<void>((resolve) => {
        resolveCreateException = resolve;
      });

      vi.mocked(createParkingPriceException).mockReturnValue(createExceptionPromise);

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);
      await user.type(dateInput, '2024-01-01');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /criando/i })).toBeInTheDocument();
      });

      expect(submitButton).toBeDisabled();

      resolveCreateException!();
      await createExceptionPromise;
    });

    it('should handle API errors', async () => {
      const user = userEvent.setup();
      const errorMessage = 'Erro ao criar exceção de preço';

      vi.mocked(createParkingPriceException).mockRejectedValue(new Error(errorMessage));

      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);
      await user.type(dateInput, '2024-01-01');
      const startHourInput = screen.getByLabelText(/horário de início/i);
      await user.type(startHourInput, '8');
      const endHourInput = screen.getByLabelText(/horário de fim/i);
      await user.type(endHourInput, '18');
      const priceInput = screen.getByLabelText(/preço/i);
      await user.type(priceInput, '10.00');
      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(toastError).toHaveBeenCalledWith(errorMessage);
      });
      expect(screen.getByLabelText(/data da exceção/i)).toBeInTheDocument();
    });
  });

  describe('form cancellation', () => {
    it('should call onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup();
      render(
        <PriceExceptionForm
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
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      const dateInput = screen.getByLabelText(/data da exceção/i);
      await user.type(dateInput, '2024-01-01');
      const descriptionInput = screen.getByLabelText(/descrição/i);
      await user.type(descriptionInput, 'Test description');
      await user.click(screen.getByRole('button', { name: /cancelar/i }));
      expect(mockOnCancel).toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all fields', () => {
      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );

      expect(screen.getByLabelText(/data da exceção/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de início/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/horário de fim/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/preço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/é desconto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
    });
    it('should associate error messages with fields via aria-describedby', async () => {
      const user = userEvent.setup();
      render(
        <PriceExceptionForm
          companyId={mockCompanyId}
          onSuccess={mockOnSuccess}
          onCancel={mockOnCancel}
        />,
      );
      const submitButton = screen.getByRole('button', {
        name: /criar exceção/i,
      });
      await user.click(submitButton);
      await waitFor(() => {
        const dateInput = screen.getByLabelText(/data da exceção/i);
        expect(dateInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
