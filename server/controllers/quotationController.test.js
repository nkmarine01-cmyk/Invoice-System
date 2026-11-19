const quotationController = require('./quotationController');
const Quotation = require('../models/Quotation');

// Mock the Quotation model
jest.mock('../models/Quotation');

describe('Quotation Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {
      params: {},
      body: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    jest.clearAllMocks();
  });

  describe('getQuotations', () => {
    it('should return all quotations sorted by createdAt descending with 200 status', async () => {
      const mockQuotations = [
        { quotationNumber: 'Q-001', createdAt: new Date('2024-01-02') },
        { quotationNumber: 'Q-002', createdAt: new Date('2024-01-01') }
      ];

      Quotation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockQuotations)
      });

      await quotationController.getQuotations(req, res);

      expect(Quotation.find).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        count: 2,
        data: mockQuotations
      });
    });

    it('should return 500 status on server error', async () => {
      const errorMessage = 'Database error';
      Quotation.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error(errorMessage))
      });

      await quotationController.getQuotations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: `Server Error: ${errorMessage}`
      });
    });
  });

  describe('getQuotation', () => {
    it('should return single quotation with 200 status', async () => {
      const mockQuotation = { _id: '123', quotationNumber: 'Q-001' };
      req.params.id = '123';

      Quotation.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(mockQuotation)
      });

      await quotationController.getQuotation(req, res);

      expect(Quotation.findById).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockQuotation
      });
    });

    it('should return 404 status when quotation not found', async () => {
      req.params.id = '123';

      Quotation.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue(null)
      });

      await quotationController.getQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Quotation not found'
      });
    });
  });

  describe('createQuotation', () => {
    it('should create quotation and return 201 status with valid data', async () => {
      const validQuotationData = {
        quotationNumber: 'Q-123/01-01-2024/24NK',
        quotationDate: new Date(),
        customer: {
          name: 'John Doe',
          phoneNumber: '1234567890',
          email: 'john@example.com',
          billingAddress: '123 Main St',
          gstin: ''
        },
        items: [
          { itemId: '1', itemName: 'Item 1', price: 100, quantity: 2 }
        ],
        calculations: {
          subtotal: 200,
          totalGST: 36,
          totalDiscount: 0,
          grandTotal: 236
        },
        gst: 18,
        discount: 0,
        discountType: 'fixed'
      };

      req.body = validQuotationData;

      const createdQuotation = { ...validQuotationData, _id: '123' };
      Quotation.findOne = jest.fn().mockResolvedValue(null); // No duplicate
      Quotation.create = jest.fn().mockResolvedValue(createdQuotation);

      await quotationController.createQuotation(req, res);

      expect(Quotation.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: createdQuotation
      });
    });

    it('should return 400 status when quotation number is missing', async () => {
      req.body = {
        customer: { name: 'John' },
        items: []
      };

      await quotationController.createQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Quotation number is required'
      });
    });

    it('should return 400 status when customer name is missing', async () => {
      req.body = {
        quotationNumber: 'Q-123',
        customer: { phoneNumber: '123' },
        items: []
      };

      await quotationController.createQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Customer name is required'
      });
    });

    it('should return 400 status when email format is invalid', async () => {
      req.body = {
        quotationNumber: 'Q-123',
        customer: {
          name: 'John',
          phoneNumber: '123',
          email: 'invalid-email',
          billingAddress: '123 Main St'
        },
        items: [{ itemId: '1' }],
        calculations: {}
      };

      await quotationController.createQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Please provide a valid email address'
      });
    });

    it('should return 400 status when no items provided', async () => {
      req.body = {
        quotationNumber: 'Q-123',
        customer: {
          name: 'John',
          phoneNumber: '123',
          email: 'john@example.com',
          billingAddress: '123 Main St'
        },
        items: [],
        calculations: {}
      };

      await quotationController.createQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Please add at least one item to the quotation'
      });
    });

    it('should return 400 status when duplicate quotation number exists', async () => {
      req.body = {
        quotationNumber: 'Q-123',
        customer: {
          name: 'John',
          phoneNumber: '123',
          email: 'john@example.com',
          billingAddress: '123 Main St'
        },
        items: [{ itemId: '1' }],
        calculations: { subtotal: 100 }
      };

      Quotation.findOne = jest.fn().mockResolvedValue({ quotationNumber: 'Q-123' });

      await quotationController.createQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Quotation number already exists'
      });
    });
  });

  describe('updateQuotation', () => {
    it('should update quotation and return 200 status', async () => {
      const updatedQuotation = { _id: '123', quotationNumber: 'Q-001' };
      req.params.id = '123';
      req.body = { quotationNumber: 'Q-001' };

      Quotation.findByIdAndUpdate = jest.fn().mockResolvedValue(updatedQuotation);

      await quotationController.updateQuotation(req, res);

      expect(Quotation.findByIdAndUpdate).toHaveBeenCalledWith(
        '123',
        req.body,
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: updatedQuotation
      });
    });

    it('should return 404 status when quotation not found', async () => {
      req.params.id = '123';
      req.body = {};

      Quotation.findByIdAndUpdate = jest.fn().mockResolvedValue(null);

      await quotationController.updateQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Quotation not found'
      });
    });
  });

  describe('deleteQuotation', () => {
    it('should delete quotation and return 200 status', async () => {
      const deletedQuotation = { _id: '123', quotationNumber: 'Q-001' };
      req.params.id = '123';

      Quotation.findByIdAndDelete = jest.fn().mockResolvedValue(deletedQuotation);

      await quotationController.deleteQuotation(req, res);

      expect(Quotation.findByIdAndDelete).toHaveBeenCalledWith('123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });

    it('should return 404 status when quotation not found', async () => {
      req.params.id = '123';

      Quotation.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      await quotationController.deleteQuotation(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'Quotation not found'
      });
    });
  });
});
