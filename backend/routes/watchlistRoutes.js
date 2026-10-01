const express = require('express');
const router = express.Router();
const {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getWatchlist);
router.post('/', protect, addToWatchlist);
router.delete('/:symbol', protect, removeFromWatchlist);

module.exports = router;