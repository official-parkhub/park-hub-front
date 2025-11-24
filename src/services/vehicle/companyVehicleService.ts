import type {
  CompanyActiveVehicle,
  PaginatedResponse,
  VehicleHistoryRecord,
} from './types';
import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

export async function listCompanyActiveVehicles(
  companyId: string,
  params?: { skip?: number; limit?: number },
): Promise<PaginatedResponse<CompanyActiveVehicle>> {
  const apiUrl = getApiUrl();

  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 10;

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/active-vehicles?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      let errorMessage = 'Erro ao listar veículos ativos';

      try {
        const error: ApiError = await response.json();
        if (error.detail && error.detail.length > 0 && error.detail[0]?.msg) {
          errorMessage = error.detail[0].msg;
        }
      } catch {
        if (response.status === 500) {
          errorMessage = 'Erro do servidor. Tente novamente mais tarde.';
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return {
        skip,
        limit,
        total: data.length,
        data: data as CompanyActiveVehicle[],
      };
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return {
        skip: data.skip ?? skip,
        limit: data.limit ?? limit,
        total: data.total ?? data.data.length,
        data: data.data as CompanyActiveVehicle[],
      };
    }

    return {
      skip,
      limit,
      total: 0,
      data: [],
    };
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

export async function getCompanyVehicleHistory(
  companyId: string,
  params?: { skip?: number; limit?: number },
): Promise<PaginatedResponse<VehicleHistoryRecord>> {
  const apiUrl = getApiUrl();

  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 10;

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: limit.toString(),
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/report?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      let errorMessage = 'Erro ao buscar histórico de veículos';

      try {
        const error: ApiError = await response.json();
        if (error.detail && error.detail.length > 0 && error.detail[0]?.msg) {
          errorMessage = error.detail[0].msg;
        }
      } catch {
        if (response.status === 500) {
          errorMessage = 'Erro do servidor. Tente novamente mais tarde.';
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (Array.isArray(data)) {
      return {
        skip,
        limit,
        total: data.length,
        data: data as VehicleHistoryRecord[],
      };
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      return {
        skip: data.skip ?? skip,
        limit: data.limit ?? limit,
        total: data.total ?? data.data.length,
        data: data.data as VehicleHistoryRecord[],
      };
    }

    return {
      skip,
      limit,
      total: 0,
      data: [],
    };
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
