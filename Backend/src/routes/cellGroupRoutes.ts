import { FastifyInstance } from 'fastify';
import { CellGroupController } from '../controllers/cellGroupController';
import { CellJoinRequestService } from '../services/cellJoinRequestService';
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

  // ── Join requests ────────────────────────────────────────────────────────

  // Member: send a join request for a specific cell group
  fastify.post('/:id/join-request', async (req, reply) => {
    try {
      const user = (req as any).user;
      const { id: cellGroupId } = req.params as { id: string };
      const joinRequest = await CellJoinRequestService.sendRequest(user.id, cellGroupId);
      reply.status(201).send({ joinRequest });
    } catch (err: any) {
      const status =
        err.code === 'ALREADY_IN_CELL' || err.code === 'PENDING_EXISTS' ? 409 : 500;
      reply.status(status).send({ error: err.message || 'Failed to send join request' });
    }
  });

  // Member: get their own pending request (if any)
  fastify.get('/join-requests/mine', async (req, reply) => {
    try {
      const user = (req as any).user;
      const joinRequest = await CellJoinRequestService.getMyRequest(user.id);
      reply.send({ joinRequest });
    } catch (err: any) {
      reply.status(500).send({ error: 'Failed to get join request' });
    }
  });

  // Cell leader: list pending requests for their cell group
  fastify.get('/:id/join-requests', async (req, reply) => {
    try {
      const user = (req as any).user;
      const { id: cellGroupId } = req.params as { id: string };

      // Verify the caller is actually the leader of this group
      const { query: dbQuery } = await import('../config/database');
      const cgRes = await dbQuery(`SELECT leader_id FROM cell_groups WHERE id = $1`, [cellGroupId]);
      if (cgRes.rows.length === 0) return reply.status(404).send({ error: 'Cell group not found' });
      if (cgRes.rows[0].leader_id !== user.id) {
        return reply.status(403).send({ error: 'Only the cell leader can view join requests' });
      }

      const requests = await CellJoinRequestService.getIncomingRequests(cellGroupId);
      reply.send({ requests });
    } catch (err: any) {
      reply.status(500).send({ error: 'Failed to get join requests' });
    }
  });

  // Cell leader: accept a join request
  fastify.put('/join-requests/:requestId/accept', async (req, reply) => {
    try {
      const user = (req as any).user;
      const { requestId } = req.params as { requestId: string };
      await CellJoinRequestService.acceptRequest(requestId, user.id);
      reply.send({ success: true });
    } catch (err: any) {
      const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'NOT_FOUND' ? 404 : 500;
      reply.status(status).send({ error: err.message || 'Failed to accept request' });
    }
  });

  // Cell leader: reject a join request
  fastify.put('/join-requests/:requestId/reject', async (req, reply) => {
    try {
      const user = (req as any).user;
      const { requestId } = req.params as { requestId: string };
      await CellJoinRequestService.rejectRequest(requestId, user.id);
      reply.send({ success: true });
    } catch (err: any) {
      const status = err.code === 'FORBIDDEN' ? 403 : err.code === 'NOT_FOUND' ? 404 : 500;
      reply.status(status).send({ error: err.message || 'Failed to reject request' });
    }
  });
}
