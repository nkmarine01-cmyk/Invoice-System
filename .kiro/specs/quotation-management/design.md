# Design Document: Quotation Management System

## Overview

The Quotation Management System is a comprehensive module that enables M Marine Services to create, manage, and generate professional quotations for potential customers during the pre-sale phase. This system mirrors the existing invoice functionality but operates independently, allowing the business to track quotes and completed sales separately.

The system follows a client-server architecture with a React frontend and Node.js/Express backend, utilizing MongoDB for data persistence. The design emphasizes real-time calculation, input validation, and professional PDF generation with Marine-themed branding.

**Key Design Goals:**
- Independent operation from invoice system (separate collection, routes, components)
- Real-time calculation engine for accurate pricing
- Professional PDF generation with company branding
- Robust validation to ensure data integrity
- Intuitive staging area for item selection
- RESTful API for seamless frontend-backend communication

## Architecture

### System Architecture

The Quotation Management System follows a three-tier architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ QuotationForm    │  │QuotationDashboard│                │
│  │  Component       │  │   Component      │                │
│  └──────────────────┘  └──────────────────┘                │
│          │                      │                            │
│          └──────────┬───────────┘                            │
│                     │                                        │
│              ┌──────▼───────┐                               │
│              │ PDF Generator │                               │
│              └──────────────┘                                │
└─────────────────────────────────────────────────────────────┘
                      │ HTTP/REST API
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Business Logic Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Quotation Controller                            │ │
│  │  • createQuotation()  • updateQuotation()              │ │
│  │  • getQuotations()    • deleteQuotation()              │ │
│  │  • getQuotation()                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│                      │                                       │
│  ┌───────────────────▼────────────────────────────────────┐ │
│  │         Validation & Calculation Services              │ │
│  │  • Input validation  • GST calculation                 │ │
│  │  • Number-to-words  • Subtotal/Total computation       │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│                    Data Persistence Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               MongoDB Database                          │ │
│  │  ┌──────────────┐  ┌──────────────┐                   │ │
│  │  │  Quotation   │  │    Item      │                   │ │
│  │  │  Collection  │  │  Collection  │                   │ │
│  │  └──────────────┘  └──────────────┘                   │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

#### Quotation Creation Flow:
1. User fills out QuotationForm with customer details
2. User selects items from Item Master → items added to Staging Area
3. User modifies quantity, denomination, rate in Staging Area
4. User clicks "Add Items to Summary" → items moved to quotation summary
5. Calculation engine updates subtotal, GST, total in real-time
6. User submits form → validation occurs
7. Valid data sent to backend API
8. Controller validates and saves to MongoDB
9. Success response triggers form reset

#### Quotation Retrieval Flow:
1. QuotationDashboard component loads
2. Frontend requests GET /api/quotations
3. Controller queries MongoDB for all quotations (sorted by date desc)
4. Quotations returned with customer, items, and calculation data
5. Dashboard displays quotations in tabular format

#### PDF Generation Flow:
1. User clicks "Download PDF" from form or dashboard
2. PDF Generator validates quotation data (customer name, items exist)
3. Generator constructs PDF with:
   - Company header (logo, tagline, GSTIN)
   - Customer details
   - Line items table
   - Calculations (subtotal, GST, total, round-off, final total)
   - Amount in words
   - Bank details and contact information
4. PDF saved with filename format: `M-Marine-Quotation-{QuotationNumber}.pdf`

## Components and Interfaces

### Frontend Components

#### 1. QuotationForm Component
**Purpose:** Create new quotations with customer details and line items

**State Management:**
```javascript
{
  quotationData: {
    quotationNumber: string,      // Auto-generated
    quotationDate: string,         // Auto-generated (DD-MM-YYYY)
    customerName: string,
    customerAddress: string,
    customerCity: string,
    phoneNumber: string,
    email: string,
    gstin: string                  // Optional
  },
  availableItems: Array<Item>,     // From Item Master
  selectedItemId: string,          // Current dropdown selection
  stagingItems: Array<LineItem>,   // Items selected but not added
  cartItems: Array<LineItem>,      // Items in quotation summary
  gst: number,                     // GST percentage (default 18)
  calculations: {
    subtotal: number,
    totalGST: number,
    grandTotal: number,
    roundOff: number,
    finalTotal: number
  },
  touched: Object,                 // Field validation tracking
  loading: boolean
}
```

**Key Methods:**
- `handleInputChange(e)`: Update quotation data fields
- `handleSelectItem(itemId)`: Add item to staging area
- `updateStagingItem(itemId, field, value)`: Modify staging item
- `removeStagingItem(itemId)`: Remove from staging
- `handleAddAllToCart()`: Move staging items to quotation summary
- `updateCartItem(itemId, field, value)`: Modify cart item
- `removeItem(itemId)`: Remove from cart
- `handleSubmit(e)`: Validate and save quotation
- `handleReset()`: Reset form to initial state
- `generatePDF()`: Trigger PDF generation

**Validation Rules:**
- Customer name, phone, email, address, city required
- At least one item in quotation summary
- Email format validation
- No items in staging area when saving
- No duplicate quotation numbers

#### 2. QuotationDashboard Component
**Purpose:** View, manage, and download all quotations

**State Management:**
```javascript
{
  quotations: Array<Quotation>,
  loading: boolean,
  error: string
}
```

**Key Methods:**
- `fetchQuotations()`: Load all quotations from API
- `handleDelete(id, quotationNumber)`: Delete quotation with confirmation
- `handleDownloadPDF(quotation)`: Generate and download PDF
- `formatDate(dateString)`: Format date for display

**Display Fields:**
- Quotation Number
- Customer Name
- Quotation Date (MMM DD, YYYY format)
- Number of Line Items
- Grand Total
- Action buttons (View, Download PDF, Delete)

**Statistics:**
- Total number of quotations
- Total revenue (sum of all grand totals)

#### 3. PDF Generator Utility
**Purpose:** Generate professional PDF quotations with Marine branding

**Function Signature:**
```javascript
generateMarineQuotationPDF(
  quotationData: Object,
  lineItems: Array<LineItem>,
  calculations: Object,
  gst: number
): Promise<void>
```

**PDF Structure:**
1. **Header Section:**
   - M Marine Services logo
   - Company tagline
   - GSTIN
   - "QUOTATION" title

2. **Quotation Details:**
   - Quotation Number
   - Date

3. **Customer Details ("TO:-" section):**
   - Name/Organization
   - Address
   - City
   - Phone
   - Email
   - GSTIN (if provided)

4. **Line Items Table:**
   - Columns: SR. NO., DESCRIPTION, QTY, DENO, RATE, AMOUNT
   - Minimum 3 rows for professional appearance

5. **Calculations Section:**
   - SUB TOTAL
   - GST {percentage}%
   - TOTAL
   - Round off
   - FINAL TOTAL (highlighted)

6. **Amount in Words:**
   - "Rupees {words} Only."

7. **Company Details:**
   - Bank account details
   - IFSC code
   - Bank name
   - Contact information (phone, email, address)

8. **Visual Branding:**
   - Blue vertical stripe on right edge
   - Blue diagonal accent in bottom right corner
   - Marine-themed color scheme

### Backend Components

#### 1. Quotation Model (MongoDB Schema)
**File:** `server/models/Quotation.js`

**Schema Definition:**
```javascript
{
  quotationNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  quotationDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  customer: {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    billingAddress: { type: String, required: true },
    gstin: { type: String, trim: true, default: '' }
  },
  items: [{
    itemId: { type: ObjectId, ref: 'Item', required: true },
    itemName: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    denomination: { type: String, default: 'pieces' },
    gst: { type: Number, default: 0, min: 0, max: 100 },
    discount: { type: Number, default: 0, min: 0 },
    discountType: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' }
  }],
  calculations: {
    subtotal: { type: Number, required: true, min: 0, default: 0 },
    totalGST: { type: Number, required: true, min: 0, default: 0 },
    totalDiscount: { type: Number, required: true, min: 0, default: 0 },
    grandTotal: { type: Number, required: true, min: 0, default: 0 }
  },
  gst: { type: Number, default: 18, min: 0, max: 100 },
  discount: { type: Number, default: 0, min: 0 },
  discountType: { type: String, enum: ['percentage', 'fixed'], default: 'fixed' },
  createdAt: { type: Date, default: Date.now }
}
```

**Indexes:**
- `quotationNumber`: unique index for fast lookups and duplicate prevention
- `createdAt`: index for efficient sorting by date

#### 2. Quotation Controller
**File:** `server/controllers/quotationController.js`

**API Endpoints:**

##### GET /api/quotations
- **Purpose:** Retrieve all quotations
- **Response:** Array of quotations sorted by createdAt descending
- **Status Codes:** 200 (success), 500 (server error)

##### GET /api/quotations/:id
- **Purpose:** Retrieve single quotation by ID
- **Response:** Quotation object with populated items
- **Status Codes:** 200 (success), 404 (not found), 500 (server error)

##### POST /api/quotations
- **Purpose:** Create new quotation
- **Request Body:**
```javascript
{
  quotationNumber: string,
  quotationDate: ISO date string,
  customer: {
    name: string,
    phoneNumber: string,
    email: string,
    billingAddress: string,
    gstin: string (optional)
  },
  items: Array<LineItem>,
  calculations: {
    subtotal: number,
    totalGST: number,
    totalDiscount: number,
    grandTotal: number
  },
  gst: number,
  discount: number,
  discountType: string
}
```
- **Validation:**
  - Quotation number required and unique
  - Customer name, phone, email, address required
  - Email format validation
  - At least one item required
  - Calculations object required
- **Status Codes:** 201 (created), 400 (validation error), 500 (server error)

##### PUT /api/quotations/:id
- **Purpose:** Update existing quotation
- **Request Body:** Same as POST
- **Status Codes:** 200 (success), 404 (not found), 400 (validation error), 500 (server error)

##### DELETE /api/quotations/:id
- **Purpose:** Delete quotation
- **Status Codes:** 200 (success), 404 (not found), 500 (server error)

**Controller Methods:**
```javascript
exports.getQuotations = async (req, res) => {
  // Fetch all quotations sorted by createdAt: -1
  // Return { success: true, count: number, data: quotations }
}

exports.getQuotation = async (req, res) => {
  // Fetch quotation by ID with populated items
  // Return { success: true, data: quotation }
}

exports.createQuotation = async (req, res) => {
  // Validate input
  // Check for duplicate quotation number
  // Create quotation in database
  // Return { success: true, data: quotation }
}

exports.updateQuotation = async (req, res) => {
  // Find and update quotation with validation
  // Return { success: true, data: updatedQuotation }
}

exports.deleteQuotation = async (req, res) => {
  // Find and delete quotation
  // Return { success: true, data: {} }
}
```

#### 3. Routes Configuration
**File:** `server/routes/api.js`

**Route Definitions:**
```javascript
const router = express.Router();
const quotationController = require('../controllers/quotationController');

router.route('/quotations')
  .get(quotationController.getQuotations)
  .post(quotationController.createQuotation);

router.route('/quotations/:id')
  .get(quotationController.getQuotation)
  .put(quotationController.updateQuotation)
  .delete(quotationController.deleteQuotation);
```

### Shared Utilities

#### Number-to-Words Converter
**Purpose:** Convert numeric amounts to Indian English word format

**Function Signature:**
```javascript
numberToWords(num: number): string
```

**Implementation Details:**
- Supports Indian numbering system (ones, tens, hundreds, thousands, lakhs, crores)
- Returns format: "One Lakh Twenty Three Thousand Four Hundred Fifty Six Only"
- Handles zero: "Zero Only"
- Maximum supported: crores

**Algorithm:**
1. Handle zero case
2. Extract crores, lakhs, thousands, hundreds
3. Convert each segment to words using helper functions
4. Concatenate segments with appropriate scale words
5. Append "Only" suffix

#### Calculation Engine
**Purpose:** Real-time calculation of quotation totals

**Function Logic:**
```javascript
calculateTotals(lineItems: Array, gstPercentage: number) {
  let subtotal = 0;
  
  // Sum all item amounts
  lineItems.forEach(item => {
    subtotal += item.rate * item.quantity;
  });
  
  // Calculate GST
  const gstAmount = (subtotal * gstPercentage) / 100;
  
  // Calculate grand total
  const grandTotal = subtotal + gstAmount;
  
  // Calculate rounded total and round-off
  const finalTotal = Math.round(grandTotal);
  const roundOff = finalTotal - grandTotal;
  
  return {
    subtotal: subtotal.toFixed(2),
    totalGST: gstAmount.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    roundOff: roundOff.toFixed(2),
    finalTotal: finalTotal.toFixed(2)
  };
}
```

## Data Models

### Quotation Entity
```typescript
interface Quotation {
  _id: ObjectId;
  quotationNumber: string;           // Format: -XXX/DD-MM-YYYY/YYNK
  quotationDate: Date;
  customer: Customer;
  items: LineItem[];
  calculations: Calculations;
  gst: number;                       // Percentage
  discount: number;
  discountType: 'percentage' | 'fixed';
  createdAt: Date;
}
```

### Customer Entity
```typescript
interface Customer {
  name: string;
  phoneNumber: string;
  email: string;
  billingAddress: string;
  gstin?: string;                    // Optional
}
```

### LineItem Entity
```typescript
interface LineItem {
  itemId: ObjectId;                  // Reference to Item collection
  itemName: string;
  price: number;
  quantity: number;
  denomination: string;              // e.g., 'pieces', 'kg', 'meters'
  gst: number;                       // Item-level GST (default 0)
  discount: number;
  discountType: 'percentage' | 'fixed';
}
```

### Calculations Entity
```typescript
interface Calculations {
  subtotal: number;
  totalGST: number;
  totalDiscount: number;
  grandTotal: number;
}
```

### Item Entity (from Item Master)
```typescript
interface Item {
  _id: ObjectId;
  name: string;
  price: number;
  description?: string;
  category?: string;
}
```

## Data Flow Diagrams

### Create Quotation Flow:
```
User Input → Form Validation → Calculation Engine → API Request
    ↓
Backend Validation → Duplicate Check → Save to MongoDB → Response
    ↓
Success → Form Reset + Confirmation
Failure → Error Display
```

### Load Dashboard Flow:
```
Component Mount → API GET Request → MongoDB Query (sorted)
    ↓
Response → State Update → Table Render → Statistics Calculation
```

### PDF Generation Flow:
```
User Action → Validation Check → PDF Construction
    ↓
Header → Customer Details → Line Items Table → Calculations
    ↓
Amount in Words → Bank Details → Branding Elements
    ↓
PDF Save → Download Trigger
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property Reflection

Before defining properties, I performed reflection to eliminate redundancy:

**Identified Redundancies:**
- Requirements 2.2, 2.3, 2.4 are format constraints within 2.1 (quotation number format)
- Requirement 2.5 (duplicate rejection) is the enforcement side of 1.2 (uniqueness generation)
- Requirements 5.2-5.5 are all parts of the persistence round-trip tested by 5.1
- Requirements 4.1-4.5 (individual field validations) can be combined into a single comprehensive validation property
- Calculation formulas (3.3, 3.4, 3.6) are part of the overall calculation correctness that can be tested together

**Combined Properties:**
- Single property for quotation number format compliance (covers 2.1-2.4)
- Single property for customer data validation (covers 4.1-4.5)
- Single property for calculation correctness (covers 3.1-3.7)
- Single property for persistence round-trip (covers 5.1-5.5)

### Property 1: Quotation Number Uniqueness

*For any* set of generated quotation numbers, no two quotation numbers SHALL be identical.

**Validates: Requirements 1.2, 2.5**

### Property 2: Quotation Number Format Compliance

*For any* generated quotation number, it SHALL match the format pattern `-XXX/DD-MM-YYYY/YYNK` where XXX is a 3-digit number, DD-MM-YYYY is a valid date, and YY is the last two digits of the year.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 3: Item Selection Adds to Staging Area

*For any* item from the Item Master, when selected, it SHALL appear in the Staging Area with default values (quantity=1, denomination="pieces", rate=item.price).

**Validates: Requirement 1.5**

### Property 4: Adding Items Clears Staging Area

*For any* set of items in the Staging Area, when added to the quotation summary, the Staging Area SHALL be empty.

**Validates: Requirement 1.8**

### Property 5: Line Item Amount Calculation

*For any* line item with quantity Q and rate R, the item amount SHALL equal Q × R.

**Validates: Requirement 3.1**

### Property 6: Subtotal Calculation

*For any* set of line items, the subtotal SHALL equal the sum of all line item amounts.

**Validates: Requirement 3.2**

### Property 7: Calculation Correctness (Comprehensive)

*For any* quotation with subtotal S, GST percentage G, the following SHALL hold:
- GST amount = (S × G) / 100
- Grand total = S + GST amount
- Final total = round(Grand total)
- Round-off = Final total - Grand total

**Validates: Requirements 3.3, 3.4, 3.5, 3.6**

### Property 8: Decimal Place Formatting

*For any* calculated value (subtotal, GST amount, grand total, round-off, final total), when displayed, it SHALL have exactly 2 decimal places.

**Validates: Requirement 3.7**

### Property 9: Customer Data Validation

*For any* quotation submission, IF customer name OR phone number OR email OR address OR city is empty, THEN the submission SHALL be rejected with a validation error.

**Validates: Requirements 4.1, 4.2, 4.4, 4.5**

### Property 10: Email Format Validation

*For any* quotation submission with a non-empty email, IF the email does not match the email format pattern `[text]@[text].[text]`, THEN the submission SHALL be rejected.

**Validates: Requirement 4.3**

### Property 11: Line Items Existence Validation

*For any* quotation submission with zero line items in the summary, the submission SHALL be rejected with a validation error.

**Validates: Requirement 4.6**

### Property 12: Staging Area Clearance Validation

*For any* quotation submission, IF the Staging Area contains one or more items, THEN the submission SHALL be prevented with an error message.

**Validates: Requirement 4.7**

### Property 13: Quotation Persistence Round-Trip

*For any* valid quotation Q, IF Q is saved to the database and then retrieved, THEN the retrieved quotation SHALL contain identical data including all customer details, line items with their properties (itemId, itemName, quantity, denomination, rate, GST, discount, discountType), calculations (subtotal, totalGST, totalDiscount, grandTotal), GST percentage, discount, and discountType.

**Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**

### Property 14: Form Reset to Initial State

*For any* quotation form state, when reset is triggered, the form SHALL return to initial state with a new quotation number, current date, empty customer fields, empty staging area, empty quotation summary, and GST = 18%.

**Validates: Requirements 5.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**

### Property 15: Quotation List Sorting

*For any* set of quotations with different creation dates, when retrieved from the dashboard, they SHALL be ordered by creation date in descending order (newest first).

**Validates: Requirement 6.1**

### Property 16: Total Revenue Calculation

*For any* set of quotations with grand totals T1, T2, ..., Tn, the total revenue displayed SHALL equal T1 + T2 + ... + Tn.

**Validates: Requirement 6.8**

### Property 17: PDF Generation Validation

*For any* PDF generation request, IF the customer name is empty OR there are zero line items, THEN the PDF generation SHALL be rejected with an error.

**Validates: Requirements 8.1, 8.2**

### Property 18: PDF Content Completeness

*For any* valid quotation, the generated PDF SHALL contain all of the following elements: company logo, company tagline, GSTIN, "QUOTATION" title, quotation number, date, customer details, line items table with columns (SR. NO., DESCRIPTION, QTY, DENO, RATE, AMOUNT), subtotal, GST amount with percentage, total, round-off, final total, amount in words, bank details, contact information, blue vertical stripe, and blue diagonal accent.

**Validates: Requirements 8.4, 8.5, 8.6, 8.7, 8.8, 8.9, 8.10, 8.11, 8.12, 8.13, 8.14, 8.15, 8.16, 8.17**

### Property 19: Number-to-Words Indian Format

*For any* non-negative integer N, the number-to-words conversion SHALL:
- Follow the Indian numbering system (ones, tens, hundreds, thousands, lakhs, crores)
- Return "Zero Only" when N = 0
- End with "Only" for all other values
- Use proper scale words (Crore, Lakh, Thousand, Hundred)

**Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**

## Error Handling

### Frontend Error Handling

**Form Validation Errors:**
- Display inline validation errors for empty required fields
- Highlight invalid fields with red borders
- Show descriptive error messages below invalid fields
- Prevent form submission until all validation passes

**API Communication Errors:**
- Display user-friendly error messages for network failures
- Show "Server Error" message for 500 status codes
- Parse and display validation error arrays from backend
- Provide retry functionality for failed requests

**PDF Generation Errors:**
- Catch and log PDF generation exceptions
- Display alert with specific error message
- Prevent partial PDF downloads on failure

**State Management Errors:**
- Handle async state update failures gracefully
- Provide loading indicators during operations
- Disable action buttons during processing to prevent duplicate submissions

### Backend Error Handling

**Validation Errors (400 status):**
- Return structured error response: `{ success: false, error: string | string[] }`
- Provide descriptive error messages for each validation failure
- Use Mongoose validation error messages when available

**Not Found Errors (404 status):**
- Return error for non-existent quotation IDs
- Include descriptive message: "Quotation not found"

**Duplicate Errors (400 status):**
- Check for duplicate quotation numbers before insertion
- Return error: "Quotation number already exists"

**Server Errors (500 status):**
- Log full error details to console
- Return sanitized error message to client
- Include error name and message for debugging

**Database Errors:**
- Handle MongoDB connection failures
- Catch and report schema validation errors
- Handle ObjectId casting errors for invalid IDs

### Error Logging

**Frontend:**
- Console logging for debugging (development only)
- User-visible error messages for all failures
- Error context (which operation failed)

**Backend:**
- Console logging with timestamps
- Full error stack traces for server errors
- Request context (endpoint, parameters)

## Testing Strategy

### Dual Testing Approach

The Quotation Management System will use a comprehensive testing strategy that combines property-based testing for universal correctness properties with example-based unit tests for specific scenarios and edge cases.

### Property-Based Testing

**Framework:** fast-check (JavaScript property-based testing library)

**Configuration:**
- Minimum 100 iterations per property test
- Each property test must reference its design document property using a comment tag
- Tag format: `// Feature: quotation-management, Property {number}: {property_text}`

**Property Test Implementation Guidelines:**

1. **Generators Required:**
   - `arbitraryQuotationNumber()`: Generate valid quotation numbers matching format
   - `arbitraryCustomerDetails()`: Generate customer data with all required fields
   - `arbitraryLineItem()`: Generate line items with quantity, rate, denomination
   - `arbitraryQuotation()`: Generate complete valid quotations
   - `arbitraryInvalidEmail()`: Generate strings that don't match email format
   - `arbitraryPositiveNumber()`: Generate numbers for calculations

2. **Key Properties to Implement:**
   - Quotation number uniqueness (Property 1)
   - Quotation number format compliance (Property 2)
   - Calculation correctness (Properties 5, 6, 7)
   - Validation rules (Properties 9, 10, 11, 12)
   - Persistence round-trip (Property 13)
   - Number-to-words conversion (Property 19)

3. **Testing Isolated Business Logic:**
   - Test calculation engine separately from React components
   - Test validation functions in isolation
   - Test number-to-words utility function
   - Mock database operations for backend controller tests

### Unit Testing

**Framework:** Jest (JavaScript testing framework)

**Unit Tests Focus:**
- Specific examples demonstrating correct behavior
- Edge cases (zero items, maximum values, special characters)
- Error conditions and rejection scenarios
- Component lifecycle events (mount, unmount)
- User interactions (button clicks, form submissions)

**Unit Test Categories:**

1. **Component Tests:**
   - QuotationForm: form rendering, field updates, staging area behavior
   - QuotationDashboard: table rendering, empty state, statistics display
   - Test user interactions with React Testing Library

2. **Utility Function Tests:**
   - Number-to-words: zero case, ones, tens, hundreds, thousands, lakhs, crores
   - Date formatting: DD-MM-YYYY format validation
   - Email validation: valid and invalid examples

3. **API Integration Tests:**
   - Test API endpoints with mock data
   - Test error responses (400, 404, 500)
   - Test request/response structure

4. **Database Tests:**
   - Schema validation (required fields, data types)
   - Index functionality (uniqueness constraints)
   - Reference population (itemId references)

### Integration Testing

**Focus:** End-to-end flows and external dependencies

1. **API Integration:**
   - Full CRUD operations through REST API
   - Database persistence and retrieval
   - Error handling across layers

2. **PDF Generation:**
   - Complete PDF creation flow
   - File saving and download
   - Content verification

3. **Form Submission Flow:**
   - Form validation → API call → Database save → Response handling

### Test Coverage Goals

- **Unit Tests:** 80%+ code coverage
- **Property Tests:** All 19 correctness properties
- **Integration Tests:** All critical user flows
- **Edge Cases:** All validation boundaries

### Test Execution

**Development:**
```bash
npm test                    # Run all tests
npm test -- --watch         # Watch mode for TDD
npm test -- --coverage      # Generate coverage report
```

**Continuous Integration:**
- Run all tests on every commit
- Fail build if any test fails
- Generate and publish coverage reports
- Run property tests with increased iterations (1000+)

### Testing Best Practices

1. **Property Tests:**
   - Keep properties simple and focused
   - Use appropriate generators for input data
   - Include shrinking for minimal counterexamples
   - Document the property being tested

2. **Unit Tests:**
   - Follow AAA pattern (Arrange, Act, Assert)
   - Use descriptive test names
   - One assertion per test when possible
   - Mock external dependencies

3. **Integration Tests:**
   - Use test database for isolation
   - Clean up data after tests
   - Test happy path and error scenarios
   - Verify side effects (database changes, file creation)

