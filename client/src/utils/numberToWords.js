/**
 * Converts a number to words using Indian numbering system
 * @param {number} num - The number to convert
 * @returns {string} The number in words with "Only" suffix
 */
export function numberToWords(num) {
  // Handle zero edge case
  if (num === 0) {
    return "Zero Only";
  }

  // Handle negative numbers by converting to positive
  const isNegative = num < 0;
  num = Math.abs(Math.floor(num));

  // Units (1-9)
  const units = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"
  ];

  // Teens (10-19)
  const teens = [
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen",
    "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];

  // Tens (20-90)
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty",
    "Sixty", "Seventy", "Eighty", "Ninety"
  ];

  /**
   * Converts numbers 1-99 to words
   * @param {number} n - Number between 1-99
   * @returns {string} The number in words
   */
  function convertTwoDigits(n) {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    
    const tenDigit = Math.floor(n / 10);
    const unitDigit = n % 10;
    
    return tens[tenDigit] + (unitDigit > 0 ? " " + units[unitDigit] : "");
  }

  /**
   * Converts numbers 1-999 to words (for hundreds place)
   * @param {number} n - Number between 1-999
   * @returns {string} The number in words
   */
  function convertThreeDigits(n) {
    if (n === 0) return "";
    
    const hundred = Math.floor(n / 100);
    const remainder = n % 100;
    
    let result = "";
    
    if (hundred > 0) {
      result = units[hundred] + " Hundred";
    }
    
    if (remainder > 0) {
      if (result !== "") result += " ";
      result += convertTwoDigits(remainder);
    }
    
    return result;
  }

  // Indian numbering system breakdown
  const crores = Math.floor(num / 10000000);
  num %= 10000000;
  
  const lakhs = Math.floor(num / 100000);
  num %= 100000;
  
  const thousands = Math.floor(num / 1000);
  num %= 1000;
  
  const hundreds = num;

  let result = "";

  // Crores (10,000,000+)
  if (crores > 0) {
    // Crores can be more than 99, so use convertThreeDigits for larger numbers
    if (crores < 100) {
      result += convertTwoDigits(crores) + " Crore";
    } else {
      result += convertThreeDigits(crores) + " Crore";
    }
    if (lakhs > 0 || thousands > 0 || hundreds > 0) {
      result += " ";
    }
  }

  // Lakhs (100,000+)
  if (lakhs > 0) {
    result += convertTwoDigits(lakhs) + " Lakh";
    if (thousands > 0 || hundreds > 0) {
      result += " ";
    }
  }

  // Thousands (1,000+)
  if (thousands > 0) {
    result += convertThreeDigits(thousands) + " Thousand";
    if (hundreds > 0) {
      result += " ";
    }
  }

  // Hundreds (1-999)
  if (hundreds > 0) {
    result += convertThreeDigits(hundreds);
  }

  // Handle negative prefix
  if (isNegative) {
    result = "Minus " + result;
  }

  // Append "Only" suffix
  return result.trim() + " Only";
}
