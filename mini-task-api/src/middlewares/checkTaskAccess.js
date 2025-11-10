const taskModel = require('../models/task.model');

module.exports = (action) => {
    return async (req, res, next) => {
        const task = await taskModel.getTaskById(req.params.id);
        if (!task) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });

        const user = req.user;
        if (action === 'read') {
            if (task.isPublic || task.ownerId === Number(user.userId) || task.assignedTo === Number(user.userId) || user.role === 'admin') {
                return next();
            }
        } else if (action === 'write') {
            if (task.ownerId === Number(user.userId) || user.role === 'admin') {
                return next();
            }
        }
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    };
};
