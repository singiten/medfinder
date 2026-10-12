import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'medfinder-server',
    env: process.env.NODE_ENV || 'development',
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[medfinder] listening on http://localhost:${PORT} (${process.env.NODE_ENV || 'development'})`);
});