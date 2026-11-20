require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const cardRoutes = require('./routes/cardRoutes');
const setRoutes = require('./routes/setRoutes');
const collectionRoutes = require('./routes/collectionRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const profileRoutes = require('./routes/profileRoutes');
const errorHandler = require('./utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());

// CORS - allow any origin in production or development
app.use(cors({
  origin: true,
  credentials: true,
}));

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', timestamp: new Date().toISOString() } });
});

// Routes
app.use('/api/cards', cardRoutes);
app.use('/api/sets', setRoutes);
app.use('/api/series', setRoutes);
app.use('/api/collection', collectionRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/profile', profileRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use(errorHandler);

// Only start standalone HTTP server when not running in serverless environment (like Vercel)
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Pokédeckz API running on port ${PORT}`);
  });
}

module.exports = app;
