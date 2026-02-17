import { FastifyRequest, FastifyReply } from 'fastify';
import { UserService } from '../services/userService';
import { AuthenticatedRequest } from '../middleware/auth';
import fs from 'fs/promises';
import path from 'path';
import { config } from '../config';

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
      const { email, phoneNumber, identifier, password } = request.body as any;

      const loginIdentifier = identifier || phoneNumber || email;
      if (!loginIdentifier || !password) {
        return reply.status(400).send({ error: 'Identifier and password are required' });
      }

      const user = await UserService.validateCredentialsWithIdentifier(loginIdentifier, password);

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

  static async uploadProfileImage(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const fileRequest = request as FastifyRequest & {
        file: () => Promise<{
          filename: string;
          mimetype: string;
          file: NodeJS.ReadableStream;
        }>;
      };

      const file = await fileRequest.file();
      if (!file) {
        return reply.status(400).send({ error: 'No file uploaded' });
      }

      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return reply.status(400).send({ error: 'Only JPG or PNG images are allowed' });
      }

      await fs.mkdir(config.upload.dir, { recursive: true });

      const safeName = file.filename.replace(/[^a-zA-Z0-9._-]/g, '_');
      const filename = `${request.user!.id}-${Date.now()}-${safeName}`;
      const filePath = path.join(config.upload.dir, filename);

      const chunks: Buffer[] = [];
      for await (const chunk of file.file) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }
      await fs.writeFile(filePath, Buffer.concat(chunks));

      const imageUrl = `/uploads/${filename}`;
      const user = await UserService.updateUser(request.user!.id, { profileImage: imageUrl });

      reply.send({ user, imageUrl });
    } catch (error) {
      console.error('Upload profile image error:', error);
      reply.status(500).send({ error: 'Failed to upload profile image' });
    }
  }
}
