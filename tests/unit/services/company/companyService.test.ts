import type {
  Company,
  CompanyImage,
  CreateCompanyRequest,
  PriceReference,
} from '@/services/company/types';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addCompanyImage,
  canManageCompany,
  createCompany,
  deleteCompanyImage,
  getCompanyById,
  getCompanyImages,
  getCompanyPriceReference,
  listCompanies,
  listOwnedCompanies,
} from '@/services/company/companyService';
import { authenticatedFetch } from '@/utils/authenticatedFetch';
import { getToken } from '@/utils/tokenStorage';

vi.mock('@/libs/EnvHelpers', () => ({
  getApiUrl: vi.fn(() => 'https://api.test.com'),
}));

vi.mock('@/utils/authenticatedFetch', () => ({
  authenticatedFetch: vi.fn(),
}));

vi.mock('@/utils/tokenStorage', () => ({
  getToken: vi.fn(() => 'mock-token'),
}));

describe('companyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('listCompanies', () => {
    const mockCompanies: Company[] = [
      {
        id: '1',
        name: 'Estacionamento Teste',
        postal_code: '70000-000',
        register_code: '123456',
        address: 'Rua Teste, 123',
        description: 'Descrição teste',
        is_covered: true,
        has_camera: true,
        total_spots: 50,
        has_charging_station: false,
        city: {
          name: 'Brasília',
          identification_code: null,
          country: 'BR',
        },
        organization_id: 'org-1',
        organization: {
          id: 'org-1',
          user_id: 'user-1',
          name: 'Organização Teste',
          register_code: 'ORG123',
          state_id: 'state-1',
          state: {
            id: 'state-1',
            name: 'Distrito Federal',
            country: 'BR',
            iso2_code: 'DF',
          },
        },
        parking_prices: [],
        parking_exceptions: [],
      },
    ];

    it('should list companies with default pagination', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          skip: 0,
          limit: 10,
          total: mockCompanies.length,
          data: mockCompanies,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await listCompanies();

      expect(result).toEqual(mockCompanies);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/list?skip=0&limit=10',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should list companies with custom pagination parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          skip: 10,
          limit: 5,
          total: mockCompanies.length,
          data: mockCompanies,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await listCompanies({ skip: 10, limit: 5 });

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/list?skip=10&limit=5',
        expect.any(Object),
      );
    });

    it('should enforce maximum limit of 10', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          skip: 0,
          limit: 10,
          total: mockCompanies.length,
          data: mockCompanies,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await listCompanies({ skip: 0, limit: 20 });

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/list?skip=0&limit=10',
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

      await expect(listCompanies()).rejects.toThrow();
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

      await expect(listCompanies()).rejects.toThrow();
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

      await expect(listCompanies()).rejects.toThrow();
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

      await expect(listCompanies()).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(listCompanies()).rejects.toThrow('Erro de conexão. Tente novamente.');
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(listCompanies()).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('listOwnedCompanies', () => {
    const mockCompanies: Company[] = [
      {
        id: '1',
        name: 'Estacionamento Teste',
        postal_code: '70000-000',
        register_code: '123456',
        address: 'Rua Teste, 123',
        description: 'Descrição teste',
        is_covered: true,
        has_camera: true,
        total_spots: 50,
        has_charging_station: false,
        city: {
          name: 'Brasília',
          identification_code: null,
          country: 'BR',
        },
        organization_id: 'org-1',
        organization: {
          id: 'org-1',
          user_id: 'user-1',
          name: 'Organização Teste',
          register_code: 'ORG123',
          state_id: 'state-1',
          state: {
            id: 'state-1',
            name: 'Distrito Federal',
            country: 'BR',
            iso2_code: 'DF',
          },
        },
        parking_prices: [],
        parking_exceptions: [],
      },
    ];

    it('should list owned companies with default pagination', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          skip: 0,
          limit: 10,
          total: mockCompanies.length,
          data: mockCompanies,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await listOwnedCompanies();

      expect(result).toEqual(mockCompanies);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/list?only_owned=true&skip=0&limit=10',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should list owned companies with custom pagination parameters', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          skip: 10,
          limit: 5,
          total: mockCompanies.length,
          data: mockCompanies,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await listOwnedCompanies({ skip: 10, limit: 5 });

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/list?only_owned=true&skip=10&limit=5',
        expect.any(Object),
      );
    });

    it('should enforce maximum limit of 10', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          skip: 0,
          limit: 10,
          total: mockCompanies.length,
          data: mockCompanies,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await listOwnedCompanies({ skip: 0, limit: 20 });

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/list?only_owned=true&skip=0&limit=10',
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
      await expect(listOwnedCompanies()).rejects.toThrow();
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
      await expect(listOwnedCompanies()).rejects.toThrow();
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
      await expect(listOwnedCompanies()).rejects.toThrow();
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
      await expect(listOwnedCompanies()).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(listOwnedCompanies()).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(listOwnedCompanies()).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('getCompanyImages', () => {
    const mockImages: CompanyImage[] = [
      {
        id: 'img-1',
        url: 'https://example.com/image1.jpg',
        is_primary: true,
      },
      {
        id: 'img-2',
        url: 'https://example.com/image2.jpg',
        is_primary: false,
      },
    ];

    it('should get company images with valid companyId', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockImages,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await getCompanyImages('company-1');

      expect(result).toEqual(mockImages);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/images/',
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
          detail: [{ msg: 'Estacionamento não encontrado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(getCompanyImages('invalid-id')).rejects.toThrow(
        'Estacionamento não encontrado',
      );
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
      await expect(getCompanyImages('invalid-id')).rejects.toThrow();
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

      await expect(getCompanyImages('company-1')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(getCompanyImages('company-1')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(getCompanyImages('company-1')).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('getCompanyById', () => {
    const mockCompany: Company = {
      id: 'company-1',
      name: 'Estacionamento Teste',
      postal_code: '70000-000',
      register_code: '123456',
      address: 'Rua Teste, 123',
      description: 'Descrição teste',
      is_covered: true,
      has_camera: true,
      total_spots: 50,
      has_charging_station: false,
      city: {
        name: 'Brasília',
        identification_code: null,
        country: 'BR',
      },
      organization_id: 'org-1',
      organization: {
        id: 'org-1',
        user_id: 'user-1',
        name: 'Organização Teste',
        register_code: 'ORG123',
        state_id: 'state-1',
        state: {
          id: 'state-1',
          name: 'Distrito Federal',
          country: 'BR',
          iso2_code: 'DF',
        },
      },
      parking_prices: [],
      parking_exceptions: [],
    };

    beforeEach(() => {
      globalThis.fetch = vi.fn();
    });

    it('should get company by id with token', async () => {
      vi.mocked(getToken).mockReturnValue('mock-token');

      const mockResponse = {
        ok: true,
        json: async () => mockCompany,
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);

      const result = await getCompanyById('company-1');

      expect(result).toEqual(mockCompany);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
            Authorization: 'Bearer mock-token',
          }),
        }),
      );
    });

    it('should get company by id without token', async () => {
      vi.mocked(getToken).mockReturnValue(null);
      const mockResponse = {
        ok: true,
        json: async () => mockCompany,
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);

      const result = await getCompanyById('company-1');

      expect(result).toEqual(mockCompany);
      expect(globalThis.fetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );

      expect(globalThis.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.not.objectContaining({
          headers: expect.objectContaining({
            Authorization: expect.anything(),
          }),
        }),
      );
    });

    it('should handle 404 not found error', async () => {
      vi.mocked(getToken).mockReturnValue('mock-token');

      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          detail: [{ msg: 'Estacionamento não encontrado' }],
        }),
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);

      await expect(getCompanyById('invalid-id')).rejects.toThrow(
        'Estacionamento não encontrado',
      );
    });

    it('should handle 500 server error', async () => {
      vi.mocked(getToken).mockReturnValue('mock-token');

      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(globalThis.fetch).mockResolvedValue(mockResponse);

      await expect(getCompanyById('company-1')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(getToken).mockReturnValue('mock-token');
      vi.mocked(globalThis.fetch).mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(getCompanyById('company-1')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });
  });

  describe('canManageCompany', () => {
    it('should return true when user can manage company', async () => {
      const mockResponse = {
        ok: true,
        json: async () => true,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await canManageCompany('company-1');

      expect(result).toBe(true);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/can-manage',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should return false when user cannot manage company', async () => {
      const mockResponse = {
        ok: true,
        json: async () => false,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await canManageCompany('company-1');

      expect(result).toBe(false);
    });

    it('should handle 404 not found error', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        json: async () => ({
          detail: [{ msg: 'Estacionamento não encontrado' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(canManageCompany('invalid-id')).rejects.toThrow(
        'Estacionamento não encontrado',
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

      await expect(canManageCompany('company-1')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(canManageCompany('company-1')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(canManageCompany('company-1')).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('addCompanyImage', () => {
    it('should add image without isPrimary', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        status: 204,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await addCompanyImage('company-1', mockFile);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/images/',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });

    it('should add image with isPrimary true', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        status: 204,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await addCompanyImage('company-1', mockFile, true);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/images/?is_primary=true',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });

    it('should add image with isPrimary false', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: true,
        status: 204,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await addCompanyImage('company-1', mockFile, false);

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/images/?is_primary=false',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        }),
      );
    });

    it('should handle 422 validation error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => ({
          detail: [{ msg: 'Arquivo inválido' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(addCompanyImage('company-1', mockFile)).rejects.toThrow(
        'Arquivo inválido',
      );
    });

    it('should handle 422 with generic message when JSON parse fails', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(addCompanyImage('company-1', mockFile)).rejects.toThrow(
        'Arquivo inválido. Verifique o formato e tamanho da imagem.',
      );
    });

    it('should handle 500 server error', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockResponse = {
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Not JSON');
        },
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(addCompanyImage('company-1', mockFile)).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(addCompanyImage('company-1', mockFile)).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(addCompanyImage('company-1', mockFile)).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('deleteCompanyImage', () => {
    it('should delete image successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 204,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await deleteCompanyImage('company-1', 'image-1');

      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/images/image-1',
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
          detail: [{ msg: 'Imagem não encontrada' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      await expect(deleteCompanyImage('company-1', 'invalid-id')).rejects.toThrow(
        'Imagem não encontrada',
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
      await expect(deleteCompanyImage('company-1', 'image-1')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(deleteCompanyImage('company-1', 'image-1')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(deleteCompanyImage('company-1', 'image-1')).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('getCompanyPriceReference', () => {
    const mockPriceReference: PriceReference = {
      current_price_cents: 500,
      current_price_formatted: 'R$ 5,00',
      weekly_prices: [
        {
          start_hour: 0,
          end_hour: 23,
          price_cents: 500,
          is_discount: false,
          week_day: 0,
        },
      ],
      exceptions: [],
    };

    it('should get price reference successfully', async () => {
      const mockResponse = {
        ok: true,
        json: async () => mockPriceReference,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await getCompanyPriceReference('company-1');

      expect(result).toEqual(mockPriceReference);
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/company-1/price/reference',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            Accept: 'application/json',
          }),
        }),
      );
    });

    it('should return null when price reference not found (404)', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);
      const result = await getCompanyPriceReference('company-1');
      expect(result).toBeNull();
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
      await expect(getCompanyPriceReference('company-1')).rejects.toThrow(
        'Erro do servidor. Tente novamente mais tarde.',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(getCompanyPriceReference('company-1')).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );
      await expect(getCompanyPriceReference('company-1')).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });
  });

  describe('createCompany', () => {
    const mockCreateRequest: CreateCompanyRequest = {
      name: 'Estacionamento Novo',
      postal_code: '12345-678',
      register_code: '11.222.333/0001-81',
      address: 'Rua Nova, 456',
      description: 'Novo estacionamento',
      is_covered: true,
      has_camera: true,
      total_spots: 100,
      has_charging_station: false,
      city_id: 'city-1',
    };

    const mockCreatedCompany: Company = {
      id: 'company-new',
      name: 'Estacionamento Novo',
      postal_code: '12345-678',
      register_code: '11.222.333/0001-81',
      address: 'Rua Nova, 456',
      description: 'Novo estacionamento',
      is_covered: true,
      has_camera: true,
      total_spots: 100,
      has_charging_station: false,
      city: {
        name: 'Brasília',
        identification_code: null,
        country: 'BR',
      },
      organization_id: 'org-1',
      organization: {
        id: 'org-1',
        user_id: 'user-1',
        name: 'Organização Teste',
        register_code: 'ORG123',
        state_id: 'state-1',
        state: {
          id: 'state-1',
          name: 'Distrito Federal',
          country: 'BR',
          iso2_code: 'DF',
        },
      },
      parking_prices: [],
      parking_exceptions: [],
    };

    it('should create company successfully', async () => {
      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => mockCreatedCompany,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await createCompany(mockCreateRequest);

      expect(result).toEqual(mockCreatedCompany);
      expect(result.id).toBe('company-new');
      expect(authenticatedFetch).toHaveBeenCalledWith(
        'https://api.test.com/api/core/company/',
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

    it('should handle 401 authentication error', async () => {
      const mockResponse = {
        ok: false,
        status: 401,
        json: async () => ({
          detail: [{ msg: 'Token inválido' }],
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(createCompany(mockCreateRequest)).rejects.toThrow();
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

      await expect(createCompany(mockCreateRequest)).rejects.toThrow();
    });

    it('should handle 422 validation error with API message', async () => {
      const errorData = {
        detail: [{ msg: 'CNPJ já cadastrado' }],
      };

      const mockResponse = {
        ok: false,
        status: 422,
        json: async () => errorData,
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      await expect(createCompany(mockCreateRequest)).rejects.toThrow(
        'CNPJ já cadastrado',
      );
    });

    it('should handle network errors', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(new TypeError('Failed to fetch'));
      await expect(createCompany(mockCreateRequest)).rejects.toThrow(
        'Erro de conexão. Tente novamente.',
      );
    });

    it('should handle authentication errors from authenticatedFetch', async () => {
      vi.mocked(authenticatedFetch).mockRejectedValue(
        new Error('Token de autenticação inválido ou expirado'),
      );

      await expect(createCompany(mockCreateRequest)).rejects.toThrow(
        'Token de autenticação inválido ou expirado',
      );
    });

    it('should create company with minimal data', async () => {
      const minimalRequest: CreateCompanyRequest = {
        name: 'Estacionamento Simples',
        postal_code: '12345678',
        register_code: '11222333000181',
        address: 'Rua Simples, 123',
        is_covered: false,
        has_camera: false,
        total_spots: 50,
        has_charging_station: false,
        city_id: 'city-1',
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          ...mockCreatedCompany,
          ...minimalRequest,
          id: 'company-simple',
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await createCompany(minimalRequest);

      expect(result.name).toBe('Estacionamento Simples');
      expect(result.total_spots).toBe(50);
    });

    it('should create company with null description', async () => {
      const requestWithNullDescription: CreateCompanyRequest = {
        ...mockCreateRequest,
        description: null,
      };

      const mockResponse = {
        ok: true,
        status: 201,
        json: async () => ({
          ...mockCreatedCompany,
          description: null,
        }),
      } as unknown as Response;

      vi.mocked(authenticatedFetch).mockResolvedValue(mockResponse);

      const result = await createCompany(requestWithNullDescription);

      expect(result.description).toBeNull();
    });
  });
});
