import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

export async function authRoutes(fastify: FastifyInstance) {
  // Public routes
  fastify.post('/register', AuthController.register);
  fastify.post('/login', AuthController.login);

  // Protected routes
  fastify.get('/profile', { onRequest: [authenticate] }, AuthController.getProfile);
  fastify.put('/profile', { onRequest: [authenticate] }, AuthController.updateProfile);
}
