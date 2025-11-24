'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { startTransition, useEffect, useState } from 'react';
import CompanyForm from '@/components/company/CompanyForm';
import { getLoginRoute } from '@/libs/EnvHelpers';
import { getCurrentUser } from '@/services/auth/authService';
import { getUserEmail, removeToken } from '@/utils/tokenStorage';

export type NavLink = {
  href: string;
  label: string;
  ariaLabel?: string;
};

type HeaderProps = {
  currentPath?: string;
  navLinks?: NavLink[];
};

const defaultNavLinks: NavLink[] = [
  {
    href: '/home',
    label: 'Início',
    ariaLabel: 'Ir para página inicial',
  },
  {
    href: '/vehicles',
    label: 'Meus Veículos',
    ariaLabel: 'Gerenciar meus veículos',
  },
];

export default function Header({ currentPath, navLinks: customNavLinks }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isOrganization, setIsOrganization] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const activePath = currentPath || pathname;

  useEffect(() => {
    startTransition(() => {
      const email = getUserEmail();
      setUserEmail(email);
    });

    const checkUserType = async () => {
      try {
        const userInfo = await getCurrentUser();
        startTransition(() => {
          setIsOrganization(!!userInfo.organization);
        });
      } catch {
        startTransition(() => {
          setIsOrganization(false);
        });
      }
    };

    checkUserType();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        isMenuOpen
        && !target.closest('.header-menu')
        && !target.closest('.hamburger-button')
      ) {
        setIsMenuOpen(false);
      }
      if (
        isUserMenuOpen
        && !target.closest('.user-menu')
        && !target.closest('.user-menu-button')
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);

      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    if (isUserMenuOpen || isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isUserMenuOpen]);

  useEffect(() => {
    startTransition(() => {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    });
  }, [pathname]);

  const handleLogout = () => {
    removeToken();
    const loginRoute = getLoginRoute();
    router.push(loginRoute);
  };

  const handleCreateCompanyClick = () => {
    setIsFormOpen(true);
    setIsUserMenuOpen(false);
    setIsMenuOpen(false);
  };

  const handleFormClose = (open: boolean) => {
    setIsFormOpen(open);
  };

  const handleFormSuccess = (_companyId: string) => {};

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsMenuOpen(false);
      setIsUserMenuOpen(false);
    }
  };

  const userDisplayName = userEmail || 'Usuário';

  let navLinks = customNavLinks;
  if (!navLinks) {
    if (isOrganization) {
      navLinks = defaultNavLinks.filter(link => link.href !== '/vehicles');
    } else {
      navLinks = defaultNavLinks;
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-card border-b border-border transition-shadow duration-200 ${
        isScrolled ? 'shadow-md' : 'shadow-sm'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link
            href="/home"
            className="flex items-center gap-2 sm:gap-3 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 rounded-lg"
            aria-label="ParkHub - Ir para página inicial"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center shadow-md">
              <Image
                src="/images/logo/parkhub-logo.svg"
                alt="ParkHub Logo"
                width={24}
                height={29}
                className="w-5 h-auto sm:w-6 sm:h-auto"
                priority
              />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-foreground hidden sm:inline">
              ParkHub
            </span>
          </Link>

          <nav
            className="hidden md:flex items-center gap-1 lg:gap-2"
            aria-label="Navegação principal"
          >
            {navLinks.map((link) => {
              const isActive = activePath === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-4 py-2 rounded-lg text-sm lg:text-base font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                  } focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`}
                  aria-label={link.ariaLabel || link.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden md:block relative user-menu">
              <button
                type="button"
                onClick={toggleUserMenu}
                onKeyDown={handleMenuKeyDown}
                className="user-menu-button flex items-center gap-2 px-3 py-2 rounded-lg text-sm lg:text-base font-medium text-foreground hover:bg-accent transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                aria-label="Menu do usuário"
                aria-expanded={isUserMenuOpen}
                aria-haspopup="true"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>

                <span className="max-w-[150px] truncate">{userDisplayName}</span>

                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg bg-card border border-border shadow-lg z-50">
                  <div className="py-2">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {userDisplayName}
                      </p>
                      {userEmail && (
                        <p className="text-xs text-muted-foreground mt-1">{userEmail}</p>
                      )}
                    </div>

                    {isOrganization && (
                      <button
                        type="button"
                        onClick={handleCreateCompanyClick}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                        aria-label="Criar nova empresa"
                      >
                        <div className="flex items-center gap-2">
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4v16m8-8H4"
                            />
                          </svg>
                          <span>Criar Empresa</span>
                        </div>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                      aria-label="Sair da conta"
                    >
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                          />
                        </svg>
                        <span>Sair</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={toggleMenu}
              onKeyDown={handleMenuKeyDown}
              className="md:hidden hamburger-button p-2 rounded-lg text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
              aria-label="Abrir menu de navegação"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMenuOpen
                ? (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )
                : (
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  )}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-foreground/50 z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />

          <nav
            id="mobile-menu"
            className="header-menu fixed top-16 left-0 right-0 z-50 bg-card border-b border-border shadow-lg md:hidden"
            aria-label="Menu de navegação mobile"
          >
            <div className="px-4 py-2 space-y-1">
              {navLinks.map((link) => {
                const isActive = activePath === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    } focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2`}
                    aria-label={link.ariaLabel || link.label}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="px-4 py-3 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {userDisplayName}
                    </p>
                    {userEmail && (
                      <p className="text-xs text-muted-foreground">{userEmail}</p>
                    )}
                  </div>
                </div>

                {isOrganization && (
                  <button
                    type="button"
                    onClick={handleCreateCompanyClick}
                    className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-foreground hover:bg-accent transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2 mb-2"
                    aria-label="Criar nova empresa"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>Criar Empresa</span>
                    </div>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg text-base font-medium text-destructive hover:bg-destructive/10 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
                  aria-label="Sair da conta"
                >
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Sair</span>
                  </div>
                </button>
              </div>
            </div>
          </nav>
        </>
      )}

      <CompanyForm
        open={isFormOpen}
        onOpenChange={handleFormClose}
        onSuccess={handleFormSuccess}
      />
    </header>
  );
}
