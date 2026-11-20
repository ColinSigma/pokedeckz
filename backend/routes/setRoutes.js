const express = require('express');
const router = express.Router();
const cardController = require('../controllers/cardController');

// GET /api/sets/series or /api/series — List authentic series / generations
router.get('/series', cardController.getSeries);

// GET /api/sets — List sets (no auth)
router.get('/', cardController.getSets);

// GET /api/sets/:id — Get single set (no auth)
router.get('/:id', cardController.getSetById);

module.exports = router;
