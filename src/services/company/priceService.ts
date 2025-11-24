import type {
  BaseParkingPriceSchema,
  CreateParkingPriceExceptionRequest,
  CreateParkingPriceRequest,
} from './types';
import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

export async function createParkingPrice(
  companyId: string,
  priceData: CreateParkingPriceRequest,
): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/price/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(priceData),
      },
    );

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao criar preço');
      } catch {
        if (response.status === 422) {
          throw new Error('Dados inválidos. Verifique os campos preenchidos.');
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao criar preço');
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

export async function createParkingPriceException(
  companyId: string,
  exceptionData: CreateParkingPriceExceptionRequest,
): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/price/exception`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(exceptionData),
      },
    );

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        const errorMessage = error.detail?.[0]?.msg || 'Erro ao criar exceção de preço';

        const customError = new Error(errorMessage) as Error & {
          kind?: string;
          field?: string;
        };
        customError.kind = error.kind;

        if (error.kind === 'INVALID_OPERATION') {
          customError.field = 'exception_date';
        }

        throw customError;
      } catch (err) {
        if (err instanceof Error && 'kind' in err) {
          throw err;
        }

        if (response.status === 422) {
          throw new Error('Dados inválidos. Verifique os campos preenchidos.');
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao criar exceção de preço');
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

export async function listParkingPrices(
  companyId: string,
): Promise<BaseParkingPriceSchema[]> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/price/list`,
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
        throw new Error(error.detail?.[0]?.msg || 'Erro ao listar preços');
      } catch {
        if (response.status === 404) {
          return [];
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao listar preços');
      }
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return data as BaseParkingPriceSchema[];
    }

    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data as BaseParkingPriceSchema[];
    }

    return [];
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
