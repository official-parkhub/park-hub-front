import { z } from 'zod';

export const vehicleFormSchema = z.object({
  plate: z
    .string()
    .min(1, 'Placa é obrigatória')
    .max(20, 'Placa deve ter no máximo 20 caracteres'),
  name: z
    .string()
    .min(1, 'Apelido é obrigatório')
    .max(100, 'Apelido deve ter no máximo 100 caracteres'),
  model: z.string().max(100, 'Modelo deve ter no máximo 100 caracteres').optional(),
  year: z
    .number()
    .min(1900, 'Ano deve ser entre 1900 e 2100')
    .max(2100, 'Ano deve ser entre 1900 e 2100')
    .int('Ano deve ser um número inteiro')
    .optional(),
  color: z.string().max(50, 'Cor deve ter no máximo 50 caracteres').optional(),
  country: z.string().default('BR').optional(),
});
