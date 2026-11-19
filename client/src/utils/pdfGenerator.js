/**
 * PDF Generator Utility Module
 * Generates professional PDF invoices for M Marine Services
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { numberToWords } from './numberToWords';

// PDF Layout and Styling Constants
export const PDF_CONSTANTS = {
  PAGE: {
    WIDTH: 210,
    HEIGHT: 297,
    MARGIN_LEFT: 15,
    MARGIN_RIGHT: 15,
    MARGIN_TOP: 10,
    MARGIN_BOTTOM: 10
  },
  
  LOGO: {
    WIDTH: 50,  // Increased from 40
    HEIGHT: 38, // Increased from 30 (maintaining aspect ratio)
    X: 15,
    Y: 5  // Moved up from 10
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
    MIN_ROWS: 3,  // Reduced from 6 to 3 to save space
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

// Company Information Constants
export const COMPANY_DETAILS = {
  name: 'M MARINE SERVICES',
  tagline: 'All Types Of Marine Engineering Solution, Engineering Turnkey Projects, Service In Mechanical, Electrical, Safety Items, Service In Mechanical & IT Solution',
  gstin: '29AAYFN4510A1Z8',
  accountNo: '0815073000000174',
  ifsc: 'SIBL0000815',
  bankName: 'SOUTH INDIAN BANK KARWAR',
  phone: '+91 8149332389 / 8762850701',
  email: 'naikvishal063@gmail.com',
  address: 'Off. 395 Gaonkarwada Near Ice Factory, Uttara Kannada Karnataka 581324',
  logoPath: '/marine-logo.jpg'
};

/**
 * Validates invoice data before PDF generation
 */
export function validateInvoiceData(invoiceData, lineItems, calculations) {
  if (!invoiceData.customerName || invoiceData.customerName.trim() === '') {
    throw new Error('Please fill in customer details and add items before generating PDF');
  }
  
  if (!Array.isArray(lineItems) || lineItems.length === 0) {
    throw new Error('Please fill in customer details and add items before generating PDF');
  }
  
  if (calculations) {
    const requiredCalcs = ['subtotal', 'totalGST', 'grandTotal', 'finalTotal'];
    requiredCalcs.forEach(key => {
      if (calculations[key] === undefined || calculations[key] === null) {
        throw new Error(`Invalid calculation: ${key} is missing`);
      }
    });
  }
}

/**
 * Formats a number to Indian number format with 2 decimal places
 */
export function formatIndianNumber(num) {
  if (isNaN(num) || num === null || num === undefined) {
    return '0.00';
  }
  
  const fixedNum = parseFloat(num).toFixed(2);
  const [intPart, decPart] = fixedNum.split('.');
  
  let formattedInt = intPart;
  if (intPart.length > 3) {
    const lastThree = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    formattedInt = remaining.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
  }
  
  return `${formattedInt}.${decPart}`;
}

/**
 * Calculates the amount for a line item
 */
export function calculateAmount(quantity, rate) {
  const qty = parseFloat(quantity);
  const rateVal = parseFloat(rate);
  
  if (isNaN(qty) || isNaN(rateVal)) {
    return 0;
  }
  
  return qty * rateVal;
}

/**
 * Generates and downloads a professional PDF invoice
 */
export async function generateMarineInvoicePDF(invoiceData, lineItems, calculations, gstPercentage) {
  console.log('generateMarineInvoicePDF called');
  console.log('Parameters received:', { invoiceData, lineItems, calculations, gstPercentage });
  
  try {
    console.log('Validating invoice data...');
    validateInvoiceData(invoiceData, lineItems, calculations);
    console.log('Validation passed');
  } catch (validationError) {
    console.error('Validation error:', validationError);
    alert(validationError.message);
    return;
  }

  try {
    console.log('Creating jsPDF instance...');
    const doc = new jsPDF();
    console.log('jsPDF instance created');
    
    const pageWidth = PDF_CONSTANTS.PAGE.WIDTH;
    const pageHeight = PDF_CONSTANTS.PAGE.HEIGHT;
    
    // Add blue vertical stripe on right edge
    doc.setFillColor(PDF_CONSTANTS.COLORS.PRIMARY_BLUE[0], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[1], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[2]);
    doc.rect(pageWidth - 10, 0, 10, pageHeight, 'F');
    
    // Add logo with proper async loading and error handling
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'Anonymous';
      
      const logoLoaded = await new Promise((resolve) => {
        logoImg.onload = () => {
          console.log('Logo loaded successfully');
          resolve(true);
        };
        logoImg.onerror = (err) => {
          console.warn('Logo failed to load:', err);
          resolve(false);
        };
        
        // Try marine-logo.jpg first, fallback to logo.jpeg
        logoImg.src = '/marine-logo.jpg?' + new Date().getTime(); // Cache busting
        
        // Timeout after 3 seconds
        setTimeout(() => {
          console.warn('Logo loading timed out');
          resolve(false);
        }, 3000);
      });
      
      if (logoLoaded) {
        try {
          doc.addImage(logoImg, 'JPEG', PDF_CONSTANTS.LOGO.X, PDF_CONSTANTS.LOGO.Y, PDF_CONSTANTS.LOGO.WIDTH, PDF_CONSTANTS.LOGO.HEIGHT);
          console.log('Logo added to PDF');
        } catch (err) {
          console.error('Error adding logo to PDF:', err);
        }
      } else {
        console.warn('Continuing without logo');
      }
    } catch (err) {
      console.error('Logo loading error:', err);
    }
    
    // Company tagline (to the right of logo) - EXACTLY 3 LINES - COMPACT
    doc.setFontSize(8); // Reduced from 9
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_GRAY[0], PDF_CONSTANTS.COLORS.TEXT_GRAY[1], PDF_CONSTANTS.COLORS.TEXT_GRAY[2]);
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    
    // Manually split tagline into 3 lines for proper display
    const taglineLine1 = 'All Types Of Marine Engineering Solution, Engineering Turnkey Projects,';
    const taglineLine2 = 'Service In Mechanical, Electrical, Safety Items, Service In Mechanical';
    const taglineLine3 = '& IT Solution';
    
    let currentY = 16; // Start tagline right next to logo
    doc.text(taglineLine1, 60, currentY);
    currentY += 3.5; // Reduced spacing from 4
    doc.text(taglineLine2, 60, currentY);
    currentY += 3.5; // Reduced spacing from 4
    doc.text(taglineLine3, 60, currentY);
    currentY += 3.5; // Reduced spacing from 4
    
    // GSTIN Number (below tagline, to the right of logo) - COMPACT
    doc.setFontSize(9); // Reduced from 10
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
    doc.text(`GSTIN Number : ${COMPANY_DETAILS.gstin}`, 60, currentY + 2); // Reduced spacing
    
    // Horizontal line - COMPACT
    doc.setDrawColor(PDF_CONSTANTS.COLORS.LINE_GRAY[0], PDF_CONSTANTS.COLORS.LINE_GRAY[1], PDF_CONSTANTS.COLORS.LINE_GRAY[2]);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONSTANTS.PAGE.MARGIN_LEFT, currentY + 6, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, currentY + 6); // Reduced spacing
    
    // INVOICE Title (centered on the page, excluding blue stripe) - COMPACT
    const invoiceTitleY = currentY + 14; // Reduced spacing from 18
    doc.setFontSize(14); // Reduced from 16
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
    const invoiceText = 'INVOICE';
    const invoiceWidth = doc.getTextWidth(invoiceText);
    const centerX = (pageWidth - 10) / 2; // Center of page excluding blue stripe
    doc.text(invoiceText, centerX, invoiceTitleY, { align: 'center' });
    doc.line(centerX - invoiceWidth / 2, invoiceTitleY + 1, centerX + invoiceWidth / 2, invoiceTitleY + 1);
    
    // Customer Section - COMPACT
    const customerY = invoiceTitleY + 8; // Reduced spacing from 10
    doc.setFontSize(9); // Reduced from 10
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.text('TO:-', PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerY);
    
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    doc.setFontSize(8); // Reduced from 9
    
    let customerTextY = customerY + 5; // Reduced spacing from 6
    
    // Customer Name
    doc.text((invoiceData.customerName || '').toUpperCase(), PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerTextY);
    customerTextY += 4; // Reduced spacing from 5
    
    // Customer Address - wrap if too long
    if (invoiceData.customerAddress) {
      const maxAddressWidth = 90; // Maximum width for address
      const addressLines = doc.splitTextToSize((invoiceData.customerAddress || '').toUpperCase(), maxAddressWidth);
      addressLines.forEach((line, index) => {
        if (index < 2) { // Limit to 2 lines for address
          doc.text(line, PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerTextY);
          customerTextY += 4; // Reduced spacing from 5
        }
      });
    }
    
    // Customer City
    if (invoiceData.customerCity) {
      doc.text((invoiceData.customerCity || '').toUpperCase(), PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerTextY);
    }
    
    // Invoice Metadata (Right) - COMPACT
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.setFontSize(9); // Reduced from 10
    doc.text(`TAX INVOICE NO. :${invoiceData.invoiceNumber}`, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, customerY, { align: 'right' });
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    doc.text(`DATE :-${invoiceData.invoiceDate}`, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, customerY + 5, { align: 'right' }); // Reduced spacing from 6
    
    // Items Table - CENTERED on page - COMPACT spacing
    const tableStartY = customerY + 22; // Reduced spacing from 25
    const tableData = lineItems.map((item, index) => {
      const amount = calculateAmount(item.quantity, item.rate);
      return [
        (index + 1).toString().padStart(2, '0'),
        item.description || item.name,
        item.quantity.toString().padStart(2, '0'),
        item.deno || 'pieces',
        formatIndianNumber(item.rate),
        formatIndianNumber(amount)
      ];
    });
    
    // Add empty rows
    while (tableData.length < PDF_CONSTANTS.TABLE.MIN_ROWS) {
      tableData.push(['', '', '', '', '', '']);
    }
    
    // Calculate table width and center it
    const tableWidth = 180; // Total table width
    const tableMarginLeft = (pageWidth - 10 - tableWidth) / 2; // Center the table excluding blue stripe
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['SR.\nNO.', 'DESCRIPTION', 'QTY', 'DENO', 'RATE', 'AMOUNT']],
      body: tableData,
      foot: [
        ['', '', '', '', 'SUB TOTAL', formatIndianNumber(calculations.subtotal)],
        ['', '', '', '', `GST ${gstPercentage} %`, formatIndianNumber(calculations.totalGST)],
        ['', '', '', '', 'TOTAL', formatIndianNumber(calculations.grandTotal)],
        ['', '', '', '', 'Round off', formatIndianNumber(calculations.roundOff)],
        ['', '', '', '', 'GRAND TOTAL', formatIndianNumber(calculations.finalTotal)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        fontSize: PDF_CONSTANTS.FONTS.SIZE_BODY,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        fontSize: PDF_CONSTANTS.FONTS.SIZE_BODY,
        lineWidth: 0.5,
        lineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        cellPadding: 3,
        minCellHeight: 10
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        fontSize: PDF_CONSTANTS.FONTS.SIZE_BODY,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        halign: 'right',
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 25 }
      },
      margin: { left: tableMarginLeft, right: pageWidth - tableMarginLeft - tableWidth },
      tableLineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
      tableLineWidth: 0.5
    });
    
    let finalY = doc.lastAutoTable.finalY + 5;
    
    // Amount in words
    doc.setFontSize(PDF_CONSTANTS.FONTS.SIZE_BODY);
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    const amountWords = numberToWords(Math.round(parseFloat(calculations.finalTotal)));
    doc.text(`IN WORDS:- Rupees ${amountWords}.`, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    
    finalY += 8; // Reduced spacing
    
    // Bank Details - COMPACT - All on one line or split intelligently
    doc.setFontSize(8.5); // Smaller font
    doc.text(`Acc no. :- ${COMPANY_DETAILS.accountNo}`, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    finalY += 4; // Reduced spacing
    doc.text(`IFSC :- ${COMPANY_DETAILS.ifsc}`, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    finalY += 4; // Reduced spacing
    doc.text(COMPANY_DETAILS.bankName, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    
    // Footer divider line - FIXED at bottom
    const footerY = pageHeight - 25;
    doc.setDrawColor(PDF_CONSTANTS.COLORS.LINE_GRAY[0], PDF_CONSTANTS.COLORS.LINE_GRAY[1], PDF_CONSTANTS.COLORS.LINE_GRAY[2]);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONSTANTS.PAGE.MARGIN_LEFT, footerY, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, footerY);
    
    // Contact Footer - Load and use icon images (FIXED at bottom)
    doc.setFontSize(9);
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
    
    // Load icons
    const iconSize = 4;
    const iconY = footerY + 4;
    
    try {
      // Phone icon
      const phoneIcon = new Image();
      phoneIcon.src = '/icon-phone.jpg?' + new Date().getTime();
      await new Promise(resolve => {
        phoneIcon.onload = () => {
          doc.addImage(phoneIcon, 'JPEG', PDF_CONSTANTS.PAGE.MARGIN_LEFT, iconY, iconSize, iconSize);
          resolve();
        };
        phoneIcon.onerror = () => resolve();
        setTimeout(resolve, 1000);
      });
    } catch (err) {
      console.warn('Phone icon load error');
    }
    
    // Phone number text
    doc.text(COMPANY_DETAILS.phone, PDF_CONSTANTS.PAGE.MARGIN_LEFT + iconSize + 2, footerY + 7);
    
    try {
      // Email icon
      const emailIcon = new Image();
      emailIcon.src = '/icon-email.jpg?' + new Date().getTime();
      const emailX = 105;
      await new Promise(resolve => {
        emailIcon.onload = () => {
          doc.addImage(emailIcon, 'JPEG', emailX, iconY, iconSize, iconSize);
          resolve();
        };
        emailIcon.onerror = () => resolve();
        setTimeout(resolve, 1000);
      });
      
      // Email text in blue
      doc.setTextColor(0, 0, 255);
      doc.text(COMPANY_DETAILS.email, emailX + iconSize + 2, footerY + 7);
    } catch (err) {
      console.warn('Email icon load error');
    }
    
    try {
      // Location icon on second line
      const locationIcon = new Image();
      locationIcon.src = '/icon-location.jpg?' + new Date().getTime();
      await new Promise(resolve => {
        locationIcon.onload = () => {
          doc.addImage(locationIcon, 'JPEG', PDF_CONSTANTS.PAGE.MARGIN_LEFT, footerY + 11, iconSize, iconSize);
          resolve();
        };
        locationIcon.onerror = () => resolve();
        setTimeout(resolve, 1000);
      });
      
      // Address text
      doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
      doc.text(COMPANY_DETAILS.address, PDF_CONSTANTS.PAGE.MARGIN_LEFT + iconSize + 2, footerY + 14);
    } catch (err) {
      console.warn('Location icon load error');
    }
    
    // Blue diagonal accent (bottom right corner - matching reference image)
    doc.setFillColor(PDF_CONSTANTS.COLORS.PRIMARY_BLUE[0], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[1], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[2]);
    // Draw triangle in bottom right
    doc.triangle(pageWidth - 50, pageHeight, pageWidth - 10, pageHeight, pageWidth - 10, pageHeight - 40, 'F');
    
    // Save PDF
    const filename = `M-Marine-Invoice-${invoiceData.invoiceNumber.replace(/\//g, '-')}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}


/**
 * Generate Marine Quotation PDF
 * This is EXACTLY identical to generateMarineInvoicePDF but outputs "QUOTATION" instead of "INVOICE"
 */
export async function generateMarineQuotationPDF(quotationData, lineItems, calculations, gstPercentage) {
  console.log('generateMarineQuotationPDF called');
  console.log('Parameters received:', { quotationData, lineItems, calculations, gstPercentage });
  
  try {
    console.log('Validating quotation data...');
    validateInvoiceData(quotationData, lineItems, calculations);
    console.log('Validation passed');
  } catch (validationError) {
    console.error('Validation error:', validationError);
    alert(validationError.message);
    return;
  }

  try {
    console.log('Creating jsPDF instance...');
    const doc = new jsPDF();
    console.log('jsPDF instance created');
    
    const pageWidth = PDF_CONSTANTS.PAGE.WIDTH;
    const pageHeight = PDF_CONSTANTS.PAGE.HEIGHT;
    
    // Add blue vertical stripe on right edge
    doc.setFillColor(PDF_CONSTANTS.COLORS.PRIMARY_BLUE[0], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[1], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[2]);
    doc.rect(pageWidth - 10, 0, 10, pageHeight, 'F');
    
    // Add logo with proper async loading and error handling
    try {
      const logoImg = new Image();
      logoImg.crossOrigin = 'Anonymous';
      
      const logoLoaded = await new Promise((resolve) => {
        logoImg.onload = () => {
          console.log('Logo loaded successfully');
          resolve(true);
        };
        logoImg.onerror = (err) => {
          console.warn('Logo failed to load:', err);
          resolve(false);
        };
        
        // Try marine-logo.jpg first, fallback to logo.jpeg
        logoImg.src = '/marine-logo.jpg?' + new Date().getTime(); // Cache busting
        
        // Timeout after 3 seconds
        setTimeout(() => {
          console.warn('Logo loading timed out');
          resolve(false);
        }, 3000);
      });
      
      if (logoLoaded) {
        try {
          doc.addImage(logoImg, 'JPEG', PDF_CONSTANTS.LOGO.X, PDF_CONSTANTS.LOGO.Y, PDF_CONSTANTS.LOGO.WIDTH, PDF_CONSTANTS.LOGO.HEIGHT);
          console.log('Logo added to PDF');
        } catch (err) {
          console.error('Error adding logo to PDF:', err);
        }
      } else {
        console.warn('Continuing without logo');
      }
    } catch (err) {
      console.error('Logo loading error:', err);
    }
    
    // Company tagline (to the right of logo) - EXACTLY 3 LINES - COMPACT
    doc.setFontSize(8); // Reduced from 9
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_GRAY[0], PDF_CONSTANTS.COLORS.TEXT_GRAY[1], PDF_CONSTANTS.COLORS.TEXT_GRAY[2]);
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    
    // Manually split tagline into 3 lines for proper display
    const taglineLine1 = 'All Types Of Marine Engineering Solution, Engineering Turnkey Projects,';
    const taglineLine2 = 'Service In Mechanical, Electrical, Safety Items, Service In Mechanical';
    const taglineLine3 = '& IT Solution';
    
    let currentY = 16; // Start tagline right next to logo
    doc.text(taglineLine1, 60, currentY);
    currentY += 3.5; // Reduced spacing from 4
    doc.text(taglineLine2, 60, currentY);
    currentY += 3.5; // Reduced spacing from 4
    doc.text(taglineLine3, 60, currentY);
    currentY += 3.5; // Reduced spacing from 4
    
    // GSTIN Number (below tagline, to the right of logo) - COMPACT
    doc.setFontSize(9); // Reduced from 10
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
    doc.text(`GSTIN Number : ${COMPANY_DETAILS.gstin}`, 60, currentY + 2); // Reduced spacing
    
    // Horizontal line - COMPACT
    doc.setDrawColor(PDF_CONSTANTS.COLORS.LINE_GRAY[0], PDF_CONSTANTS.COLORS.LINE_GRAY[1], PDF_CONSTANTS.COLORS.LINE_GRAY[2]);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONSTANTS.PAGE.MARGIN_LEFT, currentY + 6, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, currentY + 6); // Reduced spacing
    
    // QUOTATION Title (centered on the page, excluding blue stripe) - COMPACT
    const quotationTitleY = currentY + 14; // Reduced spacing from 18
    doc.setFontSize(14); // Reduced from 16
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
    const quotationText = 'QUOTATION';
    const quotationWidth = doc.getTextWidth(quotationText);
    const centerX = (pageWidth - 10) / 2; // Center of page excluding blue stripe
    doc.text(quotationText, centerX, quotationTitleY, { align: 'center' });
    doc.line(centerX - quotationWidth / 2, quotationTitleY + 1, centerX + quotationWidth / 2, quotationTitleY + 1);
    
    // Customer Section - COMPACT
    const customerY = quotationTitleY + 8; // Reduced spacing from 10
    doc.setFontSize(9); // Reduced from 10
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.text('TO:-', PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerY);
    
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    doc.setFontSize(8); // Reduced from 9
    
    let customerTextY = customerY + 5; // Reduced spacing from 6
    
    // Customer Name
    doc.text((quotationData.customerName || '').toUpperCase(), PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerTextY);
    customerTextY += 4; // Reduced spacing from 5
    
    // Customer Address - wrap if too long
    if (quotationData.customerAddress) {
      const maxAddressWidth = 90; // Maximum width for address
      const addressLines = doc.splitTextToSize((quotationData.customerAddress || '').toUpperCase(), maxAddressWidth);
      addressLines.forEach((line, index) => {
        if (index < 2) { // Limit to 2 lines for address
          doc.text(line, PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerTextY);
          customerTextY += 4; // Reduced spacing from 5
        }
      });
    }
    
    // Customer City
    if (quotationData.customerCity) {
      doc.text((quotationData.customerCity || '').toUpperCase(), PDF_CONSTANTS.PAGE.MARGIN_LEFT, customerTextY);
    }
    
    // Quotation Metadata (Right) - COMPACT
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'bold');
    doc.setFontSize(9); // Reduced from 10
    doc.text(`TAX QUOTATION NO. :${quotationData.quotationNumber || quotationData.invoiceNumber}`, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, customerY, { align: 'right' });
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    doc.text(`DATE :-${quotationData.quotationDate || quotationData.invoiceDate}`, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, customerY + 5, { align: 'right' }); // Reduced spacing from 6
    
    // Items Table - CENTERED on page - COMPACT spacing
    const tableStartY = customerY + 22; // Reduced spacing from 25
    const tableData = lineItems.map((item, index) => {
      const amount = calculateAmount(item.quantity, item.rate);
      return [
        (index + 1).toString().padStart(2, '0'),
        item.description || item.name,
        item.quantity.toString().padStart(2, '0'),
        item.deno || 'pieces',
        formatIndianNumber(item.rate),
        formatIndianNumber(amount)
      ];
    });
    
    // Add empty rows
    while (tableData.length < PDF_CONSTANTS.TABLE.MIN_ROWS) {
      tableData.push(['', '', '', '', '', '']);
    }
    
    // Calculate table width and center it
    const tableWidth = 180; // Total table width
    const tableMarginLeft = (pageWidth - 10 - tableWidth) / 2; // Center the table excluding blue stripe
    
    autoTable(doc, {
      startY: tableStartY,
      head: [['SR.\nNO.', 'DESCRIPTION', 'QTY', 'DENO', 'RATE', 'AMOUNT']],
      body: tableData,
      foot: [
        ['', '', '', '', 'SUB TOTAL', formatIndianNumber(calculations.subtotal)],
        ['', '', '', '', `GST ${gstPercentage} %`, formatIndianNumber(calculations.totalGST)],
        ['', '', '', '', 'TOTAL', formatIndianNumber(calculations.grandTotal)],
        ['', '', '', '', 'Round off', formatIndianNumber(calculations.roundOff)],
        ['', '', '', '', 'GRAND TOTAL', formatIndianNumber(calculations.finalTotal)]
      ],
      theme: 'grid',
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        fontSize: PDF_CONSTANTS.FONTS.SIZE_BODY,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3
      },
      bodyStyles: {
        fillColor: [255, 255, 255],
        textColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        fontSize: PDF_CONSTANTS.FONTS.SIZE_BODY,
        lineWidth: 0.5,
        lineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        cellPadding: 3,
        minCellHeight: 10
      },
      footStyles: {
        fillColor: [255, 255, 255],
        textColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        fontSize: PDF_CONSTANTS.FONTS.SIZE_BODY,
        fontStyle: 'bold',
        lineWidth: 0.5,
        lineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
        halign: 'right',
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'left', cellWidth: 80 },
        2: { halign: 'center', cellWidth: 15 },
        3: { halign: 'center', cellWidth: 20 },
        4: { halign: 'right', cellWidth: 25 },
        5: { halign: 'right', cellWidth: 25 }
      },
      margin: { left: tableMarginLeft, right: pageWidth - tableMarginLeft - tableWidth },
      tableLineColor: PDF_CONSTANTS.COLORS.TEXT_BLACK,
      tableLineWidth: 0.5
    });
    
    let finalY = doc.lastAutoTable.finalY + 5;
    
    // Amount in words
    doc.setFontSize(PDF_CONSTANTS.FONTS.SIZE_BODY);
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    const amountWords = numberToWords(Math.round(parseFloat(calculations.finalTotal)));
    doc.text(`IN WORDS:- Rupees ${amountWords}.`, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    
    finalY += 8; // Reduced spacing
    
    // Bank Details - COMPACT - All on one line or split intelligently
    doc.setFontSize(8.5); // Smaller font
    doc.text(`Acc no. :- ${COMPANY_DETAILS.accountNo}`, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    finalY += 4; // Reduced spacing
    doc.text(`IFSC :- ${COMPANY_DETAILS.ifsc}`, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    finalY += 4; // Reduced spacing
    doc.text(COMPANY_DETAILS.bankName, PDF_CONSTANTS.PAGE.MARGIN_LEFT, finalY);
    
    // Footer divider line - FIXED at bottom
    const footerY = pageHeight - 25;
    doc.setDrawColor(PDF_CONSTANTS.COLORS.LINE_GRAY[0], PDF_CONSTANTS.COLORS.LINE_GRAY[1], PDF_CONSTANTS.COLORS.LINE_GRAY[2]);
    doc.setLineWidth(0.5);
    doc.line(PDF_CONSTANTS.PAGE.MARGIN_LEFT, footerY, pageWidth - PDF_CONSTANTS.PAGE.MARGIN_RIGHT - 10, footerY);
    
    // Contact Footer - Load and use icon images (FIXED at bottom)
    doc.setFontSize(9);
    doc.setFont(PDF_CONSTANTS.FONTS.FAMILY, 'normal');
    doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
    
    // Load icons
    const iconSize = 4;
    const iconY = footerY + 4;
    
    try {
      // Phone icon
      const phoneIcon = new Image();
      phoneIcon.src = '/icon-phone.jpg?' + new Date().getTime();
      await new Promise(resolve => {
        phoneIcon.onload = () => {
          doc.addImage(phoneIcon, 'JPEG', PDF_CONSTANTS.PAGE.MARGIN_LEFT, iconY, iconSize, iconSize);
          resolve();
        };
        phoneIcon.onerror = () => resolve();
        setTimeout(resolve, 1000);
      });
    } catch (err) {
      console.warn('Phone icon load error');
    }
    
    // Phone number text
    doc.text(COMPANY_DETAILS.phone, PDF_CONSTANTS.PAGE.MARGIN_LEFT + iconSize + 2, footerY + 7);
    
    try {
      // Email icon
      const emailIcon = new Image();
      emailIcon.src = '/icon-email.jpg?' + new Date().getTime();
      const emailX = 105;
      await new Promise(resolve => {
        emailIcon.onload = () => {
          doc.addImage(emailIcon, 'JPEG', emailX, iconY, iconSize, iconSize);
          resolve();
        };
        emailIcon.onerror = () => resolve();
        setTimeout(resolve, 1000);
      });
      
      // Email text in blue
      doc.setTextColor(0, 0, 255);
      doc.text(COMPANY_DETAILS.email, emailX + iconSize + 2, footerY + 7);
    } catch (err) {
      console.warn('Email icon load error');
    }
    
    try {
      // Location icon on second line
      const locationIcon = new Image();
      locationIcon.src = '/icon-location.jpg?' + new Date().getTime();
      await new Promise(resolve => {
        locationIcon.onload = () => {
          doc.addImage(locationIcon, 'JPEG', PDF_CONSTANTS.PAGE.MARGIN_LEFT, footerY + 11, iconSize, iconSize);
          resolve();
        };
        locationIcon.onerror = () => resolve();
        setTimeout(resolve, 1000);
      });
      
      // Address text
      doc.setTextColor(PDF_CONSTANTS.COLORS.TEXT_BLACK[0], PDF_CONSTANTS.COLORS.TEXT_BLACK[1], PDF_CONSTANTS.COLORS.TEXT_BLACK[2]);
      doc.text(COMPANY_DETAILS.address, PDF_CONSTANTS.PAGE.MARGIN_LEFT + iconSize + 2, footerY + 14);
    } catch (err) {
      console.warn('Location icon load error');
    }
    
    // Blue diagonal accent (bottom right corner - matching reference image)
    doc.setFillColor(PDF_CONSTANTS.COLORS.PRIMARY_BLUE[0], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[1], PDF_CONSTANTS.COLORS.PRIMARY_BLUE[2]);
    // Draw triangle in bottom right
    doc.triangle(pageWidth - 50, pageHeight, pageWidth - 10, pageHeight, pageWidth - 10, pageHeight - 40, 'F');
    
    // Save PDF
    const filename = `M-Marine-Quotation-${(quotationData.quotationNumber || quotationData.invoiceNumber).replace(/\//g, '-')}.pdf`;
    doc.save(filename);
    
  } catch (error) {
    console.error('PDF generation failed:', error);
    alert('Failed to generate PDF. Please try again.');
  }
}
