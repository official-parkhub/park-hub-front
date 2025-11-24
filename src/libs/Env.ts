import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {},
  client: {
    NEXT_PUBLIC_API_URL: z.url({
      message: 'NEXT_PUBLIC_API_URL must be a valid URL',
    }),
    NEXT_PUBLIC_APP_URL: z
      .url({
        message: 'NEXT_PUBLIC_APP_URL must be a valid URL',
      })
      .optional(),
    NEXT_PUBLIC_LOGIN_ROUTE: z
      .string()
      .min(1, {
        message: 'NEXT_PUBLIC_LOGIN_ROUTE cannot be empty',
      })
      .optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_LOGIN_ROUTE: process.env.NEXT_PUBLIC_LOGIN_ROUTE,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
