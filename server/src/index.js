import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';
import medicineRoutes from './routes/medicine.routes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

// --- DEV-ONLY: fake authentication ---
// Remove this the moment real JWT auth exists.
// It lets us test role-gated routes before building the auth system.
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    const role = req.header('x-dev-role');
    if (role) {
      req.user = { _id: 'dev-user', role, email: 'dev@medfinder.dev' };
    }
  }
  next();
});

app.get('/api/health', (req, res) => {
  const dbStates = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: 'ok',
    service: 'medfinder-server',
    env: process.env.NODE_ENV || 'development',
    db: dbStates[mongoose.connection.readyState] || 'unknown',
    time: new Date().toISOString(),
  });
});

app.use('/api/medicines', medicineRoutes);

// --- Error handler ---
// Must be last. Express identifies error middleware by the 4-arg signature.
app.use((err, req, res, next) => {
  console.error('[medfinder] error:', err.message);

  if (err.name === 'ValidationError') {
    const fields = Object.keys(err.errors);
    return res.status(400).json({
      error: 'Validation failed',
      fields,
      details: err.message,
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Duplicate key',
      details: err.keyValue,
    });
  }

  res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`[medfinder] listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (err) {
    console.error('[medfinder] failed to start:', err.message);
    process.exit(1);
  }
}

start();