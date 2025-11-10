const { getIdempotency } = require('../models/idempotency.model');

module.exports = async (req, res, next) => {
    const key = req.header('Idempotency-Key');
    if (!key) return next();

    try {
        const stored = await getIdempotency(key);
        if (stored) {
            // If stored, return the stored response body directly
            const now = new Date();
            if (stored.expiresAt && new Date(stored.expiresAt) < now) {
                // expired, continue
                return next();
            }
            // stored.responseBody is stringified
            return res.status(201).json(JSON.parse(stored.responseBody));
        }
        // otherwise proceed to controller which will store after creating the resource
        return next();
    } catch (err) { return next(err); }
};
