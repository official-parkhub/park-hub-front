import { z } from 'zod';
import { isValidCEP, isValidCNPJ } from '../utils/validators';

export const companyFormSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  postal_code: z.string().min(1, 'CEP é obrigatório').refine(isValidCEP, 'CEP inválido'),
  register_code: z
    .string()
    .min(1, 'CNPJ é obrigatório')
    .refine(isValidCNPJ, 'CNPJ inválido'),
  address: z.string().min(1, 'Endereço é obrigatório'),
  description: z.string().nullable().optional(),
  is_covered: z.boolean().default(false),
  has_camera: z.boolean().default(false),
  total_spots: z
    .number()
    .int('Total de vagas deve ser um número inteiro')
    .min(1, 'Total de vagas deve ser pelo menos 1'),
  has_charging_station: z.boolean().default(false),
  city_id: z.string().uuid('Cidade é obrigatória'),
});
