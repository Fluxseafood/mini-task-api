const jwt = require('jsonwebtoken');

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access-secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh-secret';
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRES_IN ? Number(process.env.ACCESS_TOKEN_EXPIRES_IN) : 900;
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRES_IN ? Number(process.env.REFRESH_TOKEN_EXPIRES_IN) : 604800;

function generateAccessToken(user) {
    const payload = {
        userId: user.id || user.userId,
        email: user.email,
        role: user.role,
        isPremium: Boolean(user.isPremium)
    };
    return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function verifyAccessToken(token) {
    return jwt.verify(token, ACCESS_SECRET);
}

function generateRefreshToken(user) {
    const payload = { userId: user.id || user.userId, tokenId: require('uuid').v4() };
    return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES });
}

function verifyRefreshToken(token) {
    return jwt.verify(token, REFRESH_SECRET);
}

module.exports = { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken };
