# Requirements Document

## Introduction

The Quotation Management feature enables M Marine Services to create, manage, and generate professional quotations for potential customers. This feature mirrors the existing invoice functionality but is used in the pre-sale phase to provide pricing estimates to customers before converting them to formal invoices. The quotation module will be a separate, standalone system alongside the invoice management system, allowing the business to track both quotes and completed sales independently.

## Glossary

- **Quotation_System**: The software module responsible for managing quotations, including creation, storage, retrieval, and PDF generation
- **Quotation**: A document that provides an estimate of costs for goods or services to a potential customer
- **Line_Item**: An individual product or service entry in a quotation, including description, quantity, denomination, rate, and calculated amount
- **Customer_Details**: Information about the potential customer including name, address, city, phone number, email, and optional GSTIN
- **GST**: Goods and Services Tax - a percentage-based tax applied to the subtotal
- **Quotation_Number**: A unique identifier for each quotation in the format `-XXX/DD-MM-YYYY/YYNK`
- **Quotation_Form**: The user interface component for creating and editing quotations
- **Quotation_Dashboard**: The user interface component for viewing, managing, and downloading all quotations
- **PDF_Generator**: The utility module that converts quotation data into a professional PDF document
- **Staging_Area**: A temporary holding area where selected items can be modified before being added to the quotation summary
- **Item_Master**: The database of available products and services that can be added to quotations
- **Round_Off**: The difference between the calculated total and the rounded final total

## Requirements

### Requirement 1: Quotation Creation Form

**User Story:** As a sales representative, I want to create quotations with customer details and line items, so that I can provide pricing estimates to potential customers.

#### Acceptance Criteria

1. THE Quotation_Form SHALL display input fields for all Customer_Details (name, address, city, phone number, email, optional GSTIN)
2. WHEN the Quotation_Form loads, THE Quotation_System SHALL auto-generate a unique Quotation_Number
3. WHEN the Quotation_Form loads, THE Quotation_System SHALL auto-populate the current date in DD-MM-YYYY format
4. THE Quotation_Form SHALL provide a dropdown to select items from the Item_Master
5. WHEN an item is selected from the dropdown, THE Quotation_System SHALL add it to the Staging_Area with default values
6. THE Quotation_Form SHALL allow users to modify quantity, denomination, and rate for items in the Staging_Area
7. THE Quotation_Form SHALL provide a button to add all Staging_Area items to the quotation summary
8. WHEN items are added to the quotation summary, THE Quotation_System SHALL clear the Staging_Area
9. THE Quotation_Form SHALL allow users to modify quantity, denomination, and rate for items in the quotation summary
10. THE Quotation_Form SHALL provide a remove button for each item in the Staging_Area and quotation summary
11. THE Quotation_Form SHALL display a configurable GST percentage input with a default value of 18%

### Requirement 2: Quotation Number Generation

**User Story:** As a system administrator, I want quotations to have unique identifiers, so that I can track and reference them accurately.

#### Acceptance Criteria

1. WHEN a new quotation is created, THE Quotation_System SHALL generate a unique Quotation_Number in the format `-XXX/DD-MM-YYYY/YYNK`
2. THE Quotation_System SHALL use a random 3-digit number for the XXX portion of the Quotation_Number
3. THE Quotation_System SHALL use the current date for the DD-MM-YYYY portion of the Quotation_Number
4. THE Quotation_System SHALL use the last two digits of the current year for the YY portion of the Quotation_Number
5. THE Quotation_System SHALL reject duplicate Quotation_Numbers
6. THE Quotation_Number SHALL be read-only in the user interface

### Requirement 3: Real-Time Calculation Engine

**User Story:** As a sales representative, I want quotations to automatically calculate totals with GST and rounding, so that I can provide accurate pricing without manual calculations.

#### Acceptance Criteria

1. WHEN Line_Item quantity or rate changes, THE Quotation_System SHALL recalculate the item amount as quantity × rate
2. WHEN any Line_Item changes, THE Quotation_System SHALL recalculate the subtotal as the sum of all item amounts
3. WHEN the subtotal or GST percentage changes, THE Quotation_System SHALL recalculate the GST amount as (subtotal × GST%) / 100
4. WHEN the subtotal or GST amount changes, THE Quotation_System SHALL recalculate the grand total as subtotal + GST amount
5. WHEN the grand total changes, THE Quotation_System SHALL calculate the final total as the rounded grand total
6. WHEN the grand total changes, THE Quotation_System SHALL calculate the Round_Off as final total - grand total
7. THE Quotation_System SHALL display all calculated values with 2 decimal places
8. THE Quotation_System SHALL update calculations in real-time without user interaction

### Requirement 4: Input Validation

**User Story:** As a system administrator, I want quotations to be validated before saving, so that the database contains only complete and valid data.

#### Acceptance Criteria

1. WHEN the user attempts to save a quotation, THE Quotation_System SHALL validate that Customer_Details name is not empty
2. WHEN the user attempts to save a quotation, THE Quotation_System SHALL validate that Customer_Details phone number is not empty
3. WHEN the user attempts to save a quotation, THE Quotation_System SHALL validate that Customer_Details email is not empty and matches email format
4. WHEN the user attempts to save a quotation, THE Quotation_System SHALL validate that Customer_Details address is not empty
5. WHEN the user attempts to save a quotation, THE Quotation_System SHALL validate that Customer_Details city is not empty
6. WHEN the user attempts to save a quotation, THE Quotation_System SHALL validate that at least one Line_Item exists in the quotation summary
7. IF the Staging_Area contains items, THEN THE Quotation_System SHALL prevent saving and display an error message prompting the user to add items to summary
8. IF validation fails, THEN THE Quotation_System SHALL display a descriptive error message and prevent saving
9. WHEN a quotation with duplicate Quotation_Number is submitted, THE Quotation_System SHALL reject it and display an error message

### Requirement 5: Quotation Persistence

**User Story:** As a sales representative, I want to save quotations to the database, so that I can retrieve and reference them later.

#### Acceptance Criteria

1. WHEN a valid quotation is submitted, THE Quotation_System SHALL store it in the database with all Customer_Details
2. WHEN a valid quotation is submitted, THE Quotation_System SHALL store all Line_Items with their itemId, itemName, quantity, denomination, rate, GST, discount, and discountType
3. WHEN a valid quotation is submitted, THE Quotation_System SHALL store all calculations including subtotal, totalGST, totalDiscount, and grandTotal
4. WHEN a valid quotation is submitted, THE Quotation_System SHALL store the GST percentage, discount, and discountType
5. WHEN a valid quotation is submitted, THE Quotation_System SHALL store the creation timestamp
6. WHEN a quotation is successfully saved, THE Quotation_System SHALL display a success confirmation message
7. WHEN a quotation is successfully saved, THE Quotation_System SHALL reset the form to initial state

### Requirement 6: Quotation Dashboard Display

**User Story:** As a sales representative, I want to view all quotations in a dashboard, so that I can review and manage them efficiently.

#### Acceptance Criteria

1. THE Quotation_Dashboard SHALL display a list of all quotations sorted by creation date in descending order
2. THE Quotation_Dashboard SHALL display the Quotation_Number for each quotation
3. THE Quotation_Dashboard SHALL display the Customer_Details name for each quotation
4. THE Quotation_Dashboard SHALL display the quotation date in MMM DD, YYYY format for each quotation
5. THE Quotation_Dashboard SHALL display the number of Line_Items for each quotation
6. THE Quotation_Dashboard SHALL display the grand total for each quotation
7. THE Quotation_Dashboard SHALL display the total number of quotations
8. THE Quotation_Dashboard SHALL display the sum of all quotation grand totals as total revenue
9. WHEN no quotations exist, THE Quotation_Dashboard SHALL display an empty state message
10. WHEN the Quotation_Dashboard loads, THE Quotation_System SHALL fetch all quotations from the database

### Requirement 7: Quotation Management Actions

**User Story:** As a sales representative, I want to download and delete quotations, so that I can share quotes with customers and maintain a clean database.

#### Acceptance Criteria

1. THE Quotation_Dashboard SHALL provide a download PDF button for each quotation
2. THE Quotation_Dashboard SHALL provide a delete button for each quotation
3. WHEN the download PDF button is clicked, THE Quotation_System SHALL generate and download a professional PDF quotation
4. WHEN the delete button is clicked, THE Quotation_System SHALL display a confirmation dialog with the Quotation_Number
5. WHEN deletion is confirmed, THE Quotation_System SHALL remove the quotation from the database
6. WHEN deletion is confirmed, THE Quotation_System SHALL remove the quotation from the dashboard display
7. WHEN deletion is successful, THE Quotation_System SHALL display a success message
8. IF deletion fails, THEN THE Quotation_System SHALL display an error message

### Requirement 8: PDF Quotation Generator

**User Story:** As a sales representative, I want to generate professional PDF quotations, so that I can share them with potential customers via email or print.

#### Acceptance Criteria

1. WHEN PDF generation is requested, THE PDF_Generator SHALL validate that Customer_Details name is not empty
2. WHEN PDF generation is requested, THE PDF_Generator SHALL validate that at least one Line_Item exists
3. IF validation fails, THEN THE PDF_Generator SHALL display an error message and cancel PDF generation
4. THE PDF_Generator SHALL include the M Marine Services logo in the quotation header
5. THE PDF_Generator SHALL include the company tagline and GSTIN in the quotation header
6. THE PDF_Generator SHALL display "QUOTATION" as the document title
7. THE PDF_Generator SHALL include all Customer_Details in the quotation
8. THE PDF_Generator SHALL include the Quotation_Number and date
9. THE PDF_Generator SHALL display all Line_Items in a table with columns: SR. NO., DESCRIPTION, QTY, DENO, RATE, AMOUNT
10. THE PDF_Generator SHALL ensure a minimum of 3 table rows for professional appearance
11. THE PDF_Generator SHALL display subtotal, GST amount with percentage, total, Round_Off, and final total
12. THE PDF_Generator SHALL convert the final total to words in Indian number format
13. THE PDF_Generator SHALL include M Marine Services bank details
14. THE PDF_Generator SHALL include company contact information with icons
15. THE PDF_Generator SHALL include a blue vertical stripe on the right edge
16. THE PDF_Generator SHALL include a blue diagonal accent in the bottom right corner
17. THE PDF_Generator SHALL save the file with name format `M-Marine-Quotation-{QuotationNumber}.pdf`

### Requirement 9: Quotation Form Preview Panel

**User Story:** As a sales representative, I want to see a real-time preview of the quotation, so that I can verify details before saving or generating PDF.

#### Acceptance Criteria

1. THE Quotation_Form SHALL display a preview panel showing the Quotation_Number
2. THE Quotation_Form SHALL display a preview panel showing the quotation date
3. THE Quotation_Form SHALL display a preview panel showing the Customer_Details name
4. THE Quotation_Form SHALL display a preview panel showing the Customer_Details address and city
5. THE Quotation_Form SHALL display a preview panel showing the number of Line_Items
6. THE Quotation_Form SHALL display a preview panel showing subtotal, GST amount with percentage, total, Round_Off, and final total
7. THE Quotation_Form SHALL display a preview panel showing the final total in words
8. THE Quotation_Form SHALL display a preview panel showing M Marine Services bank details
9. WHEN any quotation data changes, THE Quotation_System SHALL update the preview panel in real-time

### Requirement 10: Quotation Form Reset Functionality

**User Story:** As a sales representative, I want to reset the quotation form, so that I can quickly start creating a new quotation.

#### Acceptance Criteria

1. THE Quotation_Form SHALL provide a reset button
2. WHEN the reset button is clicked, THE Quotation_System SHALL generate a new Quotation_Number
3. WHEN the reset button is clicked, THE Quotation_System SHALL set the date to the current date
4. WHEN the reset button is clicked, THE Quotation_System SHALL clear all Customer_Details fields
5. WHEN the reset button is clicked, THE Quotation_System SHALL clear the Staging_Area
6. WHEN the reset button is clicked, THE Quotation_System SHALL clear the quotation summary
7. WHEN the reset button is clicked, THE Quotation_System SHALL reset the GST percentage to 18%

### Requirement 11: Database Schema for Quotations

**User Story:** As a system administrator, I want quotations to be stored in a structured database schema, so that data integrity is maintained.

#### Acceptance Criteria

1. THE Quotation_System SHALL store quotations in a MongoDB collection named "Quotation"
2. THE Quotation schema SHALL include a quotationNumber field as a required, unique, trimmed string
3. THE Quotation schema SHALL include a quotationDate field as a required date with default value of current timestamp
4. THE Quotation schema SHALL include a customer object with name, phoneNumber, email, billingAddress, and optional gstin fields
5. THE Quotation schema SHALL include an items array containing itemId, itemName, price, quantity, denomination, gst, discount, and discountType
6. THE Quotation schema SHALL include a calculations object with subtotal, totalGST, totalDiscount, and grandTotal fields
7. THE Quotation schema SHALL include gst, discount, and discountType fields at the quotation level
8. THE Quotation schema SHALL include a createdAt timestamp field with default value of current timestamp
9. THE Quotation schema SHALL validate that customer name, phoneNumber, email, and billingAddress are required
10. THE Quotation schema SHALL validate that each Line_Item has required fields: itemId, itemName, price, and quantity

### Requirement 12: RESTful API for Quotations

**User Story:** As a frontend developer, I want a RESTful API for quotations, so that I can perform CRUD operations from the client application.

#### Acceptance Criteria

1. THE Quotation_System SHALL provide a GET endpoint at `/api/quotations` to retrieve all quotations sorted by creation date descending
2. THE Quotation_System SHALL provide a GET endpoint at `/api/quotations/:id` to retrieve a single quotation by ID
3. THE Quotation_System SHALL provide a POST endpoint at `/api/quotations` to create a new quotation
4. THE Quotation_System SHALL provide a PUT endpoint at `/api/quotations/:id` to update an existing quotation
5. THE Quotation_System SHALL provide a DELETE endpoint at `/api/quotations/:id` to delete a quotation
6. WHEN a GET all request succeeds, THE Quotation_System SHALL return status 200 with success flag and quotations array
7. WHEN a GET single request succeeds, THE Quotation_System SHALL return status 200 with success flag and quotation data
8. WHEN a POST request succeeds, THE Quotation_System SHALL return status 201 with success flag and created quotation data
9. WHEN a PUT request succeeds, THE Quotation_System SHALL return status 200 with success flag and updated quotation data
10. WHEN a DELETE request succeeds, THE Quotation_System SHALL return status 200 with success flag and empty data object
11. IF a GET single, PUT, or DELETE request targets a non-existent quotation, THEN THE Quotation_System SHALL return status 404 with error message
12. IF a POST or PUT request fails validation, THEN THE Quotation_System SHALL return status 400 with error messages
13. IF any request encounters a server error, THEN THE Quotation_System SHALL return status 500 with error message

### Requirement 13: Navigation Integration

**User Story:** As a user, I want to access the quotation feature from the main application navigation, so that I can easily switch between invoices and quotations.

#### Acceptance Criteria

1. THE Quotation_System SHALL add "Create Quotation" to the main application navigation menu
2. THE Quotation_System SHALL add "Quotation Dashboard" to the main application navigation menu
3. WHEN "Create Quotation" is clicked, THE Quotation_System SHALL navigate to the Quotation_Form route
4. WHEN "Quotation Dashboard" is clicked, THE Quotation_System SHALL navigate to the Quotation_Dashboard route
5. THE navigation menu SHALL maintain the existing "Items", "Create Invoice", and "Invoice Dashboard" options
6. THE navigation menu SHALL clearly distinguish between quotation and invoice sections

### Requirement 14: Number-to-Words Conversion for Quotations

**User Story:** As a sales representative, I want the quotation total to be displayed in words, so that the document is more professional and readable.

#### Acceptance Criteria

1. THE Quotation_System SHALL convert the final total to Indian English words format
2. THE Quotation_System SHALL support conversion up to crores
3. THE Quotation_System SHALL follow the Indian numbering system (ones, tens, hundreds, thousands, lakhs, crores)
4. THE Quotation_System SHALL append "Only" to the end of the words
5. WHEN the final total is 0, THE Quotation_System SHALL display "Zero Only"
6. THE Quotation_System SHALL display the amount in words format "Rupees {words}."
