import { describe, expect, it } from 'vitest';
import { vehicleExitSchema } from '@/validations/vehicleExit';

describe('vehicleExitSchema', () => {
  describe('required fields', () => {
    it('should validate valid vehicle exit data with plate only', () => {
      const validData = {
        plate: 'ABC1234',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');

        expect(result.data.ended_at).toBeUndefined();
      }
    });

    it('should validate valid vehicle exit data with plate and ended_at', () => {
      const validData = {
        plate: 'ABC1234',
        ended_at: '2024-01-15T14:30:00Z',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');

        expect(result.data.ended_at).toBe('2024-01-15T14:30:00Z');
      }
    });

    it('should reject when plate is missing', () => {
      const invalidData = {
        ended_at: '2024-01-15T14:30:00Z',
      };
      const result = vehicleExitSchema.safeParse(invalidData);
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
      const result = vehicleExitSchema.safeParse(invalidData);
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
      const result = vehicleExitSchema.safeParse(invalidData);
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
      const result = vehicleExitSchema.safeParse(invalidData);
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
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('A'.repeat(20));
      }
    });
  });

  describe('ended_at validation', () => {
    it('should accept valid ISO 8601 datetime with Z timezone', () => {
      const validData = {
        plate: 'ABC1234',
        ended_at: '2024-01-15T14:30:00Z',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ended_at).toBe('2024-01-15T14:30:00Z');
      }
    });

    it('should accept valid ISO 8601 datetime with timezone offset', () => {
      const validData = {
        plate: 'ABC1234',
        ended_at: '2024-01-15T14:30:00-03:00',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ended_at).toBe('2024-01-15T14:30:00-03:00');
      }
    });

    it('should accept valid ISO 8601 datetime without timezone', () => {
      const validData = {
        plate: 'ABC1234',
        ended_at: '2024-01-15T14:30:00',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ended_at).toBe('2024-01-15T14:30:00');
      }
    });

    it('should reject invalid datetime format', () => {
      const invalidData = {
        plate: 'ABC1234',
        ended_at: '2024-01-15 14:30:00',
      };
      const result = vehicleExitSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endedAtError = result.error.issues.find(issue =>
          issue.path.includes('ended_at'),
        );
        expect(endedAtError).toBeDefined();

        expect(endedAtError?.message).toContain('ISO 8601');
      }
    });

    it('should reject date without time', () => {
      const invalidData = {
        plate: 'ABC1234',
        ended_at: '2024-01-15',
      };
      const result = vehicleExitSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endedAtError = result.error.issues.find(issue =>
          issue.path.includes('ended_at'),
        );
        expect(endedAtError).toBeDefined();

        expect(endedAtError?.message).toContain('ISO 8601');
      }
    });

    it('should reject invalid date format', () => {
      const invalidData = {
        plate: 'ABC1234',
        ended_at: '15/01/2024 14:30',
      };
      const result = vehicleExitSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endedAtError = result.error.issues.find(issue =>
          issue.path.includes('ended_at'),
        );
        expect(endedAtError).toBeDefined();

        expect(endedAtError?.message).toContain('ISO 8601');
      }
    });

    it('should accept undefined ended_at (optional field)', () => {
      const validData = {
        plate: 'ABC1234',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ended_at).toBeUndefined();
      }
    });

    it('should accept null ended_at (treated as optional)', () => {
      const validData = {
        plate: 'ABC1234',
        ended_at: undefined,
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.ended_at).toBeUndefined();
      }
    });
  });

  describe('trimming', () => {
    it('should trim whitespace from plate', () => {
      const validData = {
        plate: '  ABC1234  ',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');
      }
    });
  });

  describe('valid plate examples', () => {
    it('should accept old format plate (ABC1234)', () => {
      const validData = {
        plate: 'ABC1234',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1234');
      }
    });

    it('should accept Mercosul format plate (ABC1D23)', () => {
      const validData = {
        plate: 'ABC1D23',
      };
      const result = vehicleExitSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.plate).toBe('ABC1D23');
      }
    });
  });
});
