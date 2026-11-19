/**
 * Validation Utility Functions for Quotation Management System
 * 
 * This module provides validation functions for quotation data including:
 * - Email format validation
 * - Required field validation
 * - Empty/whitespace validation
 * - Line items validation
 */

/**
 * Validates if a string is empty or contains only whitespace
 * @param {string} value - The string to validate
 * @returns {boolean} - True if empty or whitespace, false otherwise
 */
const isEmptyOrWhitespace = (value) => {
  if (value === null || value === undefined) {
    return true;
  }
  if (typeof value !== 'string') {
    return false;
  }
  return value.trim().length === 0;
};

/**
 * Validates email format
 * @param {string} email - The email address to validate
 * @returns {boolean} - True if valid email format, false otherwise
 */
const isValidEmail = (email) => {
  if (isEmptyOrWhitespace(email)) {
    return false;
  }
  
  // Email format pattern: [text]@[text].[text]
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates required customer details fields
 * @param {Object} customer - Customer details object
 * @param {string} customer.name - Customer name
 * @param {string} customer.phoneNumber - Customer phone number
 * @param {string} customer.email - Customer email
 * @param {string} customer.billingAddress - Customer billing address
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateCustomerDetails = (customer) => {
  const errors = [];

  if (!customer) {
    errors.push('Customer details are required');
    return { isValid: false, errors };
  }

  if (isEmptyOrWhitespace(customer.name)) {
    errors.push('Customer name is required');
  }

  if (isEmptyOrWhitespace(customer.phoneNumber)) {
    errors.push('Customer phone number is required');
  }

  if (isEmptyOrWhitespace(customer.email)) {
    errors.push('Customer email is required');
  } else if (!isValidEmail(customer.email)) {
    errors.push('Customer email format is invalid');
  }

  if (isEmptyOrWhitespace(customer.billingAddress)) {
    errors.push('Customer billing address is required');
  }

  // Note: City validation is handled separately if needed as it may be part of billingAddress
  // GSTIN is optional, so no validation required

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates line items array
 * @param {Array} items - Array of line items
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateLineItems = (items) => {
  const errors = [];

  if (!items || !Array.isArray(items)) {
    errors.push('Line items must be an array');
    return { isValid: false, errors };
  }

  if (items.length === 0) {
    errors.push('At least one line item is required');
    return { isValid: false, errors };
  }

  // Validate each line item
  items.forEach((item, index) => {
    if (!item.itemId) {
      errors.push(`Line item ${index + 1}: Item ID is required`);
    }

    if (isEmptyOrWhitespace(item.itemName)) {
      errors.push(`Line item ${index + 1}: Item name is required`);
    }

    if (item.price === undefined || item.price === null || item.price < 0) {
      errors.push(`Line item ${index + 1}: Valid price is required (must be >= 0)`);
    }

    if (item.quantity === undefined || item.quantity === null || item.quantity < 1) {
      errors.push(`Line item ${index + 1}: Valid quantity is required (must be >= 1)`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates quotation number format
 * @param {string} quotationNumber - The quotation number to validate
 * @returns {boolean} - True if valid format, false otherwise
 */
const isValidQuotationNumber = (quotationNumber) => {
  if (isEmptyOrWhitespace(quotationNumber)) {
    return false;
  }

  // Format: -XXX/DD-MM-YYYY/YYNK
  const quotationNumberRegex = /^-\d{3}\/\d{2}-\d{2}-\d{4}\/\d{2}NK$/;
  return quotationNumberRegex.test(quotationNumber.trim());
};

/**
 * Validates complete quotation data
 * @param {Object} quotationData - The quotation data to validate
 * @param {string} quotationData.quotationNumber - Quotation number
 * @param {Object} quotationData.customer - Customer details
 * @param {Array} quotationData.items - Line items
 * @param {Object} quotationData.calculations - Calculations object
 * @returns {Object} - { isValid: boolean, errors: string[] }
 */
const validateQuotationData = (quotationData) => {
  const errors = [];

  if (!quotationData) {
    errors.push('Quotation data is required');
    return { isValid: false, errors };
  }

  // Validate quotation number
  if (isEmptyOrWhitespace(quotationData.quotationNumber)) {
    errors.push('Quotation number is required');
  } else if (!isValidQuotationNumber(quotationData.quotationNumber)) {
    errors.push('Quotation number format is invalid');
  }

  // Validate customer details
  const customerValidation = validateCustomerDetails(quotationData.customer);
  if (!customerValidation.isValid) {
    errors.push(...customerValidation.errors);
  }

  // Validate line items
  const itemsValidation = validateLineItems(quotationData.items);
  if (!itemsValidation.isValid) {
    errors.push(...itemsValidation.errors);
  }

  // Validate calculations object exists
  if (!quotationData.calculations) {
    errors.push('Calculations object is required');
  } else {
    if (quotationData.calculations.subtotal === undefined || quotationData.calculations.subtotal === null) {
      errors.push('Subtotal is required in calculations');
    }
    if (quotationData.calculations.totalGST === undefined || quotationData.calculations.totalGST === null) {
      errors.push('Total GST is required in calculations');
    }
    if (quotationData.calculations.grandTotal === undefined || quotationData.calculations.grandTotal === null) {
      errors.push('Grand total is required in calculations');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validates that a field is a valid number and within optional range
 * @param {*} value - The value to validate
 * @param {Object} options - Validation options
 * @param {number} options.min - Minimum value (optional)
 * @param {number} options.max - Maximum value (optional)
 * @returns {boolean} - True if valid number within range, false otherwise
 */
const isValidNumber = (value, options = {}) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return false;
  }

  if (options.min !== undefined && value < options.min) {
    return false;
  }

  if (options.max !== undefined && value > options.max) {
    return false;
  }

  return true;
};

/**
 * Validates GST percentage
 * @param {number} gst - GST percentage value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
const validateGST = (gst) => {
  if (!isValidNumber(gst, { min: 0, max: 100 })) {
    return {
      isValid: false,
      error: 'GST must be a number between 0 and 100'
    };
  }

  return { isValid: true, error: null };
};

module.exports = {
  isEmptyOrWhitespace,
  isValidEmail,
  validateCustomerDetails,
  validateLineItems,
  isValidQuotationNumber,
  validateQuotationData,
  isValidNumber,
  validateGST
};
