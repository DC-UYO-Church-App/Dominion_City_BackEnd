import { FastifyReply } from 'fastify';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export class TeamController {
  // GET /api/admin/team — list all team members with user details
  static async listTeamMembers(_request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const result = await query(
        `SELECT
           tm.id,
           tm.user_id,
           tm.roles,
           tm.created_at,
           u.first_name,
           u.last_name,
           u.email,
           u.phone_number,
           u.profile_image
         FROM team_members tm
         JOIN users u ON u.id = tm.user_id
         ORDER BY u.first_name, u.last_name`
      );

      const members = result.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
        profileImage: row.profile_image,
        roles: row.roles || [],
        createdAt: row.created_at,
      }));

      reply.send({ members });
    } catch (error) {
      console.error('List team members error:', error);
      reply.status(500).send({ error: 'Failed to fetch team members' });
    }
  }

  // POST /api/admin/team — add a user as a team member
  static async addTeamMember(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { userId, roles } = request.body as { userId: string; roles: any[] };
      const addedBy = request.user?.id;

      if (!userId) {
        return reply.status(400).send({ error: 'userId is required' });
      }
      if (!Array.isArray(roles) || roles.length === 0) {
        return reply.status(400).send({ error: 'At least one role is required' });
      }

      // Validate each role
      const validTypes = ['pastor', 'cell_leader', 'department_leader'];
      for (const role of roles) {
        if (!validTypes.includes(role.type)) {
          return reply.status(400).send({ error: `Invalid role type: ${role.type}` });
        }
        if ((role.type === 'cell_leader' || role.type === 'department_leader') && !role.detail?.trim()) {
          return reply.status(400).send({ error: `Role "${role.type}" requires a detail (name)` });
        }
      }

      // Check user exists
      const userCheck = await query(`SELECT id FROM users WHERE id = $1 AND is_active = true`, [userId]);
      if (userCheck.rowCount === 0) {
        return reply.status(404).send({ error: 'User not found' });
      }

      const result = await query(
        `INSERT INTO team_members (user_id, roles, added_by)
         VALUES ($1, $2::jsonb, $3)
         ON CONFLICT (user_id) DO UPDATE SET roles = $2::jsonb, updated_at = NOW()
         RETURNING id`,
        [userId, JSON.stringify(roles), addedBy || null]
      );

      reply.status(201).send({ id: result.rows[0].id, message: 'Team member added' });
    } catch (error) {
      console.error('Add team member error:', error);
      reply.status(500).send({ error: 'Failed to add team member' });
    }
  }

  // PUT /api/admin/team/:id — update roles for a team member
  static async updateTeamMember(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };
      const { roles } = request.body as { roles: any[] };

      if (!Array.isArray(roles) || roles.length === 0) {
        return reply.status(400).send({ error: 'At least one role is required' });
      }

      const validTypes = ['pastor', 'cell_leader', 'department_leader'];
      for (const role of roles) {
        if (!validTypes.includes(role.type)) {
          return reply.status(400).send({ error: `Invalid role type: ${role.type}` });
        }
        if ((role.type === 'cell_leader' || role.type === 'department_leader') && !role.detail?.trim()) {
          return reply.status(400).send({ error: `Role "${role.type}" requires a detail (name)` });
        }
      }

      const result = await query(
        `UPDATE team_members SET roles = $1::jsonb, updated_at = NOW() WHERE id = $2 RETURNING id`,
        [JSON.stringify(roles), id]
      );

      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Team member not found' });
      }

      reply.send({ message: 'Roles updated' });
    } catch (error) {
      console.error('Update team member error:', error);
      reply.status(500).send({ error: 'Failed to update team member' });
    }
  }

  // DELETE /api/admin/team/:id — remove a team member
  static async removeTeamMember(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { id } = request.params as { id: string };

      const result = await query(`DELETE FROM team_members WHERE id = $1`, [id]);

      if (result.rowCount === 0) {
        return reply.status(404).send({ error: 'Team member not found' });
      }

      reply.send({ message: 'Team member removed' });
    } catch (error) {
      console.error('Remove team member error:', error);
      reply.status(500).send({ error: 'Failed to remove team member' });
    }
  }

  // GET /api/admin/users — list all active users for member search
  static async listAllUsers(request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const { q } = request.query as { q?: string };

      let sql = `SELECT id, first_name, last_name, email, phone_number, profile_image
                 FROM users WHERE is_active = true`;
      const params: any[] = [];

      if (q?.trim()) {
        params.push(`%${q.trim().toLowerCase()}%`);
        sql += ` AND (LOWER(first_name) LIKE $1 OR LOWER(last_name) LIKE $1 OR LOWER(email) LIKE $1)`;
      }

      sql += ` ORDER BY first_name, last_name LIMIT 50`;

      const result = await query(sql, params);

      const users = result.rows.map((row) => ({
        id: row.id,
        firstName: row.first_name,
        lastName: row.last_name,
        email: row.email,
        phoneNumber: row.phone_number,
        profileImage: row.profile_image,
      }));

      reply.send({ users });
    } catch (error) {
      console.error('List users error:', error);
      reply.status(500).send({ error: 'Failed to fetch users' });
    }
  }
}
