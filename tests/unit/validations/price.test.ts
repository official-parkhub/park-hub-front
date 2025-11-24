import { describe, expect, it } from 'vitest';
import { parkingPriceExceptionSchema, parkingPriceSchema } from '@/validations/price';

describe('parkingPriceSchema', () => {
  describe('required fields', () => {
    it('should validate valid parking price data with all required fields', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.week_day).toBe(0);

        expect(result.data.start_hour).toBe(8);

        expect(result.data.end_hour).toBe(18);

        expect(result.data.price_cents).toBe(1000);

        expect(result.data.is_discount).toBe(false);
      }
    });

    it('should reject when week_day is missing', () => {
      const invalidData = {
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const weekDayError = result.error.issues.find(issue =>
          issue.path.includes('week_day'),
        );
        expect(weekDayError).toBeDefined();
      }
    });

    it('should reject when start_hour is missing', () => {
      const invalidData = {
        week_day: 0,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const startHourError = result.error.issues.find(issue =>
          issue.path.includes('start_hour'),
        );
        expect(startHourError).toBeDefined();
      }
    });

    it('should reject when end_hour is missing', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(issue =>
          issue.path.includes('end_hour'),
        );
        expect(endHourError).toBeDefined();
      }
    });

    it('should reject when price_cents is missing', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const priceCentsError = result.error.issues.find(issue =>
          issue.path.includes('price_cents'),
        );
        expect(priceCentsError).toBeDefined();
      }
    });

    it('should reject when is_discount is missing', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const isDiscountError = result.error.issues.find(issue =>
          issue.path.includes('is_discount'),
        );
        expect(isDiscountError).toBeDefined();
      }
    });
  });

  describe('week_day validation', () => {
    it('should accept week_day at minimum boundary (0)', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.week_day).toBe(0);
      }
    });

    it('should accept week_day at maximum boundary (6)', () => {
      const validData = {
        week_day: 6,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.week_day).toBe(6);
      }
    });

    it('should reject week_day below minimum (-1)', () => {
      const invalidData = {
        week_day: -1,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const weekDayError = result.error.issues.find(issue =>
          issue.path.includes('week_day'),
        );
        expect(weekDayError).toBeDefined();

        expect(weekDayError?.message).toBe('Dia da semana deve ser entre 0 e 6');
      }
    });

    it('should reject week_day above maximum (7)', () => {
      const invalidData = {
        week_day: 7,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const weekDayError = result.error.issues.find(issue =>
          issue.path.includes('week_day'),
        );
        expect(weekDayError).toBeDefined();

        expect(weekDayError?.message).toBe('Dia da semana deve ser entre 0 e 6');
      }
    });

    it('should reject non-integer week_day', () => {
      const invalidData = {
        week_day: 1.5,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const weekDayError = result.error.issues.find(issue =>
          issue.path.includes('week_day'),
        );
        expect(weekDayError).toBeDefined();

        expect(weekDayError?.message).toBe('Dia da semana deve ser um número inteiro');
      }
    });
  });

  describe('hour validation', () => {
    it('should accept start_hour at minimum boundary (0)', () => {
      const validData = {
        week_day: 0,
        start_hour: 0,
        end_hour: 23,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.start_hour).toBe(0);
      }
    });

    it('should accept start_hour at maximum boundary (23)', () => {
      const validData = {
        week_day: 0,
        start_hour: 22,
        end_hour: 23,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.start_hour).toBe(22);
      }
    });

    it('should reject start_hour below minimum (-1)', () => {
      const invalidData = {
        week_day: 0,
        start_hour: -1,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const startHourError = result.error.issues.find(issue =>
          issue.path.includes('start_hour'),
        );
        expect(startHourError).toBeDefined();

        expect(startHourError?.message).toBe('Horário de início deve ser entre 0 e 23');
      }
    });

    it('should reject start_hour above maximum (24)', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 24,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const startHourError = result.error.issues.find(issue =>
          issue.path.includes('start_hour'),
        );
        expect(startHourError).toBeDefined();

        expect(startHourError?.message).toBe('Horário de início deve ser entre 0 e 23');
      }
    });

    it('should reject non-integer start_hour', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8.5,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const startHourError = result.error.issues.find(issue =>
          issue.path.includes('start_hour'),
        );
        expect(startHourError).toBeDefined();

        expect(startHourError?.message).toBe(
          'Horário de início deve ser um número inteiro',
        );
      }
    });

    it('should accept end_hour at minimum boundary (0)', () => {
      const validData = {
        week_day: 0,
        start_hour: 0,
        end_hour: 1,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.end_hour).toBe(1);
      }
    });

    it('should accept end_hour at maximum boundary (23)', () => {
      const validData = {
        week_day: 0,
        start_hour: 0,
        end_hour: 23,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.end_hour).toBe(23);
      }
    });

    it('should reject end_hour below minimum (-1)', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: -1,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(issue =>
          issue.path.includes('end_hour'),
        );
        expect(endHourError).toBeDefined();

        expect(endHourError?.message).toBe('Horário de fim deve ser entre 0 e 23');
      }
    });

    it('should reject end_hour above maximum (24)', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 24,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(issue =>
          issue.path.includes('end_hour'),
        );
        expect(endHourError).toBeDefined();

        expect(endHourError?.message).toBe('Horário de fim deve ser entre 0 e 23');
      }
    });

    it('should reject non-integer end_hour', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18.5,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(issue =>
          issue.path.includes('end_hour'),
        );
        expect(endHourError).toBeDefined();

        expect(endHourError?.message).toBe('Horário de fim deve ser um número inteiro');
      }
    });
  });

  describe('price_cents validation', () => {
    it('should accept price_cents at minimum boundary (0)', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 0,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price_cents).toBe(0);
      }
    });

    it('should accept positive price_cents', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 5000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.price_cents).toBe(5000);
      }
    });

    it('should reject price_cents below minimum (-1)', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: -1,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const priceCentsError = result.error.issues.find(issue =>
          issue.path.includes('price_cents'),
        );
        expect(priceCentsError).toBeDefined();

        expect(priceCentsError?.message).toBe('Preço deve ser maior ou igual a zero');
      }
    });

    it('should reject non-integer price_cents', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000.5,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const priceCentsError = result.error.issues.find(issue =>
          issue.path.includes('price_cents'),
        );
        expect(priceCentsError).toBeDefined();

        expect(priceCentsError?.message).toBe('Preço deve ser um número inteiro');
      }
    });
  });

  describe('is_discount validation', () => {
    it('should accept is_discount as true', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: true,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_discount).toBe(true);
      }
    });

    it('should accept is_discount as false', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_discount).toBe(false);
      }
    });

    it('should reject is_discount when not a boolean', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: 'true',
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('custom validation: start_hour < end_hour', () => {
    it('should accept when start_hour is less than end_hour', () => {
      const validData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when start_hour equals end_hour', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 8,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(
          issue =>
            issue.path.includes('end_hour')
            && issue.message === 'Horário de início deve ser menor que horário de fim',
        );
        expect(endHourError).toBeDefined();
      }
    });

    it('should reject when start_hour is greater than end_hour', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 18,
        end_hour: 8,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(
          issue =>
            issue.path.includes('end_hour')
            && issue.message === 'Horário de início deve ser menor que horário de fim',
        );
        expect(endHourError).toBeDefined();
      }
    });
  });

  describe('type validation', () => {
    it('should reject when week_day is not a number', () => {
      const invalidData = {
        week_day: '0',
        start_hour: 8,
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when start_hour is not a number', () => {
      const invalidData = {
        week_day: 0,
        start_hour: '8',
        end_hour: 18,
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when end_hour is not a number', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: '18',
        price_cents: 1000,
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when price_cents is not a number', () => {
      const invalidData = {
        week_day: 0,
        start_hour: 8,
        end_hour: 18,
        price_cents: '1000',
        is_discount: false,
      };
      const result = parkingPriceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});

describe('parkingPriceExceptionSchema', () => {
  describe('required fields', () => {
    it('should validate valid exception data with all required fields', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
        description: 'Natal',
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exception_date).toBe('2024-12-25');

        expect(result.data.start_hour).toBe(0);

        expect(result.data.end_hour).toBe(23);

        expect(result.data.price_cents).toBe(2000);

        expect(result.data.is_discount).toBe(false);

        expect(result.data.description).toBe('Natal');
      }
    });

    it('should validate exception data without description', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should validate exception data with null description', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
        description: null,
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeNull();
      }
    });

    it('should reject when exception_date is missing', () => {
      const invalidData = {
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const exceptionDateError = result.error.issues.find(issue =>
          issue.path.includes('exception_date'),
        );
        expect(exceptionDateError).toBeDefined();
      }
    });
  });

  describe('exception_date validation', () => {
    it('should accept valid date in YYYY-MM-DD format', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.exception_date).toBe('2024-12-25');
      }
    });

    it('should reject date in wrong format (DD-MM-YYYY)', () => {
      const invalidData = {
        exception_date: '25-12-2024',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const exceptionDateError = result.error.issues.find(issue =>
          issue.path.includes('exception_date'),
        );
        expect(exceptionDateError).toBeDefined();

        expect(exceptionDateError?.message).toBe('Data inválida (use YYYY-MM-DD)');
      }
    });

    it('should reject date in wrong format (YYYY/MM/DD)', () => {
      const invalidData = {
        exception_date: '2024/12/25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const exceptionDateError = result.error.issues.find(issue =>
          issue.path.includes('exception_date'),
        );
        expect(exceptionDateError).toBeDefined();

        expect(exceptionDateError?.message).toBe('Data inválida (use YYYY-MM-DD)');
      }
    });

    it('should reject empty string for exception_date', () => {
      const invalidData = {
        exception_date: '',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const exceptionDateError = result.error.issues.find(issue =>
          issue.path.includes('exception_date'),
        );
        expect(exceptionDateError).toBeDefined();
      }
    });

    it('should reject invalid date format (YYYY-M-D)', () => {
      const invalidData = {
        exception_date: '2024-1-5',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const exceptionDateError = result.error.issues.find(issue =>
          issue.path.includes('exception_date'),
        );
        expect(exceptionDateError).toBeDefined();

        expect(exceptionDateError?.message).toBe('Data inválida (use YYYY-MM-DD)');
      }
    });
  });

  describe('hour validation', () => {
    it('should accept valid hours within range', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 8,
        end_hour: 18,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject start_hour below minimum', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: -1,
        end_hour: 18,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const startHourError = result.error.issues.find(issue =>
          issue.path.includes('start_hour'),
        );
        expect(startHourError).toBeDefined();

        expect(startHourError?.message).toBe('Horário de início deve ser entre 0 e 23');
      }
    });

    it('should reject end_hour above maximum', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: 8,
        end_hour: 24,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(issue =>
          issue.path.includes('end_hour'),
        );
        expect(endHourError).toBeDefined();

        expect(endHourError?.message).toBe('Horário de fim deve ser entre 0 e 23');
      }
    });
  });

  describe('price_cents validation', () => {
    it('should accept valid price_cents', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject negative price_cents', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: -1,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const priceCentsError = result.error.issues.find(issue =>
          issue.path.includes('price_cents'),
        );
        expect(priceCentsError).toBeDefined();

        expect(priceCentsError?.message).toBe('Preço deve ser maior ou igual a zero');
      }
    });
  });

  describe('description validation', () => {
    it('should accept description with maximum length (500)', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
        description: 'A'.repeat(500),
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('A'.repeat(500));
      }
    });

    it('should reject description longer than maximum (501)', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
        description: 'A'.repeat(501),
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const descriptionError = result.error.issues.find(issue =>
          issue.path.includes('description'),
        );
        expect(descriptionError).toBeDefined();

        expect(descriptionError?.message).toBe(
          'Descrição deve ter no máximo 500 caracteres',
        );
      }
    });

    it('should accept empty string for description', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
        description: '',
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('custom validation: start_hour < end_hour', () => {
    it('should accept when start_hour is less than end_hour', () => {
      const validData = {
        exception_date: '2024-12-25',
        start_hour: 8,
        end_hour: 18,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject when start_hour equals end_hour', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: 8,
        end_hour: 8,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(
          issue =>
            issue.path.includes('end_hour')
            && issue.message === 'Horário de início deve ser menor que horário de fim',
        );
        expect(endHourError).toBeDefined();
      }
    });

    it('should reject when start_hour is greater than end_hour', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: 18,
        end_hour: 8,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const endHourError = result.error.issues.find(
          issue =>
            issue.path.includes('end_hour')
            && issue.message === 'Horário de início deve ser menor que horário de fim',
        );
        expect(endHourError).toBeDefined();
      }
    });
  });

  describe('type validation', () => {
    it('should reject when exception_date is not a string', () => {
      const invalidData = {
        exception_date: 20241225,
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when start_hour is not a number', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: '0',
        end_hour: 23,
        price_cents: 2000,
        is_discount: false,
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when is_discount is not a boolean', () => {
      const invalidData = {
        exception_date: '2024-12-25',
        start_hour: 0,
        end_hour: 23,
        price_cents: 2000,
        is_discount: 'false',
      };
      const result = parkingPriceExceptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
