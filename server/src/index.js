import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import { connectDB } from './config/db.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStates = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  res.json({
    status: 'ok',
    service: 'medfinder-server',
    env: process.env.NODE_ENV || 'development',
    db: dbStates[dbState] || 'unknown',
    time: new Date().toISOString(),
  });
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