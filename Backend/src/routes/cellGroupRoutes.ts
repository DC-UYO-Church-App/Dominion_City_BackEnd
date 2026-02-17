import { FastifyInstance } from 'fastify';
import { CellGroupController } from '../controllers/cellGroupController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export async function cellGroupRoutes(fastify: FastifyInstance) {
  // All routes require authentication
  fastify.addHook('onRequest', authenticate);

  // View cell groups (all authenticated users)
  fastify.get('/', CellGroupController.getAllCellGroups);
  fastify.get('/nearest', CellGroupController.getNearestCellGroups);
  fastify.get('/:id', CellGroupController.getCellGroupById);
  fastify.get('/:id/members', CellGroupController.getCellGroupMembers);

  // Manage cell groups (admins and pastors only)
  fastify.post(
    '/',
    {
      onRequest: [authorize(UserRole.ADMIN, UserRole.PASTOR)],
    },
    CellGroupController.createCellGroup
  );

  fastify.put(
    '/:id',
    {
      onRequest: [authorize(UserRole.ADMIN, UserRole.PASTOR, UserRole.CELL_LEADER)],
    },
    CellGroupController.updateCellGroup
  );

  fastify.delete(
    '/:id',
    {
      onRequest: [authorize(UserRole.ADMIN, UserRole.PASTOR)],
    },
    CellGroupController.deleteCellGroup
  );
}
