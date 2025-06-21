// backend/routes/adminRoutes.js
const express = require('express');
const { body, param } = require('express-validator');

const auth = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');
const validate = require('../middleware/validate');
const adminController = require('../controllers/adminController');

const router = express.Router();

// All routes under /api/admin are protected & admin‑only
router.use(auth, requireAdmin);

// 1. List all users (pending + approved)
router.get('/users', adminController.listUsers);

// 2. Update a user’s role & parentId
router.patch(
  '/users/:id',
  [
    param('id', 'Invalid user id').isMongoId(),
    body('role', 'Role is required').isIn(['supervendor','subvendor','driver']),
    body('parentId', 'parentId must be a valid user id').isMongoId()
  ],
  validate,
  adminController.updateUser
);

// 3. Delete a user
router.delete(
  '/users/:id',
  [ param('id','Invalid user id').isMongoId() ],
  validate,
  adminController.deleteUser
);

module.exports = router;
