import type {
  CreateVehicleRequest,
  Vehicle,
  VehicleMetrics,
} from '@/services/vehicle/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCompanyById } from '@/services/company/companyService';
import {
  createVehicle,
  deleteVehicle,
  getVehicleMetrics,
  listActiveVehicles,
  listVehicles,
} from '@/services/vehicle/vehicleService';
import * as vehicleServiceModule from '@/services/vehicle/vehicleService';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

vi.mock('@/libs/EnvHelpers', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.com'),
}));

vi.mock('@/utils/authenticatedFetch', () => ({
  authenticatedFetch: vi.fn(),
}));

vi.mock('@/services/company/companyService', () => ({
  getCompanyById: vi.fn(),
}));

describe('vehicleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listVehicles', () => {
    const mockVehicles: Vehicle[] = [
      {
        id: 'vehicle-1',
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: 'Civic',
        year: 2020,
        color: 'Branco',
        country: 'BR',
      },
      {
        id: 'vehicle-2',
        plate: 'XYZ5678',
        name: 'Moto',
        country: 'BR',
      },
    ];

    it('should list vehicles with default pagination', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockVehicles,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await listVehicles();

      expect(result).toEqual(mockVehicles);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/vehicle?skip=0&limit=10',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should list vehicles with custom pagination parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockVehicles,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await listVehicles({ skip: 10, limit: 5 });
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/vehicle?skip=10&limit=5',
        expect.any(Object),
      );
    });

    it('should enforce maximum limit of 100', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockVehicles,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await listVehicles({ skip: 0, limit: 200 });

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/vehicle?skip=0&limit=100',
        expect.any(Object),
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
      await expect(listVehicles()).rejects.toThrow();
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
      await expect(listVehicles()).rejects.toThrow();
    });

    it('should handle 422 validation error', async () => {
      const errorData = {
        detail: [{ msg: 'Parâmetros inválidos' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(listVehicles()).rejects.toThrow();
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
      await expect(listVehicles()).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(listVehicles()).rejects.toThrow('Erro de conexão. Tente novamente.');
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(listVehicles()).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('createVehicle', () => {
    const mockCreateRequest: CreateVehicleRequest = {
      name: 'Meu Carro',
      vehicle: {
        plate: 'ABC1234',
        model: 'Civic',
        year: 2020,
        color: 'Branco',
        country: 'BR',
      },
    };
    it('should create vehicle successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
      } as unknown as Response;
      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await createVehicle(mockCreateRequest);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/vehicle',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          }),
          body: JSON.stringify(mockCreateRequest),
        }),
      );
    });
    it('should handle 404 not found error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          detail: [{ msg: 'Veículo não encontrado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(createVehicle(mockCreateRequest)).rejects.toThrow(
        'Veículo não encontrado',
      );
    });

    it('should handle 422 validation error', async () => {
      const errorData = {
        detail: [{ msg: 'Placa inválida' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(createVehicle(mockCreateRequest)).rejects.toThrow();
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
      await expect(createVehicle(mockCreateRequest)).rejects.toThrow(
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
      await expect(createVehicle(mockCreateRequest)).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(createVehicle(mockCreateRequest)).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(createVehicle(mockCreateRequest)).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await deleteVehicle('vehicle-1');
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/vehicle/vehicle-1',
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should handle 404 not found error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          detail: [{ msg: 'Veículo não encontrado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(deleteVehicle('invalid-id')).rejects.toThrow('Veículo não encontrado');
    });

    it('should handle 422 validation error', async () => {
      const errorData = {
        detail: [{ msg: 'ID inválido' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(deleteVehicle('invalid-id')).rejects.toThrow();
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
      await expect(deleteVehicle('vehicle-1')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(deleteVehicle('vehicle-1')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(deleteVehicle('vehicle-1')).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('getVehicleMetrics', () => {
    const mockMetrics: VehicleMetrics = {
      total_parking_time: 3600,
      total_parkings: 5,
      total_cost_cents: 5000,
    };

    it('should get vehicle metrics successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockMetrics,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await getVehicleMetrics('ABC1234');

      expect(result).toEqual(mockMetrics);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/vehicle/ABC1234?plate=ABC1234',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should handle 404 not found error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          detail: [{ msg: 'Veículo não encontrado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(getVehicleMetrics('INVALID')).rejects.toThrow(
        'Veículo não encontrado',
      );
    });

    it('should handle 422 validation error', async () => {
      const errorData = {
        detail: [{ msg: 'Placa inválida' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(getVehicleMetrics('INVALID')).rejects.toThrow();
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
      await expect(getVehicleMetrics('ABC1234')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(getVehicleMetrics('ABC1234')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(getVehicleMetrics('ABC1234')).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('listActiveVehicles', () => {
    const mockVehicle: Vehicle = {
      id: 'vehicle-1',
      plate: 'ABC1234',
      name: 'Meu Carro',
      country: 'BR',
    };

    const mockCompany = {
      id: 'company-1',
      name: 'Estacionamento Teste',
      address: 'Rua Teste, 123',
    };

    const mockActiveVehiclesResponse = {
      skip: 0,
      limit: 10,
      total: 1,
      data: [
        {
          vehicle_id: 'vehicle-1',
          company_id: 'company-1',
          entrance_date: '2025-01-01T10:00:00Z',
          hourly_rate: 2,
        },
      ],
    };

    beforeEach(() => {
      vi.spyOn(vehicleServiceModule, 'listVehicles').mockResolvedValue([mockVehicle]);
      vi.mocked(getCompanyById).mockResolvedValue(mockCompany as any);
    });

    it('should list active vehicles with custom pagination parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockActiveVehiclesResponse,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await listActiveVehicles({ skip: 10, limit: 5 });
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/active-vehicles?skip=10&limit=5',
        expect.any(Object),
      );
    });

    it('should enforce maximum limit of 100', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockActiveVehiclesResponse,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await listActiveVehicles({ skip: 0, limit: 200 });
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/customer/active-vehicles?skip=0&limit=100',
        expect.any(Object),
      );
    });

    it('should handle empty list', async () => {
      const mockResponse = {
        ok: true,
        json: async () => [],
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      const result = await listActiveVehicles();
      expect(result).toEqual([]);
    });

    it('should handle empty paginated response', async () => {
      const paginatedResponse = {
        skip: 0,
        limit: 10,
        total: 0,
        data: [],
      };

      const mockResponse = {
        ok: true,
        json: async () => paginatedResponse,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      const result = await listActiveVehicles();
      expect(result).toEqual([]);
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
      await expect(listActiveVehicles()).rejects.toThrow();
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
      await expect(listActiveVehicles()).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(listActiveVehicles()).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(listActiveVehicles()).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });
});
