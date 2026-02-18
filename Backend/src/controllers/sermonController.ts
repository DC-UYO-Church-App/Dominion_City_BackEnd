import { FastifyRequest, FastifyReply } from 'fastify';
import { SermonService } from '../services/sermonService';
import { AuthenticatedRequest } from '../middleware/auth';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

export class SermonController {
  static async createSermon(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const isMultipart = (request as any).isMultipart?.() ?? false;
      let fields: Record<string, any> = {};
      let thumbnailUrl: string | undefined;
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg'];

      if (isMultipart) {
        const parts = (request as any).parts();
        for await (const part of parts) {
          if (part.type === 'file') {
            if (!part.mimetype || !allowedImageTypes.includes(part.mimetype)) {
              return reply.status(400).send({ error: 'Only JPG or PNG images are allowed' });
            }
            if (part.fieldname !== 'thumbnail' && part.fieldname !== 'image') {
              continue;
            }
            await fs.mkdir(config.upload.dir, { recursive: true });
            const safeName = part.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
            const filename = `${request.user!.id}-${Date.now()}-${safeName}`;
            const filePath = path.join(config.upload.dir, filename);
            const buffer = await part.toBuffer();
            await fs.writeFile(filePath, buffer);
            thumbnailUrl = `/uploads/${filename}`;
          } else {
            fields[part.fieldname] = part.value;
          }
        }
      } else {
        fields = request.body as any;
      }

      const {
        title,
        preacher,
        sermonDate,
        description,
        audioUrl,
        videoUrl,
        category,
        duration,
      } = fields;

      if (!title || !preacher) {
        return reply.status(400).send({ error: 'Title and preacher are required' });
      }

      const sermon = await SermonService.createSermon({
        title,
        preacher,
        sermonDate: sermonDate ? new Date(sermonDate) : new Date(),
        description,
        audioUrl,
        videoUrl,
        thumbnailUrl,
        category: category || 'general',
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
