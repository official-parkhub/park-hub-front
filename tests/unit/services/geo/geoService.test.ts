import type { City } from '@/services/geo/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getCities } from '@/services/geo/geoService';

vi.mock('@/libs/EnvHelpers', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.com'),
}));

describe('geoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getCities', () => {
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

    it('should get cities successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockCities,
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);

      const result = await getCities();

      expect(result).toEqual(mockCities);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/geo/cities',
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
          detail: [{ msg: 'Rota não encontrada' }],
        }),
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);
      await expect(getCities()).rejects.toThrow(
        'Rota de cidades não encontrada. Verifique a configuração da API.',
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

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);

      await expect(getCities()).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(getCities()).rejects.toThrow('Erro de conexão. Tente novamente.');
    });

    it('should handle error with API message', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({
          detail: [{ msg: 'Erro ao buscar cidades' }],
        }),
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);
      await expect(getCities()).rejects.toThrow('Erro ao buscar cidades');
    });

    it('should handle error without API message', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        json: async () => ({}),
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);
      await expect(getCities()).rejects.toThrow('Erro ao buscar cidades (400)');
    });
  });
});
