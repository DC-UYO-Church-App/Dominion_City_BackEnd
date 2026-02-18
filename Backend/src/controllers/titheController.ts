import { FastifyRequest, FastifyReply } from 'fastify';
import { TitheService } from '../services/titheService';
import { AuthenticatedRequest } from '../middleware/auth';
import { TitheFrequency } from '../types';

export class TitheController {
  static async recordTithe(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { userId, amount, frequency, paymentDate, paymentMethod, notes } = request.body as any;

      if (!userId || amount === undefined || !frequency || !paymentMethod) {
        return reply.status(400).send({ error: 'User ID, amount, frequency, and payment method are required' });
      }

      const tithe = await TitheService.recordTithe({
        userId,
        amount: parseFloat(amount),
        frequency: frequency as TitheFrequency,
        paymentDate: new Date(paymentDate || Date.now()),
        paymentMethod,
        notes,
      });

      reply.status(201).send({ tithe });
    } catch (error) {
      console.error('Record tithe error:', error);
      reply.status(500).send({ error: 'Failed to record tithe' });
    }
  }

  static async getUserTithes(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as any;
      const { startDate, endDate } = request.query as any;

      const tithes = await TitheService.getTithesByUser(
        userId,
        startDate ? new Date(startDate) : undefined,
        endDate ? new Date(endDate) : undefined
      );

      reply.send({ tithes });
    } catch (error) {
      console.error('Get user tithes error:', error);
      reply.status(500).send({ error: 'Failed to get tithes' });
    }
  }

  static async getTitheByReceipt(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { receiptNumber } = request.params as any;

      const tithe = await TitheService.getTitheByReceipt(receiptNumber);

      if (!tithe) {
        return reply.status(404).send({ error: 'Receipt not found' });
      }

      reply.send({ tithe });
    } catch (error) {
      console.error('Get tithe by receipt error:', error);
      reply.status(500).send({ error: 'Failed to get tithe' });
    }
  }

  static async getTitheStats(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { userId } = request.params as any;

      const stats = await TitheService.getTitheStats(userId);

      reply.send({ stats });
    } catch (error) {
      console.error('Get tithe stats error:', error);
      reply.status(500).send({ error: 'Failed to get tithe stats' });
    }
  }
}
