const rateLimit = require('express-rate-limit');

// Anonymous limiter
const anonymous = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 20,
    standardHeaders: true, // ใส่ X-RateLimit-* headers
    legacyHeaders: false,  // ปิด X-RateLimit-Legacy
    handler: (req, res) => {
        const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // วินาที
        res.status(429).json({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Try again later',
                retryAfter // จำนวนวินาทีที่ต้องรอ
            }
        });
    }
});

// Authenticated user limiter (default)
const userLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 100,
    standardHeaders: true, // ใส่ X-RateLimit-* headers
    legacyHeaders: false,  // ปิด X-RateLimit-Legacy
    handler: (req, res) => {
        const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // วินาที
        res.status(429).json({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Try again later',
                retryAfter // จำนวนวินาทีที่ต้องรอ
            }
        });
    }
});

// premium limiter (should be applied when user is premium)
const premiumLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 นาที
    max: 500,
    standardHeaders: true, // ใส่ X-RateLimit-* headers
    legacyHeaders: false,  // ปิด X-RateLimit-Legacy
    handler: (req, res) => {
        const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // วินาที
        res.status(429).json({
            error: {
                code: 'RATE_LIMIT_EXCEEDED',
                message: 'Too many requests. Try again later',
                retryAfter // จำนวนวินาทีที่ต้องรอ
            }
        });
    }
});

// A simple middleware to delegate limiter based on req.user
function dynamicRateLimit(req, res, next) {
    // ถ้าไม่มี token -> anonymous
    if (!req.user) return anonymous(req, res, next);

    // ตรวจสอบ premium
    if (req.user.isPremium) return premiumLimiter(req, res, next);

    // default user
    return userLimiter(req, res, next);
}


module.exports = { anonymous, userLimiter, premiumLimiter, global: dynamicRateLimit };
