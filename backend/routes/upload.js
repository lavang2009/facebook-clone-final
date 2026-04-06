import fs from 'fs';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { requireUser } from '../middlewares/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');
const uploadsRoot = path.join(projectRoot, 'backend', 'uploads');
const tempRoot = path.join(uploadsRoot, '_tmp');

fs.mkdirSync(tempRoot, { recursive: true });

const safeSegment = (value = 'public') =>
  String(value)
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'public';

const safeFileName = (name = 'file') => {
  const ext = path.extname(name).toLowerCase();
  const base = path.basename(name, ext)
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base || 'file'}${ext}`;
};

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tempRoot),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${safeFileName(file.originalname)}`;
    cb(null, unique);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 1024
  }
});

function getBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
}

export const uploadRouter = (app) => {
  app.post('/api/upload', requireUser, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Chưa chọn tệp để tải lên.' });
      }

      const kind = safeSegment(req.body?.kind || 'post');
      const uid = safeSegment(req.user?.uid || req.body?.uid || 'public');
      const finalDir = path.join(uploadsRoot, kind, uid);
      await fs.promises.mkdir(finalDir, { recursive: true });

      const finalName = `${Date.now()}-${safeFileName(req.file.originalname)}`;
      const finalPath = path.join(finalDir, finalName);
      await fs.promises.rename(req.file.path, finalPath);

      const mediaType = req.file.mimetype.startsWith('video/')
        ? 'video'
        : req.file.mimetype.startsWith('image/')
          ? 'image'
          : 'file';

      const baseUrl = getBaseUrl(req);
      const url = `${baseUrl}/uploads/${encodeURIComponent(kind)}/${encodeURIComponent(uid)}/${encodeURIComponent(finalName)}`;

      return res.json({
        ok: true,
        url,
        mediaType,
        size: req.file.size,
        originalName: req.file.originalname,
        storedName: finalName,
        kind,
        uid
      });
    } catch (error) {
      console.error('Upload error:', error);
      if (req.file?.path) {
        try { await fs.promises.unlink(req.file.path); } catch (_) {}
      }
      return res.status(500).json({ error: error?.message || 'Upload thất bại.' });
    }
  });
};
