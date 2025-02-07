import { describe, it, expect } from 'vitest';
import {
  isValidEmail,
  isValidPhone,
  isValidDate,
  isValidTime,
  isValidDateTime,
  isValidCurrency,
  isValidName,
  isValidPassword,
  isValidPostalCode,
  isValidAge,
  isValidBloodGroup,
  isValidGender,
} from '../validation';

describe('Validation Utils', () => {
  describe('isValidEmail', () => {
    it('validates correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('test.name@example.co.uk')).toBe(true);
      expect(isValidEmail('test+label@example.com')).toBe(true);
    });

    it('invalidates incorrect email addresses', () => {
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('test@.')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test@example')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    it('validates correct phone numbers', () => {
      expect(isValidPhone('1234567890')).toBe(true);
      expect(isValidPhone('+1-234-567-8900')).toBe(true);
      expect(isValidPhone('+91 9876543210')).toBe(true);
    });

    it('invalidates incorrect phone numbers', () => {
      expect(isValidPhone('123')).toBe(false);
      expect(isValidPhone('abcdefghij')).toBe(false);
      expect(isValidPhone('123456')).toBe(false);
    });
  });

  describe('isValidDate', () => {
    it('validates correct dates', () => {
      expect(isValidDate('2023-01-01')).toBe(true);
      expect(isValidDate('2023/01/01')).toBe(true);
      expect(isValidDate(new Date().toISOString())).toBe(true);
    });

    it('invalidates incorrect dates', () => {
      expect(isValidDate('invalid-date')).toBe(false);
      expect(isValidDate('2023-13-01')).toBe(false);
      expect(isValidDate('2023-00-00')).toBe(false);
    });
  });

  describe('isValidTime', () => {
    it('validates correct times', () => {
      expect(isValidTime('13:00')).toBe(true);
      expect(isValidTime('09:30')).toBe(true);
      expect(isValidTime('23:59')).toBe(true);
    });

    it('invalidates incorrect times', () => {
      expect(isValidTime('25:00')).toBe(false);
      expect(isValidTime('12:60')).toBe(false);
      expect(isValidTime('9:30')).toBe(false);
    });
  });

  describe('isValidCurrency', () => {
    it('validates correct currency values', () => {
      expect(isValidCurrency(100)).toBe(true);
      expect(isValidCurrency(0)).toBe(true);
      expect(isValidCurrency(99.99)).toBe(true);
    });

    it('invalidates incorrect currency values', () => {
      expect(isValidCurrency(-1)).toBe(false);
      expect(isValidCurrency(NaN)).toBe(false);
    });
  });

  describe('isValidName', () => {
    it('validates correct names', () => {
      expect(isValidName('John')).toBe(true);
      expect(isValidName('John Doe')).toBe(true);
      expect(isValidName('J. Doe')).toBe(true);
    });

    it('invalidates incorrect names', () => {
      expect(isValidName('')).toBe(false);
      expect(isValidName('J')).toBe(false);
      expect(isValidName('  ')).toBe(false);
    });
  });

  describe('isValidPassword', () => {
    it('validates correct passwords', () => {
      expect(isValidPassword('Password123')).toBe(true);
      expect(isValidPassword('StrongP@ss1')).toBe(true);
      expect(isValidPassword('Abcd1234')).toBe(true);
    });

    it('invalidates incorrect passwords', () => {
      expect(isValidPassword('pass')).toBe(false);
      expect(isValidPassword('password')).toBe(false);
      expect(isValidPassword('12345678')).toBe(false);
      expect(isValidPassword('PASSWORD123')).toBe(false);
    });
  });

  describe('isValidBloodGroup', () => {
    it('validates correct blood groups', () => {
      expect(isValidBloodGroup('A+')).toBe(true);
      expect(isValidBloodGroup('B-')).toBe(true);
      expect(isValidBloodGroup('O+')).toBe(true);
      expect(isValidBloodGroup('AB-')).toBe(true);
    });

    it('invalidates incorrect blood groups', () => {
      expect(isValidBloodGroup('C+')).toBe(false);
      expect(isValidBloodGroup('AB')).toBe(false);
      expect(isValidBloodGroup('A')).toBe(false);
    });
  });

  describe('isValidGender', () => {
    it('validates correct genders', () => {
      expect(isValidGender('male')).toBe(true);
      expect(isValidGender('female')).toBe(true);
      expect(isValidGender('other')).toBe(true);
      expect(isValidGender('MALE')).toBe(true);
    });

    it('invalidates incorrect genders', () => {
      expect(isValidGender('')).toBe(false);
      expect(isValidGender('invalid')).toBe(false);
    });
  });
});
