import { z } from 'zod';

export const vehicleExitSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(1, 'Placa é obrigatória')
    .max(20, 'Placa deve ter no máximo 20 caracteres'),
  ended_at: z
    .string()
    .refine(
      (val) => {
        const iso8601Regex
          = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;
        if (!iso8601Regex.test(val)) {
          return false;
        }

        const date = new Date(val);
        return !Number.isNaN(date.getTime());
      },
      {
        message:
          'Data e hora de saída deve estar no formato ISO 8601 (ex: 2024-01-15T14:30:00Z)',
      },
    )
    .optional(),
});
