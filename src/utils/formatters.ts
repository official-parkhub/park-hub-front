import { cnpj } from 'cpf-cnpj-validator';

export function formatCNPJ(cnpjValue: string): string {
  if (!cnpjValue || typeof cnpjValue !== 'string') {
    return '';
  }

  const cleaned = cnpjValue.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return '';
  }

  const digits = cleaned.slice(0, 14);

  if (digits.length < 4) {
    return digits;
  }

  try {
    return cnpj.format(digits);
  } catch {
    return digits
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
}

export function formatCEP(cep: string): string {
  if (!cep || typeof cep !== 'string') {
    return '';
  }

  const cleaned = cep.replace(/\D/g, '');

  if (cleaned.length === 0) {
    return '';
  }

  const digits = cleaned.slice(0, 8);

  if (digits.length < 6) {
    return digits;
  }

  if (digits.length === 8) {
    return digits.replace(/^(\d{5})(\d{3})$/, '$1-$2');
  }

  return digits;
}

export function cleanCNPJ(cnpjValue: string): string {
  if (!cnpjValue || typeof cnpjValue !== 'string') {
    return '';
  }

  return cnpjValue.replace(/\D/g, '');
}

export function cleanCEP(cep: string): string {
  if (!cep || typeof cep !== 'string') {
    return '';
  }

  return cep.replace(/\D/g, '');
}
