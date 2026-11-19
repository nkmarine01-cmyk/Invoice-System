# Design Document: Professional PDF Invoice Download

## Overview

This document outlines the technical design for implementing a professional PDF invoice download feature in the M Marine Services invoice management system. The feature enables users to generate branded PDF invoices that match the company's established visual identity and format standards.

The solution utilizes the jsPDF library with jspdf-autotable plugin for client-side PDF generation, ensuring no server-side processing is required. The PDF generator creates documents that precisely match the reference invoice template, including company branding, comprehensive invoice details, itemized billing tables with calculations, and company contact information.

### Key Design Goals

1. **Brand Consistency**: Ensure all generated PDFs match M Marine Services' brand identity with precise formatting, colors, and layout
2. **Client-Side Processing**: Generate PDFs entirely in the browser without backend dependencies
3. **Data Accuracy**: Guarantee correct calculations, formatting, and data presentation
4. **Error Resilience**: Handle edge cases and missing data gracefully
5. **Reusability**: Provide a single PDF generator that works from multiple trigger points (InvoiceForm and InvoiceDashboard)

## Architecture

### Component Structure

```
client/src/
├── components/
│   ├── InvoiceForm.js          # Existing - contains generatePDF() method
│   ├── InvoiceDashboard.js     # Existing - contains handleDownloadPDF() method
│   └── PrintableInvoice.js     # Existing - preview component (reference only)
├── utils/
│   └── pdfGenerator.js         # NEW - Centralized PDF generation logic
│   └── numberToWords.js        # NEW - Number to words conversion utility
```

### Design Pattern: Utility Module

The PDF generation functionality will be extracted into a reusable utility module that can be invoked from any component. This approach:
- Eliminates code duplication between InvoiceForm and InvoiceDashboard
- Provides consistent PDF output regardless of trigger source
- Simplifies testing and maintenance
- Separates concerns (UI vs. document generation)

### Technology Stack

- **jsPDF 2.x**: Core PDF document creation library
- **jspdf-autotable 3.x**: Table generation plugin for structured data
- **React**: Frontend framework (existing)
- **JavaScript ES6+**: Modern language features

## Components and Interfaces

### PDF Generator Module (`utils/pdfGenerator.js`)

The main module responsible for creating PDF documents from invoice data.

#### Public Interface

```javascript
/**
 * Generates and downloads a professional PDF invoice
 * @param {Object} invoiceData - Invoice header information
 * @param {Array} lineItems - Array of invoice line items
 * @param {Object} calculations - Calculated totals and amounts
 * @param {number} gstPercentage - GST percentage to display
 * @throws {Error} When required data is missing or invalid
 * @returns {void}
 */
export function generateMarineInvoicePDF(invoiceData, lineItems, calculations, gstPercentage)
```

#### Input Data Structures

**InvoiceData Object:**
```javascript
{
  invoiceNumber: string,    // Format: -XXX/DD-MM-YYYY/YYNK
  invoiceDate: string,      // Format: DD-MM-YYYY
  customerName: string,     // Required, non-empty
  customerAddress: string,  // Optional
  customerCity: string      // Optional
}
```

**LineItem Object:**
```javascript
{
  _id: string,              // Unique identifier
  description: string,      // Item description
  quantity: number,         // Positive integer
  deno: string,            // Denomination (e.g., "pieces")
  rate: number             // Unit price (positive decimal)
}
```

**Calculations Object:**
```javascript
{
  subtotal: string,         // Formatted with 2 decimals
  totalGST: string,        // Formatted with 2 decimals
  grandTotal: string,      // Formatted with 2 decimals
  roundOff: string,        // Round-off adjustment
  finalTotal: string       // Final rounded total
}
```

#### Internal Functions

```javascript
// Validates invoice data before PDF generation
function validateInvoiceData(invoiceData, lineItems)

// Adds company header with logo and branding
function addCompanyHeader(doc, pageWidth)

// Adds invoice metadata (number, date)
function addInvoiceMetadata(doc, invoiceData, pageWidth)

// Adds customer information section
function addCustomerSection(doc, invoiceData)

// Creates and populates the line items table
function addLineItemsTable(doc, lineItems, calculations, gstPercentage)

// Adds amount in words section
function addAmountInWords(doc, finalTotal, yPosition)

// Adds bank account information
function addBankDetails(doc, yPosition)

// Adds company stamp and signature area
function addSignatureSection(doc, yPosition)

// Adds footer with contact information
function addContactFooter(doc)

// Adds decorative elements (blue stripe, accents)
function addDecorativeElements(doc, pageHeight)
```

### Number to Words Utility (`utils/numberToWords.js`)

Converts numeric amounts to Indian English word format.

#### Public Interface

```javascript
/**
 * Converts a number to Indian English words format
 * @param {number} num - The number to convert
 * @returns {string} The number in words (e.g., "One Thousand Two Hundred Thirty Four Only")
 */
export function numberToWords(num)
```

#### Implementation Details

- Handles Indian numbering system: Crores, Lakhs, Thousands, Hundreds
- Returns "Zero Only" for 0
- Appends "Only" to all conversions
- Supports numbers up to 999,99,99,999 (99 crores)

### Component Integration Points

#### InvoiceForm Component

**Current State:**
- Contains embedded `generatePDF()` method with full PDF generation logic
- Has access to invoice data, cart items, calculations via React state

**Modification Required:**
```javascript
import { generateMarineInvoicePDF } from '../utils/pdfGenerator';

const generatePDF = () => {
  if (!invoiceData.customerName || cartItems.length === 0) {
    alert('Please fill in customer details and add items before generating PDF');
    return;
  }

  try {
    generateMarineInvoicePDF(invoiceData, cartItems, calculations, gst);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
```

#### InvoiceDashboard Component

**Current State:**
- Contains `handleDownloadPDF()` method with different PDF styling (HealthyChef branding)
- Receives complete invoice objects from backend

**Modification Required:**
```javascript
import { generateMarineInvoicePDF } from '../utils/pdfGenerator';

const handleDownloadPDF = (invoice) => {
  // Transform backend invoice structure to match expected format
  const invoiceData = {
    invoiceNumber: invoice.invoiceNumber,
    invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('en-GB').replace(/\//g, '-'),
    customerName: invoice.customer.name,
    customerAddress: invoice.customer.billingAddress.split(',')[0],
    customerCity: invoice.customer.billingAddress.split(',').slice(1).join(',').trim()
  };

  const lineItems = invoice.items.map(item => ({
    _id: item.itemId,
    description: item.itemName,
    quantity: item.quantity,
    deno: item.denomination,
    rate: item.price
  }));

  const calculations = {
    subtotal: invoice.calculations.subtotal.toFixed(2),
    totalGST: invoice.calculations.totalGST.toFixed(2),
    grandTotal: invoice.calculations.grandTotal.toFixed(2),
    roundOff: '0.00', // Calculate if needed
    finalTotal: Math.round(invoice.calculations.grandTotal).toFixed(2)
  };

  try {
    generateMarineInvoicePDF(invoiceData, lineItems, calculations, invoice.gst);
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Please try again.');
  }
};
```

## Data Models

### PDF Layout Constants

```javascript
const PDF_CONSTANTS = {
  PAGE: {
    WIDTH: 210,          // A4 width in mm
    HEIGHT: 297,         // A4 height in mm
    MARGIN_LEFT: 15,
    MARGIN_RIGHT: 15,
    MARGIN_TOP: 10,
    MARGIN_BOTTOM: 10
  },
  
  LOGO: {
    WIDTH: 40,
    HEIGHT: 30,
    X: 15,
    Y: 10
  },
  
  COLORS: {
    PRIMARY_BLUE: [70, 130, 180],
    ACCENT_BLUE: [0, 0, 255],
    TEXT_BLACK: [0, 0, 0],
    TEXT_GRAY: [80, 80, 80],
    LINE_GRAY: [150, 150, 150]
  },
  
  FONTS: {
    FAMILY: 'helvetica',
    SIZE_BODY: 9,
    SIZE_TITLE: 16,
    SIZE_HEADER: 10,
    SIZE_FOOTER: 8
  },
  
  TABLE: {
    MIN_ROWS: 6,
    COLUMN_WIDTHS: {
      SR_NO: 15,
      DESCRIPTION: 85,
      QTY: 15,
      DENO: 20,
      RATE: 28,
      AMOUNT: 32
    }
  }
};
```

### Company Details Constants

```javascript
const COMPANY_DETAILS = {
  name: 'M MARINE SERVICES',
  tagline: 'All Types Of Marine Engineering Solution, Engineering Turnkey Projects, Service In Mechanical, Electrical, Safety Items, Service In Mechanical & IT Solution',
  gstin: '29AAYFN4510A1Z8',
  accountNo: '0815073000000174',
  ifsc: 'SIBL0000815',
  bankName: 'SOUTH INDIAN BANK KARWAR',
  phone: '+91 8149332389 / 8762850701',
  email: 'naikvishal063@gmail.com',
  address: 'Off. 395 Gaonkarwada Near Ice Factory, Uttara Kannada Karnataka 581324',
  logoPath: '/logo.jpeg'
};
```

## Error Handling

### Validation Strategy

The PDF generator implements multi-layer validation:

1. **Pre-generation Validation**: Check for required fields before starting PDF creation
2. **Runtime Error Handling**: Wrap PDF operations in try-catch blocks
3. **Graceful Degradation**: Continue generation when non-critical elements fail (e.g., logo loading)
4. **User Feedback**: Provide clear, actionable error messages

### Error Scenarios and Responses

| Error Condition | Detection Point | Response |
|----------------|-----------------|----------|
| Missing customer name | Pre-validation | Alert: "Please fill in customer details and add items before generating PDF" |
| Empty line items array | Pre-validation | Alert: "Please fill in customer details and add items before generating PDF" |
| Logo file not found | Runtime (addCompanyHeader) | Log warning, continue without logo |
| Invalid calculation values (NaN) | Runtime (addLineItemsTable) | Replace with "0.00", log warning |
| PDF generation exception | Top-level catch | Alert: "Failed to generate PDF. Please try again." |
| Invalid number for words conversion | Runtime (numberToWords) | Return "Zero Only" |

### Error Handling Implementation

```javascript
export function generateMarineInvoicePDF(invoiceData, lineItems, calculations, gstPercentage) {
  // Pre-validation
  try {
    validateInvoiceData(invoiceData, lineItems);
  } catch (validationError) {
    alert(validationError.message);
    return;
  }

  try {
    const doc = new jsPDF();
    
    // PDF generation steps with individual error handling
    try {
      addCompanyHeader(doc, PDF_CONSTANTS.PAGE.WIDTH);
    } catch (error) {
      console.warn('Failed to add company header:', error);
      // Continue without logo
    }

    // ... more sections

    // Save PDF
    const filename = `M_Marine_Invoice_${invoiceData.invoiceNumber.replace(/\//g, '_')}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF. Please try again.');
  }
}

function validateInvoiceData(invoiceData, lineItems) {
  if (!invoiceData.customerName || invoiceData.customerName.trim() === '') {
    throw new Error('Please fill in customer details and add items before generating PDF');
  }
  
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new Error('Please fill in customer details and add items before generating PDF');
  }
  
  // Validate calculations
  const requiredCalcs = ['subtotal', 'totalGST', 'grandTotal', 'finalTotal'];
  requiredCalcs.forEach(key => {
    if (calculations[key] === undefined || calculations[key] === null) {
      throw new Error(`Invalid calculation: ${key} is missing`);
    }
  });
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### When Property-Based Testing Applies

This feature involves PDF generation, which is primarily a rendering and layout concern. Most acceptance criteria relate to visual presentation, which is not suitable for property-based testing. However, the feature includes several pure utility functions that ARE appropriate for PBT:

- **Number to Words Conversion**: Pure function with clear input/output behavior
- **Number Formatting**: Deterministic formatting operations
- **Calculation Logic**: Mathematical operations that should hold universally

For the PDF rendering aspects (layout, colors, fonts, positioning), we will use snapshot tests, visual verification, and example-based integration tests.

### Property 1: Number Formatting Preserves Value

*For any* positive decimal rate value, formatting to Indian number format with 2 decimal places SHALL preserve the numerical value within floating-point precision limits (±0.01).

**Validates: Requirements 6.3**

**Rationale**: When rates are formatted for display in the PDF, the formatted string when parsed back to a number should equal the original value. This ensures no data loss or corruption during formatting.

### Property 2: Amount Calculation Accuracy

*For any* positive integer quantity (1-9999) and positive decimal rate (0.01-999999.99), the calculated amount SHALL equal quantity multiplied by rate within floating-point precision (±0.01).

**Validates: Requirements 6.4**

**Rationale**: The line item amount calculation must be mathematically correct for all valid inputs. This property ensures no calculation errors, overflows, or precision loss.

### Property 3: Number to Words Structure

*For any* non-negative integer from 0 to 99,99,99,999 (999 million, within Indian crore range), the number-to-words conversion SHALL produce a non-empty string that ends with " Only".

**Validates: Requirements 8.1, 8.4**

**Rationale**: Every amount converted to words must follow the standard format ending with "Only" as per Indian invoice conventions. This property ensures consistent output structure.

### Property 4: Number to Words Unit Inclusion

*For any* non-negative integer, the number-to-words conversion SHALL include the appropriate Indian English units based on the number's magnitude:
- Numbers 1-9: Single units only
- Numbers 10-19: Teen units only  
- Numbers 20-99: Tens and units
- Numbers 100-999: Hundreds, tens, and units
- Numbers 1,000-99,999: Thousands, hundreds, tens, and units
- Numbers 1,00,000-99,99,999: Lakhs, thousands, hundreds, tens, and units
- Numbers 1,00,00,000-99,99,99,999: Crores, lakhs, thousands, hundreds, tens, and units

**Validates: Requirements 8.1, 8.3**

**Rationale**: The Indian numbering system has specific unit names (Crore, Lakh) that must appear when numbers reach certain magnitudes. This property ensures correct unit usage across the entire supported range.

### Property 5: Zero Edge Case

*For any* calculation result equal to zero, the number-to-words conversion SHALL produce exactly "Zero Only".

**Validates: Requirements 8.5**

**Rationale**: Zero is a special case that must be handled explicitly with a simple, clear representation.

## Testing Strategy

This feature requires a comprehensive testing approach combining property-based tests for pure functions, unit tests for utilities, and integration tests for the complete PDF generation workflow.

### Testing Framework and Tools

- **Jest**: Unit testing framework for JavaScript
- **React Testing Library**: Component testing
- **pdf-parse** or **pdf-lib**: PDF content extraction for verification
- **fast-check**: Property-based testing library for JavaScript/TypeScript (required for property tests)

### Property-Based Tests

Property-based tests verify that universal properties hold across many generated inputs. We will use fast-check for these tests.

**Installation:**
```bash
npm install --save-dev fast-check
```

**Test File**: `utils/numberToWords.property.test.js`

```javascript
const fc = require('fast-check');
const { numberToWords } = require('./numberToWords');

describe('numberToWords - Property-Based Tests', () => {
  
  test('Property 1: All conversions end with " Only"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999999 }),
        (num) => {
          const result = numberToWords(num);
          return result.endsWith(' Only');
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 3: For any non-negative integer from 0 to 99,99,99,999, the number-to-words conversion SHALL produce a non-empty string that ends with " Only"

  test('Property 2: Conversions are non-empty strings', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 999999999 }),
        (num) => {
          const result = numberToWords(num);
          return typeof result === 'string' && result.length > 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 3: For any non-negative integer from 0 to 99,99,99,999, the number-to-words conversion SHALL produce a non-empty string that ends with " Only"

  test('Property 3: Zero converts to exactly "Zero Only"', () => {
    expect(numberToWords(0)).toBe('Zero Only');
  });
  // Feature: professional-pdf-invoice-download, Property 5: For any calculation result equal to zero, the number-to-words conversion SHALL produce exactly "Zero Only"

  test('Property 4: Numbers 1-9 contain single unit words', () => {
    const units = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9 }),
        (num) => {
          const result = numberToWords(num);
          return units.some(unit => result.includes(unit));
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 4: Number to words conversion includes appropriate Indian English units

  test('Property 5: Numbers with hundreds include "Hundred"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100, max: 999 }),
        (num) => {
          const result = numberToWords(num);
          return result.includes('Hundred');
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 4: Number to words conversion includes appropriate Indian English units

  test('Property 6: Numbers with thousands include "Thousand"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1000, max: 99999 }),
        (num) => {
          const result = numberToWords(num);
          return result.includes('Thousand');
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 4: Number to words conversion includes appropriate Indian English units

  test('Property 7: Numbers with lakhs include "Lakh"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 100000, max: 9999999 }),
        (num) => {
          const result = numberToWords(num);
          return result.includes('Lakh');
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 4: Number to words conversion includes appropriate Indian English units

  test('Property 8: Numbers with crores include "Crore"', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 10000000, max: 999999999 }),
        (num) => {
          const result = numberToWords(num);
          return result.includes('Crore');
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 4: Number to words conversion includes appropriate Indian English units
});
```

**Test File**: `utils/formatting.property.test.js`

```javascript
const fc = require('fast-check');

// Assuming these functions will be exported from pdfGenerator.js or a separate utils file
const { formatIndianNumber, calculateAmount } = require('./pdfGenerator');

describe('Number Formatting - Property-Based Tests', () => {
  
  test('Property 1: Formatted number preserves value', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.01, max: 999999.99, noNaN: true }),
        (rate) => {
          const formatted = formatIndianNumber(rate);
          const parsed = parseFloat(formatted.replace(/,/g, ''));
          return Math.abs(parsed - rate) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 1: For any positive decimal rate value, formatting to Indian number format with 2 decimal places SHALL preserve the numerical value

  test('Property 2: Formatted numbers always have 2 decimal places', () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0.01, max: 999999.99, noNaN: true }),
        (rate) => {
          const formatted = formatIndianNumber(rate);
          const parts = formatted.split('.');
          return parts.length === 2 && parts[1].length === 2;
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 1: For any positive decimal rate value, formatting to Indian number format with 2 decimal places SHALL preserve the numerical value
});

describe('Amount Calculation - Property-Based Tests', () => {
  
  test('Property 3: Amount equals quantity times rate', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        fc.float({ min: 0.01, max: 999999.99, noNaN: true }),
        (quantity, rate) => {
          const calculated = calculateAmount(quantity, rate);
          const expected = quantity * rate;
          return Math.abs(calculated - expected) < 0.01;
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 2: For any positive integer quantity and positive decimal rate, the calculated amount SHALL equal quantity multiplied by rate

  test('Property 4: Amount is always non-negative', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 9999 }),
        fc.float({ min: 0.01, max: 999999.99, noNaN: true }),
        (quantity, rate) => {
          const calculated = calculateAmount(quantity, rate);
          return calculated >= 0;
        }
      ),
      { numRuns: 100 }
    );
  });
  // Feature: professional-pdf-invoice-download, Property 2: For any positive integer quantity and positive decimal rate, the calculated amount SHALL equal quantity multiplied by rate
});
```

**Property Test Configuration:**
- All property tests MUST run minimum 100 iterations per property
- Each property test MUST include a comment tag referencing the design document property
- Tag format: `// Feature: professional-pdf-invoice-download, Property {number}: {property_text}`

### Unit Tests

#### Number to Words Utility Tests

**Test File**: `utils/numberToWords.test.js`

```javascript
describe('numberToWords', () => {
  test('converts zero correctly', () => {
    expect(numberToWords(0)).toBe('Zero Only');
  });

  test('converts single digits', () => {
    expect(numberToWords(1)).toBe('One Only');
    expect(numberToWords(9)).toBe('Nine Only');
  });

  test('converts teens', () => {
    expect(numberToWords(10)).toBe('Ten Only');
    expect(numberToWords(15)).toBe('Fifteen Only');
    expect(numberToWords(19)).toBe('Nineteen Only');
  });

  test('converts tens', () => {
    expect(numberToWords(20)).toBe('Twenty Only');
    expect(numberToWords(50)).toBe('Fifty Only');
    expect(numberToWords(99)).toBe('Ninety Nine Only');
  });

  test('converts hundreds', () => {
    expect(numberToWords(100)).toBe('One Hundred Only');
    expect(numberToWords(234)).toBe('Two Hundred Thirty Four Only');
  });

  test('converts thousands', () => {
    expect(numberToWords(1000)).toBe('One Thousand Only');
    expect(numberToWords(5678)).toBe('Five Thousand Six Hundred Seventy Eight Only');
  });

  test('converts lakhs', () => {
    expect(numberToWords(100000)).toBe('One Lakh Only');
    expect(numberToWords(234567)).toBe('Two Lakh Thirty Four Thousand Five Hundred Sixty Seven Only');
  });

  test('converts crores', () => {
    expect(numberToWords(10000000)).toBe('One Crore Only');
    expect(numberToWords(12345678)).toBe('One Crore Twenty Three Lakh Forty Five Thousand Six Hundred Seventy Eight Only');
  });
});
```

#### PDF Generator Validation Tests

**Test File**: `utils/pdfGenerator.test.js`

```javascript
describe('validateInvoiceData', () => {
  test('throws error when customer name is missing', () => {
    const invalidData = { customerName: '', invoiceNumber: '123', invoiceDate: '01-01-2024' };
    const lineItems = [{ description: 'Item 1', quantity: 1, rate: 100 }];
    
    expect(() => validateInvoiceData(invalidData, lineItems))
      .toThrow('Please fill in customer details');
  });

  test('throws error when line items array is empty', () => {
    const validData = { customerName: 'Customer', invoiceNumber: '123', invoiceDate: '01-01-2024' };
    const emptyItems = [];
    
    expect(() => validateInvoiceData(validData, emptyItems))
      .toThrow('Please fill in customer details and add items');
  });

  test('passes validation with valid data', () => {
    const validData = { customerName: 'Customer', invoiceNumber: '123', invoiceDate: '01-01-2024' };
    const lineItems = [{ description: 'Item 1', quantity: 1, rate: 100 }];
    const calculations = { subtotal: '100.00', totalGST: '18.00', grandTotal: '118.00', finalTotal: '118.00' };
    
    expect(() => validateInvoiceData(validData, lineItems, calculations)).not.toThrow();
  });
});
```

### Integration Tests

Integration tests verify the complete PDF generation workflow, including:
- Data transformation from component state to PDF
- Correct rendering of all sections
- File download trigger
- Error handling flows

**Test File**: `components/InvoiceForm.integration.test.js`

```javascript
describe('PDF Generation Integration', () => {
  test('generates PDF when download button is clicked with valid data', async () => {
    const { getByText } = render(<InvoiceForm />);
    
    // Fill form with valid data
    // ...
    
    // Click download button
    const downloadBtn = getByText('Download PDF');
    fireEvent.click(downloadBtn);
    
    // Verify PDF was generated (mock jsPDF.save)
    expect(mockJsPDFSave).toHaveBeenCalledWith(expect.stringContaining('M_Marine_Invoice_'));
  });

  test('shows error alert when customer name is missing', () => {
    const { getByText } = render(<InvoiceForm />);
    
    const downloadBtn = getByText('Download PDF');
    fireEvent.click(downloadBtn);
    
    expect(mockAlert).toHaveBeenCalledWith(expect.stringContaining('Please fill in customer details'));
  });
});
```

### Manual Testing Checklist

Due to the visual nature of PDF generation, manual verification is essential:

- [ ] PDF matches reference invoice layout exactly
- [ ] Company logo renders correctly (position, size)
- [ ] All text is readable and properly aligned
- [ ] Table rows and columns align correctly
- [ ] Calculations are accurate and formatted correctly
- [ ] Amount in words is correct for various totals
- [ ] Blue decorative elements render in correct positions
- [ ] Contact footer is complete and links work
- [ ] PDF filename follows correct format
- [ ] Download triggers successfully in different browsers
- [ ] PDFs can be opened in Adobe Reader, Chrome, Edge
- [ ] Print preview shows correct layout

### Test Data Sets

**Minimum Valid Invoice:**
```javascript
{
  invoiceData: {
    invoiceNumber: '-001/01-01-2024/24NK',
    invoiceDate: '01-01-2024',
    customerName: 'Test Customer',
    customerAddress: 'Test Address',
    customerCity: 'Test City'
  },
  lineItems: [
    { _id: '1', description: 'Test Item', quantity: 1, deno: 'pieces', rate: 100 }
  ],
  calculations: {
    subtotal: '100.00',
    totalGST: '18.00',
    grandTotal: '118.00',
    roundOff: '0.00',
    finalTotal: '118.00'
  },
  gstPercentage: 18
}
```

**Complex Invoice (6+ items, large amounts):**
```javascript
{
  // Similar structure with 6+ line items
  // Calculations in lakhs range to test number to words
}
```

**Edge Cases:**
- Single item with 0.01 rate
- Very long customer name (50+ characters)
- Very long item description (100+ characters)
- Amount requiring round-off adjustment
- Large quantity values (999)
- Zero GST percentage
- Missing optional fields (address, city)

## Implementation Plan

### Phase 1: Utility Module Creation
1. Create `utils/numberToWords.js` with comprehensive unit tests
2. Create `utils/pdfGenerator.js` with validation logic
3. Define all constants (PDF_CONSTANTS, COMPANY_DETAILS)

### Phase 2: PDF Generation Functions
4. Implement `addCompanyHeader()` with logo handling
5. Implement `addInvoiceMetadata()` for number and date
6. Implement `addCustomerSection()` for customer details
7. Implement `addLineItemsTable()` with autoTable
8. Implement `addAmountInWords()` with numberToWords integration
9. Implement `addBankDetails()` and `addSignatureSection()`
10. Implement `addContactFooter()` with clickable links
11. Implement `addDecorativeElements()` for blue accents

### Phase 3: Component Integration
12. Update InvoiceForm component to use new utility
13. Update InvoiceDashboard component to use new utility
14. Remove old PDF generation code from components

### Phase 4: Testing and Validation
15. Run unit tests for all utility functions
16. Perform integration testing
17. Manual visual verification against reference invoice
18. Cross-browser testing (Chrome, Firefox, Edge, Safari)
19. Test error scenarios and edge cases

### Phase 5: Refinement
20. Fine-tune positioning and spacing based on visual comparison
21. Optimize performance if needed
22. Add inline documentation and comments
23. Update component documentation

## Dependencies

### Existing Dependencies (No Changes Required)
- `jspdf: ^2.x` - Already installed
- `jspdf-autotable: ^3.x` - Already installed
- `react: ^18.2.0` - Already installed

### No New Dependencies Required
The implementation uses only existing dependencies from the project's `package.json`.

## Deployment Considerations

### Build Process
- No changes to build configuration required
- Utilities will be bundled with existing application code
- No server-side changes needed

### Browser Compatibility
- Modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- jsPDF supports all major browsers with ES6 support
- PDF download requires browser support for Blob and URL.createObjectURL (universal in modern browsers)

### Performance
- PDF generation is synchronous and completes in <500ms for typical invoices
- No performance impact on application load time (lazy loaded with components)
- Memory usage is minimal (<5MB for typical invoice)

### Future Enhancements
1. **Email Integration**: Add ability to email PDF directly from browser
2. **Batch Download**: Generate multiple PDFs in sequence
3. **Template Selection**: Support multiple invoice templates
4. **Custom Branding**: Allow configuration of colors, fonts, logo
5. **Multi-page Support**: Handle invoices with 20+ line items across multiple pages
