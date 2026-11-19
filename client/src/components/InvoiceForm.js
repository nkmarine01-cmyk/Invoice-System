import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_URL from '../config';
import { generateMarineInvoicePDF } from '../utils/pdfGenerator';
import PrintableInvoice from './PrintableInvoice';
import './InvoiceForm.css';

const InvoiceForm = () => {
  const [invoiceData, setInvoiceData] = useState({
    invoiceNumber: '',
    invoiceDate: '',
    customerName: '',
    customerAddress: '',
    customerCity: '',
    phoneNumber: '',
    email: '',
    gstin: '' // Added GSTIN field
  });

  const [availableItems, setAvailableItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [stagingItems, setStagingItems] = useState([]); // Items selected but not yet added to cart
  const [cartItems, setCartItems] = useState([]); // Items with qty, deno, rate
  const [gst, setGst] = useState(18); // GST percentage
  
  const [calculations, setCalculations] = useState({
    subtotal: 0,
    totalGST: 0,
    grandTotal: 0,
    roundOff: 0,
    finalTotal: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Company details
  const companyDetails = {
    name: 'M MARINE SERVICES',
    tagline: 'All Types Of Marine Engineering Solution, Engineering Turnkey Projects, Service In Mechanical, Electrical, Safety Items, Service In Mechanical & IT Solution',
    gstin: '29AAYFN4510A1Z8',
    accountNo: '0815073000000174',
    ifsc: 'SIBL0000815',
    bankName: 'SOUTH INDIAN BANK KARWAR',
    phone: '+91 8149332389 / 8762850701',
    email: 'naikvishal063@gmail.com',
    address: 'Off. 395 Gaonkarwada Near Ice Factory, Uttara Kannada Karnataka 581324'
  };

  // Fetch items from backend
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/items`);
        if (res.data.success) {
          setAvailableItems(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching items:', err);
      }
    };
    fetchItems();
  }, []);

  // Auto-generate invoice number and date
  useEffect(() => {
    const generateInvoiceNumber = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() * 100);
      return `-${random.toString().padStart(3, '0')}/${day}-${month}-${year}/${year % 100}NK`;
    };

    const getCurrentDate = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setInvoiceData(prev => ({
      ...prev,
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: getCurrentDate()
    }));
  }, []);

  // Calculate totals with round off
  useEffect(() => {
    let subtotal = 0;

    cartItems.forEach(cartItem => {
      subtotal += cartItem.rate * cartItem.quantity;
    });

    const gstAmount = (subtotal * parseFloat(gst)) / 100;
    const grandTotal = subtotal + gstAmount;
    const roundedTotal = Math.round(grandTotal);
    const roundOff = roundedTotal - grandTotal;

    setCalculations({
      subtotal: subtotal.toFixed(2),
      totalGST: gstAmount.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
      roundOff: roundOff.toFixed(2),
      finalTotal: roundedTotal.toFixed(2)
    });
  }, [cartItems, gst]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInvoiceData(prev => ({ ...prev, [name]: value }));
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Add item to staging area when selected from dropdown
  const handleSelectItem = (itemId) => {
    if (!itemId) return; // Empty selection
    
    const item = availableItems.find(i => i._id === itemId);
    const existingInStaging = stagingItems.find(i => i._id === itemId);
    const existingInCart = cartItems.find(i => i._id === itemId);

    if (existingInStaging) {
      alert('Item already in staging area');
      setSelectedItemId(''); // Reset dropdown
      return;
    }

    if (existingInCart) {
      alert('Item already added to summary. Please modify it there.');
      setSelectedItemId(''); // Reset dropdown
      return;
    }

    // Add to staging area
    setStagingItems([...stagingItems, {
      _id: item._id,
      description: item.name,
      quantity: 1,
      deno: 'pieces',
      rate: item.price
    }]);

    setSelectedItemId(''); // Reset dropdown
  };

  // Remove item from staging area
  const removeStagingItem = (itemId) => {
    setStagingItems(stagingItems.filter(item => item._id !== itemId));
  };

  // Update item in staging area
  const updateStagingItem = (itemId, field, value) => {
    setStagingItems(stagingItems.map(item =>
      item._id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Add all staging items to cart
  const handleAddAllToCart = () => {
    if (stagingItems.length === 0) {
      alert('No items in staging area to add');
      return;
    }

    setCartItems([...cartItems, ...stagingItems]);
    setStagingItems([]); // Clear staging area
  };

  // Update item in cart
  const updateCartItem = (itemId, field, value) => {
    setCartItems(cartItems.map(item =>
      item._id === itemId ? { ...item, [field]: value } : item
    ));
  };

  // Remove item from cart
  const removeItem = (itemId) => {
    setCartItems(cartItems.filter(item => item._id !== itemId));
  };

  // Convert number to words (Indian format)
  const numberToWords = (num) => {
    const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';

    const convertHundreds = (n) => {
      let str = '';
      if (n > 99) {
        str += units[Math.floor(n / 100)] + ' Hundred ';
        n %= 100;
      }
      if (n > 19) {
        str += tens[Math.floor(n / 10)] + ' ';
        n %= 10;
      }
      if (n > 9) {
        str += teens[n - 10] + ' ';
        return str;
      }
      if (n > 0) {
        str += units[n] + ' ';
      }
      return str;
    };

    let result = '';
    const crore = Math.floor(num / 10000000);
    num %= 10000000;
    const lakh = Math.floor(num / 100000);
    num %= 100000;
    const thousand = Math.floor(num / 1000);
    num %= 1000;
    const hundred = num;

    if (crore > 0) result += convertHundreds(crore) + 'Crore ';
    if (lakh > 0) result += convertHundreds(lakh) + 'Lakh ';
    if (thousand > 0) result += convertHundreds(thousand) + 'Thousand ';
    if (hundred > 0) result += convertHundreds(hundred);

    return result.trim() + ' Only';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (stagingItems.length > 0) {
      alert('You have items in the staging area. Please click "Add Items to Summary" button before saving the invoice.');
      return;
    }

    if (cartItems.length === 0) {
      alert('Please add at least one item to the invoice');
      return;
    }

    if (!validateEmail(invoiceData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      // Convert DD-MM-YYYY to ISO date format
      const convertDateToISO = (dateStr) => {
        const [day, month, year] = dateStr.split('-');
        return new Date(`${year}-${month}-${day}`).toISOString();
      };

      const invoicePayload = {
        invoiceNumber: invoiceData.invoiceNumber,
        invoiceDate: convertDateToISO(invoiceData.invoiceDate),
        customer: {
          name: invoiceData.customerName,
          phoneNumber: invoiceData.phoneNumber,
          email: invoiceData.email,
          billingAddress: [invoiceData.customerAddress, invoiceData.customerCity].filter(Boolean).join(', ') || 'N/A',
          gstin: invoiceData.gstin || ''
        },
        items: cartItems.map(item => ({
          itemId: item._id,
          itemName: item.description,
          price: item.rate,
          quantity: item.quantity,
          denomination: item.deno,
          gst: 0,
          discount: 0,
          discountType: 'percentage'
        })),
        calculations: {
          subtotal: parseFloat(calculations.subtotal),
          totalGST: parseFloat(calculations.totalGST),
          totalDiscount: 0,
          grandTotal: parseFloat(calculations.finalTotal)
        },
        gst: parseFloat(gst),
        discount: 0,
        discountType: 'fixed'
      };

      console.log('Sending invoice payload:', JSON.stringify(invoicePayload, null, 2));

      const res = await axios.post(`${API_URL}/api/invoices`, invoicePayload);

      if (res.data.success) {
        alert('Invoice saved successfully!');
        handleReset();
      }
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      let errorMessage = 'Failed to save invoice';
      
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // If it's an array of errors, show all of them
      if (Array.isArray(errorMessage)) {
        alert('Validation Errors:\n' + errorMessage.join('\n'));
      } else {
        alert('Error: ' + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const generateInvoiceNumber = () => {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const random = Math.floor(Math.random() + 100);
      return `-${random.toString().padStart(3, '0')}/${day}-${month}-${year}/${year % 100}NK`;
    };

    const getCurrentDate = () => {
      const today = new Date();
      const day = String(today.getDate()).padStart(2, '0');
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const year = today.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setInvoiceData({
      invoiceNumber: generateInvoiceNumber(),
      invoiceDate: getCurrentDate(),
      customerName: '',
      customerAddress: '',
      customerCity: '',
      phoneNumber: '',
      email: '',
      gstin: ''
    });
    setCartItems([]);
    setStagingItems([]);
    setSelectedItemId('');
    setGst(18);
    setTouched({});
  };

  const generatePDF = async () => {
    try {
      console.log('Starting PDF generation...');
      console.log('Invoice Data:', invoiceData);
      console.log('Cart Items:', cartItems);
      console.log('Calculations:', calculations);
      console.log('GST:', gst);
      await generateMarineInvoicePDF(invoiceData, cartItems, calculations, gst);
      console.log('PDF generation completed successfully');
    } catch (error) {
      console.error('PDF generation error:', error);
      console.error('Error stack:', error.stack);
      alert('PDF Error: ' + error.message);
    }
  };

  return (
    <div className="invoice-form-page">
      <div className="invoice-header-section marine-header">
        <h1>🚢 M MARINE SERVICES</h1>
        <p>Marine Engineering Solutions & Turnkey Projects</p>
      </div>

      <div className="invoice-form-container">
        {/* Left Side - Form */}
        <form onSubmit={handleSubmit} className="invoice-form marine-form">
          {/* Invoice Details */}
          <div className="form-section">
            <h3 className="section-title">Invoice Details</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Tax Invoice No. <span className="required">*</span></label>
                <input
                  type="text"
                  name="invoiceNumber"
                  value={invoiceData.invoiceNumber}
                  onChange={handleInputChange}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Date <span className="required">*</span></label>
                <input
                  type="text"
                  name="invoiceDate"
                  value={invoiceData.invoiceDate}
                  onChange={handleInputChange}
                  readOnly
                  className="readonly-input"
                />
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="form-section">
            <h3 className="section-title">TO:- Customer Details</h3>
            <div className="form-group">
              <label>Customer Name / Organization <span className="required">*</span></label>
              <input
                type="text"
                name="customerName"
                value={invoiceData.customerName}
                onChange={handleInputChange}
                onBlur={() => handleBlur('customerName')}
                placeholder="e.g., THE COMMANDING OFFICER / INS KADAMBA"
                className={touched.customerName && !invoiceData.customerName ? 'error' : ''}
                required
              />
            </div>

            <div className="form-group">
              <label>Address <span className="required">*</span></label>
              <input
                type="text"
                name="customerAddress"
                value={invoiceData.customerAddress}
                onChange={handleInputChange}
                placeholder="e.g., NAVAL BASE KARWAR"
                required
              />
            </div>

            <div className="form-group">
              <label>City / Location <span className="required">*</span></label>
              <input
                type="text"
                name="customerCity"
                value={invoiceData.customerCity}
                onChange={handleInputChange}
                placeholder="City"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number <span className="required">*</span></label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={invoiceData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="+91 XXXXXXXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email <span className="required">*</span></label>
                <input
                  type="email"
                  name="email"
                  value={invoiceData.email}
                  onChange={handleInputChange}
                  placeholder="email@example.com"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Customer GSTIN <span className="optional">(optional)</span></label>
              <input
                type="text"
                name="gstin"
                value={invoiceData.gstin}
                onChange={handleInputChange}
                placeholder="e.g., 29AAYFN4510A1Z8"
              />
            </div>
          </div>

          {/* Add Item Section */}
          <div className="form-section">
            <h3 className="section-title">Add Items / Services</h3>
            
            <div className="form-group">
              <label>Select Item <span className="required">*</span></label>
              <select
                value={selectedItemId}
                onChange={(e) => handleSelectItem(e.target.value)}
                className="item-select-dropdown"
              >
                <option value="">-- Select an item to add --</option>
                {availableItems.map(item => (
                  <option key={item._id} value={item._id}>
                    {item.name} - Rs. {item.price}
                  </option>
                ))}
              </select>
              <small className="form-hint">Item will be added to staging area automatically when selected</small>
            </div>

            {/* Staging Area */}
            {stagingItems.length > 0 && (
              <div className="staging-area">
                <div className="staging-header">
                  <h4>📦 Selected Items (Not added yet)</h4>
                  <span className="staging-count">{stagingItems.length} item{stagingItems.length > 1 ? 's' : ''}</span>
                </div>
                
                <div className="staging-items-list">
                  {stagingItems.map((item, index) => (
                    <div key={item._id} className="staging-item-card">
                      <div className="staging-item-number">{index + 1}</div>
                      <div className="staging-item-details">
                        <h5>{item.description}</h5>
                        <div className="staging-item-inputs">
                          <div className="staging-input-group">
                            <label>QTY</label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateStagingItem(item._id, 'quantity', parseInt(e.target.value) || 1)}
                              min="1"
                              className="staging-input"
                            />
                          </div>
                          <div className="staging-input-group">
                            <label>DENO</label>
                            <input
                              type="text"
                              value={item.deno}
                              onChange={(e) => updateStagingItem(item._id, 'deno', e.target.value)}
                              className="staging-input"
                              placeholder="pieces"
                            />
                          </div>
                          <div className="staging-input-group">
                            <label>RATE</label>
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateStagingItem(item._id, 'rate', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              className="staging-input"
                            />
                          </div>
                          <div className="staging-amount">
                            <label>Amount</label>
                            <div className="amount-value">Rs. {(item.rate * item.quantity).toFixed(2)}</div>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeStagingItem(item._id)}
                        className="btn-remove-staging"
                        title="Remove from selection"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddAllToCart}
                  className="btn-add-all-to-cart marine-btn-primary"
                >
                  ✓ Add {stagingItems.length} Item{stagingItems.length > 1 ? 's' : ''} to Summary
                </button>
              </div>
            )}
          </div>

          {/* Cart Items Summary */}
          <div className="form-section">
            <h3 className="section-title">Items Summary</h3>
            {cartItems.length === 0 ? (
              <div className="empty-cart">
                <p>No items added yet</p>
              </div>
            ) : (
              <div className="marine-table">
                <table>
                  <thead>
                    <tr>
                      <th>SR. NO.</th>
                      <th>DESCRIPTION</th>
                      <th>QTY</th>
                      <th>DENO</th>
                      <th>RATE</th>
                      <th>AMOUNT</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>{item.description}</td>
                        <td>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateCartItem(item._id, 'quantity', parseInt(e.target.value) || 1)}
                            min="1"
                            className="table-input"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            value={item.deno}
                            onChange={(e) => updateCartItem(item._id, 'deno', e.target.value)}
                            className="table-input"
                            placeholder="pieces"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateCartItem(item._id, 'rate', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                            className="table-input"
                          />
                        </td>
                        <td className="amount-cell">Rs. {(item.rate * item.quantity).toFixed(2)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() => removeItem(item._id)}
                            className="btn-remove-table"
                            title="Remove"
                          >
                            ×
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* GST */}
          <div className="form-section">
            <h3 className="section-title">GST Configuration</h3>
            <div className="form-row">
              <div className="form-group">
                <label>GST % <span className="required">*</span></label>
                <input
                  type="number"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  min="0"
                  max="100"
                  step="0.01"
                  required
                />
                <small className="form-hint">Standard GST is 18%</small>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn-secondary marine-btn-secondary"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="btn-preview marine-btn"
              disabled={cartItems.length === 0}
            >
              👁️ Preview Invoice
            </button>
            <button
              type="button"
              onClick={generatePDF}
              className="btn-download marine-btn-download"
              disabled={cartItems.length === 0 || loading}
            >
              📄 Download PDF
            </button>
            <button
              type="submit"
              className="btn-primary marine-btn-primary"
              disabled={cartItems.length === 0 || loading}
            >
              {loading ? 'Saving...' : '💾 Save Invoice'}
            </button>
          </div>
        </form>

        {/* Right Side - Preview */}
        <div className="invoice-preview marine-preview">
          <div className="preview-header marine-preview-header">
            <h3>📋 Invoice Preview</h3>
          </div>
          
          <div className="preview-section">
            <div className="preview-label">Tax Invoice No.:</div>
            <div className="preview-value">{invoiceData.invoiceNumber}</div>
          </div>

          <div className="preview-section">
            <div className="preview-label">Date:</div>
            <div className="preview-value">{invoiceData.invoiceDate}</div>
          </div>

          <div className="preview-divider"></div>

          <div className="preview-section">
            <div className="preview-label">TO:-</div>
            <div className="preview-value">{invoiceData.customerName || '-'}</div>
          </div>

          <div className="preview-section">
            <div className="preview-label">Address:</div>
            <div className="preview-value">
              {invoiceData.customerAddress || '-'}<br />
              {invoiceData.customerCity}
            </div>
          </div>

          <div className="preview-divider"></div>

          <div className="preview-section">
            <div className="preview-label">Items Count:</div>
            <div className="preview-value">{cartItems.length}</div>
          </div>

          <div className="preview-divider"></div>

          <div className="preview-calculations marine-calculations">
            <div className="calc-row">
              <span>SUB TOTAL:</span>
              <span>Rs. {calculations.subtotal}</span>
            </div>
            <div className="calc-row">
              <span>GST {gst}%:</span>
              <span>Rs. {calculations.totalGST}</span>
            </div>
            <div className="calc-row">
              <span>TOTAL:</span>
              <span>Rs. {calculations.grandTotal}</span>
            </div>
            <div className="calc-row">
              <span>Round off:</span>
              <span>Rs. {calculations.roundOff}</span>
            </div>
            <div className="calc-row grand-total marine-grand-total">
              <span>FINAL TOTAL:</span>
              <span>Rs. {calculations.finalTotal}</span>
            </div>
          </div>

          <div className="preview-divider"></div>

          <div className="preview-section">
            <div className="preview-label">Amount in Words:</div>
            <div className="preview-value amount-words">
              Rupees {numberToWords(Math.round(parseFloat(calculations.finalTotal)))}.
            </div>
          </div>

          <div className="preview-divider"></div>

          <div className="company-details">
            <h4>Bank Details:</h4>
            <p><strong>Acc No:</strong> {companyDetails.accountNo}</p>
            <p><strong>IFSC:</strong> {companyDetails.ifsc}</p>
            <p><strong>Bank:</strong> {companyDetails.bankName}</p>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="preview-modal" onClick={() => setShowPreview(false)}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <h2>Invoice Preview</h2>
              <div className="preview-modal-actions">
                <button 
                  onClick={() => window.print()} 
                  className="btn-print marine-btn-primary"
                >
                  🖨️ Print
                </button>
                <button 
                  onClick={() => setShowPreview(false)} 
                  className="btn-close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="preview-modal-body">
              <PrintableInvoice 
                invoiceData={invoiceData}
                cartItems={cartItems}
                calculations={calculations}
                gst={gst}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InvoiceForm;
