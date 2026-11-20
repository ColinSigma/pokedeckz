const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const wishlistController = require('../controllers/wishlistController');

// All wishlist routes require authentication
router.use(authMiddleware);

// GET /api/wishlist
router.get('/', wishlistController.getWishlist);

// POST /api/wishlist
router.post('/', wishlistController.addToWishlist);

// DELETE /api/wishlist/:id
router.delete('/:id', wishlistController.removeFromWishlist);

module.exports = router;
