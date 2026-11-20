const tcgdexService = require('../services/tcgdexService');

async function getCards(req, res, next) {
  try {
    const result = await tcgdexService.getCards(req.query);
    res.json({
      success: true,
      data: result.cards,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getCardById(req, res, next) {
  try {
    const card = await tcgdexService.getCardById(req.params.id);
    if (!card) {
      return res.status(404).json({ success: false, error: 'Card not found' });
    }
    res.json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
}

async function getSets(req, res, next) {
  try {
    const result = await tcgdexService.getSets(req.query);
    res.json({
      success: true,
      data: result.sets,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
}

async function getSetById(req, res, next) {
  try {
    const set = await tcgdexService.getSetById(req.params.id);
    if (!set) {
      return res.status(404).json({ success: false, error: 'Set not found' });
    }
    res.json({ success: true, data: set });
  } catch (error) {
    next(error);
  }
}

async function getSeries(req, res, next) {
  try {
    const series = await tcgdexService.getSeries();
    res.json({
      success: true,
      data: series,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCards, getCardById, getSets, getSetById, getSeries };
