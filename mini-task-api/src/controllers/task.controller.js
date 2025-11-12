const taskModel = require('../models/task.model');
const idempotencyModel = require('../models/idempotency.model');
const crypto = require('crypto');

function hashRequestBody(body) {
    return crypto.createHash('sha256').update(JSON.stringify(body)).digest('hex');
}

// helper สำหรับ v1: clean เฉพาะฟิลด์พื้นฐาน
function cleanTaskV1(task) {
    return {
        id: task.id,
        title: task.title,
        status: task.status
    };
}

// helper สำหรับ v2: clean + metadata
function cleanTaskV2(task) {
    return {
        id: task.id,
        title: task.title,
        status: task.status,
        metadata: {
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            version: 'v2'
        }
    };
}

async function createTask(req, res, next) {
    try {
        const idempotencyKey = req.header('Idempotency-Key');
        const { title, description, priority, assignedTo, isPublic } = req.body;

        // Validate required fields
        const errors = {};
        if (!title) errors.title = 'Title is required';
        if (priority && !['low', 'medium', 'high'].includes(priority)) errors.priority = 'Must be one of: low, medium, high';
        if (Object.keys(errors).length) {
            return res.status(400).json({
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Invalid input data',
                    details: errors,
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl
                }
            });
        }

        // Idempotency check
        if (idempotencyKey) {
            const stored = await idempotencyModel.getIdempotency(idempotencyKey);
            const requestHash = hashRequestBody(req.body);
            if (stored) {
                if (stored.requestHash === requestHash) {
                    const storedTask = JSON.parse(stored.responseBody);
                    return res.status(201).json(
                        req.version === 'v2' ? cleanTaskV2(storedTask) : cleanTaskV1(storedTask)
                    );
                } else {
                    return res.status(409).json({
                        error: {
                            code: 'CONFLICT',
                            message: 'Idempotency key used with different payload',
                            timestamp: new Date().toISOString(),
                            path: req.originalUrl
                        }
                    });
                }
            }
        }

        // Premium check
        if (priority === 'high' && !(req.user.isPremium || req.user.role === 'admin')) {
            return res.status(403).json({
                error: {
                    code: 'PREMIUM_REQUIRED',
                    message: 'High priority requires premium',
                    timestamp: new Date().toISOString(),
                    path: req.originalUrl
                }
            });
        }
        
        if (title === 'trigger500') {
            throw new Error('Manual internal server error for testing');
        }
        // Create task
        const task = await taskModel.createTask({
            title, description, priority, ownerId: req.user.userId, assignedTo, isPublic: isPublic ? 1 : 0
        });

        // Store idempotency key
        if (idempotencyKey) {
            const requestHash = hashRequestBody(req.body);
            await idempotencyModel.storeIdempotency(
                idempotencyKey,
                req.user.userId,
                requestHash,
                task,
                new Date(Date.now() + 24 * 60 * 60 * 1000)
            );
        }

        return res.status(201).json(req.version === 'v2' ? cleanTaskV2(task) : cleanTaskV1(task));

    } catch (err) {
        console.error('CREATE TASK ERROR:', err);  // log error
        return res.status(500).json({
            error: {
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong',
                details: err.message,
                timestamp: new Date().toISOString(),
                path: req.originalUrl
            }
        });
    }
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

    let tasks = await taskModel.listTasks(filters, page, limit, sort);

    tasks = tasks.map(task => req.version === 'v2' ? cleanTaskV2(task) : cleanTaskV1(task));

    return res.json(tasks);
}

async function getTask(req, res, next) {
    const task = await taskModel.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });

    return res.json(req.version === 'v2' ? cleanTaskV2(task) : cleanTaskV1(task));
}

async function putTask(req, res, next) {
    const fields = req.body;
    const updated = await taskModel.updateTask(req.params.id, fields);
    return res.json(req.version === 'v2' ? cleanTaskV2(updated) : cleanTaskV1(updated));
}

async function patchStatus(req, res, next) {
    const { status } = req.body;
    const allowed = ['pending', 'in_progress', 'completed'];
    if (!allowed.includes(status)) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Invalid status' } });

    const updated = await taskModel.updateTask(req.params.id, { status });
    return res.json(req.version === 'v2' ? cleanTaskV2(updated) : cleanTaskV1(updated));
}

async function deleteTask(req, res, next) {
    await taskModel.deleteTask(req.params.id);
    return res.json({ message: 'Deleted' });
}

module.exports = { createTask, listTasks, getTask, putTask, patchStatus, deleteTask };
