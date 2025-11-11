const express = require('express');
const helmet = require('helmet');
const rateLimit = require('./middlewares/rateLimit');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const taskV1Routes = require('./routes/task.v1.routes');
const taskV2Routes = require('./routes/task.v2.routes');
const authenticate = require('./middlewares/authenticate');

const app = express();

app.use(helmet());
app.use(express.json()); 

const testRoutes = require('./routes/test.routes');
app.use('/api/test', testRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth routes (no auth required)
app.use('/api/v1/auth', rateLimit.anonymous, authRoutes);

// All routes below require authentication
app.use(authenticate);
app.use(rateLimit.global);

// User & task routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskV1Routes);
app.use('/api/v2/tasks', taskV2Routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found'
    }
  });
});

app.use(errorHandler);

module.exports = app;
