const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.route('/')
  .get(getInvoices)
  .post(createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(updateInvoice)
  .delete(deleteInvoice);

module.exports = router;
