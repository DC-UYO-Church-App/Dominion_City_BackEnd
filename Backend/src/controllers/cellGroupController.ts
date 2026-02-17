import { FastifyRequest, FastifyReply } from 'fastify';
import { CellGroupService } from '../services/cellGroupService';
import { AuthenticatedRequest } from '../middleware/auth';

export class CellGroupController {
  static async createCellGroup(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { name, leaderId, meetingDay, meetingTime, address, latitude, longitude } =
        request.body as any;

      const cellGroup = await CellGroupService.createCellGroup({
        name,
        leaderId,
        meetingDay,
        meetingTime,
        address,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
      });

      reply.status(201).send({ cellGroup });
    } catch (error) {
      console.error('Create cell group error:', error);
      reply.status(500).send({ error: 'Failed to create cell group' });
    }
  }

  static async getCellGroupById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const cellGroup = await CellGroupService.getCellGroupById(id);

      if (!cellGroup) {
        return reply.status(404).send({ error: 'Cell group not found' });
      }

      reply.send({ cellGroup });
    } catch (error) {
      console.error('Get cell group error:', error);
      reply.status(500).send({ error: 'Failed to get cell group' });
    }
  }

  static async getAllCellGroups(request: FastifyRequest, reply: FastifyReply) {
    try {
      const cellGroups = await CellGroupService.getAllCellGroups();

      reply.send({ cellGroups });
    } catch (error) {
      console.error('Get all cell groups error:', error);
      reply.status(500).send({ error: 'Failed to get cell groups' });
    }
  }

  static async getNearestCellGroups(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { latitude, longitude, limit } = request.query as any;

      if (!latitude || !longitude) {
        return reply.status(400).send({ error: 'Latitude and longitude required' });
      }

      const cellGroups = await CellGroupService.getNearestCellGroups(
        parseFloat(latitude),
        parseFloat(longitude),
        limit ? parseInt(limit, 10) : 5
      );

      reply.send({ cellGroups });
    } catch (error) {
      console.error('Get nearest cell groups error:', error);
      reply.status(500).send({ error: 'Failed to get nearest cell groups' });
    }
  }

  static async getCellGroupMembers(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const members = await CellGroupService.getCellGroupMembers(id);

      reply.send({ members, count: members.length });
    } catch (error) {
      console.error('Get cell group members error:', error);
      reply.status(500).send({ error: 'Failed to get cell group members' });
    }
  }

  static async updateCellGroup(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const updates = request.body as any;

      if (updates.latitude) updates.latitude = parseFloat(updates.latitude);
      if (updates.longitude) updates.longitude = parseFloat(updates.longitude);

      const cellGroup = await CellGroupService.updateCellGroup(id, updates);

      if (!cellGroup) {
        return reply.status(404).send({ error: 'Cell group not found' });
      }

      reply.send({ cellGroup });
    } catch (error) {
      console.error('Update cell group error:', error);
      reply.status(500).send({ error: 'Failed to update cell group' });
    }
  }

  static async deleteCellGroup(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const success = await CellGroupService.deleteCellGroup(id);

      if (!success) {
        return reply.status(404).send({ error: 'Cell group not found' });
      }

      reply.send({ message: 'Cell group deleted successfully' });
    } catch (error) {
      console.error('Delete cell group error:', error);
      reply.status(500).send({ error: 'Failed to delete cell group' });
    }
  }
}
