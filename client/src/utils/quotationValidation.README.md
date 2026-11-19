# Quotation Validation Utilities

This module provides client-side validation functions for the Quotation Management System. These utilities ensure data integrity before submission and provide user-friendly error messages.

## Overview

The validation utilities are designed to validate quotation data according to the requirements specified in the Quotation Management System design document. They follow a consistent pattern and return structured validation results.

## Functions

### `isEmptyOrWhitespace(value)`

Validates if a string is empty or contains only whitespace.

**Parameters:**
- `value` (string): The string to validate

**Returns:**
- `boolean`: True if empty or whitespace, false otherwise

**Example:**
```javascript
import { isEmptyOrWhitespace } from './quotationValidation';

isEmptyOrWhitespace('');        // true
isEmptyOrWhitespace('   ');     // true
isEmptyOrWhitespace('hello');   // false
```

---

### `isValidEmail(email)`

Validates email format using regex pattern `[text]@[text].[text]`.

**Validates:** Requirement 4.3 - Email format validation

**Parameters:**
- `email` (string): The email address to validate

**Returns:**
- `boolean`: True if valid email format, false otherwise

**Example:**
```javascript
import { isValidEmail } from './quotationValidation';

isValidEmail('user@example.com');  // true
isValidEmail('notanemail');        // false
isValidEmail('missing@domain');    // false
```

---

### `validateCustomerDetails(customerData)`

Validates all required customer details fields.

**Validates:** Requirements 4.1, 4.2, 4.3, 4.4, 4.5

**Parameters:**
- `customerData` (Object): Customer details object
  - `customerName` (string): Customer name
  - `phoneNumber` (string): Customer phone number
  - `email` (string): Customer email
  - `customerAddress` (string): Customer address
  - `customerCity` (string): Customer city
  - `gstin` (string, optional): Customer GSTIN

**Returns:**
- `Object`: 
  - `isValid` (boolean): True if all validations pass
  - `errors` (Object): Object with field-specific error messages

**Example:**
```javascript
import { validateCustomerDetails } from './quotationValidation';

const customerData = {
  customerName: 'John Doe',
  phoneNumber: '1234567890',
  email: 'john@example.com',
  customerAddress: '123 Main St',
  customerCity: 'Mumbai'
};

const result = validateCustomerDetails(customerData);
// { isValid: true, errors: {} }

const invalidCustomer = { ...customerData, email: 'invalid' };
const invalidResult = validateCustomerDetails(invalidCustomer);
// { isValid: false, errors: { email: 'Please enter a valid email address' } }
```

---

### `validateLineItems(lineItems)`

Validates that at least one line item exists in the quotation.

**Validates:** Requirement 4.6 - At least one line item must exist

**Parameters:**
- `lineItems` (Array): Array of line items

**Returns:**
- `Object`:
  - `isValid` (boolean): True if validation passes
  - `error` (string|null): Error message if validation fails

**Example:**
```javascript
import { validateLineItems } from './quotationValidation';

const items = [
  { itemId: '123', itemName: 'Item 1', rate: 100, quantity: 2 }
];

const result = validateLineItems(items);
// { isValid: true, error: null }

const emptyResult = validateLineItems([]);
// { isValid: false, error: 'Please add at least one item to the quotation' }
```

---

### `validateStagingArea(stagingItems)`

Validates that staging area is empty before saving.

**Validates:** Requirement 4.7 - Staging area must be cleared before saving

**Parameters:**
- `stagingItems` (Array): Array of items in staging area

**Returns:**
- `Object`:
  - `isValid` (boolean): True if staging area is empty
  - `error` (string|null): Error message if validation fails

**Example:**
```javascript
import { validateStagingArea } from './quotationValidation';

const result = validateStagingArea([]);
// { isValid: true, error: null }

const withItems = [{ itemId: '123', itemName: 'Item 1' }];
const invalidResult = validateStagingArea(withItems);
// { isValid: false, error: 'Please add all staged items to the quotation summary before saving' }
```

---

### `validateQuotationData(quotationData)`

Validates complete quotation data before submission. This is the primary validation function to use before submitting a quotation.

**Validates:** Requirements 4.1-4.7 - Complete quotation validation

**Parameters:**
- `quotationData` (Object): Complete quotation data
  - `customerData` (Object): Customer details
  - `cartItems` (Array): Line items in cart
  - `stagingItems` (Array): Items in staging area

**Returns:**
- `Object`:
  - `isValid` (boolean): True if all validations pass
  - `errors` (Object): Field-specific error messages
  - `message` (string|null): General error message

**Example:**
```javascript
import { validateQuotationData } from './quotationValidation';

const quotationData = {
  customerData: {
    customerName: 'John Doe',
    phoneNumber: '1234567890',
    email: 'john@example.com',
    customerAddress: '123 Main St',
    customerCity: 'Mumbai'
  },
  cartItems: [
    { itemId: '123', itemName: 'Item 1', rate: 100, quantity: 2 }
  ],
  stagingItems: []
};

const result = validateQuotationData(quotationData);
// { isValid: true, errors: {}, message: null }
```

---

### `validateGST(gst)`

Validates GST percentage value.

**Parameters:**
- `gst` (number): GST percentage value

**Returns:**
- `Object`:
  - `isValid` (boolean): True if valid GST value
  - `error` (string|null): Error message if validation fails

**Example:**
```javascript
import { validateGST } from './quotationValidation';

validateGST(18);    // { isValid: true, error: null }
validateGST(-5);    // { isValid: false, error: 'GST must be between 0 and 100' }
validateGST(150);   // { isValid: false, error: 'GST must be between 0 and 100' }
```

---

### `validateLineItem(item)`

Validates a single line item.

**Parameters:**
- `item` (Object): Line item to validate
  - `itemName` (string): Item name
  - `quantity` (number): Item quantity
  - `rate` (number): Item rate

**Returns:**
- `Object`:
  - `isValid` (boolean): True if item is valid
  - `errors` (Object): Field-specific error messages

**Example:**
```javascript
import { validateLineItem } from './quotationValidation';

const item = {
  itemName: 'Test Item',
  quantity: 2,
  rate: 100
};

const result = validateLineItem(item);
// { isValid: true, errors: {} }
```

## Usage in QuotationForm Component

Here's how to integrate these validation utilities in the QuotationForm component:

```javascript
import {
  validateQuotationData,
  validateCustomerDetails
} from '../utils/quotationValidation';

// In your handleSubmit function:
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate quotation data
  const validation = validateQuotationData({
    customerData: quotationData,
    cartItems,
    stagingItems
  });
  
  if (!validation.isValid) {
    // Display field-specific errors
    if (Object.keys(validation.errors).length > 0) {
      setTouched(validation.errors);
    }
    
    // Display general error message
    if (validation.message) {
      alert(validation.message);
    }
    
    return;
  }
  
  // Proceed with submission
  // ...
};
```

## Validation Requirements Mapping

| Function | Requirements Validated |
|----------|----------------------|
| `isValidEmail` | 4.3 - Email format validation |
| `validateCustomerDetails` | 4.1, 4.2, 4.3, 4.4, 4.5 - Required customer fields |
| `validateLineItems` | 4.6 - At least one line item required |
| `validateStagingArea` | 4.7 - Staging area must be empty |
| `validateQuotationData` | 4.1-4.7 - Complete quotation validation |

## Testing

All validation functions have comprehensive unit tests in `quotationValidation.test.js`. Run tests with:

```bash
npm test -- quotationValidation.test.js --watchAll=false
```

## Error Messages

The validation functions provide user-friendly error messages:

- **Customer name:** "Customer name is required"
- **Phone number:** "Phone number is required"
- **Email (empty):** "Email is required"
- **Email (invalid):** "Please enter a valid email address"
- **Address:** "Address is required"
- **City:** "City is required"
- **Line items:** "Please add at least one item to the quotation"
- **Staging area:** "Please add all staged items to the quotation summary before saving"
- **GST:** "GST must be between 0 and 100"

## Design Principles

1. **Consistent Return Values:** All validation functions return objects with `isValid` boolean and error information
2. **User-Friendly Messages:** Error messages are clear and actionable
3. **Field-Specific Errors:** Customer validation returns field-specific errors for precise UI feedback
4. **Null Safety:** Functions handle null/undefined inputs gracefully
5. **Type Safety:** Functions validate data types before processing

## Related Files

- **Implementation:** `quotationValidation.js`
- **Tests:** `quotationValidation.test.js`
- **Usage:** `QuotationForm.js` (component)
- **Backend Validation:** `server/utils/validation.js` (server-side validation)

## Notes

- GSTIN is optional and not validated
- Email validation uses a simple but effective regex pattern
- Whitespace is trimmed before validation
- Server-side validation exists as a secondary layer of protection
