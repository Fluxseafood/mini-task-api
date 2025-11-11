const express = require('express');
const router = express.Router();
const rateLimit = require('../middlewares/rateLimit');

router.get('/anonymous-test', rateLimit.anonymous, (req, res) => {
    res.json({ message: 'Anonymous request success' });
});

module.exports = router;
