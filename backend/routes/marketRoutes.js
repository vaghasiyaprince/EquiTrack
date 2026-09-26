const express = require('express');
const router = express.Router();
const { getQuote, getGainersLosers, getCandles } = require('../controllers/marketController');
const { searchStocks } = require('../controllers/searchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/quote/:symbol', protect, getQuote);
router.get('/search', protect, searchStocks);
router.get('/gainers-losers', protect, getGainersLosers);
router.get('/candles/:symbol', protect, getCandles);

module.exports = router;