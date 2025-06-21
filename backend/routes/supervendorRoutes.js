// backend/routes/supervendorRoutes.js
const express = require('express');
const { body, param } = require('express-validator');

const auth = require('../middleware/auth');
const requireRole = require('../middleware/requireRole');
const validate = require('../middleware/validate');
const ctrl = require('../controllers/supervendorController');

const router = express.Router();

// all routes under here require a valid token and supervendor role
router.use(auth, requireRole('supervendor'));

// list self+children
router.get('/users', ctrl.listMyTeam);

// update a member
router.patch(
  '/users/:id',
  [
    param('id','Invalid user id').isMongoId(),
    body('role','Role required').isIn(['subvendor','driver']),
    body('parentId','parentId required').isMongoId()
  ],
  validate,
  ctrl.updateMember
);

// delete a member
router.delete(
  '/users/:id',
  [ param('id','Invalid user id').isMongoId() ],
  validate,
  ctrl.deleteMember
);

module.exports = router;
