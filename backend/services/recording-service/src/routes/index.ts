import { Router } from 'express';
import { authenticate, authorize, validateRequest } from '@edutrack/shared';
import { config } from '../config/index.js';
import {
  createRecording,
  getAllRecordings,
  getRecordingById,
  updateRecording,
  deleteRecording,
  searchRecordings,
  recordViewHandler,
  getRecordingStats,
  createRecordingSchema,
  updateRecordingSchema,
  recordViewSchema,
} from '../controllers/recording.controller.js';

const router = Router();
const auth = authenticate(config.jwtSecret);

// ─── Search (must be before /:id to avoid conflict) ───────────────────────────
router.get('/search', auth, searchRecordings);

// ─── Stats ────────────────────────────────────────────────────────────────────
router.get('/stats/overview', auth, authorize('admin'), getRecordingStats);

// ─── CRUD ─────────────────────────────────────────────────────────────────────
router.get('/', auth, getAllRecordings);
router.post('/', auth, authorize('teacher', 'admin'), validateRequest(createRecordingSchema), createRecording);

router.get('/:id', auth, getRecordingById);
router.put('/:id', auth, authorize('teacher', 'admin'), validateRequest(updateRecordingSchema), updateRecording);
router.delete('/:id', auth, authorize('admin'), deleteRecording);

// ─── Views ────────────────────────────────────────────────────────────────────
router.post('/:id/view', auth, authorize('student'), validateRequest(recordViewSchema), recordViewHandler);

export default router;
