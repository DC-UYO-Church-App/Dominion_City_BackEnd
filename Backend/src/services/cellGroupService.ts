import { query } from '../config/database';
import { CellGroup } from '../types';

export class CellGroupService {
  static async createCellGroup(data: {
    name: string;
    leaderId?: string;
    meetingDay: string;
    meetingTime: string;
    address: string;
    latitude?: number;
    longitude?: number;
  }): Promise<CellGroup> {
    const result = await query(
      `INSERT INTO cell_groups (name, leader_id, meeting_day, meeting_time, address, latitude, longitude)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.name,
        data.leaderId,
        data.meetingDay,
        data.meetingTime,
        data.address,
        data.latitude,
        data.longitude,
      ]
    );

    return this.mapDbRowToCellGroup(result.rows[0]);
  }

  static async getCellGroupById(id: string): Promise<CellGroup | null> {
    const result = await query(`SELECT * FROM cell_groups WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToCellGroup(result.rows[0]);
  }

  static async getAllCellGroups(): Promise<CellGroup[]> {
    const result = await query(`SELECT * FROM cell_groups ORDER BY name ASC`);

    return result.rows.map(this.mapDbRowToCellGroup);
  }

  static async getNearestCellGroups(
    latitude: number,
    longitude: number,
    limit: number = 5
  ): Promise<Array<CellGroup & { distance: number }>> {
    const result = await query(
      `SELECT *, 
        (6371 * acos(
          cos(radians($1)) * cos(radians(latitude)) * 
          cos(radians(longitude) - radians($2)) + 
          sin(radians($1)) * sin(radians(latitude))
        )) AS distance
       FROM cell_groups
       WHERE latitude IS NOT NULL AND longitude IS NOT NULL
       ORDER BY distance ASC
       LIMIT $3`,
      [latitude, longitude, limit]
    );

    return result.rows.map((row) => ({
      ...this.mapDbRowToCellGroup(row),
      distance: parseFloat(row.distance),
    }));
  }

  static async getCellGroupMembers(cellGroupId: string): Promise<any[]> {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone_number, profile_image
       FROM users 
       WHERE cell_group_id = $1 AND is_active = true
       ORDER BY first_name, last_name`,
      [cellGroupId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      profileImage: row.profile_image,
    }));
  }

  static async updateCellGroup(
    id: string,
    updates: Partial<Omit<CellGroup, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<CellGroup | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${this.camelToSnake(key)} = $${paramCount}`);
        values.push(value);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return this.getCellGroupById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE cell_groups SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToCellGroup(result.rows[0]);
  }

  static async deleteCellGroup(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM cell_groups WHERE id = $1`, [id]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private static mapDbRowToCellGroup(row: any): CellGroup {
    return {
      id: row.id,
      name: row.name,
      leaderId: row.leader_id,
      meetingDay: row.meeting_day,
      meetingTime: row.meeting_time,
      address: row.address,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
