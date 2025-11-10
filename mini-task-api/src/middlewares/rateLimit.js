const rateLimit = require('express-rate-limit');

// Anonymous limiter
const anonymous = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Try again later' } }
});

// Authenticated user limiter (default)
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

// premium limiter (should be applied when user is premium)
const premiumLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
});

// A simple middleware to delegate limiter based on req.user
function dynamicRateLimit(req, res, next) {
    // If no auth header -> anonymous
    const auth = req.header('Authorization');
    if (!auth) return anonymous(req, res, next);

    // else apply userLimiter (for premium you'd plug this into auth middleware or check req.user)
    // For simplicity: userLimiter applied; premium users can be given premiumLimiter in routes
    return userLimiter(req, res, next);
}

module.exports = { anonymous, userLimiter, premiumLimiter, global: dynamicRateLimit };
