import type { City, CityListResponse, State, StateListResponse } from './types';
import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';

export async function getStates(): Promise<State[]> {
  const apiUrl = getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/core/geo/states`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao buscar estados');
      } catch {
        if (response.status === 404) {
          throw new Error(
            'Rota de estados não encontrada. Verifique a configuração da API.',
          );
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error(`Erro ao buscar estados (${response.status})`);
      }
    }

    const data: StateListResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function getCities(): Promise<City[]> {
  const apiUrl = getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/core/geo/cities`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao buscar cidades');
      } catch {
        if (response.status === 404) {
          throw new Error(
            'Rota de cidades não encontrada. Verifique a configuração da API.',
          );
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error(`Erro ao buscar cidades (${response.status})`);
      }
    }

    const data: CityListResponse = await response.json();
    return data;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}
