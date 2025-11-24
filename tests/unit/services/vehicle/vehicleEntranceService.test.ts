import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { registerVehicleEntrance } from '@/services/vehicle/vehicleEntranceService';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

vi.mock('@/libs/EnvHelpers', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.com'),
}));

vi.mock('@/utils/authenticatedFetch', () => ({
  authenticatedFetch: vi.fn(),
}));

describe('vehicleEntranceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('registerVehicleEntrance', () => {
    const mockCompanyId = 'company-123';
    const mockPlate = 'ABC1234';

    it('should register vehicle entrance successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await registerVehicleEntrance(mockCompanyId, mockPlate);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        `https://api.test.com/api/core/company/${mockCompanyId}/register-entrance`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          body: JSON.stringify({ plate: mockPlate }),
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
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow();
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
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow();
    });

    it('should handle 422 validation error - vehicle already parked', async () => {
      const errorData = {
        detail: [{ msg: 'Veículo já está estacionado' }],
      };
      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
        'Veículo já está estacionado',
      );
    });

    it('should handle 422 validation error - invalid plate', async () => {
      const errorData = {
        detail: [{ msg: 'Placa inválida' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
        'Placa inválida',
      );
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
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
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
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });

    it('should handle 422 with empty detail array', async () => {
      const errorData = {
        detail: [],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(registerVehicleEntrance(mockCompanyId, mockPlate)).rejects.toThrow(
        'Dados inválidos. Verifique os campos preenchidos.',
      );
    });
  });
});
