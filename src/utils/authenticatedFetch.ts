import { getLoginRoute } from '@/libs/EnvHelpers';
import { getToken, removeToken } from './tokenStorage';

let isRedirecting = false;

function redirectToLogin(): void {
  if (typeof window !== 'undefined' && !isRedirecting) {
    const loginRoute = getLoginRoute();

    if (window.location.pathname === loginRoute) {
      return;
    }
    isRedirecting = true;
    window.location.href = loginRoute;
  }
}

export async function authenticatedFetch(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const token = getToken();

  if (!token) {
    throw new Error('Token de autenticação não encontrado');
  }

  const headers = new Headers(options?.headers);
  headers.set('Authorization', `Bearer ${token}`);

  const fetchOptions: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, fetchOptions);

    if (response.status === 401 || response.status === 403) {
      const contentType = response.headers.get('content-type');
      const isJsonError = contentType?.includes('application/json');

      if (isJsonError) {
        try {
          const errorData = await response.clone().json();

          if (errorData?.kind?.startsWith('AUTHENTICATION')) {
            removeToken();

            setTimeout(() => {
              redirectToLogin();

              setTimeout(() => {
                isRedirecting = false;
              }, 2000);
            }, 100);
            throw new Error('Token de autenticação inválido ou expirado');
          }

          return response;
        } catch (error) {
          if (error instanceof Error && error.message.includes('autenticação')) {
            throw error;
          }
        }
      }

      removeToken();

      setTimeout(() => {
        redirectToLogin();

        setTimeout(() => {
          isRedirecting = false;
        }, 2000);
      }, 100);
      throw new Error('Token de autenticação inválido ou expirado');
    }

    return response;
  } catch (error) {
    if (error instanceof Error && error.message.includes('autenticação')) {
      throw error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Verifique sua internet e tente novamente.');
    }
    throw error;
  }
}
