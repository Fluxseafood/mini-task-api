const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/task.controller');
const authenticate = require('../middlewares/authenticate');
const checkTaskAccess = require('../middlewares/checkTaskAccess');
const idempotencyMw = require('../middlewares/idempotency');

router.post('/', authenticate, idempotencyMw, ctrl.createTask);
router.get('/', authenticate, ctrl.listTasks);
router.get('/:id', authenticate, checkTaskAccess('read'), ctrl.getTask);
router.put('/:id', authenticate, checkTaskAccess('write'), ctrl.putTask);
router.patch('/:id/status', authenticate, checkTaskAccess('write'), ctrl.patchStatus);
router.delete('/:id', authenticate, checkTaskAccess('write'), ctrl.deleteTask);

module.exports = router;
