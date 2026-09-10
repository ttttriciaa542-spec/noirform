import { Router } from 'express';
import { requireAuth } from '../auth';
import { UPLOAD_DIR, UPLOAD_BASE, jsonError } from '../config';
import * as path from 'path';
import * as fs from 'fs';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  },
  limits: { fileSize: 5 * 1024 * 1024 }
});

const router = Router();

router.post('/', requireAuth, upload.single('file'), async (req: any, res) => {
  try {
    if (!req.file) return jsonError(res, 'No file uploaded', 400);
    res.status(201).json({ url: `${UPLOAD_BASE}/${req.file.filename}`, filename: req.file.filename });
  } catch (e: any) {
    jsonError(res, e.message, 500);
  }
});

export default router;
