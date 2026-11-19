/**
 * Unit tests for pdfGenerator utility functions
 */

import {
  PDF_CONSTANTS,
  COMPANY_DETAILS,
  validateInvoiceData,
  formatIndianNumber,
  calculateAmount
} from './pdfGenerator';

describe('PDF_CONSTANTS', () => {
  test('should have correct page dimensions', () => {
    expect(PDF_CONSTANTS.PAGE.WIDTH).toBe(210);
    expect(PDF_CONSTANTS.PAGE.HEIGHT).toBe(297);
  });

  test('should have margin settings', () => {
    expect(PDF_CONSTANTS.PAGE.MARGIN_LEFT).toBe(15);
    expect(PDF_CONSTANTS.PAGE.MARGIN_RIGHT).toBe(15);
  });

  test('should have color definitions', () => {
    expect(PDF_CONSTANTS.COLORS.PRIMARY_BLUE).toEqual([70, 130, 180]);
    expect(PDF_CONSTANTS.COLORS.ACCENT_BLUE).toEqual([0, 0, 255]);
  });
});

describe('COMPANY_DETAILS', () => {
  test('should have company name', () => {
    expect(COMPANY_DETAILS.name).toBe('M MARINE SERVICES');
  });

  test('should have GSTIN', () => {
    expect(COMPANY_DETAILS.gstin).toBe('29AAYFN4510A1Z8');
  });

  test('should have bank details', () => {
    expect(COMPANY_DETAILS.accountNo).toBe('0815073000000174');
    expect(COMPANY_DETAILS.ifsc).toBe('SIBL0000815');
  });
});

describe('validateInvoiceData', () => {
  const validInvoiceData = {
    customerName: 'Test Customer',
    invoiceNumber: '001',
    invoiceDate: '01-01-2024'
  };

  const validLineItems = [
    { description: 'Item 1', quantity: 1, rate: 100 }
  ];

  const validCalculations = {
    subtotal: '100.00',
    totalGST: '18.00',
    grandTotal: '118.00',
    finalTotal: '118.00'
  };

  test('should throw error when customer name is missing', () => {
    const invalidData = { ...validInvoiceData, customerName: '' };
    expect(() => validateInvoiceData(invalidData, validLineItems, validCalculations))
      .toThrow('Please fill in customer details and add items before generating PDF');
  });

  test('should throw error when customer name is whitespace only', () => {
    const invalidData = { ...validInvoiceData, customerName: '   ' };
    expect(() => validateInvoiceData(invalidData, validLineItems, validCalculations))
      .toThrow('Please fill in customer details and add items before generating PDF');
  });

  test('should throw error when line items array is empty', () => {
    expect(() => validateInvoiceData(validInvoiceData, [], validCalculations))
      .toThrow('Please fill in customer details and add items before generating PDF');
  });

  test('should throw error when line items is not an array', () => {
    expect(() => validateInvoiceData(validInvoiceData, null, validCalculations))
      .toThrow('Please fill in customer details and add items before generating PDF');
  });

  test('should throw error when required calculation is missing', () => {
    const invalidCalcs = { subtotal: '100.00', totalGST: '18.00' };
    expect(() => validateInvoiceData(validInvoiceData, validLineItems, invalidCalcs))
      .toThrow('Invalid calculation: grandTotal is missing');
  });

  test('should pass validation with valid data', () => {
    expect(() => validateInvoiceData(validInvoiceData, validLineItems, validCalculations))
      .not.toThrow();
  });

  test('should pass validation without calculations parameter', () => {
    expect(() => validateInvoiceData(validInvoiceData, validLineItems))
      .not.toThrow();
  });
});

describe('formatIndianNumber', () => {
  test('should format small numbers correctly', () => {
    expect(formatIndianNumber(123)).toBe('123.00');
    expect(formatIndianNumber(999)).toBe('999.00');
  });

  test('should format thousands with comma', () => {
    expect(formatIndianNumber(1234)).toBe('1,234.00');
    expect(formatIndianNumber(9999)).toBe('9,999.00');
  });

  test('should format lakhs with commas', () => {
    expect(formatIndianNumber(123456)).toBe('1,23,456.00');
    expect(formatIndianNumber(999999)).toBe('9,99,999.00');
  });

  test('should format crores with commas', () => {
    expect(formatIndianNumber(12345678)).toBe('1,23,45,678.00');
  });

  test('should preserve decimal places', () => {
    expect(formatIndianNumber(1234.56)).toBe('1,234.56');
    expect(formatIndianNumber(123456.78)).toBe('1,23,456.78');
  });

  test('should handle zero', () => {
    expect(formatIndianNumber(0)).toBe('0.00');
  });

  test('should handle invalid inputs', () => {
    expect(formatIndianNumber(NaN)).toBe('0.00');
    expect(formatIndianNumber(null)).toBe('0.00');
    expect(formatIndianNumber(undefined)).toBe('0.00');
  });

  test('should round to 2 decimal places', () => {
    expect(formatIndianNumber(123.456)).toBe('123.46');
    expect(formatIndianNumber(123.454)).toBe('123.45');
  });
});

describe('calculateAmount', () => {
  test('should calculate amount correctly', () => {
    expect(calculateAmount(2, 100)).toBe(200);
    expect(calculateAmount(5, 50.5)).toBe(252.5);
  });

  test('should handle decimal quantities', () => {
    expect(calculateAmount(1.5, 100)).toBe(150);
  });

  test('should handle decimal rates', () => {
    expect(calculateAmount(3, 33.33)).toBeCloseTo(99.99, 2);
  });

  test('should return 0 for invalid quantity', () => {
    expect(calculateAmount(NaN, 100)).toBe(0);
    expect(calculateAmount(null, 100)).toBe(0);
  });

  test('should return 0 for invalid rate', () => {
    expect(calculateAmount(5, NaN)).toBe(0);
    expect(calculateAmount(5, null)).toBe(0);
  });

  test('should handle string inputs that can be parsed', () => {
    expect(calculateAmount('3', '50')).toBe(150);
  });

  test('should return 0 for zero quantity', () => {
    expect(calculateAmount(0, 100)).toBe(0);
  });

  test('should return 0 for zero rate', () => {
    expect(calculateAmount(5, 0)).toBe(0);
  });
});
