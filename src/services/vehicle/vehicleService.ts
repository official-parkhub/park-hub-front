import type {
  ActiveVehicle,
  CreateVehicleRequest,
  Vehicle,
  VehicleMetrics,
} from './types';
import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { getCompanyById } from '@/services/company/companyService';
import { authenticatedFetch } from '@/utils/authenticatedFetch';
import logger from '@/utils/logger';

export async function listVehicles(params?: {
  skip?: number;
  limit?: number;
}): Promise<Vehicle[]> {
  const apiUrl = getApiUrl();

  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 10;

  const validatedLimit = Math.min(limit, 100);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: validatedLimit.toString(),
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/customer/vehicle?${queryParams.toString()}`,
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
        throw new Error(error.detail?.[0]?.msg || 'Erro ao listar veículos');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao listar veículos');
      }
    }

    const data = await response.json();

    let vehiclesArray: unknown[] = [];
    if (Array.isArray(data)) {
      vehiclesArray = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.vehicles)) {
      vehiclesArray = data.vehicles;
    }

    return vehiclesArray.map((vehicle: any) => ({
      id: vehicle.vehicle_id || vehicle.id,
      plate: vehicle.plate,
      name: vehicle.name_given_by_owner || vehicle.name,
      model: vehicle.model,
      year: vehicle.year,
      color: vehicle.color,
      country: vehicle.country || 'BR',
    })) as Vehicle[];
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

export async function createVehicle(data: CreateVehicleRequest): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(`${apiUrl}/api/core/customer/vehicle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Veículo não encontrado');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao criar veículo');
      } catch {
        if (response.status === 422) {
          throw new Error('Dados inválidos. Verifique os campos preenchidos.');
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao criar veículo');
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

export async function deleteVehicle(vehicleId: string): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/customer/vehicle/${vehicleId}`,
      {
        method: 'DELETE',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Veículo não encontrado');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao remover veículo');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao remover veículo');
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

export async function getVehicleMetrics(plate: string): Promise<VehicleMetrics> {
  const apiUrl = getApiUrl();

  const queryParams = new URLSearchParams({
    plate,
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/customer/vehicle/${plate}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      },
    );

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Veículo não encontrado');
      }

      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao buscar métricas do veículo');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao buscar métricas do veículo');
      }
    }

    const data: VehicleMetrics = await response.json();
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

export async function listActiveVehicles(params?: {
  skip?: number;
  limit?: number;
}): Promise<ActiveVehicle[]> {
  const apiUrl = getApiUrl();

  const skip = params?.skip ?? 0;
  const limit = params?.limit ?? 10;

  const validatedLimit = Math.min(limit, 100);

  const queryParams = new URLSearchParams({
    skip: skip.toString(),
    limit: validatedLimit.toString(),
  });

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/customer/active-vehicles?${queryParams.toString()}`,
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
        throw new Error(error.detail?.[0]?.msg || 'Erro ao listar veículos ativos');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao listar veículos ativos');
      }
    }

    const data = await response.json();

    let activeVehiclesArray: unknown[] = [];
    if (Array.isArray(data)) {
      activeVehiclesArray = data;
    } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
      activeVehiclesArray = data.data;
    }

    const allVehicles = await listVehicles({ skip: 0, limit: 100 });
    const vehiclesMap = new Map<string, Vehicle>();
    allVehicles.forEach((vehicle) => {
      vehiclesMap.set(vehicle.id, vehicle);
    });

    const uniqueCompanyIds = new Set<string>();
    activeVehiclesArray.forEach((item: any) => {
      const companyId = item.company_id || item.company?.id;
      if (companyId) {
        uniqueCompanyIds.add(companyId);
      }
    });

    const companyPromises = Array.from(uniqueCompanyIds).map(async (companyId) => {
      try {
        const companyData = await getCompanyById(companyId);
        return {
          id: companyId,
          data: {
            id: companyData.id,
            name: companyData.name,
            address: companyData.address,
          },
        };
      } catch (error) {
        logger.warn({ companyId, error }, 'Failed to fetch company');
        return {
          id: companyId,
          data: {
            id: companyId,
            name: 'Estacionamento não encontrado',
            address: '',
          },
        };
      }
    });

    const companyResults = await Promise.all(companyPromises);
    const companyMap = new Map<string, { id: string; name: string; address: string }>();
    companyResults.forEach(({ id, data }) => {
      companyMap.set(id, data);
    });

    const activeVehiclesWithDetails = await Promise.all(
      activeVehiclesArray.map(async (item: any) => {
        const vehicleId = item.vehicle_id || item.vehicle?.id || item.id;
        const companyId = item.company_id || item.company?.id;

        const vehicle = vehiclesMap.get(vehicleId);

        const company = companyId ? companyMap.get(companyId) : undefined;

        const hourlyRate = item.hourly_rate;
        const entranceDate = item.entrance_date;
        let currentPriceCents: number | undefined;

        if (hourlyRate && entranceDate) {
          const entrance = new Date(entranceDate);
          const now = new Date();
          const hoursElapsed = Math.max(
            0,
            (now.getTime() - entrance.getTime()) / (1000 * 60 * 60),
          );
          currentPriceCents = Math.round(hoursElapsed * hourlyRate);
        } else if (
          item.current_price_cents !== undefined
          && item.current_price_cents !== null
        ) {
          currentPriceCents = item.current_price_cents;
        }

        if (!vehicle) {
          return {
            vehicle: {
              id: vehicleId || '',
              plate: item.plate || 'N/A',
              name: item.name || item.name_given_by_owner || 'Veículo não encontrado',
              model: item.model,
              year: item.year,
              color: item.color,
              country: item.country || 'BR',
            },
            company: company || {
              id: companyId || '',
              name: 'Estacionamento não encontrado',
              address: '',
            },
            current_price_cents: currentPriceCents,
            entrance_date: entranceDate,
          } as ActiveVehicle;
        }

        return {
          vehicle,
          company: company || {
            id: companyId || '',
            name: 'Estacionamento não encontrado',
            address: '',
          },
          current_price_cents: currentPriceCents,
          entrance_date: entranceDate,
        } as ActiveVehicle;
      }),
    );

    return activeVehiclesWithDetails;
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
