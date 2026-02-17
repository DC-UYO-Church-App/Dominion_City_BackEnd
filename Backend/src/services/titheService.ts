import { query } from '../config/database';
import { Tithe, TitheFrequency, NotificationType } from '../types';
import { NotificationService } from './notificationService';
import { config } from '../config';
import { v4 as uuidv4 } from 'uuid';

export class TitheService {
  static async recordTithe(data: {
    userId: string;
    amount: number;
    frequency: TitheFrequency;
    paymentDate: Date;
    paymentMethod: string;
    notes?: string;
  }): Promise<Tithe> {
    const receiptNumber = this.generateReceiptNumber();

    const result = await query(
      `INSERT INTO tithes (user_id, amount, frequency, payment_date, payment_method, receipt_number, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        data.userId,
        data.amount,
        data.frequency,
        data.paymentDate,
        data.paymentMethod,
        receiptNumber,
        data.notes,
      ]
    );

    return this.mapDbRowToTithe(result.rows[0]);
  }

  static async getTithesByUser(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<Tithe[]> {
    let queryText = `SELECT * FROM tithes WHERE user_id = $1`;
    const values: any[] = [userId];
    let paramCount = 2;

    if (startDate) {
      queryText += ` AND payment_date >= $${paramCount}`;
      values.push(startDate);
      paramCount++;
    }

    if (endDate) {
      queryText += ` AND payment_date <= $${paramCount}`;
      values.push(endDate);
      paramCount++;
    }

    queryText += ' ORDER BY payment_date DESC';

    const result = await query(queryText, values);

    return result.rows.map(this.mapDbRowToTithe);
  }

  static async getTitheByReceipt(receiptNumber: string): Promise<Tithe | null> {
    const result = await query(
      `SELECT * FROM tithes WHERE receipt_number = $1`,
      [receiptNumber]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToTithe(result.rows[0]);
  }

  static async getMissedPayments(userId: string, frequency: TitheFrequency): Promise<number> {
    const intervalMap = {
      [TitheFrequency.DAILY]: '1 day',
      [TitheFrequency.WEEKLY]: '1 week',
      [TitheFrequency.MONTHLY]: '1 month',
    };

    const result = await query(
      `SELECT payment_date 
       FROM tithes 
       WHERE user_id = $1 AND frequency = $2
       ORDER BY payment_date DESC 
       LIMIT 1`,
      [userId, frequency]
    );

    if (result.rows.length === 0) {
      return 0;
    }

    const lastPayment = new Date(result.rows[0].payment_date);
    const expectedPayments = await query(
      `SELECT COUNT(*) as expected
       FROM generate_series($1::date, CURRENT_DATE, $2::interval) as expected_date`,
      [lastPayment, intervalMap[frequency]]
    );

    const actual = await query(
      `SELECT COUNT(*) as actual
       FROM tithes 
       WHERE user_id = $1 AND frequency = $2 AND payment_date > $3`,
      [userId, frequency, lastPayment]
    );

    const expected = parseInt(expectedPayments.rows[0]?.expected || '0', 10);
    const actualCount = parseInt(actual.rows[0]?.actual || '0', 10);

    return Math.max(0, expected - actualCount - 1);
  }

  static async checkAndNotifyMissedTithes(): Promise<void> {
    const users = await query(
      `SELECT DISTINCT user_id, frequency 
       FROM tithes 
       WHERE user_id IN (SELECT id FROM users WHERE is_active = true)`
    );

    for (const row of users.rows) {
      const missedPayments = await this.getMissedPayments(row.user_id, row.frequency);

      if (missedPayments >= config.notifications.titheReminderThreshold) {
        await NotificationService.sendNotification({
          userId: row.user_id,
          type: NotificationType.TITHE_REMINDER,
          title: 'Tithe Reminder',
          message: `You've missed ${missedPayments} ${row.frequency} tithe payment(s). Remember, tithing is an act of worship and obedience to God.`,
        });

        // Notify pastor if critical
        if (missedPayments >= config.notifications.titheReminderThreshold * 2) {
          const userResult = await query(
            `SELECT u.*, d.hod_id 
             FROM users u 
             LEFT JOIN departments d ON u.department_id = d.id 
             WHERE u.id = $1`,
            [row.user_id]
          );

          if (userResult.rows[0]?.hod_id) {
            await NotificationService.sendNotification({
              userId: userResult.rows[0].hod_id,
              type: NotificationType.TITHE_REMINDER,
              title: 'Member Tithe Follow-up',
              message: `${userResult.rows[0].first_name} ${userResult.rows[0].last_name} has missed ${missedPayments} tithe payments.`,
              metadata: { memberId: row.user_id, missedPayments },
            });
          }
        }
      }
    }
  }

  static async getTitheStats(userId: string): Promise<{
    totalAmount: number;
    totalPayments: number;
    currentStreak: number;
    lastPaymentDate: Date | null;
  }> {
    const result = await query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_amount,
        COUNT(*) as total_payments,
        MAX(payment_date) as last_payment
       FROM tithes 
       WHERE user_id = $1`,
      [userId]
    );

    const row = result.rows[0];

    return {
      totalAmount: parseFloat(row.total_amount || '0'),
      totalPayments: parseInt(row.total_payments || '0', 10),
      currentStreak: 0, // TODO: Implement streak calculation
      lastPaymentDate: row.last_payment ? new Date(row.last_payment) : null,
    };
  }

  private static generateReceiptNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = uuidv4().split('-')[0].toUpperCase();
    return `DCU-${timestamp}-${random}`;
  }

  private static mapDbRowToTithe(row: any): Tithe {
    return {
      id: row.id,
      userId: row.user_id,
      amount: parseFloat(row.amount),
      frequency: row.frequency as TitheFrequency,
      paymentDate: row.payment_date,
      paymentMethod: row.payment_method,
      receiptNumber: row.receipt_number,
      notes: row.notes,
      createdAt: row.created_at,
    };
  }
}
