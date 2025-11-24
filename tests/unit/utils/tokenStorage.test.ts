import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getProfileType, removeProfileType, saveProfileType } from '@/utils/tokenStorage';

describe('tokenStorage - Profile Type', () => {
  const originalLocalStorage = globalThis.localStorage;
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    length: 0,
    key: vi.fn(),
  };
  beforeEach(() => {
    vi.clearAllMocks();

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'localStorage', {
      value: originalLocalStorage,
      writable: true,
    });
  });

  describe('saveProfileType', () => {
    it('should save driver profile type to localStorage', () => {
      saveProfileType('driver');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'parkhub_profile_type',
        'driver',
      );
    });

    it('should save organization profile type to localStorage', () => {
      saveProfileType('organization');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'parkhub_profile_type',
        'organization',
      );
    });

    it('should not throw error when window is undefined', () => {
      const originalWindow = globalThis.window;
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => saveProfileType('driver')).not.toThrow();

      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('getProfileType', () => {
    it('should return driver profile type from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('driver');
      const result = getProfileType();
      expect(result).toBe('driver');

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('parkhub_profile_type');
    });

    it('should return organization profile type from localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('organization');
      const result = getProfileType();
      expect(result).toBe('organization');
    });

    it('should return null when profile type is not set', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      const result = getProfileType();
      expect(result).toBeNull();
    });

    it('should return null when profile type is invalid', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid');
      const result = getProfileType();
      expect(result).toBeNull();
    });

    it('should return null when window is undefined', () => {
      const originalWindow = globalThis.window;
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });
      const result = getProfileType();
      expect(result).toBeNull();

      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    });
  });

  describe('removeProfileType', () => {
    it('should remove profile type from localStorage', () => {
      removeProfileType();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('parkhub_profile_type');
    });

    it('should not throw error when window is undefined', () => {
      const originalWindow = globalThis.window;
      Object.defineProperty(globalThis, 'window', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(() => removeProfileType()).not.toThrow();

      Object.defineProperty(globalThis, 'window', {
        value: originalWindow,
        writable: true,
        configurable: true,
      });
    });
  });
});
