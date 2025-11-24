import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Email ou usuário é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const customerSignupSchema = z
  .object({
    first_name: z
      .string()
      .min(1, 'Primeiro nome é obrigatório')
      .max(50, 'Primeiro nome deve ter no máximo 50 caracteres'),
    last_name: z
      .string()
      .min(1, 'Último nome é obrigatório')
      .max(50, 'Último nome deve ter no máximo 50 caracteres'),
    birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
    email: z.email('Email inválido'),
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export const organizationSignupSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome da organização é obrigatório')
      .max(100, 'Nome da organização deve ter no máximo 100 caracteres'),
    register_code: z
      .string()
      .min(1, 'Código de registro é obrigatório')
      .max(50, 'Código de registro deve ter no máximo 50 caracteres'),
    state_id: z.string().uuid('ID do estado inválido'),
    email: z.string().email('Email inválido'),
    password: z
      .string()
      .min(6, 'Senha deve ter no mínimo 6 caracteres')
      .max(128, 'Senha deve ter no máximo 128 caracteres'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });
