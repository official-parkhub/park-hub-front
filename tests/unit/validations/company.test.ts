import { faker } from '@faker-js/faker';
import { describe, expect, it } from 'vitest';
import { companyFormSchema } from '@/validations/company';

const VALID_UUID = faker.string.uuid();
describe('companyFormSchema', () => {
  describe('required fields', () => {
    it('should validate valid company data with all required fields', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Estacionamento Central');

        expect(result.data.postal_code).toBe('12345-678');

        expect(result.data.register_code).toBe('11.222.333/0001-81');

        expect(result.data.address).toBe('Rua Principal, 123');

        expect(result.data.total_spots).toBe(50);

        expect(result.data.city_id).toBe(VALID_UUID);
      }
    });

    it('should reject when name is missing', () => {
      const invalidData = {
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(issue =>
          issue.path.includes('name'),
        );
        expect(nameError).toBeDefined();
      }
    });

    it('should reject when name is empty string', () => {
      const invalidData = {
        name: '',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const nameError = result.error.issues.find(issue =>
          issue.path.includes('name'),
        );
        expect(nameError).toBeDefined();

        expect(nameError?.message).toBe('Nome é obrigatório');
      }
    });

    it('should reject when postal_code is missing', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const postalCodeError = result.error.issues.find(issue =>
          issue.path.includes('postal_code'),
        );
        expect(postalCodeError).toBeDefined();
      }
    });

    it('should reject when postal_code is empty string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const postalCodeError = result.error.issues.find(issue =>
          issue.path.includes('postal_code'),
        );
        expect(postalCodeError).toBeDefined();
      }
    });

    it('should reject when register_code is missing', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const registerCodeError = result.error.issues.find(issue =>
          issue.path.includes('register_code'),
        );
        expect(registerCodeError).toBeDefined();
      }
    });

    it('should reject when register_code is empty string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const registerCodeError = result.error.issues.find(issue =>
          issue.path.includes('register_code'),
        );
        expect(registerCodeError).toBeDefined();
      }
    });

    it('should reject when address is missing', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const addressError = result.error.issues.find(issue =>
          issue.path.includes('address'),
        );
        expect(addressError).toBeDefined();
      }
    });

    it('should reject when address is empty string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: '',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const addressError = result.error.issues.find(issue =>
          issue.path.includes('address'),
        );
        expect(addressError).toBeDefined();

        expect(addressError?.message).toBe('Endereço é obrigatório');
      }
    });

    it('should reject when total_spots is missing', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const totalSpotsError = result.error.issues.find(issue =>
          issue.path.includes('total_spots'),
        );
        expect(totalSpotsError).toBeDefined();
      }
    });

    it('should reject when city_id is missing', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const cityIdError = result.error.issues.find(issue =>
          issue.path.includes('city_id'),
        );
        expect(cityIdError).toBeDefined();
      }
    });
  });

  describe('cNPJ validation', () => {
    it('should accept valid CNPJ with formatting', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid CNPJ without formatting', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11222333000181',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CNPJ', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-91',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const registerCodeError = result.error.issues.find(issue =>
          issue.path.includes('register_code'),
        );
        expect(registerCodeError).toBeDefined();

        expect(registerCodeError?.message).toBe('CNPJ inválido');
      }
    });

    it('should reject CNPJ with repeated digits', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.111.111/1111-11',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const registerCodeError = result.error.issues.find(issue =>
          issue.path.includes('register_code'),
        );
        expect(registerCodeError).toBeDefined();

        expect(registerCodeError?.message).toBe('CNPJ inválido');
      }
    });

    it('should reject CNPJ with wrong length', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '123456780001',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const registerCodeError = result.error.issues.find(issue =>
          issue.path.includes('register_code'),
        );
        expect(registerCodeError).toBeDefined();

        expect(registerCodeError?.message).toBe('CNPJ inválido');
      }
    });
  });

  describe('cEP validation', () => {
    it('should accept valid CEP with formatting', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept valid CEP without formatting', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid CEP with wrong length', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-67',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const postalCodeError = result.error.issues.find(issue =>
          issue.path.includes('postal_code'),
        );
        expect(postalCodeError).toBeDefined();

        expect(postalCodeError?.message).toBe('CEP inválido');
      }
    });

    it('should reject CEP with letters', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-67a',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const postalCodeError = result.error.issues.find(issue =>
          issue.path.includes('postal_code'),
        );
        expect(postalCodeError).toBeDefined();

        expect(postalCodeError?.message).toBe('CEP inválido');
      }
    });

    it('should reject CEP with wrong format', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12.345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const postalCodeError = result.error.issues.find(issue =>
          issue.path.includes('postal_code'),
        );
        expect(postalCodeError).toBeDefined();

        expect(postalCodeError?.message).toBe('CEP inválido');
      }
    });
  });

  describe('total_spots validation', () => {
    it('should accept total_spots with minimum value (1)', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 1,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total_spots).toBe(1);
      }
    });

    it('should accept total_spots with large value', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 1000,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.total_spots).toBe(1000);
      }
    });

    it('should reject total_spots below minimum (0)', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 0,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const totalSpotsError = result.error.issues.find(issue =>
          issue.path.includes('total_spots'),
        );
        expect(totalSpotsError).toBeDefined();

        expect(totalSpotsError?.message).toBe('Total de vagas deve ser pelo menos 1');
      }
    });

    it('should reject total_spots below minimum (negative)', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: -1,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const totalSpotsError = result.error.issues.find(issue =>
          issue.path.includes('total_spots'),
        );
        expect(totalSpotsError).toBeDefined();

        expect(totalSpotsError?.message).toBe('Total de vagas deve ser pelo menos 1');
      }
    });

    it('should reject non-integer total_spots', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50.5,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const totalSpotsError = result.error.issues.find(issue =>
          issue.path.includes('total_spots'),
        );
        expect(totalSpotsError).toBeDefined();

        expect(totalSpotsError?.message).toBe(
          'Total de vagas deve ser um número inteiro',
        );
      }
    });
  });

  describe('city_id validation', () => {
    it('should accept valid UUID', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.city_id).toBe(VALID_UUID);
      }
    });

    it('should reject invalid UUID format', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: 'not-a-uuid',
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const cityIdError = result.error.issues.find(issue =>
          issue.path.includes('city_id'),
        );
        expect(cityIdError).toBeDefined();

        expect(cityIdError?.message).toBe('Cidade é obrigatória');
      }
    });

    it('should reject empty string as city_id', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: '',
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        const cityIdError = result.error.issues.find(issue =>
          issue.path.includes('city_id'),
        );
        expect(cityIdError).toBeDefined();
      }
    });
  });

  describe('optional fields', () => {
    it('should accept data without description', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeUndefined();
      }
    });

    it('should accept data with description as string', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        description: 'Estacionamento coberto com segurança 24h',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('Estacionamento coberto com segurança 24h');
      }
    });

    it('should accept data with description as null', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        description: null,
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBeNull();
      }
    });

    it('should accept data with description as undefined', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        description: undefined,
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('boolean fields', () => {
    it('should set default value false for is_covered when not provided', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_covered).toBe(false);
      }
    });

    it('should accept is_covered as true', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        is_covered: true,
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.is_covered).toBe(true);
      }
    });

    it('should set default value false for has_camera when not provided', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has_camera).toBe(false);
      }
    });

    it('should accept has_camera as true', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        has_camera: true,
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has_camera).toBe(true);
      }
    });

    it('should set default value false for has_charging_station when not provided', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has_charging_station).toBe(false);
      }
    });

    it('should accept has_charging_station as true', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        has_charging_station: true,
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.has_charging_station).toBe(true);
      }
    });
  });

  describe('invalid values', () => {
    it('should reject when name is not a string', () => {
      const invalidData = {
        name: 123,
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when postal_code is not a string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: 12345678,
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when register_code is not a string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: 11222333000181,
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when address is not a string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 123,
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when total_spots is not a number', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: '50',
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when city_id is not a string', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        total_spots: 50,
        city_id: 123,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject when boolean fields are not boolean', () => {
      const invalidData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        is_covered: 'true',
        has_camera: 1,
        has_charging_station: 'yes',
        total_spots: 50,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('complete validation scenarios', () => {
    it('should validate complete valid company data', () => {
      const validData = {
        name: 'Estacionamento Central',
        postal_code: '12345-678',
        register_code: '11.222.333/0001-81',
        address: 'Rua Principal, 123',
        description: 'Estacionamento coberto com segurança 24h',
        is_covered: true,
        has_camera: true,
        total_spots: 100,
        has_charging_station: true,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.parse(validData);
      expect(result.name).toBe('Estacionamento Central');

      expect(result.postal_code).toBe('12345-678');

      expect(result.register_code).toBe('11.222.333/0001-81');

      expect(result.address).toBe('Rua Principal, 123');

      expect(result.description).toBe('Estacionamento coberto com segurança 24h');

      expect(result.is_covered).toBe(true);

      expect(result.has_camera).toBe(true);

      expect(result.total_spots).toBe(100);

      expect(result.has_charging_station).toBe(true);

      expect(result.city_id).toBe(VALID_UUID);
    });

    it('should validate minimal valid company data', () => {
      const validData = {
        name: 'Estacionamento Simples',
        postal_code: '12345678',
        register_code: '11222333000181',
        address: 'Rua das Flores, 456',
        total_spots: 1,
        city_id: VALID_UUID,
      };
      const result = companyFormSchema.parse(validData);
      expect(result.name).toBe('Estacionamento Simples');

      expect(result.postal_code).toBe('12345678');

      expect(result.register_code).toBe('11222333000181');

      expect(result.address).toBe('Rua das Flores, 456');

      expect(result.total_spots).toBe(1);

      expect(result.city_id).toBe(VALID_UUID);

      expect(result.description).toBeUndefined();

      expect(result.is_covered).toBe(false);

      expect(result.has_camera).toBe(false);

      expect(result.has_charging_station).toBe(false);
    });
  });
});
