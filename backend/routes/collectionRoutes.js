const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const collectionController = require('../controllers/collectionController');

// All collection routes require authentication
router.use(authMiddleware);

// GET /api/collection
router.get('/', collectionController.getCollection);

// POST /api/collection
router.post('/', collectionController.addToCollection);

// PATCH /api/collection/:id  (also support PUT for frontend compatibility)
router.patch('/:id', collectionController.updateCollectionItem);
router.put('/:id', collectionController.updateCollectionItem);

// DELETE /api/collection/:id
router.delete('/:id', collectionController.deleteCollectionItem);

module.exports = router;
