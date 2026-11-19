/**
 * Quotation Validation Utility Functions
 * 
 * This module provides client-side validation functions for quotation data including:
 * - Email format validation
 * - Required field validation
 * - Empty/whitespace validation
 * - Line items validation
 * - Staging area validation
 */

/**
 * Validates if a string is empty or contains only whitespace
 * @param {string} value - The string to validate
 * @returns {boolean} - True if empty or whitespace, false otherwise
 */
export const isEmptyOrWhitespace = (value) => {
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
 * 
 * Validates Requirement 4.3: Email format validation
 */
export const isValidEmail = (email) => {
  if (isEmptyOrWhitespace(email)) {
    return false;
  }
  
  // Email format pattern: [text]@[text].[text]
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validates required customer details fields
 * @param {Object} customerData - Customer details object
 * @param {string} customerData.customerName - Customer name
 * @param {string} customerData.phoneNumber - Customer phone number
 * @param {string} customerData.email - Customer email
 * @param {string} customerData.customerAddress - Customer billing address
 * @param {string} customerData.customerCity - Customer city
 * @returns {Object} - { isValid: boolean, errors: Object }
 * 
 * Validates Requirements 4.1, 4.2, 4.3, 4.4, 4.5: Required customer fields
 */
export const validateCustomerDetails = (customerData) => {
  const errors = {};
  let isValid = true;

  if (!customerData) {
    return {
      isValid: false,
      errors: { general: 'Customer details are required' }
    };
  }

  // Requirement 4.1: Customer name is required
  if (isEmptyOrWhitespace(customerData.customerName)) {
    errors.customerName = 'Customer name is required';
    isValid = false;
  }

  // Requirement 4.2: Phone number is required
  if (isEmptyOrWhitespace(customerData.phoneNumber)) {
    errors.phoneNumber = 'Phone number is required';
    isValid = false;
  }

  // Requirement 4.3: Email is required and must match email format
  if (isEmptyOrWhitespace(customerData.email)) {
    errors.email = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(customerData.email)) {
    errors.email = 'Please enter a valid email address';
    isValid = false;
  }

  // Requirement 4.4: Address is required
  if (isEmptyOrWhitespace(customerData.customerAddress)) {
    errors.customerAddress = 'Address is required';
    isValid = false;
  }

  // Requirement 4.5: City is required
  if (isEmptyOrWhitespace(customerData.customerCity)) {
    errors.customerCity = 'City is required';
    isValid = false;
  }

  // Note: GSTIN is optional, so no validation required

  return { isValid, errors };
};

/**
 * Validates that at least one line item exists in the quotation summary
 * @param {Array} lineItems - Array of line items
 * @returns {Object} - { isValid: boolean, error: string|null }
 * 
 * Validates Requirement 4.6: At least one line item must exist
 */
export const validateLineItems = (lineItems) => {
  if (!lineItems || !Array.isArray(lineItems)) {
    return {
      isValid: false,
      error: 'Line items must be an array'
    };
  }

  if (lineItems.length === 0) {
    return {
      isValid: false,
      error: 'Please add at least one item to the quotation'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates that staging area is empty before saving
 * @param {Array} stagingItems - Array of items in staging area
 * @returns {Object} - { isValid: boolean, error: string|null }
 * 
 * Validates Requirement 4.7: Staging area must be empty before saving
 */
export const validateStagingArea = (stagingItems) => {
  if (!stagingItems || !Array.isArray(stagingItems)) {
    return { isValid: true, error: null };
  }

  if (stagingItems.length > 0) {
    return {
      isValid: false,
      error: 'Please add all staged items to the quotation summary before saving'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates complete quotation data before submission
 * @param {Object} quotationData - The quotation data to validate
 * @param {Object} quotationData.customerData - Customer details
 * @param {Array} quotationData.cartItems - Line items in cart
 * @param {Array} quotationData.stagingItems - Items in staging area
 * @returns {Object} - { isValid: boolean, errors: Object, message: string|null }
 * 
 * Validates Requirements 4.1-4.7: Complete quotation validation
 */
export const validateQuotationData = (quotationData) => {
  const validationErrors = {};
  let errorMessage = null;

  if (!quotationData) {
    return {
      isValid: false,
      errors: {},
      message: 'Quotation data is required'
    };
  }

  // Validate customer details (Requirements 4.1-4.5)
  const customerValidation = validateCustomerDetails(quotationData.customerData);
  if (!customerValidation.isValid) {
    Object.assign(validationErrors, customerValidation.errors);
  }

  // Validate line items exist (Requirement 4.6)
  const itemsValidation = validateLineItems(quotationData.cartItems);
  if (!itemsValidation.isValid) {
    errorMessage = itemsValidation.error;
  }

  // Validate staging area is empty (Requirement 4.7)
  const stagingValidation = validateStagingArea(quotationData.stagingItems);
  if (!stagingValidation.isValid) {
    errorMessage = stagingValidation.error;
  }

  const isValid = customerValidation.isValid && itemsValidation.isValid && stagingValidation.isValid;

  return {
    isValid,
    errors: validationErrors,
    message: errorMessage
  };
};

/**
 * Validates GST percentage value
 * @param {number} gst - GST percentage value
 * @returns {Object} - { isValid: boolean, error: string|null }
 */
export const validateGST = (gst) => {
  if (typeof gst !== 'number' || isNaN(gst)) {
    return {
      isValid: false,
      error: 'GST must be a number'
    };
  }

  if (gst < 0 || gst > 100) {
    return {
      isValid: false,
      error: 'GST must be between 0 and 100'
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validates a single line item
 * @param {Object} item - Line item to validate
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateLineItem = (item) => {
  const errors = {};
  let isValid = true;

  if (!item) {
    return {
      isValid: false,
      errors: { general: 'Item is required' }
    };
  }

  if (isEmptyOrWhitespace(item.itemName)) {
    errors.itemName = 'Item name is required';
    isValid = false;
  }

  if (item.quantity === undefined || item.quantity === null || item.quantity < 1) {
    errors.quantity = 'Quantity must be at least 1';
    isValid = false;
  }

  if (item.rate === undefined || item.rate === null || item.rate < 0) {
    errors.rate = 'Rate must be a positive number';
    isValid = false;
  }

  return { isValid, errors };
};
