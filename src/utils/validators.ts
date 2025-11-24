import { cnpj } from 'cpf-cnpj-validator';

export function isValidCNPJ(cnpjValue: string): boolean {
  if (!cnpjValue || typeof cnpjValue !== 'string') {
    return false;
  }

  try {
    return cnpj.isValid(cnpjValue);
  } catch {
    return false;
  }
}

export function isValidCEP(cep: string): boolean {
  if (!cep || typeof cep !== 'string') {
    return false;
  }

  const cleaned = cep.replace(/\D/g, '');

  if (cleaned.length !== 8) {
    return false;
  }

  const digitCount = (cep.match(/\d/g) || []).length;
  if (digitCount !== 8) {
    return false;
  }

  const hasHyphen = cep.includes('-');
  if (hasHyphen) {
    const parts = cep.split('-');
    if (parts.length !== 2) {
      return false;
    }
    const part0 = parts[0];
    const part1 = parts[1];
    if (!part0 || !part1 || !/^\d{5}$/.test(part0) || !/^\d{3}$/.test(part1)) {
      return false;
    }
    const nonDigitChars = cep.replace(/[\d-]/g, '');
    if (nonDigitChars.length > 0) {
      return false;
    }
  } else {
    if (!/^\d{8}$/.test(cep)) {
      return false;
    }
  }

  return /^\d{8}$/.test(cleaned);
}
