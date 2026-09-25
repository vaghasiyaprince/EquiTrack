const express = require('express');
const router = express.Router();
const { getDashboardData } = require('../controllers/stockController');

// GET /api/dashboard
router.get('/', getDashboardData);

module.exports = router;
