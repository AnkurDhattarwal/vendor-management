// backend/middleware/errorHandler.js
function errorHandler(err, req, res, next) {
    console.error(err.stack);
    const status = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ success: false, message });
  }
  
  module.exports = { errorHandler };
  