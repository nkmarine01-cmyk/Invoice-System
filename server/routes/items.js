const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
  getItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/itemController');

// Apply auth middleware to all routes
router.use(authMiddleware);

router.route('/')
  .get(getItems)
  .post(createItem);

router.route('/:id')
  .get(getItem)
  .put(updateItem)
  .delete(deleteItem);

module.exports = router;
