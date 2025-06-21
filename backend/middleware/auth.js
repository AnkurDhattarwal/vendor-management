// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function auth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ success:false, message:'No token provided' });

  const token = header.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // attach full user
    const user = await User.findById(payload.userId);
    if (!user)
      return res.status(401).json({ success:false, message:'Invalid token user' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success:false, message:'Token invalid or expired' });
  }
}

module.exports = auth;
