import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password, firstName, lastName, phoneNumber, dateOfBirth, address } =
        request.body as any;

      const existingUser = await UserService.getUserByEmail(email);
      if (existingUser) {
        return reply.status(409).send({ error: 'Email already registered' });
      }

      const user = await UserService.createUser({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
        address,
      });

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      reply.status(201).send({ user, token });
    } catch (error) {
      console.error('Registration error:', error);
      reply.status(500).send({ error: 'Registration failed' });
    }
  }

  static async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const { email, password } = request.body as any;

      const user = await UserService.validateCredentials(email, password);

      if (!user) {
        return reply.status(401).send({ error: 'Invalid credentials' });
      }

      const token = request.server.jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      reply.send({ user, token });
    } catch (error) {
      console.error('Login error:', error);
      reply.status(500).send({ error: 'Login failed' });
    }
  }

  static async getProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const user = await UserService.getUserById(request.user!.id);

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      reply.send({ user });
    } catch (error) {
      console.error('Get profile error:', error);
      reply.status(500).send({ error: 'Failed to get profile' });
    }
  }

  static async updateProfile(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const updates = request.body as any;
      const userId = request.user!.id;

      const user = await UserService.updateUser(userId, updates);

      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }

      reply.send({ user });
    } catch (error) {
      console.error('Update profile error:', error);
      reply.status(500).send({ error: 'Failed to update profile' });
    }
  }
}
