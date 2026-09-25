const express = require('express');
const router = express.Router();
const { getQuote } = require('../controllers/marketController');
const { searchStocks } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/quote/:symbol', protect, getQuote);
router.get('/search', protect, searchStocks);

module.exports = router;