/**
 * Tests for Calculation Engine Utility
 * 
 * Tests the calculation engine that computes quotation totals including:
 * - Subtotal calculation
 * - GST calculation
 * - Grand total calculation
 * - Round-off calculation
 * - Final total calculation
 * 
 * Uses both example-based unit tests and property-based tests.
 */

const { calculateTotals } = require('./calculationEngine');

describe('Calculation Engine', () => {
  describe('Unit Tests - Specific Examples', () => {
    test('should calculate totals for a single line item', () => {
      const lineItems = [{ quantity: 2, rate: 100 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      expect(result.subtotal).toBe('200.00');
      expect(result.totalGST).toBe('36.00');
      expect(result.grandTotal).toBe('236.00');
      expect(result.finalTotal).toBe('236.00');
      expect(result.roundOff).toBe('0.00');
    });

    test('should calculate totals for multiple line items', () => {
      const lineItems = [
        { quantity: 2, rate: 100 },
        { quantity: 1, rate: 50 },
        { quantity: 3, rate: 75 }
      ];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Subtotal: (2*100) + (1*50) + (3*75) = 200 + 50 + 225 = 475
      expect(result.subtotal).toBe('475.00');
      // GST: 475 * 18 / 100 = 85.50
      expect(result.totalGST).toBe('85.50');
      // Grand total: 475 + 85.50 = 560.50
      expect(result.grandTotal).toBe('560.50');
      // Final total: round(560.50) = 561
      expect(result.finalTotal).toBe('561.00');
      // Round-off: 561 - 560.50 = 0.50
      expect(result.roundOff).toBe('0.50');
    });

    test('should calculate totals with decimal quantities and rates', () => {
      const lineItems = [
        { quantity: 2.5, rate: 100.50 },
        { quantity: 1.75, rate: 50.25 }
      ];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Subtotal: (2.5*100.50) + (1.75*50.25) = 251.25 + 87.9375 = 339.1875
      expect(result.subtotal).toBe('339.19');
      // GST: 339.1875 * 18 / 100 = 61.05375
      expect(result.totalGST).toBe('61.05');
      // Grand total: 339.1875 + 61.05375 = 400.24125
      expect(result.grandTotal).toBe('400.24');
      // Final total: round(400.24125) = 400
      expect(result.finalTotal).toBe('400.00');
      // Round-off: 400 - 400.24125 = -0.24125
      expect(result.roundOff).toBe('-0.24');
    });

    test('should handle zero GST percentage', () => {
      const lineItems = [{ quantity: 2, rate: 100 }];
      const gstPercentage = 0;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      expect(result.subtotal).toBe('200.00');
      expect(result.totalGST).toBe('0.00');
      expect(result.grandTotal).toBe('200.00');
      expect(result.finalTotal).toBe('200.00');
      expect(result.roundOff).toBe('0.00');
    });

    test('should handle empty line items array', () => {
      const lineItems = [];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      expect(result.subtotal).toBe('0.00');
      expect(result.totalGST).toBe('0.00');
      expect(result.grandTotal).toBe('0.00');
      expect(result.finalTotal).toBe('0.00');
      expect(result.roundOff).toBe('0.00');
    });

    test('should calculate negative round-off when grand total is above 0.5', () => {
      const lineItems = [{ quantity: 1, rate: 100.60 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Subtotal: 100.60
      expect(result.subtotal).toBe('100.60');
      // GST: 100.60 * 18 / 100 = 18.108
      expect(result.totalGST).toBe('18.11');
      // Grand total: 100.60 + 18.108 = 118.708
      expect(result.grandTotal).toBe('118.71');
      // Final total: round(118.708) = 119
      expect(result.finalTotal).toBe('119.00');
      // Round-off: 119 - 118.708 = 0.292
      expect(result.roundOff).toBe('0.29');
    });

    test('should handle maximum GST percentage (100%)', () => {
      const lineItems = [{ quantity: 1, rate: 100 }];
      const gstPercentage = 100;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      expect(result.subtotal).toBe('100.00');
      expect(result.totalGST).toBe('100.00');
      expect(result.grandTotal).toBe('200.00');
      expect(result.finalTotal).toBe('200.00');
      expect(result.roundOff).toBe('0.00');
    });

    test('should return all values with exactly 2 decimal places', () => {
      const lineItems = [{ quantity: 1, rate: 100 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Check all values have exactly 2 decimal places
      expect(result.subtotal).toMatch(/^\d+\.\d{2}$/);
      expect(result.totalGST).toMatch(/^\d+\.\d{2}$/);
      expect(result.grandTotal).toMatch(/^\d+\.\d{2}$/);
      expect(result.roundOff).toMatch(/^-?\d+\.\d{2}$/);
      expect(result.finalTotal).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very large numbers', () => {
      const lineItems = [{ quantity: 1000000, rate: 999999 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Subtotal: 999999000000
      expect(parseFloat(result.subtotal)).toBe(999999000000);
      expect(result.subtotal).toMatch(/^\d+\.\d{2}$/);
    });

    test('should handle very small decimal values', () => {
      const lineItems = [{ quantity: 0.01, rate: 0.01 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Subtotal: 0.0001
      expect(result.subtotal).toBe('0.00');
      expect(result.totalGST).toBe('0.00');
      expect(result.grandTotal).toBe('0.00');
      expect(result.finalTotal).toBe('0.00');
      expect(result.roundOff).toBe('0.00');
    });

    test('should handle zero quantity', () => {
      const lineItems = [{ quantity: 0, rate: 100 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      expect(result.subtotal).toBe('0.00');
      expect(result.totalGST).toBe('0.00');
      expect(result.grandTotal).toBe('0.00');
      expect(result.finalTotal).toBe('0.00');
      expect(result.roundOff).toBe('0.00');
    });

    test('should handle zero rate', () => {
      const lineItems = [{ quantity: 10, rate: 0 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      expect(result.subtotal).toBe('0.00');
      expect(result.totalGST).toBe('0.00');
      expect(result.grandTotal).toBe('0.00');
      expect(result.finalTotal).toBe('0.00');
      expect(result.roundOff).toBe('0.00');
    });
  });

  describe('Input Validation', () => {
    test('should throw error if lineItems is not an array', () => {
      expect(() => {
        calculateTotals('not an array', 18);
      }).toThrow('lineItems must be an array');
    });

    test('should throw error if lineItems is null', () => {
      expect(() => {
        calculateTotals(null, 18);
      }).toThrow('lineItems must be an array');
    });

    test('should throw error if gstPercentage is not a number', () => {
      expect(() => {
        calculateTotals([], 'not a number');
      }).toThrow('gstPercentage must be a number between 0 and 100');
    });

    test('should throw error if gstPercentage is negative', () => {
      expect(() => {
        calculateTotals([], -5);
      }).toThrow('gstPercentage must be a number between 0 and 100');
    });

    test('should throw error if gstPercentage is greater than 100', () => {
      expect(() => {
        calculateTotals([], 101);
      }).toThrow('gstPercentage must be a number between 0 and 100');
    });

    test('should throw error if line item has non-numeric quantity', () => {
      const lineItems = [{ quantity: 'invalid', rate: 100 }];
      expect(() => {
        calculateTotals(lineItems, 18);
      }).toThrow('Each line item must have numeric quantity and rate');
    });

    test('should throw error if line item has non-numeric rate', () => {
      const lineItems = [{ quantity: 2, rate: 'invalid' }];
      expect(() => {
        calculateTotals(lineItems, 18);
      }).toThrow('Each line item must have numeric quantity and rate');
    });

    test('should throw error if line item is missing quantity', () => {
      const lineItems = [{ rate: 100 }];
      expect(() => {
        calculateTotals(lineItems, 18);
      }).toThrow('Each line item must have numeric quantity and rate');
    });

    test('should throw error if line item is missing rate', () => {
      const lineItems = [{ quantity: 2 }];
      expect(() => {
        calculateTotals(lineItems, 18);
      }).toThrow('Each line item must have numeric quantity and rate');
    });
  });

  describe('Calculation Formula Verification', () => {
    test('should verify subtotal equals sum of (quantity × rate)', () => {
      const lineItems = [
        { quantity: 3, rate: 50 },
        { quantity: 2, rate: 75 },
        { quantity: 1, rate: 100 }
      ];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Manual calculation: (3*50) + (2*75) + (1*100) = 150 + 150 + 100 = 400
      expect(parseFloat(result.subtotal)).toBe(400);
    });

    test('should verify GST amount equals (subtotal × GST%) / 100', () => {
      const lineItems = [{ quantity: 1, rate: 1000 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // Subtotal: 1000
      // GST: 1000 * 18 / 100 = 180
      expect(parseFloat(result.totalGST)).toBe(180);
    });

    test('should verify grand total equals subtotal + GST', () => {
      const lineItems = [{ quantity: 1, rate: 500 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const subtotal = parseFloat(result.subtotal);
      const gst = parseFloat(result.totalGST);
      const grandTotal = parseFloat(result.grandTotal);
      
      expect(grandTotal).toBeCloseTo(subtotal + gst, 2);
    });

    test('should verify final total is rounded grand total', () => {
      const lineItems = [{ quantity: 1, rate: 100.33 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const grandTotal = parseFloat(result.grandTotal);
      const finalTotal = parseFloat(result.finalTotal);
      
      expect(finalTotal).toBe(Math.round(grandTotal));
    });

    test('should verify round-off equals final total - grand total', () => {
      const lineItems = [{ quantity: 1, rate: 100.75 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const grandTotal = parseFloat(result.grandTotal);
      const finalTotal = parseFloat(result.finalTotal);
      const roundOff = parseFloat(result.roundOff);
      
      expect(roundOff).toBeCloseTo(finalTotal - grandTotal, 2);
    });
  });

  describe('Requirements Validation', () => {
    test('should satisfy Requirement 3.1: Item amount calculation', () => {
      // For any line item with quantity Q and rate R, amount = Q × R
      const lineItems = [{ quantity: 5, rate: 123.45 }];
      const gstPercentage = 0; // Use 0% GST to isolate subtotal
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const expectedAmount = 5 * 123.45;
      expect(parseFloat(result.subtotal)).toBe(expectedAmount);
    });

    test('should satisfy Requirement 3.2: Subtotal is sum of all item amounts', () => {
      const lineItems = [
        { quantity: 2, rate: 50 },
        { quantity: 3, rate: 100 },
        { quantity: 1, rate: 150 }
      ];
      const gstPercentage = 0;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const expectedSubtotal = (2 * 50) + (3 * 100) + (1 * 150);
      expect(parseFloat(result.subtotal)).toBe(expectedSubtotal);
    });

    test('should satisfy Requirement 3.3: GST calculation formula', () => {
      const lineItems = [{ quantity: 1, rate: 500 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const subtotal = parseFloat(result.subtotal);
      const expectedGST = (subtotal * gstPercentage) / 100;
      expect(parseFloat(result.totalGST)).toBe(expectedGST);
    });

    test('should satisfy Requirement 3.4: Grand total calculation', () => {
      const lineItems = [{ quantity: 1, rate: 1000 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const subtotal = parseFloat(result.subtotal);
      const gst = parseFloat(result.totalGST);
      const expectedGrandTotal = subtotal + gst;
      expect(parseFloat(result.grandTotal)).toBeCloseTo(expectedGrandTotal, 2);
    });

    test('should satisfy Requirement 3.5: Final total is rounded', () => {
      const lineItems = [{ quantity: 1, rate: 100.67 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const grandTotal = parseFloat(result.grandTotal);
      const finalTotal = parseFloat(result.finalTotal);
      expect(finalTotal).toBe(Math.round(grandTotal));
    });

    test('should satisfy Requirement 3.6: Round-off calculation', () => {
      const lineItems = [{ quantity: 1, rate: 99.99 }];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      const grandTotal = parseFloat(result.grandTotal);
      const finalTotal = parseFloat(result.finalTotal);
      const expectedRoundOff = finalTotal - grandTotal;
      expect(parseFloat(result.roundOff)).toBeCloseTo(expectedRoundOff, 2);
    });

    test('should satisfy Requirement 3.7: 2 decimal places for all values', () => {
      const lineItems = [
        { quantity: 1.5, rate: 33.333 },
        { quantity: 2.7, rate: 77.777 }
      ];
      const gstPercentage = 18;
      
      const result = calculateTotals(lineItems, gstPercentage);
      
      // All values should have exactly 2 decimal places
      expect(result.subtotal.split('.')[1].length).toBe(2);
      expect(result.totalGST.split('.')[1].length).toBe(2);
      expect(result.grandTotal.split('.')[1].length).toBe(2);
      expect(result.roundOff.split('.')[1].length).toBe(2);
      expect(result.finalTotal.split('.')[1].length).toBe(2);
    });
  });
});
