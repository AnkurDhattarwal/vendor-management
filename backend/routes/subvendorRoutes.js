const express = require('express');
const router = express.Router();
const SubvendorController = require('../controllers/subvendorController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Only subvendors allowed
router.get('/users', SubvendorController.listMyDrivers);
router.delete('/users/:id', SubvendorController.deleteDriver);

module.exports = router;
