const express = require('express');
const router = express.Router();
const { searchStocks, getCompanyDetails } = require('../controllers/stockController');

// GET /api/stocks/search?q=...
router.get('/search', searchStocks);

// GET /api/stocks/:symbol
router.get('/:symbol', getCompanyDetails);

module.exports = router;
