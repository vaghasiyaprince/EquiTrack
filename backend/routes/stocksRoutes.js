const express = require('express');
const router = express.Router();
const { getStockDetails } = require('../controllers/stocksController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:symbol', protect, getStockDetails);

module.exports = router;