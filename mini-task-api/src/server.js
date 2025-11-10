require('dotenv').config();
const app = require('./app');
const { initDb } = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await initDb(); // ensure DB connection before start
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
})();
