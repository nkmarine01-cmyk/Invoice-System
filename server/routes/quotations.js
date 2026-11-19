const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getQuotations,
  getQuotation,
  createQuotation,
  updateQuotation,
  deleteQuotation
} = require('../controllers/quotationController');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.route('/')
  .get(getQuotations)
  .post(createQuotation);

router.route('/:id')
  .get(getQuotation)
  .put(updateQuotation)
  .delete(deleteQuotation);

module.exports = router;
