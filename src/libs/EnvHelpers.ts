import { getBaseUrl } from '@/utils/Helpers';
import { env } from './Env';

export function getApiUrl(): string {
  return env.NEXT_PUBLIC_API_URL;
}

export function getAppUrl(): string {
  return env.NEXT_PUBLIC_APP_URL ?? getBaseUrl();
}

export function getLoginRoute(): string {
  return env.NEXT_PUBLIC_LOGIN_ROUTE ?? '/login';
}

export function getLoginUrl(): string {
  const appUrl = getAppUrl();
  const loginRoute = getLoginRoute();
  const route = loginRoute.startsWith('/') ? loginRoute : `/${loginRoute}`;
  return `${appUrl}${route}`;
}
