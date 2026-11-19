# Requirements Document

## Introduction

This document specifies the requirements for a professional PDF invoice download feature for the M Marine Services invoice management system. The feature generates PDF invoices that precisely match the company's established brand identity and invoice format, including company branding, comprehensive invoice details, itemized billing tables, tax calculations, and company contact information.

## Glossary

- **PDF_Generator**: The component responsible for creating PDF documents from invoice data
- **Invoice_Data**: Structured data containing customer details, line items, calculations, and company information
- **M_Marine_Brand**: The specific visual identity and formatting requirements for M Marine Services
- **Invoice_Template**: The standardized layout structure matching the reference invoice design
- **Line_Item**: A single row in the invoice table containing description, quantity, denomination, rate, and amount
- **GST**: Goods and Services Tax percentage applied to invoice calculations
- **Round_Off**: The adjustment value to round the final total to the nearest whole rupee
- **Amount_In_Words**: The total amount expressed in Indian English words format
- **GSTIN**: Goods and Services Tax Identification Number (29AAYFN4510A1Z8 for M Marine Services)
- **Download_Trigger**: User action that initiates PDF generation (button click from invoice form or dashboard)
- **Company_Details**: Static information including name, tagline, GSTIN, bank account details, and contact information

## Requirements

### Requirement 1: PDF Document Generation

**User Story:** As a user, I want to generate a professional PDF invoice, so that I can download and share formal invoices with customers

#### Acceptance Criteria

1. WHEN a user clicks the Download PDF button with valid invoice data, THE PDF_Generator SHALL create a PDF document containing all invoice information
2. WHEN the PDF is generated, THE PDF_Generator SHALL automatically trigger a browser download with the filename format "M_Marine_Invoice_{invoiceNumber}.pdf"
3. THE PDF_Generator SHALL create the PDF without requiring server-side processing
4. WHEN invoice data is incomplete (missing customer name or no line items), THE PDF_Generator SHALL display an error message and prevent PDF generation
5. WHEN the PDF is generated, THE PDF_Generator SHALL include all data that was visible in the invoice form preview

### Requirement 2: M Marine Services Brand Identity

**User Story:** As a business owner, I want the PDF to match our company branding, so that invoices appear professional and consistent with our identity

#### Acceptance Criteria

1. THE PDF_Generator SHALL display "M MARINE SERVICES" as the company name in the header
2. THE PDF_Generator SHALL include the company tagline "All Types Of Marine Engineering Solution, Engineering Turnkey Projects, Service In Mechanical, Electrical, Safety Items, Service In Mechanical & IT Solution" below the company name
3. THE PDF_Generator SHALL display "GSTIN Number : 29AAYFN4510A1Z8" in the header section
4. WHEN a company logo file exists at "/logo.jpeg", THE PDF_Generator SHALL include the logo image in the top-left header area with dimensions 40mm width by 30mm height
5. THE PDF_Generator SHALL use a professional color scheme with blue accent colors (RGB 70, 130, 180) for decorative elements
6. THE PDF_Generator SHALL include a blue vertical stripe on the right edge of the page
7. THE PDF_Generator SHALL display the centered title "INVOICE" with an underline below the header section

### Requirement 3: Invoice Header and Metadata

**User Story:** As a user, I want the invoice number and date clearly displayed, so that invoices can be tracked and referenced

#### Acceptance Criteria

1. THE PDF_Generator SHALL display the label "TAX INVOICE NO. :" followed by the invoice number in the top-right section
2. THE PDF_Generator SHALL display the label "DATE :-" followed by the invoice date in DD-MM-YYYY format below the invoice number
3. THE PDF_Generator SHALL format the invoice number exactly as provided in the Invoice_Data
4. THE PDF_Generator SHALL right-align the invoice number and date fields
5. THE PDF_Generator SHALL use bold font for the invoice number label

### Requirement 4: Customer Information Display

**User Story:** As a user, I want customer details clearly shown on the invoice, so that the recipient is properly identified

#### Acceptance Criteria

1. THE PDF_Generator SHALL display the label "TO:-" in bold on the left side below the header
2. WHEN customer name is provided, THE PDF_Generator SHALL display it in uppercase below the "TO:-" label
3. WHEN customer address is provided, THE PDF_Generator SHALL display it in uppercase below the customer name
4. WHEN customer city is provided, THE PDF_Generator SHALL display it in uppercase below the customer address
5. THE PDF_Generator SHALL left-align all customer information fields

### Requirement 5: Line Items Table Structure

**User Story:** As a user, I want items displayed in a structured table, so that the invoice is easy to read and understand

#### Acceptance Criteria

1. THE PDF_Generator SHALL create a table with columns: "SR. NO.", "DESCRIPTION", "QTY", "DENO", "RATE", "AMOUNT"
2. THE PDF_Generator SHALL center-align the table header text "SR. NO."
3. THE PDF_Generator SHALL left-align the "DESCRIPTION" column content
4. THE PDF_Generator SHALL center-align the "QTY" and "DENO" columns
5. THE PDF_Generator SHALL right-align the "RATE" and "AMOUNT" columns
6. THE PDF_Generator SHALL draw grid borders around all table cells with black lines (width 0.5pt)
7. WHEN there are fewer than 6 line items, THE PDF_Generator SHALL add empty rows to maintain a minimum of 6 visible rows in the table

### Requirement 6: Line Items Data Population

**User Story:** As a user, I want each item accurately displayed in the table, so that the invoice reflects what was ordered

#### Acceptance Criteria

1. FOR EACH Line_Item in the Invoice_Data, THE PDF_Generator SHALL populate one table row with serial number, description, quantity, denomination, rate, and calculated amount
2. THE PDF_Generator SHALL format quantity values with leading zeros (e.g., "01", "02")
3. THE PDF_Generator SHALL format rate values with two decimal places and Indian number formatting
4. THE PDF_Generator SHALL calculate amount as (quantity × rate) and format with two decimal places
5. THE PDF_Generator SHALL increment serial numbers sequentially starting from 1

### Requirement 7: Invoice Calculation Summary

**User Story:** As a user, I want the subtotal, GST, and total clearly calculated, so that the customer understands the charges

#### Acceptance Criteria

1. THE PDF_Generator SHALL display a footer row with "SUB TOTAL" label and the subtotal value right-aligned
2. THE PDF_Generator SHALL display a footer row with "GST {percentage} %" label and the GST amount right-aligned
3. THE PDF_Generator SHALL display a footer row with "TOTAL" label and the grand total value right-aligned
4. THE PDF_Generator SHALL display a footer row with "Round off" label and the final rounded total right-aligned
5. THE PDF_Generator SHALL format all monetary values in the footer with two decimal places
6. THE PDF_Generator SHALL use bold font for all calculation footer rows

### Requirement 8: Amount in Words Conversion

**User Story:** As a user, I want the total amount shown in words, so that the invoice amount is clear and verifiable

#### Acceptance Criteria

1. THE PDF_Generator SHALL convert the final rounded total to Indian English words format
2. THE PDF_Generator SHALL display "IN WORDS:- Rupees {amount_in_words}." below the calculation table
3. THE PDF_Generator SHALL handle crores, lakhs, thousands, and hundreds in the conversion
4. THE PDF_Generator SHALL append "Only" at the end of the amount in words
5. WHEN the total is zero, THE PDF_Generator SHALL display "Rupees Zero Only."

### Requirement 9: Bank Account Information

**User Story:** As a business owner, I want bank details on the invoice, so that customers know where to send payment

#### Acceptance Criteria

1. THE PDF_Generator SHALL display "Acc no. :- 0815073000000174" in the lower-left section
2. THE PDF_Generator SHALL display "IFSC :- SIBL0000815" below the account number
3. THE PDF_Generator SHALL display "SOUTH INDIAN BANK KARWAR" below the IFSC code
4. THE PDF_Generator SHALL left-align all bank detail fields
5. THE PDF_Generator SHALL position bank details at least 12mm below the amount in words section

### Requirement 10: Company Stamp and Signature Area

**User Story:** As a business owner, I want a signature area on the invoice, so that invoices can be officially authorized

#### Acceptance Criteria

1. THE PDF_Generator SHALL display "For M MARINE SERVICES" text in the lower-right section
2. THE PDF_Generator SHALL draw a circular company stamp graphic with 15mm radius
3. THE PDF_Generator SHALL include "M MARINE", "SERVICES", "KARWAR" text inside the circular stamp
4. THE PDF_Generator SHALL use blue color (RGB 0, 0, 255) for the stamp circle and text
5. THE PDF_Generator SHALL position the stamp area aligned with the bank details section

### Requirement 11: Contact Information Footer

**User Story:** As a business owner, I want contact information on the invoice, so that customers can reach us for inquiries

#### Acceptance Criteria

1. THE PDF_Generator SHALL display "+91 8149332389 / 8762850701" with a phone icon
2. THE PDF_Generator SHALL display "naikvishal063@gmail.com" as a clickable mailto link with an email icon
3. THE PDF_Generator SHALL display "Off. 395 Gaonkarwada Near Ice Factory, Uttara Kannada Karnataka 581324" with a location icon
4. THE PDF_Generator SHALL draw a horizontal divider line (width 0.5pt) above the contact information
5. THE PDF_Generator SHALL position the contact information footer 10mm above the page bottom

### Requirement 12: PDF Page Layout and Dimensions

**User Story:** As a user, I want the PDF formatted to standard page size, so that it prints correctly

#### Acceptance Criteria

1. THE PDF_Generator SHALL use A4 page size (210mm × 297mm)
2. THE PDF_Generator SHALL set left and right margins at 15mm
3. THE PDF_Generator SHALL position the header section starting at 10mm from the top
4. THE PDF_Generator SHALL ensure all content fits on a single page for invoices with up to 6 line items
5. WHEN content exceeds one page, THE PDF_Generator SHALL continue on additional pages with consistent formatting

### Requirement 13: Download Trigger Integration

**User Story:** As a user, I want to download PDFs from both the invoice form and dashboard, so that I have flexible access to invoices

#### Acceptance Criteria

1. WHEN a user clicks "Download PDF" button in the InvoiceForm component with complete invoice data, THE PDF_Generator SHALL generate and download the PDF
2. WHEN a user clicks the download icon in the InvoiceDashboard for a saved invoice, THE PDF_Generator SHALL retrieve the invoice data and generate the PDF
3. THE PDF_Generator SHALL use the same generation logic regardless of the Download_Trigger source
4. THE PDF_Generator SHALL validate that Invoice_Data contains required fields before generation
5. WHEN generation fails, THE PDF_Generator SHALL log the error to the console and display a user-friendly error message

### Requirement 14: Font and Typography Standards

**User Story:** As a user, I want the PDF to be readable and professional, so that it presents well to customers

#### Acceptance Criteria

1. THE PDF_Generator SHALL use Helvetica font family for all text
2. THE PDF_Generator SHALL use 9pt font size for body text and table content
3. THE PDF_Generator SHALL use 16pt bold font for the "INVOICE" title
4. THE PDF_Generator SHALL use 10pt bold font for section labels and invoice metadata
5. THE PDF_Generator SHALL use black text color (RGB 0, 0, 0) for all primary content except decorative elements

### Requirement 15: Error Handling and Validation

**User Story:** As a user, I want clear error messages when PDF generation fails, so that I can correct issues

#### Acceptance Criteria

1. WHEN Invoice_Data is missing the customer name, THE PDF_Generator SHALL display "Please fill in customer details and add items before generating PDF" alert
2. WHEN Invoice_Data contains zero line items, THE PDF_Generator SHALL display "Please fill in customer details and add items before generating PDF" alert
3. WHEN the logo image fails to load, THE PDF_Generator SHALL continue PDF generation without the logo and log a console message
4. WHEN any calculation value is invalid or NaN, THE PDF_Generator SHALL replace it with "0.00" in the PDF
5. THE PDF_Generator SHALL handle exceptions during PDF generation gracefully and display "Failed to generate PDF. Please try again." alert
