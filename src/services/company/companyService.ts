import type {
  Company,
  CompanyImage,
  CompanyListResponse,
  CreateCompanyRequest,
  PriceReference,
} from './types';
import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { authenticatedFetch } from '@/utils/authenticatedFetch';
import logger from '@/utils/logger';
import { getToken } from '@/utils/tokenStorage';

export async function listCompanies(params?: {
  skip?: number;
  limit?: number;
}): Promise<Company[]> {
  const apiUrl = getApiUrl();

  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 10;

  const validatedLimit = Math.min(limit, 10);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: validatedLimit.toString(),
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/list?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao listar estacionamentos');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao listar estacionamentos');
      }
    }

    const responseData: CompanyListResponse = await response.json();

    if (!responseData || !Array.isArray(responseData.data)) {
      logger.error({ responseData }, 'API returned invalid response structure');
      throw new Error(
        'Resposta inválida da API: esperado um objeto com propriedade "data" contendo um array',
      );
    }

    return responseData.data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function listOwnedCompanies(params?: {
  skip?: number;
  limit?: number;
}): Promise<Company[]> {
  const apiUrl = getApiUrl();

  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 10;

  const validatedLimit = Math.min(limit, 10);

  const queryParams = new URLSearchParams({
    only_owned: 'true',
    skip: skip.toString(),
    limit: validatedLimit.toString(),
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/list?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao listar estacionamentos');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao listar estacionamentos');
      }
    }

    const responseData: CompanyListResponse = await response.json();

    if (!responseData || !Array.isArray(responseData.data)) {
      logger.error({ responseData }, 'API returned invalid response structure');
      throw new Error(
        'Resposta inválida da API: esperado um objeto com propriedade "data" contendo um array',
      );
    }

    return responseData.data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

/**
 * Get company images
 * @param companyId - UUID of the company
 * @returns Promise resolving to array of company images
 * @throws Error with message from API if request fails
 */
export async function getCompanyImages(companyId: string): Promise<CompanyImage[]> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/images/`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Estacionamento não encontrado');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(
          error.detail?.[0]?.msg || 'Erro ao buscar imagens do estacionamento',
        );
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao buscar imagens do estacionamento');
      }
    }

    const data: CompanyImage[] = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

/**
 * Get company details by ID
 * @param companyId - UUID of the company
 * @returns Promise resolving to Company object
 * @throws Error if company not found or request fails
 */
export async function getCompanyById(companyId: string): Promise<Company> {
  const apiUrl = getApiUrl();

  try {
    const headers: HeadersInit = {
      Accept: 'application/json',
    };

    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiUrl}/api/core/company/${companyId}`, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Estacionamento não encontrado');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(
          error.detail?.[0]?.msg || 'Erro ao buscar detalhes do estacionamento',
        );
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao buscar detalhes do estacionamento');
      }
    }

    const data: Company = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

/**
 * Check if current user can manage a company
 * @param companyId - UUID of the company
 * @returns Promise resolving to boolean (true if can manage, false otherwise)
 * @throws Error if request fails
 */
export async function canManageCompany(companyId: string): Promise<boolean> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/can-manage`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Estacionamento não encontrado');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(
          error.detail?.[0]?.msg || 'Erro ao verificar permissão de gestão',
        );
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao verificar permissão de gestão');
      }
    }

    const data: boolean = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

/**
 * Add image to company
 * @param companyId - UUID of the company
 * @param file - Image file to upload
 * @param isPrimary - Whether this image should be marked as primary (optional, default: false)
 * @returns Promise resolving when upload completes
 * @throws Error if upload fails
 */
export async function addCompanyImage(
  companyId: string,
  file: File,
  isPrimary?: boolean,
): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const formData = new FormData();
    formData.append('file', file);

    let url = `${apiUrl}/api/core/company/${companyId}/images/`;
    if (isPrimary !== undefined) {
      const queryParams = new URLSearchParams({
        is_primary: isPrimary.toString(),
      });
      url += `?${queryParams.toString()}`;
    }

    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao adicionar imagem');
      } catch {
        if (response.status === 422) {
          throw new Error('Arquivo inválido. Verifique o formato e tamanho da imagem.');
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao adicionar imagem');
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function deleteCompanyImage(
  companyId: string,
  imageId: string,
): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/images/${imageId}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Imagem não encontrada');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao remover imagem');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao remover imagem');
      }
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function getCompanyPriceReference(
  companyId: string,
): Promise<PriceReference | null> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/price/reference`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao buscar informações de preço');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao buscar informações de preço');
      }
    }

    const data = await response.json();

    if (
      data
      && typeof data === 'object'
      && 'price_cents' in data
      && 'start_hour' in data
    ) {
      return {
        current_price_cents: data.price_cents,
        current_price_formatted: undefined,
        weekly_prices: data.weekly_prices || [],
        exceptions: data.exceptions || [],
      };
    }

    return data as PriceReference;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function createCompany(data: CreateCompanyRequest): Promise<Company> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(`${apiUrl}/api/core/company/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        if (error.detail?.[0]?.msg) {
          throw new Error(error.detail[0].msg);
        }

        if (response.status === 422) {
          throw new Error('Dados inválidos. Verifique os campos preenchidos.');
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao criar empresa');
      } catch (error) {
        if (error instanceof Error && error.message.includes('autenticação')) {
          throw new Error('Token de autenticação inválido ou expirado');
        }

        if (error instanceof TypeError && error.message.includes('fetch')) {
          throw new Error('Erro de conexão. Tente novamente.');
        }
        throw error;
      }
    }

    const company: Company = await response.json();
    return company;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}
