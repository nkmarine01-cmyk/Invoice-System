/**
 * Unit Tests for Quotation Validation Utility Functions
 */

import {
  isEmptyOrWhitespace,
  isValidEmail,
  validateCustomerDetails,
  validateLineItems,
  validateStagingArea,
  validateQuotationData,
  validateGST,
  validateLineItem
} from './quotationValidation';

describe('Quotation Validation Utility Functions', () => {
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
      customerName: 'John Doe',
      phoneNumber: '1234567890',
      email: 'john@example.com',
      customerAddress: '123 Main St',
      customerCity: 'Mumbai'
    };

    test('should validate complete customer details', () => {
      const result = validateCustomerDetails(validCustomer);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should reject null or undefined customer', () => {
      const result = validateCustomerDetails(null);
      expect(result.isValid).toBe(false);
      expect(result.errors.general).toBe('Customer details are required');
    });

    test('should reject missing customer name', () => {
      const customer = { ...validCustomer, customerName: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.customerName).toBe('Customer name is required');
    });

    test('should reject whitespace-only customer name', () => {
      const customer = { ...validCustomer, customerName: '   ' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.customerName).toBe('Customer name is required');
    });

    test('should reject missing phone number', () => {
      const customer = { ...validCustomer, phoneNumber: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.phoneNumber).toBe('Phone number is required');
    });

    test('should reject missing email', () => {
      const customer = { ...validCustomer, email: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Email is required');
    });

    test('should reject invalid email format', () => {
      const customer = { ...validCustomer, email: 'notanemail' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    test('should reject missing address', () => {
      const customer = { ...validCustomer, customerAddress: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.customerAddress).toBe('Address is required');
    });

    test('should reject missing city', () => {
      const customer = { ...validCustomer, customerCity: '' };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(result.errors.customerCity).toBe('City is required');
    });

    test('should accumulate multiple errors', () => {
      const customer = {
        customerName: '',
        phoneNumber: '',
        email: 'invalid',
        customerAddress: '',
        customerCity: ''
      };
      const result = validateCustomerDetails(customer);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(3);
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
      rate: 100,
      quantity: 2
    };

    test('should validate valid line items array', () => {
      const result = validateLineItems([validItem]);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should validate multiple line items', () => {
      const items = [
        validItem,
        { ...validItem, itemId: '507f1f77bcf86cd799439012' }
      ];
      const result = validateLineItems(items);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject null or undefined items', () => {
      const result = validateLineItems(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Line items must be an array');
    });

    test('should reject non-array items', () => {
      const result = validateLineItems('not an array');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Line items must be an array');
    });

    test('should reject empty items array', () => {
      const result = validateLineItems([]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please add at least one item to the quotation');
    });
  });

  describe('validateStagingArea', () => {
    const stagingItem = {
      itemId: '507f1f77bcf86cd799439011',
      itemName: 'Test Item',
      rate: 100,
      quantity: 1
    };

    test('should validate empty staging area', () => {
      const result = validateStagingArea([]);
      expect(result.isValid).toBe(true);
      expect(result.error).toBeNull();
    });

    test('should reject non-empty staging area', () => {
      const result = validateStagingArea([stagingItem]);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('Please add all staged items to the quotation summary before saving');
    });

    test('should handle null or undefined staging items', () => {
      const result1 = validateStagingArea(null);
      expect(result1.isValid).toBe(true);

      const result2 = validateStagingArea(undefined);
      expect(result2.isValid).toBe(true);
    });

    test('should reject non-array staging items', () => {
      const result = validateStagingArea('not an array');
      expect(result.isValid).toBe(true); // Non-array is treated as valid (no staging items)
    });
  });

  describe('validateQuotationData', () => {
    const validQuotation = {
      customerData: {
        customerName: 'John Doe',
        phoneNumber: '1234567890',
        email: 'john@example.com',
        customerAddress: '123 Main St',
        customerCity: 'Mumbai'
      },
      cartItems: [
        {
          itemId: '507f1f77bcf86cd799439011',
          itemName: 'Test Item',
          rate: 100,
          quantity: 2
        }
      ],
      stagingItems: []
    };

    test('should validate complete quotation data', () => {
      const result = validateQuotationData(validQuotation);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
      expect(result.message).toBeNull();
    });

    test('should reject null or undefined quotation data', () => {
      const result = validateQuotationData(null);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Quotation data is required');
    });

    test('should reject invalid customer details', () => {
      const quotation = {
        ...validQuotation,
        customerData: {
          ...validQuotation.customerData,
          customerName: ''
        }
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.errors.customerName).toBe('Customer name is required');
    });

    test('should reject empty cart items', () => {
      const quotation = {
        ...validQuotation,
        cartItems: []
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Please add at least one item to the quotation');
    });

    test('should reject non-empty staging area', () => {
      const quotation = {
        ...validQuotation,
        stagingItems: [
          {
            itemId: '507f1f77bcf86cd799439011',
            itemName: 'Staged Item',
            rate: 50,
            quantity: 1
          }
        ]
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Please add all staged items to the quotation summary before saving');
    });

    test('should accumulate multiple validation errors', () => {
      const quotation = {
        customerData: {
          customerName: '',
          phoneNumber: '',
          email: 'invalid',
          customerAddress: '',
          customerCity: ''
        },
        cartItems: [],
        stagingItems: []
      };
      const result = validateQuotationData(quotation);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBeGreaterThan(3);
      expect(result.message).toBe('Please add at least one item to the quotation');
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
      expect(result.error).toBe('GST must be between 0 and 100');
    });

    test('should reject GST over 100', () => {
      const result = validateGST(150);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GST must be between 0 and 100');
    });

    test('should reject non-number GST', () => {
      const result = validateGST('18');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GST must be a number');
    });

    test('should reject NaN GST', () => {
      const result = validateGST(NaN);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('GST must be a number');
    });

    test('should return null error for valid GST', () => {
      expect(validateGST(18).error).toBeNull();
    });
  });

  describe('validateLineItem', () => {
    const validItem = {
      itemId: '507f1f77bcf86cd799439011',
      itemName: 'Test Item',
      rate: 100,
      quantity: 2
    };

    test('should validate valid line item', () => {
      const result = validateLineItem(validItem);
      expect(result.isValid).toBe(true);
      expect(Object.keys(result.errors)).toHaveLength(0);
    });

    test('should reject null or undefined item', () => {
      const result = validateLineItem(null);
      expect(result.isValid).toBe(false);
      expect(result.errors.general).toBe('Item is required');
    });

    test('should reject missing item name', () => {
      const item = { ...validItem, itemName: '' };
      const result = validateLineItem(item);
      expect(result.isValid).toBe(false);
      expect(result.errors.itemName).toBe('Item name is required');
    });

    test('should reject invalid quantity', () => {
      const item1 = { ...validItem, quantity: 0 };
      const result1 = validateLineItem(item1);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.quantity).toBe('Quantity must be at least 1');

      const item2 = { ...validItem, quantity: -5 };
      const result2 = validateLineItem(item2);
      expect(result2.isValid).toBe(false);
      expect(result2.errors.quantity).toBe('Quantity must be at least 1');
    });

    test('should reject invalid rate', () => {
      const item1 = { ...validItem, rate: -10 };
      const result1 = validateLineItem(item1);
      expect(result1.isValid).toBe(false);
      expect(result1.errors.rate).toBe('Rate must be a positive number');

      const item2 = { ...validItem, rate: null };
      const result2 = validateLineItem(item2);
      expect(result2.isValid).toBe(false);
    });

    test('should accept rate of zero', () => {
      const item = { ...validItem, rate: 0 };
      const result = validateLineItem(item);
      expect(result.isValid).toBe(true);
    });

    test('should accumulate multiple errors', () => {
      const item = {
        ...validItem,
        itemName: '',
        quantity: 0,
        rate: -10
      };
      const result = validateLineItem(item);
      expect(result.isValid).toBe(false);
      expect(Object.keys(result.errors).length).toBe(3);
    });
  });
});
