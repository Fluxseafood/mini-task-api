const jwtUtil = require('../utils/jwt');

module.exports = (req, res, next) => {
    const auth = req.header('Authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Missing token' } });
    }
    const token = auth.slice(7);
    try {
        const payload = jwtUtil.verifyAccessToken(token);
        req.user = payload; // should include userId, email, role, isPremium
        next();
    } catch (err) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token' } });
    }
};
