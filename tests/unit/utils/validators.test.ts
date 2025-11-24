import { describe, expect, it } from 'vitest';
import { isValidCEP, isValidCNPJ } from '@/utils/validators';

describe('validators', () => {
  describe('isValidCNPJ', () => {
    const validCNPJs = [
      '11.222.333/0001-81',
      '11222333000181',
      '00.000.000/0001-91',
      '00000000000191',
    ];

    it.each(validCNPJs)('should return true for valid CNPJ: %s', (cnpj) => {
      expect(isValidCNPJ(cnpj)).toBe(true);
    });

    const invalidCNPJs = [
      '',
      '11.111.111/1111-11',
      '11111111111111',
      '12.345.678/0001-91',
      '12345678000191',
      '123456780001',
      '123456780001901',
      '12.345.678/0001',
      'abc.def.ghi/jkl-mn',
      '12.345.678/0001-9',
      null as unknown as string,
      undefined as unknown as string,
      12345678000190 as unknown as string,
    ];

    it.each(invalidCNPJs)('should return false for invalid CNPJ: %s', (cnpj) => {
      expect(isValidCNPJ(cnpj)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidCNPJ('')).toBe(false);
    });

    it('should return false for string with only formatting characters', () => {
      expect(isValidCNPJ('.../---')).toBe(false);
    });

    it('should return false for CNPJ with wrong first check digit', () => {
      expect(isValidCNPJ('11.222.333/0001-82')).toBe(false);
    });

    it('should return false for CNPJ with wrong second check digit', () => {
      expect(isValidCNPJ('11.222.333/0001-80')).toBe(false);
    });

    it('should validate CNPJ with partial formatting', () => {
      expect(isValidCNPJ('11.222333/0001-81')).toBe(true);
      expect(isValidCNPJ('11222.333/0001-81')).toBe(true);
    });
  });

  describe('isValidCEP', () => {
    const validCEPs = [
      '12345-678',
      '12345678',
      '00000-000',
      '00000000',
      '99999-999',
      '99999999',
      '01000-000',
      '01000000',
    ];

    it.each(validCEPs)('should return true for valid CEP: %s', (cep) => {
      expect(isValidCEP(cep)).toBe(true);
    });

    const invalidCEPs = [
      '',
      '12345-67',
      '1234567',
      '12345-6789',
      '123456789',
      '12345-67a',
      'abcde-fgh',
      null as unknown as string,
      undefined as unknown as string,
      12345678 as unknown as string,
    ];

    it.each(invalidCEPs)('should return false for invalid CEP: %s', (cep) => {
      expect(isValidCEP(cep)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidCEP('')).toBe(false);
    });

    it('should return false for string with only formatting characters', () => {
      expect(isValidCEP('-----')).toBe(false);
    });

    it('should return false for CEP with letters', () => {
      expect(isValidCEP('12345-67a')).toBe(false);
      expect(isValidCEP('abcde-678')).toBe(false);
    });

    it('should return false for CEP with wrong format', () => {
      expect(isValidCEP('12.345-678')).toBe(false);
      expect(isValidCEP('12345.678')).toBe(false);
      expect(isValidCEP('12345/678')).toBe(false);
    });

    it('should return false for CEP with extra characters', () => {
      expect(isValidCEP('12345-678abc')).toBe(false);
      expect(isValidCEP('abc12345-678')).toBe(false);
      expect(isValidCEP('12345678abc')).toBe(false);
    });

    it('should return false for CEP with multiple hyphens', () => {
      expect(isValidCEP('123-45-678')).toBe(false);
    });
  });
});
