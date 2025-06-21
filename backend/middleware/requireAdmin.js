// backend/middleware/requireAdmin.js
module.exports = function requireAdmin(req, res, next) {
    // your root admin's email is in ENV
    if (req.user.email !== process.env.ADMIN_EMAIL) {
      return res.status(403).json({
        success: false,
        message: 'Only the root admin can perform this action'
      });
    }
    next();
  };
  