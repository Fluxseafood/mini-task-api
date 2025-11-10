const express = require('express');
const helmet = require('helmet');
const rateLimit = require('./middlewares/rateLimit');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskV1Routes = require('./routes/task.v1.routes');
const taskV2Routes = require('./routes/task.v2.routes');

const app = express();

app.use(helmet());
app.use(express.json());
app.use(rateLimit.global); // basic global limiter or route-specific

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskV1Routes);
app.use('/api/v2/tasks', taskV2Routes);

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Error handler (must be last)
app.use(errorHandler);

module.exports = app;
