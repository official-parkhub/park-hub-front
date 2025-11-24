import type { VehicleExitResponse } from './types';
import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

export async function registerVehicleExit(
  companyId: string,
  plate: string,
  endedAt?: string,
): Promise<VehicleExitResponse> {
  const apiUrl = getApiUrl();

  const body: { plate: string; ended_at?: string } = { plate };
  if (endedAt) {
    body.ended_at = endedAt;
  }

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/register-exit`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(body),
      },
    );

    if (!response.ok) {
      let errorMessage = 'Erro ao registrar saída do veículo';

      try {
        const error: ApiError = await response.json();

        if (error.detail && error.detail.length > 0 && error.detail[0]?.msg) {
          errorMessage = error.detail[0].msg;
        } else if (response.status === 422) {
          errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
        }
      } catch {
        if (response.status === 422) {
          errorMessage = 'Dados inválidos. Verifique os campos preenchidos.';
        } else if (response.status === 500) {
          errorMessage = 'Erro do servidor. Tente novamente mais tarde.';
        }
      }

      throw new Error(errorMessage);
    }

    const data: VehicleExitResponse = await response.json();
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
