import type {
  ApiError,
  CustomerSignupRequest,
  LoginRequest,
  LoginResponse,
  OrganizationSignupRequest,
  UserInfo,
} from './types';
import { getApiUrl } from '@/libs/EnvHelpers';
import { authenticatedFetch } from '@/utils/authenticatedFetch';

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const apiUrl = getApiUrl();
  const formData = new URLSearchParams();
  formData.append('username', credentials.username);
  formData.append('password', credentials.password);

  try {
    const response = await fetch(`${apiUrl}/api/core/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao fazer login');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao fazer login');
      }
    }

    return response.json();
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function signupCustomer(data: CustomerSignupRequest): Promise<void> {
  const apiUrl = getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/api/core/customer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao criar conta');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao criar conta');
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function signupOrganization(data: OrganizationSignupRequest): Promise<void> {
  const apiUrl = getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/api/core/organization`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(error.detail?.[0]?.msg || 'Erro ao criar organização');
      } catch {
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao criar organização');
      }
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Erro de conexão. Tente novamente.');
    }
    throw error;
  }
}

export async function getCurrentUser(): Promise<UserInfo> {
  const apiUrl = getApiUrl();

  try {
    const response = await authenticatedFetch(`${apiUrl}/api/core/me`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      try {
        const error: ApiError = await response.json();
        throw new Error(
          error.detail?.[0]?.msg || 'Erro ao buscar informações do usuário',
        );
      } catch {
        if (response.status === 401 || response.status === 403) {
          throw new Error('Token de autenticação inválido ou expirado');
        }
        if (response.status === 500) {
          throw new Error('Erro do servidor. Tente novamente mais tarde.');
        }
        throw new Error('Erro ao buscar informações do usuário');
      }
    }

    const data: UserInfo = await response.json();
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
