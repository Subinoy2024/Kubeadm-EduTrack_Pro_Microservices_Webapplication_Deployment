import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import * as controller from '../controllers/assignment.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Assignment CRUD ─────────────────────────
router.get('/', controller.getAllAssignments);
router.post('/', authorize('teacher', 'admin'), controller.createAssignment);
router.get('/:id', controller.getAssignmentById);
router.put('/:id', authorize('teacher', 'admin'), controller.updateAssignment);
router.delete('/:id', authorize('admin'), controller.deleteAssignment);

// ── Submissions ─────────────────────────────
router.post('/:id/submit', authorize('student'), controller.submitAssignment);
router.get('/:id/submissions', authorize('teacher', 'admin'), controller.getSubmissionsForAssignment);
router.put('/submissions/:id/grade', authorize('teacher', 'admin'), controller.gradeSubmission);

// ── Student's own submissions ───────────────
router.get('/my/submissions', authorize('student'), controller.getMySubmissions);

// ── Stats ───────────────────────────────────
router.get('/stats/overview', authorize('admin'), controller.getAssignmentStats);

export default router;
