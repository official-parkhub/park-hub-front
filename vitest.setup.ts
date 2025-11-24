import { cleanup } from '@testing-library/react';
import React from 'react';
import { afterEach, vi } from 'vitest';
import '@testing-library/jest-dom';

process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
process.env.NEXT_PUBLIC_APP_URL = 'https://app.test.com';
process.env.NEXT_PUBLIC_LOGIN_ROUTE = '/login';

afterEach(() => {
  cleanup();
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('next/image', () => ({
  default: (props: any) => {
    return React.createElement('img', props);
  },
}));
