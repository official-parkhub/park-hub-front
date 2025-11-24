'use client';

import type { ProfileType } from '@/services/auth/types';
import type { State } from '@/services/geo/types';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { getLoginRoute } from '@/libs/EnvHelpers';
import { signupCustomer, signupOrganization } from '@/services/auth/authService';
import { getStates } from '@/services/geo/geoService';
import { customerSignupSchema, organizationSignupSchema } from '@/validations/auth';

type SignupFormProps = {
  onLoadingChange?: (loading: boolean) => void;
  onSuccess?: () => void;
};

export default function SignupForm({ onLoadingChange, onSuccess }: SignupFormProps) {
  const router = useRouter();
  const [signupType, setSignupType] = useState<ProfileType>('driver');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [organizationName, setOrganizationName] = useState('');
  const [registerCode, setRegisterCode] = useState('');
  const [stateId, setStateId] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [statesError, setStatesError] = useState<string | null>(null);

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const loadStates = useCallback(async () => {
    setLoadingStates(true);
    setStatesError(null);
    try {
      const statesList = await getStates();
      setStates(statesList);
    } catch (err) {
      setStatesError(err instanceof Error ? err.message : 'Erro ao carregar estados');
    } finally {
      setLoadingStates(false);
    }
  }, []);

  const clearForm = useCallback(() => {
    setFirstName('');
    setLastName('');
    setBirthDate('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setOrganizationName('');
    setRegisterCode('');
    setStateId('');
    setValidationErrors({});
    setError(null);
    setSuccess(false);
  }, []);

  useEffect(() => {
    if (
      signupType === 'organization'
      && states.length === 0
      && !loadingStates
      && !statesError
    ) {
      loadStates();
    }
  }, [signupType, states.length, loadingStates, statesError, loadStates]);

  const handleSignupTypeChange = (type: ProfileType) => {
    setSignupType(type);
    clearForm();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setValidationErrors({});

    try {
      if (signupType === 'driver') {
        const validationResult = customerSignupSchema.safeParse({
          first_name: firstName,
          last_name: lastName,
          birth_date: birthDate,
          email,
          password,
          confirmPassword,
        });

        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            errors[field] = issue.message;
          });
          setValidationErrors(errors);
          return;
        }

        setLoading(true);
        onLoadingChange?.(true);

        await signupCustomer({
          customer: {
            first_name: firstName,
            last_name: lastName,
            birth_date: birthDate,
          },
          user: {
            email,
            password,
          },
        });

        setLoading(false);
        onLoadingChange?.(false);
        setSuccess(true);

        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            const loginRoute = getLoginRoute();
            router.replace(loginRoute);
          }, 2000);
        }
      } else {
        const validationResult = organizationSignupSchema.safeParse({
          name: organizationName,
          register_code: registerCode,
          state_id: stateId,
          email,
          password,
          confirmPassword,
        });

        if (!validationResult.success) {
          const errors: Record<string, string> = {};
          validationResult.error.issues.forEach((issue) => {
            const field = issue.path[0] as string;
            errors[field] = issue.message;
          });
          setValidationErrors(errors);
          return;
        }

        setLoading(true);
        onLoadingChange?.(true);

        await signupOrganization({
          organization: {
            name: organizationName,
            register_code: registerCode,
            state_id: stateId,
          },
          user: {
            email,
            password,
          },
        });

        setLoading(false);
        onLoadingChange?.(false);
        setSuccess(true);

        if (onSuccess) {
          onSuccess();
        } else {
          setTimeout(() => {
            const loginRoute = getLoginRoute();
            router.replace(loginRoute);
          }, 2000);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
      setLoading(false);
      onLoadingChange?.(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-3">
        <label
          htmlFor="signup-type"
          className="block text-sm font-medium text-foreground"
        >
          Tipo de Perfil
        </label>
        <div
          className="grid grid-cols-2 gap-2"
          role="radiogroup"
          aria-labelledby="signup-type"
        >
          <button
            type="button"
            onClick={() => handleSignupTypeChange('driver')}
            disabled={loading || success}
            className={`h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
              signupType === 'driver'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
            } ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={signupType === 'driver'}
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
            onClick={() => handleSignupTypeChange('organization')}
            disabled={loading || success}
            className={`h-12 rounded-xl border-2 transition-all duration-200 flex items-center justify-center space-x-2 ${
              signupType === 'organization'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground hover:border-primary/50'
            } ${loading || success ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={signupType === 'organization'}
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

      {signupType === 'driver' && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="block text-sm font-medium text-foreground"
              >
                Primeiro Nome
              </label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  setValidationErrors((prev) => {
                    const { first_name, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Primeiro nome"
                className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                  validationErrors.first_name ? 'border-destructive' : 'border-border'
                }`}
                aria-describedby={
                  validationErrors.first_name ? 'firstName-error' : undefined
                }
                aria-invalid={!!validationErrors.first_name}
                disabled={loading || success}
                required
              />
              {validationErrors.first_name && (
                <p
                  id="firstName-error"
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {validationErrors.first_name}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="block text-sm font-medium text-foreground"
              >
                Último Nome
              </label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value);
                  setValidationErrors((prev) => {
                    const { last_name, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="Último nome"
                className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                  validationErrors.last_name ? 'border-destructive' : 'border-border'
                }`}
                aria-describedby={
                  validationErrors.last_name ? 'lastName-error' : undefined
                }
                aria-invalid={!!validationErrors.last_name}
                disabled={loading || success}
                required
              />
              {validationErrors.last_name && (
                <p
                  id="lastName-error"
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {validationErrors.last_name}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-foreground"
            >
              Data de Nascimento
            </label>
            <input
              id="birthDate"
              type="date"
              value={birthDate}
              onChange={(e) => {
                setBirthDate(e.target.value);
                setValidationErrors((prev) => {
                  const { birth_date, ...rest } = prev;
                  return rest;
                });
              }}
              className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                validationErrors.birth_date ? 'border-destructive' : 'border-border'
              }`}
              aria-describedby={
                validationErrors.birth_date ? 'birthDate-error' : undefined
              }
              aria-invalid={!!validationErrors.birth_date}
              disabled={loading}
              required
            />
            {validationErrors.birth_date && (
              <p
                id="birthDate-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {validationErrors.birth_date}
              </p>
            )}
          </div>
        </>
      )}

      {signupType === 'organization' && (
        <>
          <div className="space-y-2">
            <label
              htmlFor="organizationName"
              className="block text-sm font-medium text-foreground"
            >
              Nome da Organização
            </label>
            <input
              id="organizationName"
              type="text"
              value={organizationName}
              onChange={(e) => {
                setOrganizationName(e.target.value);
                setValidationErrors((prev) => {
                  const { name, ...rest } = prev;
                  return rest;
                });
              }}
              placeholder="Nome da organização"
              className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                validationErrors.name ? 'border-destructive' : 'border-border'
              }`}
              aria-describedby={
                validationErrors.name ? 'organizationName-error' : undefined
              }
              aria-invalid={!!validationErrors.name}
              disabled={loading}
              required
            />
            {validationErrors.name && (
              <p
                id="organizationName-error"
                className="text-sm text-destructive"
                role="alert"
                aria-live="polite"
              >
                {validationErrors.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label
                htmlFor="registerCode"
                className="block text-sm font-medium text-foreground"
              >
                Código de Registro
              </label>
              <input
                id="registerCode"
                type="text"
                value={registerCode}
                onChange={(e) => {
                  setRegisterCode(e.target.value);
                  setValidationErrors((prev) => {
                    const { register_code, ...rest } = prev;
                    return rest;
                  });
                }}
                placeholder="CNPJ"
                className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
                  validationErrors.register_code ? 'border-destructive' : 'border-border'
                }`}
                aria-describedby={
                  validationErrors.register_code ? 'registerCode-error' : undefined
                }
                aria-invalid={!!validationErrors.register_code}
                disabled={loading || success}
                required
              />
              {validationErrors.register_code && (
                <p
                  id="registerCode-error"
                  className="text-sm text-destructive"
                  role="alert"
                  aria-live="polite"
                >
                  {validationErrors.register_code}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label
                htmlFor="stateId"
                className="block text-sm font-medium text-foreground"
              >
                Estado
              </label>
              {loadingStates
                ? (
                    <div className="w-full h-12 px-4 bg-input border border-border rounded-xl flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 text-muted-foreground"
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
                      <span className="ml-2 text-sm text-muted-foreground">
                        Carregando estados...
                      </span>
                    </div>
                  )
                : statesError
                  ? (
                      <div className="space-y-2">
                        <div className="w-full h-12 px-4 bg-destructive/10 border border-destructive rounded-xl flex items-center">
                          <p className="text-sm text-destructive">{statesError}</p>
                        </div>
                        <button
                          type="button"
                          onClick={loadStates}
                          className="text-sm text-primary hover:text-primary/80 underline"
                        >
                          Tentar novamente
                        </button>
                      </div>
                    )
                  : (
                      <>
                        <div className="relative">
                          <select
                            id="stateId"
                            value={stateId}
                            onChange={(e) => {
                              setStateId(e.target.value);
                              setValidationErrors((prev) => {
                                const { state_id, ...rest } = prev;
                                return rest;
                              });
                            }}
                            className={`w-full h-12 px-4 pr-10 bg-input border rounded-xl text-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 appearance-none cursor-pointer ${
                              validationErrors.state_id ? 'border-destructive' : 'border-border'
                            }`}
                            aria-describedby={
                              validationErrors.state_id ? 'stateId-error' : undefined
                            }
                            aria-invalid={!!validationErrors.state_id}
                            disabled={loading || success || states.length === 0}
                            required
                          >
                            <option value="">Selecione um estado</option>
                            {states.map(state => (
                              <option key={state.id} value={state.id}>
                                {state.name}
                                {' '}
                                (
                                {state.iso2_code}
                                )
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <svg
                              className="h-5 w-5 text-muted-foreground"
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                fillRule="evenodd"
                                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                        {validationErrors.state_id && (
                          <p
                            id="stateId-error"
                            className="text-sm text-destructive"
                            role="alert"
                            aria-live="polite"
                          >
                            {validationErrors.state_id}
                          </p>
                        )}
                      </>
                    )}
            </div>
          </div>
        </>
      )}

      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-foreground">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setValidationErrors((prev) => {
              const { email, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="Digite seu email"
          className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
            validationErrors.email ? 'border-destructive' : 'border-border'
          }`}
          aria-describedby={validationErrors.email ? 'email-error' : undefined}
          aria-invalid={!!validationErrors.email}
          disabled={loading || success}
          required
        />
        {validationErrors.email && (
          <p
            id="email-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-foreground">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setValidationErrors((prev) => {
              const { password, confirmPassword, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="Digite sua senha"
          className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
            validationErrors.password ? 'border-destructive' : 'border-border'
          }`}
          aria-describedby={validationErrors.password ? 'password-error' : undefined}
          aria-invalid={!!validationErrors.password}
          disabled={loading || success}
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

      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-foreground"
        >
          Confirmar Senha
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            setValidationErrors((prev) => {
              const { confirmPassword, ...rest } = prev;
              return rest;
            });
          }}
          placeholder="Confirme sua senha"
          className={`w-full h-12 px-4 bg-input border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200 ${
            validationErrors.confirmPassword ? 'border-destructive' : 'border-border'
          }`}
          aria-describedby={
            validationErrors.confirmPassword ? 'confirmPassword-error' : undefined
          }
          aria-invalid={!!validationErrors.confirmPassword}
          disabled={loading || success}
          required
        />
        {validationErrors.confirmPassword && (
          <p
            id="confirmPassword-error"
            className="text-sm text-destructive"
            role="alert"
            aria-live="polite"
          >
            {validationErrors.confirmPassword}
          </p>
        )}
      </div>

      {success && (
        <div
          className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
          role="alert"
          aria-live="assertive"
        >
          <div className="flex items-center space-x-2">
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-sm font-medium">Conta criada com sucesso</p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || success}
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
                <span>Criando conta...</span>
              </>
            )
          : (
              <span>
                Criar conta como
                {signupType === 'driver' ? 'Motorista' : 'Organização'}
              </span>
            )}
      </button>
    </form>
  );
}
