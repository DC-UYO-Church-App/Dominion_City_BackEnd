import { FastifyRequest, FastifyReply } from 'fastify';
import { SermonService } from '../services/sermonService';
import { AuthenticatedRequest } from '../middleware/auth';

export class SermonController {
  static async createSermon(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const {
        title,
        preacher,
        sermonDate,
        description,
        audioUrl,
        videoUrl,
        thumbnailUrl,
        category,
        duration,
      } = request.body as any;

      const sermon = await SermonService.createSermon({
        title,
        preacher,
        sermonDate: new Date(sermonDate),
        description,
        audioUrl,
        videoUrl,
        thumbnailUrl,
        category,
        duration: duration ? parseInt(duration, 10) : undefined,
        uploadedBy: request.user!.id,
      });

      reply.status(201).send({ sermon });
    } catch (error) {
      console.error('Create sermon error:', error);
      reply.status(500).send({ error: 'Failed to create sermon' });
    }
  }

  static async getSermonById(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const sermon = await SermonService.getSermonById(id);

      if (!sermon) {
        return reply.status(404).send({ error: 'Sermon not found' });
      }

      reply.send({ sermon });
    } catch (error) {
      console.error('Get sermon error:', error);
      reply.status(500).send({ error: 'Failed to get sermon' });
    }
  }

  static async getAllSermons(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { preacher, category, startDate, endDate, limit, offset } = request.query as any;

      const result = await SermonService.getAllSermons({
        preacher,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      reply.send(result);
    } catch (error) {
      console.error('Get all sermons error:', error);
      reply.status(500).send({ error: 'Failed to get sermons' });
    }
  }

  static async searchSermons(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { q } = request.query as any;

      if (!q) {
        return reply.status(400).send({ error: 'Search query required' });
      }

      const sermons = await SermonService.searchSermons(q);

      reply.send({ sermons });
    } catch (error) {
      console.error('Search sermons error:', error);
      reply.status(500).send({ error: 'Failed to search sermons' });
    }
  }

  static async updateSermon(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;
      const updates = request.body as any;

      if (updates.sermonDate) {
        updates.sermonDate = new Date(updates.sermonDate);
      }

      const sermon = await SermonService.updateSermon(id, updates);

      if (!sermon) {
        return reply.status(404).send({ error: 'Sermon not found' });
      }

      reply.send({ sermon });
    } catch (error) {
      console.error('Update sermon error:', error);
      reply.status(500).send({ error: 'Failed to update sermon' });
    }
  }

  static async deleteSermon(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as any;

      const success = await SermonService.deleteSermon(id);

      if (!success) {
        return reply.status(404).send({ error: 'Sermon not found' });
      }

      reply.send({ message: 'Sermon deleted successfully' });
    } catch (error) {
      console.error('Delete sermon error:', error);
      reply.status(500).send({ error: 'Failed to delete sermon' });
    }
  }
}
