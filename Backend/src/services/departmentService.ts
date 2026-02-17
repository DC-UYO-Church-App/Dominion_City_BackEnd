import { query } from '../config/database';
import { Department } from '../types';

export class DepartmentService {
  static async createDepartment(data: {
    name: string;
    description?: string;
    hodId?: string;
  }): Promise<Department> {
    const result = await query(
      `INSERT INTO departments (name, description, hod_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.description, data.hodId]
    );

    return this.mapDbRowToDepartment(result.rows[0]);
  }

  static async getDepartmentById(id: string): Promise<Department | null> {
    const result = await query(`SELECT * FROM departments WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToDepartment(result.rows[0]);
  }

  static async getAllDepartments(): Promise<Department[]> {
    const result = await query(`SELECT * FROM departments ORDER BY name ASC`);

    return result.rows.map(this.mapDbRowToDepartment);
  }

  static async getDepartmentMembers(departmentId: string): Promise<any[]> {
    const result = await query(
      `SELECT id, email, first_name, last_name, phone_number, role, profile_image
       FROM users 
       WHERE department_id = $1 AND is_active = true
       ORDER BY role, first_name, last_name`,
      [departmentId]
    );

    return result.rows.map((row) => ({
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      phoneNumber: row.phone_number,
      role: row.role,
      profileImage: row.profile_image,
    }));
  }

  static async updateDepartment(
    id: string,
    updates: Partial<Omit<Department, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Department | null> {
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
      return this.getDepartmentById(id);
    }

    values.push(id);

    const result = await query(
      `UPDATE departments SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToDepartment(result.rows[0]);
  }

  static async deleteDepartment(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM departments WHERE id = $1`, [id]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  private static camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private static mapDbRowToDepartment(row: any): Department {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      hodId: row.hod_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
