const crypto = require('crypto');
const { getIdempotency } = require('../models/idempotency.model');
const { cleanTaskV1, cleanTaskV2 } = require('../controllers/task.controller');

module.exports = async (req, res, next) => {
    const key = req.header('Idempotency-Key');
    if (!key) return next();

    try {
        const stored = await getIdempotency(key);
        if (stored) {
            const now = new Date();
            if (stored.expiresAt && new Date(stored.expiresAt) < now) return next();

            const storedTask = typeof stored.responseBody === 'string'
                ? JSON.parse(stored.responseBody)
                : stored.responseBody;

            const currentHash = crypto.createHash('sha256')
                .update(JSON.stringify(req.body))
                .digest('hex');

            if (stored.requestHash === currentHash) {
                return res.status(201).json(
                    req.version === 'v2' ? cleanTaskV2(storedTask) : cleanTaskV1(storedTask)
                );
            } else {
                return res.status(409).json({
                    error: {
                        code: 'CONFLICT',
                        message: 'Idempotency key used with different payload'
                    }
                });
            }
        }

        return next();
    } catch (err) {
        next(err);
    }
};
