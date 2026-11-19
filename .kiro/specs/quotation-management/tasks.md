# Implementation Plan: Quotation Management System

## Overview

This implementation plan creates a comprehensive quotation management system that mirrors the existing invoice functionality while operating independently. The system includes a complete CRUD workflow with real-time calculations, staging area for item selection, professional PDF generation with Marine branding, and a dashboard for quotation management. The implementation follows the existing MERN architecture pattern used in the invoice system.

## Tasks

- [x] 1. Set up backend data models and database schema
  - [x] 1.1 Create Quotation model with MongoDB schema
    - Define schema in `server/models/Quotation.js` with quotationNumber, quotationDate, customer object, items array, calculations object, gst, discount, discountType, and createdAt fields
    - Add validation for required fields (quotationNumber, customer.name, customer.phoneNumber, customer.email, customer.billingAddress)
    - Add unique index on quotationNumber field
    - Add index on createdAt field for efficient sorting
    - Include itemId references to Item collection
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 11.10_

- [x] 2. Implement backend API controller and routes
  - [x] 2.1 Create quotation controller with CRUD operations
    - Create `server/controllers/quotationController.js` with getQuotations, getQuotation, createQuotation, updateQuotation, and deleteQuotation methods
    - Implement input validation for all fields
    - Implement duplicate quotation number checking
    - Add error handling with appropriate status codes (200, 201, 400, 404, 500)
    - Sort quotations by createdAt descending in getQuotations
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.8, 4.9, 2.5_

  - [ ]* 2.2 Write property test for quotation persistence round-trip
    - **Property 13: Quotation Persistence Round-Trip**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 5.5**
    - Generate arbitrary valid quotations and verify that saving and retrieving produces identical data

  - [x] 2.3 Add quotation routes to API router
    - Update `server/routes/api.js` to add GET /api/quotations, GET /api/quotations/:id, POST /api/quotations, PUT /api/quotations/:id, DELETE /api/quotations/:id routes
    - Wire routes to quotationController methods
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [ ]* 2.4 Write unit tests for quotation controller
    - Test validation error responses (400 status)
    - Test not found errors (404 status)
    - Test successful CRUD operations
    - Test duplicate quotation number rejection
    - _Requirements: 12.6, 12.7, 12.8, 12.9, 12.10, 12.11, 12.12, 12.13_

- [x] 3. Checkpoint - Verify backend API functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implement calculation engine and validation utilities
  - [x] 4.1 Create calculation engine utility
    - Create `client/src/utils/quotationCalculations.js` with calculateTotals function
    - Implement line item amount calculation (quantity × rate)
    - Implement subtotal calculation (sum of all item amounts)
    - Implement GST amount calculation ((subtotal × GST%) / 100)
    - Implement grand total calculation (subtotal + GST amount)
    - Implement final total calculation (Math.round(grand total))
    - Implement round-off calculation (final total - grand total)
    - Format all values to 2 decimal places
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

  - [ ]* 4.2 Write property tests for calculation engine
    - **Property 5: Line Item Amount Calculation**
    - **Validates: Requirement 3.1**
    - **Property 6: Subtotal Calculation**
    - **Validates: Requirement 3.2**
    - **Property 7: Calculation Correctness (Comprehensive)**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6**
    - **Property 8: Decimal Place Formatting**
    - **Validates: Requirement 3.7**
    - Generate arbitrary line items and GST percentages, verify calculation formulas

  - [x] 4.3 Create validation utility functions
    - Create `client/src/utils/quotationValidation.js` with validateCustomerDetails, validateLineItems, validateEmail, validateStagingArea functions
    - Implement email format validation (regex pattern)
    - Implement required field validation (name, phone, email, address, city)
    - Implement line items existence validation
    - Implement staging area clearance validation
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 4.4 Write property tests for validation utilities
    - **Property 9: Customer Data Validation**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5**
    - **Property 10: Email Format Validation**
    - **Validates: Requirement 4.3**
    - **Property 11: Line Items Existence Validation**
    - **Validates: Requirement 4.6**
    - **Property 12: Staging Area Clearance Validation**
    - **Validates: Requirement 4.7**
    - Generate valid and invalid customer data, verify validation rules

- [x] 5. Implement quotation number generator utility
  - [x] 5.1 Create quotation number generator
    - Create `client/src/utils/quotationNumberGenerator.js` with generateQuotationNumber function
    - Generate random 3-digit number for XXX portion
    - Use current date for DD-MM-YYYY portion
    - Use last two digits of current year for YY portion
    - Format as `-XXX/DD-MM-YYYY/YYNK`
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 1.2_

  - [ ]* 5.2 Write property tests for quotation number generator
    - **Property 1: Quotation Number Uniqueness**
    - **Validates: Requirements 1.2, 2.5**
    - **Property 2: Quotation Number Format Compliance**
    - **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
    - Generate multiple quotation numbers and verify uniqueness and format compliance

- [ ] 6. Checkpoint - Verify utility functions
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement QuotationForm component
  - [x] 7.1 Create QuotationForm component structure and state management
    - Create `client/src/components/QuotationForm.js` and `client/src/components/QuotationForm.css`
    - Initialize state with quotationData, availableItems, selectedItemId, stagingItems, cartItems, gst, calculations, touched, loading
    - Auto-generate quotation number on component mount
    - Auto-populate current date on component mount
    - Fetch available items from Item Master on component mount
    - _Requirements: 1.1, 1.2, 1.3, 1.11, 2.6_

  - [x] 7.2 Implement customer details input section
    - Add input fields for customer name, address, city, phone number, email, GSTIN (optional)
    - Implement handleInputChange to update quotationData state
    - Add field validation tracking with touched state
    - Display inline validation errors for empty required fields
    - _Requirements: 1.1, 4.1, 4.2, 4.3, 4.4, 4.5_

  - [x] 7.3 Implement staging area for item selection
    - Add dropdown to select items from Item Master
    - Implement handleSelectItem to add selected item to staging area with default values (quantity=1, denomination="pieces", rate=item.price)
    - Add editable fields for quantity, denomination, and rate in staging area
    - Implement updateStagingItem to modify staging item properties
    - Add remove button for each staging item
    - Implement removeStagingItem to remove items from staging area
    - _Requirements: 1.4, 1.5, 1.6, 1.10_

  - [ ]* 7.4 Write property test for item selection adds to staging area
    - **Property 3: Item Selection Adds to Staging Area**
    - **Validates: Requirement 1.5**
    - Generate arbitrary items and verify they appear in staging area with correct defaults

  - [x] 7.5 Implement quotation summary section
    - Add "Add All to Cart" button to move staging items to quotation summary
    - Implement handleAddAllToCart to move all staging items to cartItems and clear stagingItems
    - Add editable fields for quantity, denomination, and rate in quotation summary
    - Implement updateCartItem to modify cart item properties
    - Add remove button for each cart item
    - Implement removeItem to remove items from cart
    - _Requirements: 1.7, 1.8, 1.9, 1.10_

  - [ ]* 7.6 Write property test for adding items clears staging area
    - **Property 4: Adding Items Clears Staging Area**
    - **Validates: Requirement 1.8**
    - Generate arbitrary staging items and verify staging area is empty after adding to cart

  - [x] 7.7 Implement real-time calculation display
    - Add calculation display section showing subtotal, GST amount, total, round-off, final total
    - Update calculations whenever cartItems or gst changes using useEffect
    - Call calculateTotals utility function
    - Format all calculated values to 2 decimal places
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

  - [x] 7.8 Implement form submission and validation
    - Add Save Quotation button
    - Implement handleSubmit to validate form and submit to backend
    - Validate all customer details fields
    - Validate at least one item in quotation summary
    - Validate staging area is empty
    - Display validation errors
    - Send POST request to /api/quotations
    - Handle success and error responses
    - Reset form on successful save
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 5.6, 5.7_

  - [x] 7.9 Implement form reset functionality
    - Add Reset button
    - Implement handleReset to clear all fields and regenerate quotation number
    - Reset customer details to empty values
    - Clear staging area and quotation summary
    - Reset GST to 18%
    - Generate new quotation number and current date
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

  - [ ]* 7.10 Write property test for form reset to initial state
    - **Property 14: Form Reset to Initial State**
    - **Validates: Requirements 5.7, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7**
    - Generate arbitrary form state and verify reset returns to initial state

  - [ ]* 7.11 Write unit tests for QuotationForm component
    - Test component rendering
    - Test field input changes
    - Test staging area behavior
    - Test cart item management
    - Test form submission flow
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 1.10, 1.11_

- [x] 8. Checkpoint - Verify QuotationForm component functionality
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implement QuotationDashboard component
  - [x] 9.1 Create QuotationDashboard component structure
    - Create `client/src/components/QuotationDashboard.js` and `client/src/components/QuotationDashboard.css`
    - Initialize state with quotations, loading, error
    - Fetch quotations from backend on component mount using GET /api/quotations
    - Display loading state while fetching
    - Display error state if fetch fails
    - _Requirements: 6.10_

  - [x] 9.2 Implement quotations table display
    - Display quotations in table format with columns: Quotation Number, Customer Name, Date, Line Items Count, Grand Total, Actions
    - Format date as MMM DD, YYYY
    - Sort quotations by creation date descending (newest first)
    - Display empty state message when no quotations exist
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.9_

  - [ ]* 9.3 Write property test for quotation list sorting
    - **Property 15: Quotation List Sorting**
    - **Validates: Requirement 6.1**
    - Generate arbitrary quotations with different dates and verify descending order

  - [x] 9.4 Implement dashboard statistics
    - Display total number of quotations
    - Calculate and display total revenue (sum of all grand totals)
    - _Requirements: 6.7, 6.8_

  - [ ]* 9.5 Write property test for total revenue calculation
    - **Property 16: Total Revenue Calculation**
    - **Validates: Requirement 6.8**
    - Generate arbitrary quotations and verify revenue sum

  - [x] 9.6 Implement delete quotation functionality
    - Add delete button for each quotation
    - Implement handleDelete to show confirmation dialog with quotation number
    - Send DELETE request to /api/quotations/:id on confirmation
    - Remove deleted quotation from display
    - Display success or error message
    - _Requirements: 7.2, 7.4, 7.5, 7.6, 7.7, 7.8_

  - [ ]* 9.7 Write unit tests for QuotationDashboard component
    - Test table rendering
    - Test empty state display
    - Test statistics calculation
    - Test delete functionality
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8, 6.9_

- [x] 10. Implement PDF generation utility
  - [x] 10.1 Create PDF generator utility for quotations
    - Create `client/src/utils/quotationPdfGenerator.js` with generateMarineQuotationPDF function
    - Validate customer name is not empty
    - Validate at least one line item exists
    - Display error alert if validation fails
    - _Requirements: 8.1, 8.2, 8.3_

  - [ ]* 10.2 Write property test for PDF generation validation
    - **Property 17: PDF Generation Validation**
    - **Validates: Requirements 8.1, 8.2**
    - Generate quotations with missing data and verify validation rejection

  - [x] 10.3 Implement PDF header section
    - Add M Marine Services logo
    - Add company tagline
    - Add GSTIN
    - Add "QUOTATION" title
    - _Requirements: 8.4, 8.5, 8.6_

  - [x] 10.4 Implement PDF quotation details section
    - Add quotation number
    - Add quotation date
    - Add customer details ("TO:-" section) including name, address, city, phone, email, GSTIN (if provided)
    - _Requirements: 8.7, 8.8_

  - [x] 10.5 Implement PDF line items table
    - Create table with columns: SR. NO., DESCRIPTION, QTY, DENO, RATE, AMOUNT
    - Add all line items to table
    - Ensure minimum 3 rows for professional appearance
    - _Requirements: 8.9, 8.10_

  - [x] 10.6 Implement PDF calculations section
    - Display subtotal
    - Display GST amount with percentage
    - Display total
    - Display round-off
    - Display final total (highlighted)
    - _Requirements: 8.11_

  - [x] 10.7 Implement PDF amount in words
    - Convert final total to words using number-to-words utility
    - Display as "Rupees {words} Only."
    - _Requirements: 8.12, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

  - [ ]* 10.8 Write property test for number-to-words conversion
    - **Property 19: Number-to-Words Indian Format**
    - **Validates: Requirements 14.1, 14.2, 14.3, 14.4, 14.5, 14.6**
    - Generate arbitrary numbers and verify Indian format conversion

  - [x] 10.9 Implement PDF company details and branding
    - Add bank account details
    - Add IFSC code and bank name
    - Add contact information (phone, email, address) with icons
    - Add blue vertical stripe on right edge
    - Add blue diagonal accent in bottom right corner
    - _Requirements: 8.13, 8.14, 8.15, 8.16_

  - [x] 10.10 Implement PDF file saving
    - Save PDF with filename format `M-Marine-Quotation-{QuotationNumber}.pdf`
    - Trigger browser download
    - _Requirements: 8.17_

  - [ ]* 10.11 Write property test for PDF content completeness
    - **Property 18: PDF Content Completeness**
    - **Validates: Requirements 8.4-8.17**
    - Generate valid quotation and verify all required PDF elements are present

  - [x] 10.12 Integrate PDF download button in QuotationForm
    - Add "Download PDF" button to QuotationForm
    - Call generateMarineQuotationPDF on button click
    - Pass quotation data, line items, calculations, and GST
    - _Requirements: 7.1, 7.3_

  - [x] 10.13 Integrate PDF download button in QuotationDashboard
    - Add "Download PDF" button for each quotation in dashboard
    - Call generateMarineQuotationPDF on button click
    - Pass quotation data from dashboard row
    - _Requirements: 7.1, 7.3_

  - [ ]* 10.14 Write unit tests for PDF generator
    - Test validation error handling
    - Test file naming format
    - Test error handling for PDF generation failures
    - _Requirements: 8.1, 8.2, 8.3, 8.17_

- [x] 11. Checkpoint - Verify PDF generation functionality
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement navigation integration
  - [x] 12.1 Update App.js navigation menu
    - Add "Create Quotation" tab to navigation menu
    - Add "Quotation Dashboard" tab to navigation menu
    - Update currentPage state to support 'quotation' and 'quotation-dashboard' pages
    - Implement navigation handlers to switch between pages
    - Maintain existing "Items", "Create Invoice", "Invoice Dashboard" tabs
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [x] 12.2 Import and render quotation components in App.js
    - Import QuotationForm and QuotationDashboard components
    - Add conditional rendering based on currentPage state
    - Ensure proper component mounting and unmounting
    - _Requirements: 13.3, 13.4_

  - [ ]* 12.3 Write unit tests for navigation integration
    - Test navigation menu rendering
    - Test page switching between quotation pages
    - Test that existing navigation still works
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

- [x] 13. Final integration and end-to-end testing
  - [x] 13.1 Test complete quotation creation flow
    - Create quotation with customer details
    - Add items from staging area to summary
    - Verify real-time calculations
    - Submit quotation
    - Verify success message and form reset
    - _Requirements: 1.1-1.11, 3.1-3.8, 4.1-4.8, 5.1-5.7_

  - [x] 13.2 Test complete quotation dashboard flow
    - Load dashboard
    - Verify quotations display with correct data
    - Verify statistics calculation
    - Download PDF for a quotation
    - Delete a quotation with confirmation
    - _Requirements: 6.1-6.10, 7.1-7.8_

  - [ ]* 13.3 Write integration tests for complete workflows
    - Test full quotation creation and persistence
    - Test quotation retrieval and display
    - Test PDF generation from dashboard
    - Test quotation deletion
    - _Requirements: All requirements_

- [ ] 14. Final checkpoint - Complete system verification
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at key integration points
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- The implementation follows the existing MERN architecture patterns used in the invoice system
- All components reuse the existing Item Master collection (no changes needed)
- The quotation system operates independently from the invoice system (separate collection, routes, components)
- Testing uses Jest for unit tests and fast-check for property-based tests
- PDF generation uses jsPDF library (consistent with invoice PDF generation)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "5.1"] },
    { "id": 2, "tasks": ["2.2", "2.3", "4.2", "4.3", "5.2"] },
    { "id": 3, "tasks": ["2.4", "4.4", "7.1"] },
    { "id": 4, "tasks": ["7.2", "7.3", "7.5"] },
    { "id": 5, "tasks": ["7.4", "7.6", "7.7"] },
    { "id": 6, "tasks": ["7.8", "7.9"] },
    { "id": 7, "tasks": ["7.10", "7.11", "9.1"] },
    { "id": 8, "tasks": ["9.2", "9.4"] },
    { "id": 9, "tasks": ["9.3", "9.5", "9.6", "10.1"] },
    { "id": 10, "tasks": ["9.7", "10.2", "10.3"] },
    { "id": 11, "tasks": ["10.4", "10.5", "10.6"] },
    { "id": 12, "tasks": ["10.7", "10.9"] },
    { "id": 13, "tasks": ["10.8", "10.10"] },
    { "id": 14, "tasks": ["10.11", "10.12", "10.13"] },
    { "id": 15, "tasks": ["10.14", "12.1"] },
    { "id": 16, "tasks": ["12.2"] },
    { "id": 17, "tasks": ["12.3", "13.1"] },
    { "id": 18, "tasks": ["13.2"] },
    { "id": 19, "tasks": ["13.3"] }
  ]
}
```
