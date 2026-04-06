import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

router.get('/ping', (_req, res) => {
  res.json({
    ok: true,
    service: 'facebook-clone-backend',
    time: Date.now()
  });
});

router.get('/stats', (_req, res) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsRoot = path.join(__dirname, '..', 'uploads');

  let files = 0;
  let folders = 0;
  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    folders += 1;
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, item.name);
      if (item.isDirectory()) walk(full);
      else files += 1;
    }
  };

  walk(uploadsRoot);

  res.json({ ok: true, files, folders });
});

export { router as adminRouter };
