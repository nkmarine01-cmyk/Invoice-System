/**
 * Unit Tests for Validation Utility Functions
 */

const {
  isEmptyOrWhitespace,
  isValidEmail,
  validateCustomerDetails,
  validateLineItems,
  isValidQuotationNumber,
  validateQuotationData,
  isValidNumber,
  validateGST
} = require('./validation');

describe('Validation Utility Functions', () => {
  describe('isEmptyOrWhitespace', () => {
    test('should return true for null', () => {
      expect(isEmptyOrWhitespace(null)).toBe(true);
    });

    test('should return true for undefined', () => {
      expect(isEmptyOrWhitespace(undefined)).toBe(true);
    });

    test('should return true for empty string', () => {
      expect(isEmptyOrWhitespace('')).toBe(true);
    });

    test('should return true for whitespace only string', () => {
      expect(isEmptyOrWhitespace('   ')).toBe(true);
      expect(isEmptyOrWhitespace('\t\n  ')).toBe(true);
    });

    test('should return false for non-empty string', () => {
      expect(isEmptyOrWhitespace('hello')).toBe(false);
      expect(isEmptyOrWhitespace('  hello  ')).toBe(false);
    });

    test('should return false for non-string values', () => {
      expect(isEmptyOrWhitespace(123)).toBe(false);
      expect(isEmptyOrWhitespace(true)).toBe(false);
      expect(isEmptyOrWhitespace([])).toBe(false);
      expect(isEmptyOrWhitespace({})).toBe(false);
    });
  });

  describe('isValidEmail', () => {
    test('should return true for valid email formats', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('john.doe@company.co.uk')).toBe(true);
      expect(isValidEmail('test123@test.org')).toBe(true);
      expect(isValidEmail('user+tag@domain.com')).toBe(true);
    });

    test('should return false for invalid email formats', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('no@.com')).toBe(false);
      expect(isValidEmail('spaces in@email.com')).toBe(false);
    });

    test('should return false for empty or whitespace', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('   ')).toBe(false);
      expect(isValidEmail(null)).toBe(false);
      expect(isValidEmail(undefined)).toBe(false);
    });

    test('should handle emails with leading/trailing whitespace', () => {
      expect(isValidEmail('  user@example.com  ')).toBe(true);
    });
  });

  describe('validateCustomerDetails', () => {
    const validCustomer = {
      name: 'John Doe',
      phoneNumber: '1234567890',
      email: 'john@example.com',
      billingAddress: '123 Main St, City'
    };

    test('should validate complete customer details', () => {
      const result = validateCustomerDetails(validCustomer);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null or undefined customer', () => {
      const result = validateCustomerDetails(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer details are required');
    });

    test('should reject missing customer name', () => {
      const customer = { ...validCustomer, name: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer name is required');
    });

    test('should reject whitespace-only customer name', () => {
      const customer = { ...validCustomer, name: '   ' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer name is required');
    });

    test('should reject missing phone number', () => {
      const customer = { ...validCustomer, phoneNumber: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer phone number is required');
    });

    test('should reject missing email', () => {
      const customer = { ...validCustomer, email: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer email is required');
    });

    test('should reject invalid email format', () => {
      const customer = { ...validCustomer, email: 'notanemail' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer email format is invalid');
    });

    test('should reject missing billing address', () => {
      const customer = { ...validCustomer, billingAddress: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Customer billing address is required');
    });

    test('should accumulate multiple errors', () => {
      const customer = {
        name: '',
        phoneNumber: '',
        email: 'invalid',
        billingAddress: ''
      };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });

    test('should allow optional GSTIN', () => {
      const customerWithGstin = { ...validCustomer, gstin: '29ABCDE1234F1Z5' };
      const result1 = validateCustomerDetails(customerWithGstin);
      expect(result1.isValid).toBe(true);

      const customerWithoutGstin = { ...validCustomer };
      const result2 = validateCustomerDetails(customerWithoutGstin);
      expect(result2.isValid).toBe(true);
    });
  });

  describe('validateLineItems', () => {
    const validItem = {
      itemId: '507f1f77bcf86cd799439011',
      itemName: 'Test Item',
      price: 100,
      quantity: 2
    };

    test('should validate valid line items array', () => {
      const result = validateLineItems([validItem]);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should validate multiple line items', () => {
      const items = [
        validItem,
        { ...validItem, itemId: '507f1f77bcf86cd799439012' }
      ];
      const result = validateLineItems(items);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null or undefined items', () => {
      const result = validateLineItems(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Line items must be an array');
    });

    test('should reject non-array items', () => {
      const result = validateLineItems('not an array');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Line items must be an array');
    });

    test('should reject empty items array', () => {
      const result = validateLineItems([]);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('At least one line item is required');
    });

    test('should reject missing itemId', () => {
      const item = { ...validItem, itemId: null };
      const result = validateLineItems([item]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Item ID is required'))).toBe(true);
    });

    test('should reject missing item name', () => {
      const item = { ...validItem, itemName: '' };
      const result = validateLineItems([item]);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Item name is required'))).toBe(true);
    });

    test('should reject invalid price', () => {
      const item1 = { ...validItem, price: -10 };
      const result1 = validateLineItems([item1]);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.some(e => e.includes('Valid price is required'))).toBe(true);

      const item2 = { ...validItem, price: null };
      const result2 = validateLineItems([item2]);
      expect(result2.isValid).toBe(false);
    });

    test('should accept price of zero', () => {
      const item = { ...validItem, price: 0 };
      const result = validateLineItems([item]);
      expect(result.isValid).toBe(true);
    });

    test('should reject invalid quantity', () => {
      const item1 = { ...validItem, quantity: 0 };
      const result1 = validateLineItems([item1]);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.some(e => e.includes('Valid quantity is required'))).toBe(true);

      const item2 = { ...validItem, quantity: -5 };
      const result2 = validateLineItems([item2]);
      expect(result2.isValid).toBe(false);
    });

    test('should report errors for multiple invalid items', () => {
      const items = [
        { ...validItem, itemName: '' },
        { ...validItem, quantity: 0 }
      ];
      const result = validateLineItems(items);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });

  describe('isValidQuotationNumber', () => {
    test('should validate correct quotation number format', () => {
      expect(isValidQuotationNumber('-123/15-03-2024/24NK')).toBe(true);
      expect(isValidQuotationNumber('-001/01-01-2024/24NK')).toBe(true);
      expect(isValidQuotationNumber('-999/31-12-2025/25NK')).toBe(true);
    });

    test('should reject invalid formats', () => {
      expect(isValidQuotationNumber('123/15-03-2024/24NK')).toBe(false); // missing dash
      expect(isValidQuotationNumber('-12/15-03-2024/24NK')).toBe(false); // 2 digits instead of 3
      expect(isValidQuotationNumber('-1234/15-03-2024/24NK')).toBe(false); // 4 digits instead of 3
      expect(isValidQuotationNumber('-123/15/03/2024/24NK')).toBe(false); // wrong date separator
      expect(isValidQuotationNumber('-123/15-03-2024/24')).toBe(false); // missing NK
      expect(isValidQuotationNumber('-123/15-03-2024/2024NK')).toBe(false); // 4 digit year instead of 2
    });

    test('should reject empty or whitespace', () => {
      expect(isValidQuotationNumber('')).toBe(false);
      expect(isValidQuotationNumber('   ')).toBe(false);
      expect(isValidQuotationNumber(null)).toBe(false);
      expect(isValidQuotationNumber(undefined)).toBe(false);
    });

    test('should handle quotation numbers with leading/trailing whitespace', () => {
      expect(isValidQuotationNumber('  -123/15-03-2024/24NK  ')).toBe(true);
    });
  });

  describe('validateQuotationData', () => {
    const validQuotation = {
      quotationNumber: '-123/15-03-2024/24NK',
      customer: {
        name: 'John Doe',
        phoneNumber: '1234567890',
        email: 'john@example.com',
        billingAddress: '123 Main St'
      },
      items: [
        {
          itemId: '507f1f77bcf86cd799439011',
          itemName: 'Test Item',
          price: 100,
          quantity: 2
        }
      ],
      calculations: {
        subtotal: 200,
        totalGST: 36,
        grandTotal: 236
      }
    };

    test('should validate complete quotation data', () => {
      const result = validateQuotationData(validQuotation);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject null or undefined quotation data', () => {
      const result = validateQuotationData(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quotation data is required');
    });

    test('should reject missing quotation number', () => {
      const quotation = { ...validQuotation, quotationNumber: '' };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quotation number is required');
    });

    test('should reject invalid quotation number format', () => {
      const quotation = { ...validQuotation, quotationNumber: 'invalid-format' };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Quotation number format is invalid');
    });

    test('should reject invalid customer details', () => {
      const quotation = {
        ...validQuotation,
        customer: { ...validQuotation.customer, name: '' }
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('Customer name is required'))).toBe(true);
    });

    test('should reject invalid line items', () => {
      const quotation = { ...validQuotation, items: [] };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.includes('At least one line item is required'))).toBe(true);
    });

    test('should reject missing calculations object', () => {
      const quotation = { ...validQuotation, calculations: null };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Calculations object is required');
    });

    test('should reject missing subtotal in calculations', () => {
      const quotation = {
        ...validQuotation,
        calculations: { totalGST: 36, grandTotal: 236 }
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Subtotal is required in calculations');
    });

    test('should reject missing totalGST in calculations', () => {
      const quotation = {
        ...validQuotation,
        calculations: { subtotal: 200, grandTotal: 236 }
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Total GST is required in calculations');
    });

    test('should reject missing grandTotal in calculations', () => {
      const quotation = {
        ...validQuotation,
        calculations: { subtotal: 200, totalGST: 36 }
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Grand total is required in calculations');
    });

    test('should accumulate multiple validation errors', () => {
      const quotation = {
        quotationNumber: '',
        customer: { name: '', phoneNumber: '', email: 'invalid', billingAddress: '' },
        items: [],
        calculations: null
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(5);
    });
  });

  describe('isValidNumber', () => {
    test('should return true for valid numbers', () => {
      expect(isValidNumber(0)).toBe(true);
      expect(isValidNumber(100)).toBe(true);
      expect(isValidNumber(-50)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
    });

    test('should return false for non-numbers', () => {
      expect(isValidNumber('123')).toBe(false);
      expect(isValidNumber(null)).toBe(false);
      expect(isValidNumber(undefined)).toBe(false);
      expect(isValidNumber(NaN)).toBe(false);
      expect(isValidNumber(true)).toBe(false);
    });

    test('should validate minimum value', () => {
      expect(isValidNumber(10, { min: 0 })).toBe(true);
      expect(isValidNumber(0, { min: 0 })).toBe(true);
      expect(isValidNumber(-5, { min: 0 })).toBe(false);
    });

    test('should validate maximum value', () => {
      expect(isValidNumber(50, { max: 100 })).toBe(true);
      expect(isValidNumber(100, { max: 100 })).toBe(true);
      expect(isValidNumber(150, { max: 100 })).toBe(false);
    });

    test('should validate range', () => {
      expect(isValidNumber(50, { min: 0, max: 100 })).toBe(true);
      expect(isValidNumber(0, { min: 0, max: 100 })).toBe(true);
      expect(isValidNumber(100, { min: 0, max: 100 })).toBe(true);
      expect(isValidNumber(-10, { min: 0, max: 100 })).toBe(false);
      expect(isValidNumber(150, { min: 0, max: 100 })).toBe(false);
    });
  });

  describe('validateGST', () => {
    test('should validate valid GST percentages', () => {
      expect(validateGST(0).isValid).toBe(true);
      expect(validateGST(18).isValid).toBe(true);
      expect(validateGST(100).isValid).toBe(true);
      expect(validateGST(5.5).isValid).toBe(true);
    });

    test('should reject negative GST', () => {
      const result = validateGST(-5);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GST must be a number between 0 and 100');
    });

    test('should reject GST over 100', () => {
      const result = validateGST(150);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GST must be a number between 0 and 100');
    });

    test('should reject non-number GST', () => {
      const result = validateGST('18');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GST must be a number between 0 and 100');
    });

    test('should return null error for valid GST', () => {
      expect(validateGST(18).error).toBeNull();
    });
  });
});
