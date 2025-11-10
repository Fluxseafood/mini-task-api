const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');

router.get('/me', authenticate, ctrl.getMe);
router.put('/me', authenticate, ctrl.putMe);
router.delete('/me', authenticate, ctrl.deleteMe);

// Admin only
router.get('/', authenticate, authorize(['admin']), ctrl.listAllUsers);

module.exports = router;
