/**
 * Global Express error handling middleware.
 * Returns consistent JSON error responses.
 */
function errorHandler(err, _req, res, _next) {
  console.error('Error:', err.message || err);

  // Supabase errors often include a status code
  const statusCode = err.status || err.statusCode || 500;

  // Handle specific error types
  if (err.code === '23505') {
    // Unique constraint violation (e.g. duplicate card in collection/wishlist)
    return res.status(409).json({
      success: false,
      error: 'Item already exists',
    });
  }

  if (err.code === 'PGRST116') {
    // Supabase: row not found on .single()
    return res.status(404).json({
      success: false,
      error: 'Resource not found',
    });
  }

  res.status(statusCode).json({
    success: false,
    error: err.message || 'Internal server error',
  });
}

module.exports = errorHandler;
