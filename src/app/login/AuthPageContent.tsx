'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

export default function AuthPageContent() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [isFormLoading, setIsFormLoading] = useState(false);

  return (
    <main
      id="main-content"
      className="flex min-h-screen flex-col items-center justify-center px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-12 lg:px-12 lg:py-16 bg-background overflow-x-hidden"
    >
      <div className="w-full max-w-md text-center space-y-6 sm:space-y-8 md:space-y-10 mx-auto">
        <div className="flex justify-start mb-2">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded px-2 py-1"
            aria-label="Voltar para a homepage"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
            Voltar à homepage
          </Link>
        </div>

        <header className="space-y-4 sm:space-y-5 md:space-y-6">
          <div className="flex justify-center mb-4 sm:mb-5 md:mb-6">
            <Link
              href="/"
              className="w-14 h-14 sm:w-16 sm:h-16 bg-primary rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="Voltar para a homepage"
            >
              <Image
                src="/images/logo/parkhub-logo.svg"
                alt="ParkHub - Sistema de gerenciamento de estacionamentos"
                width={32}
                height={38}
                className="w-8 h-auto sm:w-10 sm:h-auto"
                priority
              />
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2 sm:mb-3">
            ParkHub
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-2">
            {mode === 'login'
              ? 'Bem-vindo de volta! Faça login para continuar.'
              : 'Crie sua conta e comece a usar o ParkHub.'}
          </p>
        </header>

        <section
          className="bg-card rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-7 md:p-8 border-0 space-y-5 sm:space-y-6"
          aria-labelledby="auth-heading"
        >
          <h2 id="auth-heading" className="sr-only">
            {mode === 'login' ? 'Formulário de login' : 'Formulário de cadastro'}
          </h2>

          <nav aria-label="Alternar entre login e cadastro">
            <div className="flex items-center justify-center space-x-1 bg-muted rounded-xl p-1">
              <button
                type="button"
                onClick={() => setMode('login')}
                disabled={isFormLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'login'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                } ${isFormLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={mode === 'login'}
                aria-label="Modo de login"
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                disabled={isFormLoading}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  mode === 'signup'
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'text-muted-foreground hover:text-foreground'
                } ${isFormLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                aria-pressed={mode === 'signup'}
                aria-label="Modo de cadastro"
              >
                Cadastrar
              </button>
            </div>
          </nav>

          <div className="transition-all duration-300">
            {mode === 'login'
              ? (
                  <LoginForm onLoadingChange={setIsFormLoading} />
                )
              : (
                  <SignupForm
                    onLoadingChange={setIsFormLoading}
                    onSuccess={() => {
                      setTimeout(() => {
                        setMode('login');
                      }, 2000);
                    }}
                  />
                )}
          </div>

          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground">
              {mode === 'login'
                ? (
                    <>
                      Não tem uma conta?
                      {' '}
                      <button
                        type="button"
                        onClick={() => setMode('signup')}
                        disabled={isFormLoading}
                        className={`font-semibold text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card rounded ${
                          isFormLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Cadastre-se
                      </button>
                    </>
                  )
                : (
                    <>
                      Já tem uma conta?
                      {' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        disabled={isFormLoading}
                        className={`font-semibold text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-card rounded ${
                          isFormLoading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Entrar
                      </button>
                    </>
                  )}
            </p>
          </div>
        </section>

        <footer className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-muted-foreground">
            Soluções de estacionamento seguras para todos
          </p>
        </footer>
      </div>
    </main>
  );
}
