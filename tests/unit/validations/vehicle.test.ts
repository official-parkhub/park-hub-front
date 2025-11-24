import { describe, expect, it } from 'vitest';
import { vehicleFormSchema } from '@/validations/vehicle';

describe('vehicleFormSchema', () => {
  describe('required fields', () => {
    it('should validate valid vehicle data with all required fields', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');

        expect(result.data.name).toBe('Meu Carro');
      }
    });

    it('should reject when plate is missing', () => {
      const invalidData = {
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const plateError = result.error.issues.find(issue =>
          issue.path.includes('plate'),
        );
        expect(plateError).toBeDefined();
      }
    });

    it('should reject when name is missing', () => {
      const invalidData = {
        plate: 'ABC1234',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(issue =>
          issue.path.includes('name'),
        );
        expect(nameError).toBeDefined();
      }
    });

    it('should reject when plate is empty string', () => {
      const invalidData = {
        plate: '',
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('plate');

          expect(firstIssue.message).toBe('Placa é obrigatória');
        }
      }
    });

    it('should reject when name is empty string', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: '',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('name');

          expect(firstIssue.message).toBe('Apelido é obrigatório');
        }
      }
    });
  });

  describe('field length limits', () => {
    it('should reject plate longer than 20 characters', () => {
      const invalidData = {
        plate: 'A'.repeat(21),
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('plate');

          expect(firstIssue.message).toBe('Placa deve ter no máximo 20 caracteres');
        }
      }
    });

    it('should accept plate with exactly 20 characters', () => {
      const validData = {
        plate: 'A'.repeat(20),
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject name longer than 100 characters', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'A'.repeat(101),
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('name');

          expect(firstIssue.message).toBe('Apelido deve ter no máximo 100 caracteres');
        }
      }
    });

    it('should accept name with exactly 100 characters', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'A'.repeat(100),
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject model longer than 100 characters', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: 'A'.repeat(101),
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('model');

          expect(firstIssue.message).toBe('Modelo deve ter no máximo 100 caracteres');
        }
      }
    });

    it('should accept model with exactly 100 characters', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: 'A'.repeat(100),
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject color longer than 50 characters', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        color: 'A'.repeat(51),
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('color');

          expect(firstIssue.message).toBe('Cor deve ter no máximo 50 caracteres');
        }
      }
    });

    it('should accept color with exactly 50 characters', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        color: 'A'.repeat(50),
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('year validation', () => {
    it('should accept valid year within range', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: 2020,
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2020);
      }
    });

    it('should accept year at minimum boundary (1900)', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: 1900,
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(1900);
      }
    });

    it('should accept year at maximum boundary (2100)', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: 2100,
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.year).toBe(2100);
      }
    });

    it('should reject year below minimum (1899)', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: 1899,
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const yearError = result.error.issues.find(issue =>
          issue.path.includes('year'),
        );
        expect(yearError).toBeDefined();

        expect(yearError?.message).toBe('Ano deve ser entre 1900 e 2100');
      }
    });

    it('should reject year above maximum (2101)', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: 2101,
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const yearError = result.error.issues.find(issue =>
          issue.path.includes('year'),
        );
        expect(yearError).toBeDefined();

        expect(yearError?.message).toBe('Ano deve ser entre 1900 e 2100');
      }
    });

    it('should reject non-integer year', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: 2020.5,
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const yearError = result.error.issues.find(issue =>
          issue.path.includes('year'),
        );
        expect(yearError).toBeDefined();

        expect(yearError?.message).toBe('Ano deve ser um número inteiro');
      }
    });
  });

  describe('optional fields', () => {
    it('should accept data with only required fields', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBeUndefined();

        expect(result.data.year).toBeUndefined();

        expect(result.data.color).toBeUndefined();
      }
    });

    it('should accept data with all optional fields', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: 'Civic',
        year: 2020,
        color: 'Branco',
        country: 'BR',
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe('Civic');

        expect(result.data.year).toBe(2020);

        expect(result.data.color).toBe('Branco');

        expect(result.data.country).toBe('BR');
      }
    });

    it('should accept undefined for optional fields', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: undefined,
        year: undefined,
        color: undefined,
        country: undefined,
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should set default value for country when not provided', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe('BR');
      }
    });

    it('should accept custom country value', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        country: 'US',
      };
      const result = vehicleFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.country).toBe('US');
      }
    });
  });

  describe('invalid values', () => {
    it('should reject when plate is not a string', () => {
      const invalidData = {
        plate: 123,
        name: 'Meu Carro',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when name is not a string', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 123,
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when year is not a number', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        year: '2020',
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when model is not a string', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: 123,
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when color is not a string', () => {
      const invalidData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        color: 123,
      };
      const result = vehicleFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('complete validation scenarios', () => {
    it('should validate complete valid vehicle data', () => {
      const validData = {
        plate: 'ABC1234',
        name: 'Meu Carro',
        model: 'Honda Civic',
        year: 2020,
        color: 'Branco',
        country: 'BR',
      };
      const result = vehicleFormSchema.parse(validData);
      expect(result.plate).toBe('ABC1234');

      expect(result.name).toBe('Meu Carro');

      expect(result.model).toBe('Honda Civic');

      expect(result.year).toBe(2020);

      expect(result.color).toBe('Branco');

      expect(result.country).toBe('BR');
    });

    it('should validate minimal valid vehicle data', () => {
      const validData = {
        plate: 'XYZ5678',
        name: 'Moto',
      };
      const result = vehicleFormSchema.parse(validData);
      expect(result.plate).toBe('XYZ5678');

      expect(result.name).toBe('Moto');

      expect(result.country).toBe('BR');
    });
  });
});
