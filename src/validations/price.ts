import { z } from 'zod';

export const parkingPriceSchema = z
  .object({
    week_day: z
      .number()
      .int('Dia da semana deve ser um número inteiro')
      .min(0, 'Dia da semana deve ser entre 0 e 6')
      .max(6, 'Dia da semana deve ser entre 0 e 6'),
    start_hour: z
      .number()
      .int('Horário de início deve ser um número inteiro')
      .min(0, 'Horário de início deve ser entre 0 e 23')
      .max(23, 'Horário de início deve ser entre 0 e 23'),
    end_hour: z
      .number()
      .int('Horário de fim deve ser um número inteiro')
      .min(0, 'Horário de fim deve ser entre 0 e 23')
      .max(23, 'Horário de fim deve ser entre 0 e 23'),
    price_cents: z
      .number()
      .int('Preço deve ser um número inteiro')
      .min(0, 'Preço deve ser maior ou igual a zero'),
    is_discount: z.boolean(),
  })
  .refine(data => data.start_hour < data.end_hour, {
    message: 'Horário de início deve ser menor que horário de fim',
    path: ['end_hour'],
  });

export const parkingPriceExceptionSchema = z
  .object({
    exception_date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (use YYYY-MM-DD)'),
    start_hour: z
      .number()
      .int('Horário de início deve ser um número inteiro')
      .min(0, 'Horário de início deve ser entre 0 e 23')
      .max(23, 'Horário de início deve ser entre 0 e 23'),
    end_hour: z
      .number()
      .int('Horário de fim deve ser um número inteiro')
      .min(0, 'Horário de fim deve ser entre 0 e 23')
      .max(23, 'Horário de fim deve ser entre 0 e 23'),
    price_cents: z
      .number()
      .int('Preço deve ser um número inteiro')
      .min(0, 'Preço deve ser maior ou igual a zero'),
    is_discount: z.boolean(),
    description: z
      .string()
      .max(500, 'Descrição deve ter no máximo 500 caracteres')
      .optional()
      .nullable(),
  })
  .refine(data => data.start_hour < data.end_hour, {
    message: 'Horário de início deve ser menor que horário de fim',
    path: ['end_hour'],
  });
