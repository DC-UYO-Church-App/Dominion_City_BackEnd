import { FastifyInstance } from 'fastify';
import { TitheController } from '../controllers/titheController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export async function titheRoutes(fastify: FastifyInstance) {
  // All tithe routes require authentication
  fastify.addHook('onRequest', authenticate);

  // Record tithe
  fastify.post('/', TitheController.recordTithe);

  // Get user's tithes
  fastify.get('/user/:userId', TitheController.getUserTithes);

  // Get tithe stats
  fastify.get('/user/:userId/stats', TitheController.getTitheStats);

  // Get tithe by receipt number
  fastify.get('/receipt/:receiptNumber', TitheController.getTitheByReceipt);
}
