/**
 * Quotation Number Generator Utility
 * 
 * Generates unique quotation numbers in the format: -XXX/DD-MM-YYYY/YYNK
 * where:
 * - XXX is a random 3-digit number (100-999)
 * - DD-MM-YYYY is the current date
 * - YY is the last two digits of the current year
 * 
 * @returns {string} A unique quotation number
 */
const generateQuotationNumber = () => {
  const now = new Date();
  
  // Get date components
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const yearLastTwoDigits = String(year).slice(-2);
  
  // Generate random 3-digit number between 100-999
  const randomNumber = Math.floor(Math.random() * 900) + 100;
  
  // Format: -XXX/DD-MM-YYYY/YYNK
  const quotationNumber = `-${randomNumber}/${day}-${month}-${year}/${yearLastTwoDigits}NK`;
  
  return quotationNumber;
};

module.exports = {
  generateQuotationNumber
};
