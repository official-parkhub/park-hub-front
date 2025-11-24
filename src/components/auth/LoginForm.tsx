'use client';

import type { ProfileType } from '@/services/auth/types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LabelText } from '@/components/ui/label-text';
import { getCurrentUser, login } from '@/services/auth/authService';
import {
  removeToken,
  saveProfileType,
  saveToken,
  saveUserEmail,
} from '@/utils/tokenStorage';
import { loginSchema } from '@/validations/auth';

type LoginFormProps = {
  onLoadingChange?: (loading: boolean) => void;
};

export default function LoginForm({ onLoadingChange }: LoginFormProps) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [profileType, setProfileType] = useState<ProfileType>('driver');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    username?: string;
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    const validationResult = loginSchema.safeParse({ username, password });

    if (!validationResult.success) {
      const errors: { username?: string; password?: string } = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0] === 'username') {
          errors.username = issue.message;
        }
        if (issue.path[0] === 'password') {
          errors.password = issue.message;
        }
      });
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    onLoadingChange?.(true);

    try {
      const response = await login({ username, password });

      saveToken(response.access_token);
      saveUserEmail(username);

      const userInfo = await getCurrentUser();

      const actualProfileType: ProfileType = userInfo.organization
        ? 'organization'
        : 'driver';

      if (profileType !== actualProfileType) {
        const expectedType = profileType === 'driver' ? 'motorista' : 'organização';
        const actualType = actualProfileType === 'driver' ? 'motorista' : 'organização';
        setError(
          `Você não pode entrar como ${expectedType}. Sua conta é de ${actualType}.`,
        );
        removeToken();
        setLoading(false);
        onLoadingChange?.(false);
        return;
      }

      saveProfileType(actualProfileType);

      if (profileType === 'driver') {
        router.push('/home');
      } else {
        router.push('/manager-dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-3">
        <LabelText htmlFor="profile-type">Tipo de Perfil</LabelText>
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-labelledby="profile-type"
        >
          <button
            type="button"
            onClick={() => setProfileType('driver')}
            className={`h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
              profileType === 'driver'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
            }`}
            aria-pressed={profileType === 'driver'}
            aria-label="Motorista"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-current"
              aria-hidden="true"
            >
              <path
                d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10V6c0-2-2-4-4-4H4c-2 0-4 2-4 4v10c0 .6.4 1 1 1h2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="7"
                cy="17"
                r="2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M9 17h6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="17"
                cy="17"
                r="2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Motorista</span>
          </button>
          <button
            type="button"
            onClick={() => setProfileType('organization')}
            className={`h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
              profileType === 'organization'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
            }`}
            aria-pressed={profileType === 'organization'}
            aria-label="Organização"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-current"
              aria-hidden="true"
            >
              <path
                d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="9"
                cy="7"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 21v-2a4 4 0 0 0-3-3.87"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M16 3.13a4 4 0 0 1 0 7.75"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Organização</span>
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <LabelText htmlFor="username">Email ou usuário</LabelText>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            setValidationErrors(prev => ({ ...prev, username: undefined }));
          }}
          placeholder="Digite seu email ou usuário"
          className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
            validationErrors.username ? 'border-destructive' : 'border-border'
          }`}
          aria-describedby={validationErrors.username ? 'username-error' : undefined}
          aria-invalid={!!validationErrors.username}
          disabled={loading}
          required
        />
        {validationErrors.username && (
          <p
            id="username-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.username}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <LabelText htmlFor="password">Senha</LabelText>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setValidationErrors(prev => ({ ...prev, password: undefined }));
          }}
          placeholder="Digite sua senha"
          className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
            validationErrors.password ? 'border-destructive' : 'border-border'
          }`}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
          aria-invalid={!!validationErrors.password}
          disabled={loading}
          required
        />
        {validationErrors.password && (
          <p
            id="password-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.password}
          </p>
        )}
      </div>

      {error && (
        <div
          className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5 flex-shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading
          ? (
              <>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Entrando...</span>
              </>
            )
          : (
              <span>
                Entrar como
                {' '}
                {profileType === 'driver' ? 'Motorista' : 'Organização'}
              </span>
            )}
      </button>
    </form>
  );
}
