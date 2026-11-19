const Quotation = require('../models/Quotation');

// @desc    Get all quotations
// @route   GET /api/quotations
// @access  Public
exports.getQuotations = async (req, res) => {
  try {
    const quotations = await Quotation.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: quotations.length,
      data: quotations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Get single quotation
// @route   GET /api/quotations/:id
// @access  Public
exports.getQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id).populate('items.itemId');

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Create new quotation
// @route   POST /api/quotations
// @access  Public
exports.createQuotation = async (req, res) => {
  try {
    console.log('Received quotation creation request:', JSON.stringify(req.body, null, 2));
    
    const {
      quotationNumber,
      quotationDate,
      customer,
      items,
      calculations,
      gst,
      discount,
      discountType
    } = req.body;

    console.log('Customer data:', customer);
    console.log('Quotation items:', items);
    console.log('Calculations:', calculations);

    // Validation
    if (!quotationNumber) {
      console.log('Validation failed - missing quotation number');
      return res.status(400).json({
        success: false,
        error: 'Quotation number is required'
      });
    }
    
    if (!customer || !customer.name) {
      console.log('Validation failed - missing customer name');
      return res.status(400).json({
        success: false,
        error: 'Customer name is required'
      });
    }
    
    if (!customer.phoneNumber) {
      console.log('Validation failed - missing phone number');
      return res.status(400).json({
        success: false,
        error: 'Phone number is required'
      });
    }
    
    if (!customer.email) {
      console.log('Validation failed - missing email');
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customer.email)) {
      console.log('Validation failed - invalid email format');
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }
    
    if (!customer.billingAddress || customer.billingAddress.trim() === '' || customer.billingAddress === ', ') {
      console.log('Validation failed - missing billing address, value:', customer.billingAddress);
      return res.status(400).json({
        success: false,
        error: 'Billing address is required'
      });
    }

    if (!items || items.length === 0) {
      console.log('Validation failed - no items');
      return res.status(400).json({
        success: false,
        error: 'Please add at least one item to the quotation'
      });
    }

    if (!calculations) {
      console.log('Validation failed - no calculations');
      return res.status(400).json({
        success: false,
        error: 'Quotation calculations are required'
      });
    }

    // Check if quotation number already exists
    const existingQuotation = await Quotation.findOne({ quotationNumber });
    if (existingQuotation) {
      console.log('Validation failed - duplicate quotation number');
      return res.status(400).json({
        success: false,
        error: 'Quotation number already exists'
      });
    }

    // Create quotation
    const quotation = await Quotation.create({
      quotationNumber,
      quotationDate: quotationDate || Date.now(),
      customer,
      items,
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

    console.log('Quotation created successfully:', quotation._id);

    res.status(201).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    console.error('Quotation creation error:', error);
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

// @desc    Update quotation
// @route   PUT /api/quotations/:id
// @access  Public
exports.updateQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
      });
    }

    res.status(200).json({
      success: true,
      data: quotation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server Error: ' + error.message
    });
  }
};

// @desc    Delete quotation
// @route   DELETE /api/quotations/:id
// @access  Public
exports.deleteQuotation = async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        error: 'Quotation not found'
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
