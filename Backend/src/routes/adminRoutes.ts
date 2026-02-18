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

  fastify.post(
    '/bookshop-managers',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)],
    },
    AdminController.createBookshopManager
  );

  fastify.get(
    '/bookshop-managers',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)],
    },
    AdminController.listBookshopManagers
  );

  fastify.delete(
    '/bookshop-managers/:id',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)],
    },
    AdminController.deleteBookshopManager
  );
}
