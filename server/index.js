require('dotenv').config();

const connectDB = require('./config/database');
const buildApp = require('./app');

connectDB();
const app = buildApp();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Farm & Give server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown (Render sends SIGTERM on deploys)
process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});
