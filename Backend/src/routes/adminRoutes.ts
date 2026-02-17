import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export async function adminRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/stats',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)],
    },
    AdminController.getDashboardStats
  );
}
