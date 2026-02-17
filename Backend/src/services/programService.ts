import { query } from '../config/database';
import { ProgramCompletion, ChurchProgram } from '../types';

export class ProgramService {
  static async recordCompletion(data: {
    userId: string;
    program: ChurchProgram;
    completionDate: Date;
    certificateUrl?: string;
    instructorId?: string;
    notes?: string;
  }): Promise<ProgramCompletion> {
    const result = await query(
      `INSERT INTO program_completions (user_id, program, completion_date, certificate_url, instructor_id, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, program) 
       DO UPDATE SET completion_date = $3, certificate_url = $4, instructor_id = $5, notes = $6
       RETURNING *`,
      [
        data.userId,
        data.program,
        data.completionDate,
        data.certificateUrl,
        data.instructorId,
        data.notes,
      ]
    );

    return this.mapDbRowToProgram(result.rows[0]);
  }

  static async getUserPrograms(userId: string): Promise<ProgramCompletion[]> {
    const result = await query(
      `SELECT * FROM program_completions WHERE user_id = $1 ORDER BY completion_date DESC`,
      [userId]
    );

    return result.rows.map(this.mapDbRowToProgram);
  }

  static async getProgramParticipants(program: ChurchProgram): Promise<any[]> {
    const result = await query(
      `SELECT u.id, u.first_name, u.last_name, u.email, p.completion_date, p.certificate_url
       FROM program_completions p
       JOIN users u ON u.id = p.user_id
       WHERE p.program = $1
       ORDER BY p.completion_date DESC`,
      [program]
    );

    return result.rows.map((row) => ({
      userId: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      completionDate: row.completion_date,
      certificateUrl: row.certificate_url,
    }));
  }

  static async getUserProgress(userId: string): Promise<any> {
    const allPrograms = Object.values(ChurchProgram);
    const completedResult = await query(
      `SELECT program FROM program_completions WHERE user_id = $1`,
      [userId]
    );

    const completed = completedResult.rows.map((row) => row.program);
    const pending = allPrograms.filter((p) => !completed.includes(p));

    return {
      completed,
      pending,
      completionPercentage: (completed.length / allPrograms.length) * 100,
    };
  }

  static async deleteCompletion(userId: string, program: ChurchProgram): Promise<boolean> {
    const result = await query(
      `DELETE FROM program_completions WHERE user_id = $1 AND program = $2`,
      [userId, program]
    );

    return result.rowCount !== null && result.rowCount > 0;
  }

  private static mapDbRowToProgram(row: any): ProgramCompletion {
    return {
      id: row.id,
      userId: row.user_id,
      program: row.program as ChurchProgram,
      completionDate: row.completion_date,
      certificateUrl: row.certificate_url,
      instructorId: row.instructor_id,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }
}
