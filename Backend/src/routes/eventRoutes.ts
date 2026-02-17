import { FastifyInstance } from 'fastify';
import { EventController } from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export async function eventRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.get('/', EventController.getAllEvents);
  fastify.get('/:id', EventController.getEventById);

  // Protected routes (creating/managing events - admins and pastors only)
  fastify.post(
    '/',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PASTOR)],
    },
    EventController.createEvent
  );

  fastify.put(
    '/:id',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PASTOR)],
    },
    EventController.updateEvent
  );

  fastify.delete(
    '/:id',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.PASTOR)],
    },
    EventController.deleteEvent
  );
}
