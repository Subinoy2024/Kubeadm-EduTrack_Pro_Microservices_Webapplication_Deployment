import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  unenrollStudent,
  getMyEnrollments,
  updateProgress,
  createLesson,
  updateLesson,
  deleteLesson,
  getLessons,
  getCourseStats,
} from '../controllers/course.controller.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Stats (admin only) - must be before /:id to avoid conflict
router.get('/stats/overview', authorize('admin'), getCourseStats);

// Student's own enrollments - must be before /:id to avoid conflict
router.get('/my/enrollments', getMyEnrollments);

// Course CRUD
router.get('/', getAllCourses);
router.post('/', authorize('teacher', 'admin'), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', authorize('admin'), deleteCourse);

// Enrollment
router.post('/:id/enroll', enrollStudent);
router.delete('/:id/enroll', unenrollStudent);

// Progress
router.put('/:id/progress', updateProgress);

// Lessons
router.get('/:id/lessons', getLessons);
router.post('/:id/lessons', authorize('teacher', 'admin'), createLesson);
router.put('/:courseId/lessons/:lessonId', authorize('teacher', 'admin'), updateLesson);
router.delete('/:courseId/lessons/:lessonId', authorize('teacher', 'admin'), deleteLesson);

export default router;
