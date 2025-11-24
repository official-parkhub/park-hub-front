import type { ApiError } from '@/services/auth/types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

export async function registerVehicleEntrance(
  companyId: string,
  plate: string,
): Promise<void> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(
      `${apiUrl}/api/core/company/${companyId}/register-entrance`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ plate }),
      },
    );

    if (!response.ok) {
      let errorMessage = 'Erro ao registrar entrada do veículo';

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
