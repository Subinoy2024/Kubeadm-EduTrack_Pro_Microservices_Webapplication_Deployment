import { Router } from 'express';
import { Pool } from 'pg';
import { createChatController } from '../controllers/chat.controller.js';
import { authenticate } from '../middleware/auth.js';

export function createRoutes(pool: Pool, jwtSecret: string) {
  const router = Router();
  const controller = createChatController(pool);
  const auth = authenticate(jwtSecret);

  router.get('/suggestions', auth, controller.getSuggestedQuestions);

  router.get('/sessions', auth, controller.getSessions);
  router.post('/sessions', auth, controller.createSession);

  router.get('/sessions/:id', auth, controller.getSessionMessages);
  router.delete('/sessions/:id', auth, controller.deleteSession);

  router.post('/sessions/:id/messages', auth, controller.sendMessage);

  return router;
}
