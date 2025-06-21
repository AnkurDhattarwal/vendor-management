// backend/middleware/requireRole.js
module.exports = function requireRole(role) {
    return (req, res, next) => {
      if (!req.user || req.user.role !== role) {
        return res.status(403).json({
          success: false,
          message: `You must have the "${role}" role to access this route.`
        });
      }
      next();
    };
  };
  