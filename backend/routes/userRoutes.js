// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * GET /api/users
 * Query params:
 *   parentId (optional) – ObjectId of the parent; if missing, returns root users.
 */
router.get('/', async (req, res, next) => {
    try {
        const { parentId } = req.query;
        // Build filter: if parentId present (and non‑empty), use it, otherwise null
        const filter = parentId
            ? { parentId }
            : { parentId: null };

        // Find matching users, selecting only _id, email, role
        const users = await User.find(filter)
            .select('_id email role parentId')
            .sort({ email: 1 });

        res.json({ success: true, data: users });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
