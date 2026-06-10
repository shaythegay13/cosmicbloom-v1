const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const gameRoutes = require('./routes/game');
const paymentRoutes = require('./routes/payments');
const charityRoutes = require('./routes/charity');

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(helmet({
  contentSecurityPolicy: false // the game client inlines canvas-drawn assets
}));

// Allowed origins: the hosted web client + Capacitor app schemes
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
  'capacitor://localhost',
  'https://localhost',
  'ionic://localhost'
].filter(Boolean);
app.use(cors({
  origin(origin, cb) {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, false);
  },
  credentials: true,
  exposedHeaders: ['X-Refreshed-Token']
}));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}
app.use(express.json({ limit: '400kb' })); // save snapshots cap at 300kb
app.use(express.urlencoded({ extended: true }));

// Rate limiting: tight on auth (credential stuffing), generous elsewhere
const rateLimit = require('express-rate-limit');
app.set('trust proxy', 1); // behind Render/Railway proxy
app.use('/api/auth', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
}));
app.use('/api', rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false
}));

// Serve the Vite build output (www) when present, otherwise the raw client
// directory. In development the client is served by Vite (npm run client:dev)
// with /api proxied to this server.
const builtClientDir = path.join(__dirname, '../www');
const clientDir = fs.existsSync(builtClientDir)
  ? builtClientDir
  : path.join(__dirname, '../client');
app.use(express.static(clientDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/charity', charityRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Farm & Give API is running' });
});

// Serve index.html for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Farm & Give server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
});
