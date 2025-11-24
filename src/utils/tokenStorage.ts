const TOKEN_KEY = 'parkhub_access_token';
const USER_EMAIL_KEY = 'parkhub_user_email';
const PROFILE_TYPE_KEY = 'parkhub_profile_type';

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return null;
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(TOKEN_KEY);
    removeUserEmail();
  }
}

export function hasToken(): boolean {
  return getToken() !== null;
}

export function saveUserEmail(email: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(USER_EMAIL_KEY, email);
  }
}

export function getUserEmail(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(USER_EMAIL_KEY);
  }
  return null;
}

export function removeUserEmail(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(USER_EMAIL_KEY);
  }
}

export function saveProfileType(profileType: 'driver' | 'organization'): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(PROFILE_TYPE_KEY, profileType);
  }
}

export function getProfileType(): 'driver' | 'organization' | null {
  if (typeof window !== 'undefined') {
    const profileType = localStorage.getItem(PROFILE_TYPE_KEY);
    if (profileType === 'driver' || profileType === 'organization') {
      return profileType;
    }
  }
  return null;
}

export function removeProfileType(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PROFILE_TYPE_KEY);
  }
}
