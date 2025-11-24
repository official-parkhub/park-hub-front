import { describe, expect, it } from 'vitest';
import { vehicleEntranceSchema } from '@/validations/vehicleEntrance';

describe('vehicleEntranceSchema', () => {
  describe('required fields', () => {
    it('should validate valid vehicle entrance data with plate', () => {
      const validData = {
        plate: 'ABC1234',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');
      }
    });

    it('should reject when plate is missing', () => {
      const invalidData = {};
      const result = vehicleEntranceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const plateError = result.error.issues.find(issue =>
          issue.path.includes('plate'),
        );
        expect(plateError).toBeDefined();
      }
    });

    it('should reject when plate is empty string', () => {
      const invalidData = {
        plate: '',
      };
      const result = vehicleEntranceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('plate');

          expect(firstIssue.message).toBe('Placa é obrigatória');
        }
      }
    });

    it('should reject when plate is only whitespace', () => {
      const invalidData = {
        plate: '   ',
      };
      const result = vehicleEntranceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const firstIssue = result.error.issues[0];
        if (firstIssue) {
          expect(firstIssue.path).toContain('plate');

          expect(firstIssue.message).toBe('Placa é obrigatória');
        }
      }
    });
  });

  describe('field length limits', () => {
    it('should reject plate longer than 20 characters', () => {
      const invalidData = {
        plate: 'A'.repeat(21),
      };
      const result = vehicleEntranceSchema.safeParse(invalidData);
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
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('A'.repeat(20));
      }
    });

    it('should accept plate with 1 character', () => {
      const validData = {
        plate: 'A',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('A');
      }
    });
  });

  describe('trimming', () => {
    it('should trim whitespace from plate', () => {
      const validData = {
        plate: '  ABC1234  ',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');
      }
    });

    it('should trim and validate plate with leading/trailing spaces', () => {
      const validData = {
        plate: '  XYZ9876  ',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('XYZ9876');
      }
    });
  });

  describe('valid plate examples', () => {
    it('should accept old format plate (ABC1234)', () => {
      const validData = {
        plate: 'ABC1234',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');
      }
    });

    it('should accept Mercosul format plate (ABC1D23)', () => {
      const validData = {
        plate: 'ABC1D23',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1D23');
      }
    });

    it('should accept plate with numbers only', () => {
      const validData = {
        plate: '1234567',
      };
      const result = vehicleEntranceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('1234567');
      }
    });
  });
});
