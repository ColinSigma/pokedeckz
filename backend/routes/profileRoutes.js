const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const profileController = require('../controllers/profileController');

// All profile routes require authentication
router.use(authMiddleware);

// GET /api/profile
router.get('/', profileController.getProfile);

// PATCH /api/profile (and PUT for compatibility)
router.patch('/', profileController.updateProfile);
router.put('/', profileController.updateProfile);

module.exports = router;
