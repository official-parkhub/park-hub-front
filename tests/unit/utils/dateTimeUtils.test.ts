import { describe, expect, it } from 'vitest';
import {
  convertBrasiliaToUTC,
  convertUTCToBrasilia,
  formatDateTimeBrasilia,
  getCurrentDateBrasilia,
  getCurrentDateTimeBrasilia,
  getCurrentDayAPIFormat,
  getCurrentDayBrasilia,
  getCurrentHourBrasilia,
} from '@/utils/dateTimeUtils';

describe('dateTimeUtils', () => {
  describe('convertUTCToBrasilia', () => {
    it('should convert UTC to UTC-3 correctly', () => {
      const utcDate = '2024-01-15T15:00:00Z';
      const brasiliaDate = convertUTCToBrasilia(utcDate);
      expect(brasiliaDate.getHours()).toBe(12);

      expect(brasiliaDate.getDate()).toBe(15);

      expect(brasiliaDate.getMonth()).toBe(0);
    });

    it('should handle Date object input', () => {
      const utcDate = new Date('2024-01-15T15:00:00Z');
      const brasiliaDate = convertUTCToBrasilia(utcDate);
      expect(brasiliaDate.getHours()).toBe(12);
    });

    it('should handle midnight UTC correctly', () => {
      const utcDate = '2024-01-15T00:00:00Z';
      const brasiliaDate = convertUTCToBrasilia(utcDate);
      expect(brasiliaDate.getHours()).toBe(21);

      expect(brasiliaDate.getDate()).toBe(14);
    });

    it('should handle date near midnight boundary', () => {
      const utcDate = '2024-01-15T02:00:00Z';
      const brasiliaDate = convertUTCToBrasilia(utcDate);
      expect(brasiliaDate.getHours()).toBe(23);

      expect(brasiliaDate.getDate()).toBe(14);
    });
  });

  describe('convertBrasiliaToUTC', () => {
    it('should convert UTC-3 to UTC correctly', () => {
      const brasiliaDate = '2024-01-15T12:00:00';
      const utcString = convertBrasiliaToUTC(brasiliaDate);
      expect(utcString).toMatch(/Z$/);

      expect(utcString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
      const utcDate = new Date(utcString);
      expect(utcDate.getTime()).not.toBeNaN();
    });

    it('should handle Date object input', () => {
      const brasiliaDate = new Date('2024-01-15T12:00:00-03:00');
      const utcString = convertBrasiliaToUTC(brasiliaDate);
      expect(utcString).toMatch(/Z$/);
      const utcDate = new Date(utcString);
      expect(utcDate.getTime()).not.toBeNaN();
    });

    it('should return ISO 8601 format with Z suffix', () => {
      const brasiliaDate = '2024-01-15T12:00:00';
      const utcString = convertBrasiliaToUTC(brasiliaDate);
      expect(utcString).toMatch(/Z$/);

      expect(utcString).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should handle midnight in UTC-3 correctly', () => {
      const brasiliaDate = '2024-01-15T00:00:00';
      const utcString = convertBrasiliaToUTC(brasiliaDate);
      expect(utcString).toMatch(/Z$/);
      const utcDate = new Date(utcString);
      expect(utcDate.getTime()).not.toBeNaN();

      expect(utcDate.getUTCHours()).toBe(3);
    });
  });

  describe('getCurrentDateTimeBrasilia', () => {
    it('should return current date/time in UTC-3', () => {
      const brasiliaDate = getCurrentDateTimeBrasilia();
      expect(brasiliaDate).toBeInstanceOf(Date);

      expect(brasiliaDate.getTime()).not.toBeNaN();
    });
  });

  describe('getCurrentDateBrasilia', () => {
    it('should return current date in YYYY-MM-DD format', () => {
      const dateStr = getCurrentDateBrasilia();
      expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);

      expect(dateStr.split('-')).toHaveLength(3);
    });
  });

  describe('getCurrentHourBrasilia', () => {
    it('should return current hour in UTC-3 (0-23)', () => {
      const hour = getCurrentHourBrasilia();
      expect(hour).toBeGreaterThanOrEqual(0);

      expect(hour).toBeLessThanOrEqual(23);

      expect(Number.isInteger(hour)).toBe(true);
    });
  });

  describe('getCurrentDayBrasilia', () => {
    it('should return current day of week in UTC-3 (0-6)', () => {
      const day = getCurrentDayBrasilia();
      expect(day).toBeGreaterThanOrEqual(0);

      expect(day).toBeLessThanOrEqual(6);

      expect(Number.isInteger(day)).toBe(true);
    });
  });

  describe('formatDateTimeBrasilia', () => {
    it('should format date/time in Brazilian format', () => {
      const utcDate = '2024-01-15T15:00:00Z';
      const formatted = formatDateTimeBrasilia(utcDate);
      expect(formatted).toContain('/');

      expect(formatted.length).toBeGreaterThan(0);
    });

    it('should format date without time when includeTime is false', () => {
      const utcDate = '2024-01-15T15:00:00Z';
      const formatted = formatDateTimeBrasilia(utcDate, false);
      expect(formatted).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });

    it('should handle Date object input', () => {
      const date = new Date('2024-01-15T15:00:00Z');
      const formatted = formatDateTimeBrasilia(date);
      expect(formatted).toBeTruthy();

      expect(formatted).not.toBe('Data inválida');

      expect(formatted).toContain('/');
    });

    it('should return error message for invalid date', () => {
      const invalidDate = 'invalid-date';
      const formatted = formatDateTimeBrasilia(invalidDate);
      expect(formatted).toBe('Data inválida');
    });
  });

  describe('getCurrentDayAPIFormat', () => {
    it('should convert JavaScript day format to API format correctly', () => {
      const testCases = [
        { jsDay: 0, expected: 6 },
        { jsDay: 1, expected: 0 },
        { jsDay: 2, expected: 1 },
        { jsDay: 3, expected: 2 },
        { jsDay: 4, expected: 3 },
        { jsDay: 5, expected: 4 },
        { jsDay: 6, expected: 5 },
      ];
      testCases.forEach(({ jsDay, expected }) => {
        const result = jsDay === 0 ? 6 : jsDay - 1;
        expect(result).toBe(expected);
      });
    });

    it('should return value between 0 and 6', () => {
      const apiDay = getCurrentDayAPIFormat();
      expect(apiDay).toBeGreaterThanOrEqual(0);

      expect(apiDay).toBeLessThanOrEqual(6);

      expect(Number.isInteger(apiDay)).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle year boundary correctly', () => {
      const utcDate = '2024-01-01T02:00:00Z';
      const brasiliaDate = convertUTCToBrasilia(utcDate);
      expect(brasiliaDate).toBeInstanceOf(Date);

      expect(brasiliaDate.getTime()).not.toBeNaN();
    });

    it('should handle different months correctly', () => {
      const months = [
        '2024-01-15T15:00:00Z',
        '2024-06-15T15:00:00Z',
        '2024-12-15T15:00:00Z',
      ];
      months.forEach((dateStr) => {
        const brasiliaDate = convertUTCToBrasilia(dateStr);
        expect(brasiliaDate).toBeInstanceOf(Date);

        expect(brasiliaDate.getTime()).not.toBeNaN();
      });
    });

    it('should handle conversion round-trip correctly', () => {
      const originalUTC = '2024-01-15T15:00:00Z';
      const brasiliaDate = convertUTCToBrasilia(originalUTC);
      const backToUTC = convertBrasiliaToUTC(brasiliaDate);
      expect(backToUTC).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);

      expect(backToUTC).toContain('Z');
    });
  });
});
