import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadRouter } from './routes/upload.js';
import { aiRouter } from './routes/ai.js';
import { adminRouter } from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

const port = Number(process.env.PORT || 3001);
const uploadsDir = path.join(__dirname, 'uploads');

fs.mkdirSync(uploadsDir, { recursive: true });

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

app.use('/uploads', express.static(uploadsDir, {
  maxAge: '7d',
  fallthrough: true
}));

uploadRouter(app);
app.use('/api/ai', aiRouter);
app.use('/api/admin', adminRouter);

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'facebook-clone-backend',
    uploads: true,
    time: Date.now()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.path });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend is running on http://localhost:${port}`);
});
