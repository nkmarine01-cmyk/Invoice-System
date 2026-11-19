/**
 * Calculation Engine Utility
 * 
 * Provides functions to compute quotation totals including:
 * - Subtotal from line items
 * - GST amount
 * - Grand total
 * - Final total (rounded)
 * - Round-off
 * 
 * All values are returned with 2 decimal places as specified in the design.
 */

/**
 * Calculate quotation totals from line items and GST percentage
 * 
 * @param {Array} lineItems - Array of line items with quantity and rate
 * @param {number} gstPercentage - GST percentage to apply (e.g., 18 for 18%)
 * @returns {Object} Object containing calculated values with 2 decimal places
 * 
 * @example
 * const items = [
 *   { quantity: 2, rate: 100 },
 *   { quantity: 1, rate: 50 }
 * ];
 * const result = calculateTotals(items, 18);
 * // Returns: {
 * //   subtotal: '250.00',
 * //   totalGST: '45.00',
 * //   grandTotal: '295.00',
 * //   roundOff: '0.00',
 * //   finalTotal: '295.00'
 * // }
 */
function calculateTotals(lineItems, gstPercentage) {
  // Validate inputs
  if (!Array.isArray(lineItems)) {
    throw new Error('lineItems must be an array');
  }
  
  if (typeof gstPercentage !== 'number' || gstPercentage < 0 || gstPercentage > 100) {
    throw new Error('gstPercentage must be a number between 0 and 100');
  }
  
  // Calculate subtotal: sum of (quantity × rate) for each item
  let subtotal = 0;
  lineItems.forEach(item => {
    if (typeof item.quantity !== 'number' || typeof item.rate !== 'number') {
      throw new Error('Each line item must have numeric quantity and rate');
    }
    subtotal += item.quantity * item.rate;
  });
  
  // Calculate GST amount: (subtotal × GST%) / 100
  const gstAmount = (subtotal * gstPercentage) / 100;
  
  // Calculate grand total: subtotal + GST amount
  const grandTotal = subtotal + gstAmount;
  
  // Calculate final total: rounded grand total
  const finalTotal = Math.round(grandTotal);
  
  // Calculate round-off: final total - grand total
  let roundOff = finalTotal - grandTotal;
  
  // Handle negative zero edge case
  if (Object.is(roundOff, -0)) {
    roundOff = 0;
  }
  
  // Return all values with 2 decimal places
  const result = {
    subtotal: subtotal.toFixed(2),
    totalGST: gstAmount.toFixed(2),
    grandTotal: grandTotal.toFixed(2),
    roundOff: roundOff.toFixed(2),
    finalTotal: finalTotal.toFixed(2)
  };
  
  // Fix negative zero string representation
  if (result.roundOff === '-0.00') {
    result.roundOff = '0.00';
  }
  
  return result;
}

module.exports = {
  calculateTotals
};
