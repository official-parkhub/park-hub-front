import type { City } from '@/services/geo/types';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CompanyForm from '@/components/company/CompanyForm';
import { getCities } from '@/services/geo/geoService';
import { toastError } from '@/utils/toast';

vi.mock('@/services/company/companyService');
vi.mock('@/services/geo/geoService');
vi.mock('@/utils/toast');
vi.mock('@/hooks/use-mobile', () => ({
  useIsMobile: vi.fn(() => false),
}));

const mockPush = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const mockCities: City[] = [
  {
    id: 'city-1',
    name: 'Brasília',
    identification_code: '5300108',
    country: 'BR',
    state: {
      name: 'Distrito Federal',
      country: 'BR',
      iso2_code: 'DF',
    },
  },
  {
    id: 'city-2',
    name: 'São Paulo',
    identification_code: '3550308',
    country: 'BR',
    state: {
      name: 'São Paulo',
      country: 'BR',
      iso2_code: 'SP',
    },
  },
];

describe('companyForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
    vi.mocked(getCities).mockResolvedValue(mockCities);
  });

  describe('rendering', () => {
    it('should not render when open is false', () => {
      render(<CompanyForm open={false} onOpenChange={vi.fn()} />);
      expect(screen.queryByText('Criar Empresa')).not.toBeInTheDocument();
    });

    it('should render dialog when open is true (desktop)', async () => {
      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByRole('heading', { name: /criar empresa/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
    });

    it('should render all form fields', async () => {
      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total de vagas/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estacionamento coberto/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/possui câmera/i)).toBeInTheDocument();
      expect(
        screen.getByLabelText(/possui estação de carregamento/i),
      ).toBeInTheDocument();
    });

    it('should show required field indicators', async () => {
      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const nameLabel = screen.getByText(/nome da empresa/i);
      const cepLabel = screen.getByText(/cep/i);
      const cnpjLabel = screen.getByText(/cnpj/i);

      expect(nameLabel).toHaveTextContent('*');
      expect(cepLabel).toHaveTextContent('*');
      expect(cnpjLabel).toHaveTextContent('*');
    });

    it('should show loading state while cities are loading', async () => {
      let resolveCities: (value: City[]) => void;
      const citiesPromise = new Promise<City[]>((resolve) => {
        resolveCities = resolve;
      });

      vi.mocked(getCities).mockReturnValue(citiesPromise);

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);
      expect(screen.getByText(/carregando cidades/i)).toBeInTheDocument();
      resolveCities!(mockCities);

      await citiesPromise;
      await waitFor(() => {
        expect(screen.queryByText(/carregando cidades/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('validation', () => {
    it('should show validation error when name is empty', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole('button', {
        name: /criar empresa/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when CEP is invalid', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      await user.type(screen.getByLabelText(/nome da empresa/i), 'Test Company');
      await user.type(screen.getByLabelText(/cep/i), '12345');
      const submitButton = screen.getByRole('button', {
        name: /criar empresa/i,
      });
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/cep inválido/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when CNPJ is invalid', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      await user.type(screen.getByLabelText(/nome da empresa/i), 'Test Company');
      await user.type(screen.getByLabelText(/cep/i), '12345-678');
      await user.type(screen.getByLabelText(/cnpj/i), '12345678901234');
      const submitButton = screen.getByRole('button', {
        name: /criar empresa/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/cnpj inválido/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when total_spots is below minimum', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      await user.type(screen.getByLabelText(/nome da empresa/i), 'Test Company');
      await user.type(screen.getByLabelText(/cep/i), '12345-678');
      await user.type(screen.getByLabelText(/cnpj/i), '11.222.333/0001-81');
      await user.type(screen.getByLabelText(/endereço/i), 'Rua Teste, 123');
      await user.type(screen.getByLabelText(/total de vagas/i), '0');

      await user.selectOptions(screen.getByLabelText(/cidade/i), 'city-1');

      const submitButton = screen.getByRole('button', {
        name: /criar empresa/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(
          screen.getByText(/total de vagas deve ser pelo menos 1/i),
        ).toBeInTheDocument();
      });
    });

    it('should clear validation errors when field is corrected', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const nameInput = screen.getByLabelText(/nome da empresa/i);
      const submitButton = screen.getByRole('button', {
        name: /criar empresa/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
      });
      await user.type(nameInput, 'Test Company');
      await waitFor(() => {
        expect(screen.queryByText(/nome é obrigatório/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('formatting', () => {
    it('should format CNPJ automatically during typing', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const cnpjInput = screen.getByLabelText(/cnpj/i) as HTMLInputElement;

      await user.type(cnpjInput, '11222333000181');

      await waitFor(() => {
        expect(cnpjInput.value).toBe('11.222.333/0001-81');
      });
    });

    it('should format CEP automatically during typing', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const cepInput = screen.getByLabelText(/cep/i) as HTMLInputElement;

      await user.type(cepInput, '12345678');
      await waitFor(() => {
        expect(cepInput.value).toBe('12345-678');
      });
    });
  });

  describe('form submission', () => {
    it('should handle cities loading error', async () => {
      const errorMessage = 'Erro ao carregar cidades';

      vi.mocked(getCities).mockRejectedValue(new Error(errorMessage));

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);
      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      expect(toastError).toHaveBeenCalledWith(errorMessage);
    });
  });

  describe('form cancellation', () => {
    it('should close form when cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(<CompanyForm open={true} onOpenChange={onOpenChange} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const cancelButton = screen.getByRole('button', { name: /cancelar/i });
      await user.click(cancelButton);

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should clear form when closed', async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <CompanyForm open={true} onOpenChange={onOpenChange} />,
      );

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      await user.type(screen.getByLabelText(/nome da empresa/i), 'Test Company');
      await user.type(screen.getByLabelText(/cep/i), '12345-678');
      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      rerender(<CompanyForm open={true} onOpenChange={onOpenChange} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const nameInput = screen.getByLabelText(/nome da empresa/i) as HTMLInputElement;
      const cepInput = screen.getByLabelText(/cep/i) as HTMLInputElement;

      expect(nameInput.value).toBe('');
      expect(cepInput.value).toBe('');
    });
  });

  describe('accessibility', () => {
    it('should have proper labels for all fields', async () => {
      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);

      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      expect(screen.getByLabelText(/nome da empresa/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/endereço/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total de vagas/i)).toBeInTheDocument();
    });

    it('should associate error messages with fields via aria-describedby', async () => {
      const user = userEvent.setup();

      render(<CompanyForm open={true} onOpenChange={vi.fn()} />);
      await waitFor(() => {
        expect(getCities).toHaveBeenCalled();
      });

      const submitButton = screen.getByRole('button', {
        name: /criar empresa/i,
      });

      await user.click(submitButton);
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/nome da empresa/i);
        expect(nameInput).toHaveAttribute('aria-describedby', 'name-error');
        expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });
});
