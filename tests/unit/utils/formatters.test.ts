import { describe, expect, it } from 'vitest';
import { cleanCEP, cleanCNPJ, formatCEP, formatCNPJ } from '@/utils/formatters';

describe('formatters', () => {
  describe('formatCNPJ', () => {
    it('should format unformatted CNPJ correctly', () => {
      expect(formatCNPJ('12345678000190')).toBe('12.345.678/0001-90');
    });

    it('should keep already formatted CNPJ', () => {
      expect(formatCNPJ('12.345.678/0001-90')).toBe('12.345.678/0001-90');
    });

    it('should format partially formatted CNPJ', () => {
      expect(formatCNPJ('12.345678/0001-90')).toBe('12.345.678/0001-90');
      expect(formatCNPJ('12345.678/0001-90')).toBe('12.345.678/0001-90');
      expect(formatCNPJ('12345678.0001-90')).toBe('12.345.678/0001-90');
    });

    it('should handle CNPJ with extra characters', () => {
      expect(formatCNPJ('12.345.678/0001-90abc')).toBe('12.345.678/0001-90');
      expect(formatCNPJ('abc12.345.678/0001-90')).toBe('12.345.678/0001-90');
    });

    it('should return empty string for empty input', () => {
      expect(formatCNPJ('')).toBe('');
    });

    it('should return empty string for null or undefined', () => {
      expect(formatCNPJ(null as unknown as string)).toBe('');
      expect(formatCNPJ(undefined as unknown as string)).toBe('');
    });

    it('should return empty string for string with no digits', () => {
      expect(formatCNPJ('abc...///---')).toBe('');
    });

    it('should handle CNPJ with more than 14 digits', () => {
      expect(formatCNPJ('12345678000190123')).toBe('12.345.678/0001-90');
    });

    it('should format CNPJ with only digits', () => {
      expect(formatCNPJ('00000000000191')).toBe('00.000.000/0001-91');
    });

    it('should handle CNPJ with mixed formatting', () => {
      expect(formatCNPJ('12.345678/0001-90')).toBe('12.345.678/0001-90');
      expect(formatCNPJ('12345.6780001-90')).toBe('12.345.678/0001-90');
    });
  });

  describe('formatCEP', () => {
    it('should format unformatted CEP correctly', () => {
      expect(formatCEP('12345678')).toBe('12345-678');
    });

    it('should keep already formatted CEP', () => {
      expect(formatCEP('12345-678')).toBe('12345-678');
    });

    it('should format partially formatted CEP', () => {
      expect(formatCEP('1234567')).toBe('1234567');
      expect(formatCEP('12345')).toBe('12345');
      expect(formatCEP('123-45678')).toBe('12345-678');
    });

    it('should handle CEP with extra characters', () => {
      expect(formatCEP('12345-678abc')).toBe('12345-678');
      expect(formatCEP('abc12345-678')).toBe('12345-678');
    });

    it('should return empty string for empty input', () => {
      expect(formatCEP('')).toBe('');
    });

    it('should return empty string for null or undefined', () => {
      expect(formatCEP(null as unknown as string)).toBe('');
      expect(formatCEP(undefined as unknown as string)).toBe('');
    });

    it('should return empty string for string with no digits', () => {
      expect(formatCEP('abc---')).toBe('');
    });

    it('should handle CEP with less than 8 digits', () => {
      expect(formatCEP('12345')).toBe('12345');
      expect(formatCEP('123')).toBe('123');
    });

    it('should handle CEP with more than 8 digits', () => {
      expect(formatCEP('123456789')).toBe('12345-678');
    });

    it('should format CEP with only digits', () => {
      expect(formatCEP('00000000')).toBe('00000-000');
    });

    it('should handle CEP with wrong hyphen position', () => {
      expect(formatCEP('123-45678')).toBe('12345-678');
      expect(formatCEP('1234-5678')).toBe('12345-678');
    });
  });

  describe('cleanCNPJ', () => {
    it('should remove formatting from formatted CNPJ', () => {
      expect(cleanCNPJ('12.345.678/0001-90')).toBe('12345678000190');
    });

    it('should keep unformatted CNPJ as is', () => {
      expect(cleanCNPJ('12345678000190')).toBe('12345678000190');
    });

    it('should remove all non-digit characters', () => {
      expect(cleanCNPJ('12.345.678/0001-90abc')).toBe('12345678000190');
      expect(cleanCNPJ('abc12.345.678/0001-90')).toBe('12345678000190');
    });

    it('should return empty string for empty input', () => {
      expect(cleanCNPJ('')).toBe('');
    });

    it('should return empty string for null or undefined', () => {
      expect(cleanCNPJ(null as unknown as string)).toBe('');
      expect(cleanCNPJ(undefined as unknown as string)).toBe('');
    });

    it('should return empty string for string with no digits', () => {
      expect(cleanCNPJ('abc...///---')).toBe('');
    });

    it('should handle CNPJ with mixed formatting', () => {
      expect(cleanCNPJ('12.345678/0001-90')).toBe('12345678000190');
      expect(cleanCNPJ('12345.6780001-90')).toBe('12345678000190');
    });

    it('should preserve all digits even if more than 14', () => {
      expect(cleanCNPJ('12345678000190123')).toBe('12345678000190123');
    });
  });

  describe('cleanCEP', () => {
    it('should remove formatting from formatted CEP', () => {
      expect(cleanCEP('12345-678')).toBe('12345678');
    });

    it('should keep unformatted CEP as is', () => {
      expect(cleanCEP('12345678')).toBe('12345678');
    });

    it('should remove all non-digit characters', () => {
      expect(cleanCEP('12345-678abc')).toBe('12345678');
      expect(cleanCEP('abc12345-678')).toBe('12345678');
    });

    it('should return empty string for empty input', () => {
      expect(cleanCEP('')).toBe('');
    });

    it('should return empty string for null or undefined', () => {
      expect(cleanCEP(null as unknown as string)).toBe('');
      expect(cleanCEP(undefined as unknown as string)).toBe('');
    });

    it('should return empty string for string with no digits', () => {
      expect(cleanCEP('abc---')).toBe('');
    });

    it('should handle CEP with mixed formatting', () => {
      expect(cleanCEP('123-45678')).toBe('12345678');
      expect(cleanCEP('1234-5678')).toBe('12345678');
    });

    it('should preserve all digits even if more than 8', () => {
      expect(cleanCEP('123456789')).toBe('123456789');
    });
  });
});
