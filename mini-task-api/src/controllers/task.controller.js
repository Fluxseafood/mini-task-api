const taskModel = require('../models/task.model');
const idempotencyModel = require('../models/idempotency.model');
const crypto = require('crypto');

function hashRequestBody(body) {
    return crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
}

async function createTask(req, res, next) {
    try {
        // Idempotency key handling: middleware already checked but we'll double-check
        const idempotencyKey = req.header('Idempotency-Key');
        if (idempotencyKey) {
            const stored = await idempotencyModel.getIdempotency(idempotencyKey);
            const requestHash = hashRequestBody(req.body);
            if (stored) {
                // same request?
                if (stored.requestHash === requestHash) {
                    // return stored response
                    return res.status(201).json(JSON.parse(stored.responseBody));
                } else {
                    return res.status(409).json({ error: { code: 'CONFLICT', message: 'Idempotency key used with different payload' } });
                }
            }
        }

        const { title, description, priority, assignedTo, isPublic } = req.body;

        // ABAC: if priority === 'high' ensure premium
        if (priority === 'high' && !(req.user.isPremium || req.user.role === 'admin')) {
            return res.status(403).json({ error: { code: 'PREMIUM_REQUIRED', message: 'High priority requires premium' } });
        }

        const task = await taskModel.createTask({
            title, description, priority, ownerId: req.user.userId, assignedTo, isPublic
        });

        if (idempotencyKey) {
            const requestHash = hashRequestBody(req.body);
            await idempotencyModel.storeIdempotency(idempotencyKey, req.user.userId, requestHash, task, new Date(Date.now() + 24 * 60 * 60 * 1000));
        }

        return res.status(201).json(task);
    } catch (err) { next(err); }
}

async function listTasks(req, res, next) {
    const filters = {};
    if (req.query.status) filters.status = req.query.status;
    if (req.query.priority) filters.priority = req.query.priority;
    if (req.query.assignedTo) filters.assignedTo = req.query.assignedTo;
    if (req.query.isPublic !== undefined) filters.isPublic = req.query.isPublic === 'true';

    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const sort = req.query.sort || 'createdAt:desc';

    const tasks = await taskModel.listTasks(filters, page, limit, sort);

    return res.json(tasks);
}

async function getTask(req, res, next) {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    return res.json(task);
}

async function putTask(req, res, next) {
    // Full replace (authorization checked in middleware)
    const fields = req.body;
    const updated = await taskModel.updateTask(req.params.id, fields);
    return res.json(updated);
}

async function patchStatus(req, res, next) {
    const { status } = req.body;
    const allowed = ['pending', 'in_progress', 'completed'];
    if (!allowed.includes(status)) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } });
    const updated = await taskModel.updateTask(req.params.id, { status });
    return res.json(updated);
}

async function deleteTask(req, res, next) {
    await taskModel.deleteTask(req.params.id);
    return res.json({ message: 'Deleted' });
}

module.exports = { createTask, listTasks, getTask, putTask, patchStatus, deleteTask };
