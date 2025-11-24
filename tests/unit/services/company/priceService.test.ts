import type {
  CreateParkingPriceExceptionRequest,
  CreateParkingPriceRequest,
} from '@/services/company/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createParkingPrice,
  createParkingPriceException,
} from '@/services/company/priceService';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

vi.mock('@/libs/EnvHelpers', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.com'),
}));

vi.mock('@/utils/authenticatedFetch', () => ({
  authenticatedFetch: vi.fn(),
}));

describe('priceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createParkingPrice', () => {
    const mockPriceData: CreateParkingPriceRequest = {
      week_day: 0,
      start_hour: 8,
      end_hour: 18,
      price_cents: 1000,
      is_discount: false,
    };

    it('should create parking price successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await createParkingPrice('company-1', mockPriceData);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/price/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          body: JSON.stringify(mockPriceData),
        }),
      );
    });

    it('should handle 401 authentication error', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          detail: [{ msg: 'Token inválido' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow();
    });

    it('should handle 403 authentication error', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({
          detail: [{ msg: 'Acesso negado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow();
    });

    it('should handle 422 validation error', async () => {
      const errorData = {
        detail: [{ msg: 'Horário inválido' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow();
    });

    it('should handle 422 with generic message when JSON parse fails', async () => {
      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow(
        'Dados inválidos. Verifique os campos preenchidos.',
      );
    });

    it('should handle 500 server error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(createParkingPrice('company-1', mockPriceData)).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('createParkingPriceException', () => {
    const mockExceptionData: CreateParkingPriceExceptionRequest = {
      exception_date: '2024-12-25',
      start_hour: 0,
      end_hour: 23,
      price_cents: 2000,
      is_discount: false,
      description: 'Natal',
    };

    it('should create parking price exception successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await createParkingPriceException('company-1', mockExceptionData);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/price/exception',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          body: JSON.stringify(mockExceptionData),
        }),
      );
    });

    it('should create parking price exception without description', async () => {
      const exceptionDataWithoutDescription: CreateParkingPriceExceptionRequest = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };

      const mockResponse = {
        ok: true,
        status: 201,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await createParkingPriceException('company-1', exceptionDataWithoutDescription);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/price/exception',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          body: JSON.stringify(exceptionDataWithoutDescription),
        }),
      );
    });

    it('should handle 401 authentication error', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          detail: [{ msg: 'Token inválido' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow();
    });

    it('should handle 403 authentication error', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        json: async () => ({
          detail: [{ msg: 'Acesso negado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow();
    });

    it('should handle 422 validation error', async () => {
      const errorData = {
        detail: [{ msg: 'Data inválida' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow();
    });

    it('should handle 422 with generic message when JSON parse fails', async () => {
      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow('Dados inválidos. Verifique os campos preenchidos.');
    });

    it('should handle 500 server error', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow('Erro do servidor. Tente novamente mais tarde.');
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow('Erro de conexão. Tente novamente.');
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(
        createParkingPriceException('company-1', mockExceptionData),
      ).rejects.toThrow('Token de autenticação inválido ou expirado');
    });
  });
});
