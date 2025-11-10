const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const authenticate = require('../middlewares/authenticate');

// v2: add metadata to responses - we wrap list/get responses
router.get('/', authenticate, async (req, res, next) => {
    try {
        const tasks = await taskController.listTasks(req, res, next);
        // if listTasks returned via res, it already sent; but for clarity, let's call model directly:
        // For brevity we just call listTasks but adjust format
        const page = parseInt(req.query.page || '1', 10);
        const limit = parseInt(req.query.limit || '20', 10);
        const items = await require('../models/task.model').listTasks({}, page, limit, req.query.sort);
        return res.json({
            items,
            metadata: { page, limit, returned: items.length, version: 'v2' }
        });
    } catch (err) { next(err); }
});

// Mirror other endpoints to v1 but wrapped similarly if desired
router.post('/', authenticate, require('../middlewares/idempotency'), taskController.createTask);
router.get('/:id', authenticate, require('../middlewares/checkTaskAccess')('read'), async (req, res, next) => {
    try {
        const task = await require('../models/task.model').getTaskById(req.params.id);
        if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
        return res.json({ ...task, metadata: { version: 'v2', createdAt: task.createdAt, updatedAt: task.updatedAt } });
    } catch (err) { next(err); }
});

module.exports = router;
