const Invoice = require('../models/Invoice');

// @desc    Get all invoices
// @route   GET /api/invoices
// @access  Public
exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get single invoice
// @route   GET /api/invoices/:id
// @access  Public
exports.getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('items.itemId');

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Create new invoice
// @route   POST /api/invoices
// @access  Public
exports.createInvoice = async (req, res) => {
  try {
    console.log('Received invoice creation request:', JSON.stringify(req.body, null, 2));
    
    const {
      invoiceNumber,
      invoiceDate,
      // Support both old and new format
      customerName,
      phoneNumber,
      email,
      billingAddress,
      customerGstin,
      customer,
      lineItems,
      items,
      calculations,
      gst,
      discount,
      discountType
    } = req.body;

    // Use new format if available, otherwise fall back to old format
    const customerData = customer || {
      name: customerName,
      phoneNumber,
      email,
      billingAddress,
      gstin: customerGstin || ''
    };

    const invoiceItems = items || lineItems;

    console.log('Customer data:', customerData);
    console.log('Invoice items:', invoiceItems);
    console.log('Calculations:', calculations);

    // Validation
    if (!invoiceNumber) {
      console.log('Validation failed - missing invoice number');
      return res.status(400).json({
        success: false,
        error: 'Invoice number is required'
      });
    }
    
    if (!customerData.name) {
      console.log('Validation failed - missing customer name');
      return res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });
    }
    
    if (!customerData.phoneNumber) {
      console.log('Validation failed - missing phone number');
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    if (!customerData.email) {
      console.log('Validation failed - missing email');
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }
    
    if (!customerData.billingAddress || customerData.billingAddress.trim() === '' || customerData.billingAddress === ', ') {
      console.log('Validation failed - missing billing address, value:', customerData.billingAddress);
      return res.status(400).json({
        success: false,
        error: 'Billing address is required'
      });
    }

    if (!invoiceItems || invoiceItems.length === 0) {
      console.log('Validation failed - no items');
      return res.status(400).json({
        success: false,
        error: 'Please add at least one item to the invoice'
      });
    }

    if (!calculations) {
      console.log('Validation failed - no calculations');
      return res.status(400).json({
        success: false,
        error: 'Invoice calculations are required'
      });
    }

    // Check if invoice number already exists
    const existingInvoice = await Invoice.findOne({ invoiceNumber });
    if (existingInvoice) {
      console.log('Validation failed - duplicate invoice number');
      return res.status(400).json({
        success: false,
        error: 'Invoice number already exists'
      });
    }

    // Create invoice
    const invoice = await Invoice.create({
      invoiceNumber,
      invoiceDate: invoiceDate || Date.now(),
      customer: customerData,
      items: invoiceItems,
      calculations: {
        subtotal: parseFloat(calculations.subtotal) || 0,
        totalGST: parseFloat(calculations.totalGST) || 0,
        totalDiscount: parseFloat(calculations.totalDiscount) || 0,
        grandTotal: parseFloat(calculations.grandTotal) || 0
      },
      gst: parseFloat(gst) || 18,
      discount: parseFloat(discount) || 0,
      discountType: discountType || 'fixed'
    });

    console.log('Invoice created successfully:', invoice._id);

    res.status(201).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Invoice creation error:', error);
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      console.error('Validation error messages:', messages);
      return res.status(400).json({
        success: false,
        error: messages
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Update invoice
// @route   PUT /api/invoices/:id
// @access  Public
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: invoice
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Delete invoice
// @route   DELETE /api/invoices/:id
// @access  Public
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndDelete(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};
