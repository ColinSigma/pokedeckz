const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// GET /api/cards — List/search cards (no auth)
router.get('/', cardController.getCards);

// GET /api/cards/:id — Get single card (no auth)
router.get('/:id', cardController.getCardById);

module.exports = router;
