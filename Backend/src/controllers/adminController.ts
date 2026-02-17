import { FastifyReply } from 'fastify';
import { query } from '../config/database';
import { AuthenticatedRequest } from '../middleware/auth';

export class AdminController {
  static async getDashboardStats(_request: AuthenticatedRequest, reply: FastifyReply) {
    try {
      const totalMembersResult = await query(
        `SELECT COUNT(*)::int AS count FROM users WHERE is_active = true`
      );

      const totalAttendedResult = await query(
        `SELECT COUNT(DISTINCT user_id)::int AS count FROM attendance`
      );

      const newMembersResult = await query(
        `SELECT COUNT(*)::int AS count
         FROM users
         WHERE is_active = true
           AND role = 'member'
           AND join_date >= CURRENT_DATE - INTERVAL '30 days'`
      );

      const sundaySeriesResult = await query(
        `WITH sundays AS (
           SELECT (date_trunc('week', CURRENT_DATE)::date + interval '6 days' - interval '7 weeks') AS start_date
         ), series AS (
           SELECT generate_series(
             (SELECT start_date FROM sundays),
             (date_trunc('week', CURRENT_DATE)::date + interval '6 days'),
             interval '7 days'
           )::date AS sunday
         )
         SELECT s.sunday,
                COUNT(u.id)::int AS count
         FROM series s
         LEFT JOIN users u
           ON u.role = 'member'
          AND (date_trunc('week', u.join_date)::date + interval '6 days')::date = s.sunday
         GROUP BY s.sunday
         ORDER BY s.sunday`
      );

      const chart = sundaySeriesResult.rows.map((row) => ({
        date: row.sunday,
        count: row.count,
      }));

      reply.send({
        totalMembers: totalMembersResult.rows[0]?.count || 0,
        totalAttended: totalAttendedResult.rows[0]?.count || 0,
        newMembers: newMembersResult.rows[0]?.count || 0,
        newMembersBySunday: chart,
      });
    } catch (error) {
      console.error('Admin dashboard stats error:', error);
      reply.status(500).send({ error: 'Failed to load admin dashboard stats' });
    }
  }
}
