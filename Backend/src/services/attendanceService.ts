import { query } from '../config/database';
import { Attendance, AttendanceStatus, NotificationType } from '../types';
import { NotificationService } from './notificationService';
import { config } from '../config';

export class AttendanceService {
  static async recordAttendance(data: {
    userId: string;
    serviceDate: Date;
    checkInTime: Date;
    status?: AttendanceStatus;
    isFirstTimer?: boolean;
    notes?: string;
  }): Promise<Attendance> {
    const result = await query(
      `INSERT INTO attendance (user_id, service_date, check_in_time, status, is_first_timer, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id, service_date) 
       DO UPDATE SET check_in_time = $3, status = $4, notes = $6
       RETURNING *`,
      [
        data.userId,
        data.serviceDate,
        data.checkInTime,
        data.status || AttendanceStatus.PRESENT,
        data.isFirstTimer || false,
        data.notes,
      ]
    );

    const attendance = this.mapDbRowToAttendance(result.rows[0]);

    // Send welcome message to first-timers
    if (attendance.isFirstTimer) {
      await NotificationService.sendNotification({
        userId: data.userId,
        type: NotificationType.FIRST_TIMER_WELCOME,
        title: 'Welcome to Dominion City!',
        message: `Welcome to ${config.church.name}! We're thrilled to have you join us. May God bless you abundantly.`,
      });
    }

    return attendance;
  }

  static async getAttendanceByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Attendance[]> {
    let queryText = `SELECT * FROM attendance WHERE user_id = $1`;
    const values: any[] = [userId];
    let paramCount = 2;

    if (startDate) {
      queryText += ` AND service_date >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND service_date <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    queryText += ' ORDER BY service_date DESC';

    const result = await query(queryText, values);

    return result.rows.map(this.mapDbRowToAttendance);
  }

  static async getAttendanceByDate(date: Date): Promise<Attendance[]> {
    const result = await query(
      `SELECT * FROM attendance WHERE service_date = $1 ORDER BY check_in_time ASC`,
      [date]
    );

    return result.rows.map(this.mapDbRowToAttendance);
  }

  static async getAbsentMembers(serviceDate: Date): Promise<string[]> {
    const result = await query(
      `SELECT id FROM users 
       WHERE is_active = true 
       AND id NOT IN (
         SELECT user_id FROM attendance WHERE service_date = $1
       )`,
      [serviceDate]
    );

    return result.rows.map((row) => row.id);
  }

  static async getConsecutiveAbsences(userId: string): Promise<number> {
    const result = await query(
      `WITH recent_sundays AS (
        SELECT DISTINCT service_date 
        FROM attendance 
        WHERE service_date >= CURRENT_DATE - INTERVAL '8 weeks'
        ORDER BY service_date DESC 
        LIMIT 8
      )
      SELECT COUNT(*) as absence_count
      FROM recent_sundays rs
      WHERE rs.service_date NOT IN (
        SELECT service_date 
        FROM attendance 
        WHERE user_id = $1 AND status = 'present'
      )
      AND rs.service_date <= CURRENT_DATE
      ORDER BY rs.service_date DESC`,
      [userId]
    );

    return parseInt(result.rows[0]?.absence_count || '0', 10);
  }

  static async checkAndNotifyAbsences(): Promise<void> {
    const recentSunday = await query(
      `SELECT DISTINCT service_date 
       FROM attendance 
       WHERE service_date <= CURRENT_DATE 
       ORDER BY service_date DESC 
       LIMIT 1`
    );

    if (recentSunday.rows.length === 0) return;

    const lastServiceDate = recentSunday.rows[0].service_date;
    const absentMembers = await this.getAbsentMembers(lastServiceDate);

    for (const userId of absentMembers) {
      const consecutiveAbsences = await this.getConsecutiveAbsences(userId);

      if (consecutiveAbsences >= config.notifications.absenceCriticalThreshold) {
        await NotificationService.sendNotification({
          userId,
          type: NotificationType.ABSENCE_CRITICAL,
          title: 'We Miss You!',
          message: `You've been absent for ${consecutiveAbsences} services. Your pastor will be reaching out to you soon. We hope to see you again!`,
        });

        // Notify HOD/Pastor
        const userResult = await query(
          `SELECT u.*, d.hod_id 
           FROM users u 
           LEFT JOIN departments d ON u.department_id = d.id 
           WHERE u.id = $1`,
          [userId]
        );

        if (userResult.rows[0]?.hod_id) {
          await NotificationService.sendNotification({
            userId: userResult.rows[0].hod_id,
            type: NotificationType.ABSENCE_CRITICAL,
            title: 'Member Follow-up Required',
            message: `${userResult.rows[0].first_name} ${userResult.rows[0].last_name} has been absent for ${consecutiveAbsences} consecutive services.`,
            metadata: { memberId: userId, absenceCount: consecutiveAbsences },
          });
        }
      } else if (consecutiveAbsences >= config.notifications.absenceWarningThreshold) {
        await NotificationService.sendNotification({
          userId,
          type: NotificationType.ABSENCE_WARNING,
          title: 'We Miss You!',
          message: `We noticed you've missed ${consecutiveAbsences} services. We hope everything is okay and look forward to seeing you soon!`,
        });
      }
    }
  }

  static async getAttendanceStats(userId: string): Promise<{
    totalServices: number;
    attended: number;
    percentage: number;
    consecutiveAbsences: number;
  }> {
    const result = await query(
      `SELECT 
        COUNT(DISTINCT a1.service_date) as total_services,
        COUNT(DISTINCT CASE WHEN a2.status = 'present' THEN a2.service_date END) as attended
       FROM attendance a1
       LEFT JOIN attendance a2 ON a1.service_date = a2.service_date AND a2.user_id = $1
       WHERE a1.service_date >= (SELECT join_date FROM users WHERE id = $1)
       AND a1.service_date <= CURRENT_DATE`,
      [userId]
    );

    const totalServices = parseInt(result.rows[0]?.total_services || '0', 10);
    const attended = parseInt(result.rows[0]?.attended || '0', 10);
    const percentage = totalServices > 0 ? (attended / totalServices) * 100 : 0;
    const consecutiveAbsences = await this.getConsecutiveAbsences(userId);

    return {
      totalServices,
      attended,
      percentage: Math.round(percentage * 100) / 100,
      consecutiveAbsences,
    };
  }

  private static mapDbRowToAttendance(row: any): Attendance {
    return {
      id: row.id,
      userId: row.user_id,
      serviceDate: row.service_date,
      checkInTime: row.check_in_time,
      status: row.status as AttendanceStatus,
      isFirstTimer: row.is_first_timer,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }
}
