import { numberToWords } from './numberToWords';

describe('numberToWords', () => {
  // Zero edge case
  test('converts 0 to "Zero Only"', () => {
    expect(numberToWords(0)).toBe('Zero Only');
  });

  // Units (1-9)
  test('converts single digits correctly', () => {
    expect(numberToWords(1)).toBe('One Only');
    expect(numberToWords(5)).toBe('Five Only');
    expect(numberToWords(9)).toBe('Nine Only');
  });

  // Teens (10-19)
  test('converts teens correctly', () => {
    expect(numberToWords(10)).toBe('Ten Only');
    expect(numberToWords(13)).toBe('Thirteen Only');
    expect(numberToWords(19)).toBe('Nineteen Only');
  });

  // Tens (20-90)
  test('converts tens correctly', () => {
    expect(numberToWords(20)).toBe('Twenty Only');
    expect(numberToWords(45)).toBe('Forty Five Only');
    expect(numberToWords(90)).toBe('Ninety Only');
  });

  // Hundreds
  test('converts hundreds correctly', () => {
    expect(numberToWords(100)).toBe('One Hundred Only');
    expect(numberToWords(256)).toBe('Two Hundred Fifty Six Only');
    expect(numberToWords(999)).toBe('Nine Hundred Ninety Nine Only');
  });

  // Thousands
  test('converts thousands correctly', () => {
    expect(numberToWords(1000)).toBe('One Thousand Only');
    expect(numberToWords(5432)).toBe('Five Thousand Four Hundred Thirty Two Only');
    expect(numberToWords(99999)).toBe('Ninety Nine Thousand Nine Hundred Ninety Nine Only');
  });

  // Lakhs (Indian numbering)
  test('converts lakhs correctly', () => {
    expect(numberToWords(100000)).toBe('One Lakh Only');
    expect(numberToWords(2500000)).toBe('Twenty Five Lakh Only');
    expect(numberToWords(5432100)).toBe('Fifty Four Lakh Thirty Two Thousand One Hundred Only');
  });

  // Crores (Indian numbering)
  test('converts crores correctly', () => {
    expect(numberToWords(10000000)).toBe('One Crore Only');
    expect(numberToWords(250000000)).toBe('Twenty Five Crore Only');
    expect(numberToWords(12345678)).toBe('One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Only');
  });

  // Edge cases
  test('handles decimal numbers by flooring', () => {
    expect(numberToWords(123.99)).toBe('One Hundred Twenty Three Only');
    expect(numberToWords(999.01)).toBe('Nine Hundred Ninety Nine Only');
  });

  test('handles negative numbers', () => {
    expect(numberToWords(-50)).toBe('Minus Fifty Only');
    expect(numberToWords(-1234)).toBe('Minus One Thousand Two Hundred Thirty Four Only');
  });

  // "Only" suffix verification
  test('always appends "Only" suffix', () => {
    const testCases = [0, 1, 100, 1000, 100000, 10000000];
    testCases.forEach(num => {
      expect(numberToWords(num)).toMatch(/Only$/);
    });
  });
});
