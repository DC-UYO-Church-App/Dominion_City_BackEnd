import { FastifyInstance } from 'fastify';
import { BookController } from '../controllers/bookController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

export async function bookRoutes(fastify: FastifyInstance) {
  fastify.get('/', BookController.getAllBooks);
  fastify.get('/stats', BookController.getBookStats);
  fastify.get(
    '/sales',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BOOKSHOP_MANAGER)],
    },
    BookController.getBookSales
  );

  fastify.post(
    '/',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BOOKSHOP_MANAGER)],
    },
    BookController.createBook
  );

  fastify.put(
    '/:id',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BOOKSHOP_MANAGER)],
    },
    BookController.updateBook
  );

  fastify.delete(
    '/:id',
    {
      onRequest: [authenticate, authorize(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.BOOKSHOP_MANAGER)],
    },
    BookController.deleteBook
  );
}
