import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'medfinder-server',
    time: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[medfinder] server listening on http://localhost:${PORT}`);
});