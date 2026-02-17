import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../types';

export interface AuthenticatedRequest extends FastifyRequest {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const authenticate = async (
  request: AuthenticatedRequest,
  reply: FastifyReply
) => {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
};

export const authorize = (...roles: UserRole[]) => {
  return async (request: AuthenticatedRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }

    if (!roles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Forbidden: Insufficient permissions' });
    }
  };
};
