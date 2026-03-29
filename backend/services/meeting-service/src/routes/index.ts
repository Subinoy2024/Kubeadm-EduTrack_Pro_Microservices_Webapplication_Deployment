import { Router } from 'express';
import { Pool } from 'pg';
import { createMeetingController } from '../controllers/meeting.controller';

// Import auth middleware
const { authenticate, authorize } = require('../middleware/auth');

export function createRoutes(pool: Pool) {
  const router = Router();
  const controller = createMeetingController(pool);

  router.get('/upcoming', authenticate, controller.getUpcomingMeetings);
  router.get('/stats/overview', authenticate, authorize('admin'), controller.getMeetingStats);

  router.get('/', authenticate, controller.getAllMeetings);
  router.post('/', authenticate, authorize('admin', 'teacher'), controller.createMeeting);

  router.get('/:id', authenticate, controller.getMeetingById);
  router.put('/:id', authenticate, authorize('admin', 'teacher'), controller.updateMeeting);
  router.delete('/:id', authenticate, authorize('admin'), controller.deleteMeeting);

  router.put('/:id/status', authenticate, authorize('admin', 'teacher'), controller.updateMeetingStatus);
  router.post('/:id/join', authenticate, controller.joinMeeting);
  router.post('/:id/leave', authenticate, controller.leaveMeeting);

  return router;
}