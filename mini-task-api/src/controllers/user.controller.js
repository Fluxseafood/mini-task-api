const { getUserById, updateUser, listUsers } = require('../models/user.model');

async function getMe(req, res, next) {
    const user = await getUserById(req.user.userId);
    if (!user) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
    // hide password
    delete user.password;
    return res.json(user);
}

async function putMe(req, res, next) {
    const fields = {};
    if (req.body.name !== undefined) fields.name = req.body.name;
    if (req.body.password !== undefined) fields.password = req.body.password; // hashed by middleware ideally
    const updated = await updateUser(req.user.userId, fields);
    delete updated.password;
    return res.json(updated);
}

async function deleteMe(req, res, next) {
    await updateUser(req.user.userId, { role: 'deleted' });
    return res.json({ message: 'Account deleted (soft)' });
}

async function listAllUsers(req, res, next) {
    const users = await listUsers(1000, 0);
    return res.json(users);
}

module.exports = { getMe, putMe, deleteMe, listAllUsers };
