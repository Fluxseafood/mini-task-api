const bcrypt = require('bcrypt');
const { createUser, getUserByEmail, getUserById } = require('../models/user.model');
const jwtUtil = require('../utils/jwt');
const { v4: uuidv4 } = require('uuid');

const SALT_ROUNDS = 10;

async function register(req, res, next) {
    try {
        const { email, password, name } = req.body;
        const existing = await getUserByEmail(email);
        if (existing) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Email already used' } });

        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await createUser({ email, password: hashed, name });
        return res.status(201).json({ id: user.id, email: user.email, name: user.name });
    } catch (err) { next(err); }
}

async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const user = await getUserByEmail(email);
        if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid credentials' } });

        const accessToken = jwtUtil.generateAccessToken(user);
        const refreshToken = jwtUtil.generateRefreshToken(user);

        // You should store refresh tokens server-side for revocation in production (e.g. table)
        return res.json({ accessToken, refreshToken });
    } catch (err) { next(err); }
}

async function refresh(req, res, next) {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'refreshToken required' } });
        const payload = jwtUtil.verifyRefreshToken(refreshToken);
        // Optionally check tokenId in DB
        const user = await getUserById(payload.userId);
        if (!user) return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid token' } });
        const accessToken = jwtUtil.generateAccessToken(user);
        return res.json({ accessToken });
    } catch (err) {
        return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Invalid refresh token' } });
    }
}

async function logout(req, res, next) {
    // For demo: client should discard tokens. In production: blacklist refresh token server-side.
    return res.json({ message: 'Logged out' });
}

module.exports = { register, login, refresh, logout };
