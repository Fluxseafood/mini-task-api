module.exports = (roles = []) => {
    if (!Array.isArray(roles)) roles = [roles];
    return (req, res, next) => {
        if (!req.user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });
        if (!roles.length || roles.includes(req.user.role)) return next();
        return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Access denied' } });
    };
};
