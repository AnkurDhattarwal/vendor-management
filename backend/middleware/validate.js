// backend/middleware/validate.js
const { validationResult } = require('express-validator');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // return first error message
    const msg = errors.array()[0].msg;
    return res.status(400).json({ success: false, message: msg });
  }
  next();
}

module.exports = validate;
