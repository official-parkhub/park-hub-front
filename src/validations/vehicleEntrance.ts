import { z } from 'zod';

export const vehicleEntranceSchema = z.object({
  plate: z
    .string()
    .trim()
    .min(1, 'Placa é obrigatória')
    .max(20, 'Placa deve ter no máximo 20 caracteres'),
});
