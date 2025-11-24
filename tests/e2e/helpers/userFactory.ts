export type TestUser = {
  email: string;
  password: string;
  type: 'driver' | 'organization';
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  organizationName?: string;
  registerCode?: string;
  stateId?: string;
};

type ApiError = {
  detail?: Array<{
    loc: Array<string | number>;
    msg: string;
    type: string;
  }>;
};

type State = {
  id: string;
  name: string;
  iso2_code: string;
  country: 'BR';
};

export function getApiUrl(): string {
  if (process.env.E2E_API_URL) {
    return process.env.E2E_API_URL;
  }

  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:3000';

  if (baseUrl.includes('localhost:3000')) {
    return 'http://localhost:8000';
  }

  const derivedUrl = baseUrl.replace(':3000', ':8000');
  if (!derivedUrl || derivedUrl === baseUrl) {
    throw new Error(
      'API URL não configurada. Defina E2E_API_URL ou NEXT_PUBLIC_API_URL nas variáveis de ambiente.',
    );
  }

  return derivedUrl;
}

function generateTestEmail(type: 'driver' | 'organization'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `test-${type}-${timestamp}-${random}@example.com`;
}

async function getStates(): Promise<State[]> {
  const apiUrl = getApiUrl();
  try {
    const response = await fetch(`${apiUrl}/api/core/geo/states`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch states: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw new Error(
      `Error fetching states: ${error instanceof Error ? error.message : 'Unknown error'}`,
    );
  }
}

export async function createTestUser(type: 'driver' | 'organization'): Promise<TestUser> {
  let apiUrl: string;
  try {
    apiUrl = getApiUrl();
  } catch (error) {
    throw new Error(
      `Não foi possível determinar a URL da API: ${error instanceof Error ? error.message : 'Unknown error'}. ` +
        `Por favor, defina a variável de ambiente E2E_API_URL ou NEXT_PUBLIC_API_URL.`,
    );
  }

  const email = generateTestEmail(type);
  const password = 'TestPassword123!';

  console.log(`Attempting to create ${type} user via API at: ${apiUrl}`);
  try {
    if (type === 'driver') {
      const firstName = 'Test';
      const lastName = 'Driver';
      const birthDate = '1990-01-01';
      const response = await fetch(`${apiUrl}/api/core/customer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer: {
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
          },
          user: {
            email,
            password,
          },
        }),
      });

      if (!response.ok) {
        try {
          const error: ApiError = await response.json();
          const errorMessage = error.detail?.[0]?.msg || 'Erro ao criar conta de motorista';
          throw new Error(errorMessage);
        } catch {
          if (response.status === 500) {
            throw new Error('Erro do servidor ao criar motorista. Tente novamente mais tarde.');
          }
          throw new Error(`Erro ao criar conta de motorista (${response.status})`);
        }
      }

      return {
        email,
        password,
        type: 'driver',
        firstName,
        lastName,
        birthDate,
      };
    } else {
      const states = await getStates();
      if (states.length === 0) {
        throw new Error('Nenhum estado disponível para criar organização');
      }

      const stateId = states[0]?.id;
      if (!stateId) {
        throw new Error('No states available');
      }

      const organizationName = `Test Organization ${Date.now()}`;
      const registerCode = `TEST${Date.now().toString().slice(-6)}`;
      const response = await fetch(`${apiUrl}/api/core/organization`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization: {
            name: organizationName,
            register_code: registerCode,
            state_id: stateId,
          },
          user: {
            email,
            password,
          },
        }),
      });

      if (!response.ok) {
        try {
          const error: ApiError = await response.json();
          const errorMessage = error.detail?.[0]?.msg || 'Erro ao criar organização';
          throw new Error(errorMessage);
        } catch {
          if (response.status === 500) {
            throw new Error('Erro do servidor ao criar organização. Tente novamente mais tarde.');
          }
          throw new Error(`Erro ao criar organização (${response.status})`);
        }
      }

      return {
        email,
        password,
        type: 'organization',
        organizationName,
        registerCode,
        stateId,
      };
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error(
        `Erro de conexão ao criar usuário ${type}. ` +
          `Verifique se a API está rodando em ${apiUrl}. ` +
          `Erro: ${error.message}`,
      );
    }

    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
        throw new Error(
          `Não foi possível conectar à API em ${apiUrl}. ` +
            `Verifique se o servidor backend está rodando e acessível. ` +
            `Erro original: ${error.message}`,
        );
      }
    }

    throw error;
  }
}
