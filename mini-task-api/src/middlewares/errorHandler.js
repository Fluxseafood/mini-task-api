module.exports = (err, req, res, next) => {
    console.error(err);
    const code = err.status || 500;
    const body = {
        error: {
            code: err.code || 'INTERNAL_ERROR',
            message: err.message || 'Internal server error',
            timestamp: new Date().toISOString(),
            path: req.originalUrl
        }
    };
    return res.status(code).json(body);
};
