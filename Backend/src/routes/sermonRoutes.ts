import { FastifyInstance } from 'fastify';
import { SermonController } from '../controllers/sermonController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export async function sermonRoutes(fastify: FastifyInstance) {
  // Public routes (viewing sermons)
  fastify.get('/', SermonController.getAllSermons);
  fastify.get('/search', SermonController.searchSermons);
  fastify.get('/:id', SermonController.getSermonById);

  // Protected routes (creating/managing sermons - admins and pastors only)
  fastify.post(
    '/',
    {
      onRequest: [authenticate, authorize(UserRole.ADMIN, UserRole.PASTOR)],
    },
    SermonController.createSermon
  );

  fastify.put(
    '/:id',
    {
      onRequest: [authenticate, authorize(UserRole.ADMIN, UserRole.PASTOR)],
    },
    SermonController.updateSermon
  );

  fastify.delete(
    '/:id',
    {
      onRequest: [authenticate, authorize(UserRole.ADMIN, UserRole.PASTOR)],
    },
    SermonController.deleteSermon
  );
}
