import { FastifyInstance } from 'fastify';
import { AdminController } from '../controllers/adminController';
import { TeamController } from '../controllers/teamController';
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

  // Team management
  fastify.get(
    '/team',
    { onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)] },
    TeamController.listTeamMembers
  );

  fastify.post(
    '/team',
    { onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)] },
    TeamController.addTeamMember
  );

  fastify.put(
    '/team/:id',
    { onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)] },
    TeamController.updateTeamMember
  );

  fastify.delete(
    '/team/:id',
    { onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)] },
    TeamController.removeTeamMember
  );

  // User search (for add-member modal)
  fastify.get(
    '/users',
    { onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN)] },
    TeamController.listAllUsers
  );
}
