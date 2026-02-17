import { FastifyRequest, FastifyReply } from 'fastify';

export const errorHandler = (
  error: Error,
  request: FastifyRequest,
  reply: FastifyReply
) => {
  console.error('Error:', error);

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return reply.status(401).send({
      error: 'Invalid token',
      message: error.message,
    });
  }

  if (error.name === 'TokenExpiredError') {
    return reply.status(401).send({
      error: 'Token expired',
      message: 'Please login again',
    });
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return reply.status(400).send({
      error: 'Validation error',
      message: error.message,
    });
  }

  // Database errors
  if (error.message.includes('duplicate key')) {
    return reply.status(409).send({
      error: 'Duplicate entry',
      message: 'Resource already exists',
    });
  }

  // Default error
  reply.status(500).send({
    error: 'Internal server error',
    message: error.message,
  });
};
