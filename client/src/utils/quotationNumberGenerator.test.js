import { generateQuotationNumber } from './quotationNumberGenerator';

describe('Quotation Number Generator', () => {
  describe('generateQuotationNumber', () => {
    test('should generate a quotation number in the correct format', () => {
      const quotationNumber = generateQuotationNumber();
      
      // Format: -XXX/DD-MM-YYYY/YYNK
      // Example: -123/15-01-2024/24NK
      const formatRegex = /^-\d{3}\/\d{2}-\d{2}-\d{4}\/\d{2}NK$/;
      
      expect(quotationNumber).toMatch(formatRegex);
    });

    test('should generate random 3-digit numbers between 100-999', () => {
      const quotationNumber = generateQuotationNumber();
      
      // Extract the XXX part
      const match = quotationNumber.match(/^-(\d{3})\//);
      expect(match).not.toBeNull();
      
      const randomNumber = parseInt(match[1]);
      expect(randomNumber).toBeGreaterThanOrEqual(100);
      expect(randomNumber).toBeLessThanOrEqual(999);
    });

    test('should include the current date in DD-MM-YYYY format', () => {
      const quotationNumber = generateQuotationNumber();
      
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      
      const expectedDatePart = `${day}-${month}-${year}`;
      
      expect(quotationNumber).toContain(expectedDatePart);
    });

    test('should include the last two digits of current year', () => {
      const quotationNumber = generateQuotationNumber();
      
      const now = new Date();
      const yearLastTwoDigits = String(now.getFullYear()).slice(-2);
      
      expect(quotationNumber).toContain(`/${yearLastTwoDigits}NK`);
    });

    test('should generate different numbers on successive calls', () => {
      const numbers = new Set();
      
      // Generate 50 quotation numbers
      for (let i = 0; i < 50; i++) {
        numbers.add(generateQuotationNumber());
      }
      
      // With a random component, we expect most to be unique
      // (allowing for rare collisions in the random number)
      expect(numbers.size).toBeGreaterThan(40);
    });

    test('should always end with NK suffix', () => {
      const quotationNumber = generateQuotationNumber();
      
      expect(quotationNumber).toMatch(/NK$/);
    });

    test('should always start with hyphen', () => {
      const quotationNumber = generateQuotationNumber();
      
      expect(quotationNumber).toMatch(/^-/);
    });

    test('should pad single digit day and month with zero', () => {
      // Mock a date with single digit day and month
      const originalDate = global.Date;
      const mockDate = new Date('2024-01-05'); // January 5th
      
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      } as DateConstructor;
      
      const quotationNumber = generateQuotationNumber();
      
      // Should contain 05-01-2024, not 5-1-2024
      expect(quotationNumber).toMatch(/-\d{3}\/05-01-2024\/24NK$/);
      
      // Restore original Date
      global.Date = originalDate;
    });

    test('should generate valid format for edge case dates', () => {
      // Test with December 31st
      const originalDate = global.Date;
      const mockDate = new Date('2024-12-31');
      
      global.Date = class extends Date {
        constructor() {
          super();
          return mockDate;
        }
        static now() {
          return mockDate.getTime();
        }
      } as DateConstructor;
      
      const quotationNumber = generateQuotationNumber();
      
      expect(quotationNumber).toMatch(/-\d{3}\/31-12-2024\/24NK$/);
      
      // Restore original Date
      global.Date = originalDate;
    });
  });
});
