import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatTime,
  formatDateTime,
  parseDate,
  calculateAge,
  isWorkingHour,
  getTimeSlots,
  isDateInPast,
  isDateInFuture,
  getWeekDays,
} from '../date';

describe('Date Utils', () => {
  describe('formatDate', () => {
    it('formats date string correctly', () => {
      const date = '2023-01-01';
      expect(formatDate(date)).toMatch(/Jan(uary)? 1, 2023/);
    });

    it('formats Date object correctly', () => {
      const date = new Date(2023, 0, 1);
      expect(formatDate(date)).toMatch(/Jan(uary)? 1, 2023/);
    });
  });

  describe('formatTime', () => {
    it('formats time string correctly', () => {
      const time = '2023-01-01T14:30:00';
      expect(formatTime(time)).toMatch(/2:30 PM/);
    });

    it('formats Date object correctly', () => {
      const date = new Date(2023, 0, 1, 14, 30);
      expect(formatTime(date)).toMatch(/2:30 PM/);
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime string correctly', () => {
      const datetime = '2023-01-01T14:30:00';
      const formatted = formatDateTime(datetime);
      expect(formatted).toMatch(/Jan(uary)? 1, 2023/);
      expect(formatted).toMatch(/2:30 PM/);
    });
  });

  describe('parseDate', () => {
    it('parses date string correctly', () => {
      const result = parseDate('01/01/2023', 'MM/dd/yyyy');
      expect(result).toBeInstanceOf(Date);
      expect(result?.getFullYear()).toBe(2023);
      expect(result?.getMonth()).toBe(0);
      expect(result?.getDate()).toBe(1);
    });

    it('returns null for invalid date', () => {
      const result = parseDate('invalid', 'MM/dd/yyyy');
      expect(result).toBeNull();
    });
  });

  describe('calculateAge', () => {
    it('calculates age correctly', () => {
      const today = new Date();
      const birthDate = new Date(today.getFullYear() - 25, today.getMonth(), today.getDate());
      expect(calculateAge(birthDate)).toBe(25);
    });
  });

  describe('isWorkingHour', () => {
    it('identifies working hours correctly', () => {
      const workingHours = { start: '09:00', end: '17:00' };
      const duringWork = new Date(2023, 0, 1, 14, 0); // 2:00 PM
      const afterWork = new Date(2023, 0, 1, 18, 0); // 6:00 PM
      
      expect(isWorkingHour(duringWork, workingHours)).toBe(true);
      expect(isWorkingHour(afterWork, workingHours)).toBe(false);
    });
  });

  describe('getTimeSlots', () => {
    it('generates correct time slots', () => {
      const slots = getTimeSlots('09:00', '10:00', 30);
      expect(slots).toEqual(['09:00', '09:30', '10:00']);
    });

    it('handles duration correctly', () => {
      const slots = getTimeSlots('09:00', '10:00', 15);
      expect(slots.length).toBe(5); // 09:00, 09:15, 09:30, 09:45, 10:00
    });
  });

  describe('isDateInPast', () => {
    it('identifies past dates correctly', () => {
      const pastDate = new Date(2020, 0, 1);
      const futureDate = new Date(2030, 0, 1);
      
      expect(isDateInPast(pastDate)).toBe(true);
      expect(isDateInPast(futureDate)).toBe(false);
    });
  });

  describe('isDateInFuture', () => {
    it('identifies future dates correctly', () => {
      const pastDate = new Date(2020, 0, 1);
      const futureDate = new Date(2030, 0, 1);
      
      expect(isDateInFuture(pastDate)).toBe(false);
      expect(isDateInFuture(futureDate)).toBe(true);
    });
  });

  describe('getWeekDays', () => {
    it('returns correct week days', () => {
      const date = new Date(2023, 0, 4); // Wednesday
      const weekDays = getWeekDays(date);
      
      expect(weekDays.length).toBe(7);
      expect(weekDays[0].getDay()).toBe(0); // Sunday
      expect(weekDays[6].getDay()).toBe(6); // Saturday
    });
  });
});
