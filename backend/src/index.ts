import express from 'express';
import cors from 'cors';
import { notificationRouter } from './routes/notifications';
import { emailRouter } from './routes/email';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/notifications', notificationRouter);
app.use('/api/email', emailRouter);

app.listen(PORT, () => {
  console.log(`[Server] Discipline Tracker API running on port ${PORT}`);
});
