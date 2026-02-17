import { query } from '../config/database';
import { TravelRequest, TravelStatus, NotificationType } from '../types';
import { NotificationService } from './notificationService';

export class TravelService {
  static async createTravelRequest(data: {
    userId: string;
    destination: string;
    departureDate: Date;
    returnDate: Date;
    reason?: string;
    isUrgent?: boolean;
  }): Promise<TravelRequest> {
    const result = await query(
      `INSERT INTO travel_requests (user_id, destination, departure_date, return_date, reason, is_urgent)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.userId,
        data.destination,
        data.departureDate,
        data.returnDate,
        data.reason,
        data.isUrgent || false,
      ]
    );

    const travelRequest = this.mapDbRowToTravelRequest(result.rows[0]);

    // Notify admins/pastors about the travel request
    const adminsResult = await query(
      `SELECT id FROM users WHERE role IN ('admin', 'pastor') AND is_active = true`
    );

    for (const admin of adminsResult.rows) {
      await NotificationService.sendNotification({
        userId: admin.id,
        type: NotificationType.GENERAL,
        title: 'New Travel Request',
        message: `A ${data.isUrgent ? 'URGENT ' : ''}travel request has been submitted for ${data.destination}.`,
        metadata: { travelRequestId: travelRequest.id, isUrgent: data.isUrgent },
      });
    }

    return travelRequest;
  }

  static async getTravelRequestById(id: string): Promise<TravelRequest | null> {
    const result = await query(`SELECT * FROM travel_requests WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToTravelRequest(result.rows[0]);
  }

  static async getTravelRequestsByUser(userId: string): Promise<TravelRequest[]> {
    const result = await query(
      `SELECT * FROM travel_requests WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );

    return result.rows.map(this.mapDbRowToTravelRequest);
  }

  static async getPendingTravelRequests(): Promise<TravelRequest[]> {
    const result = await query(
      `SELECT * FROM travel_requests 
       WHERE status = 'pending' 
       ORDER BY is_urgent DESC, created_at ASC`
    );

    return result.rows.map(this.mapDbRowToTravelRequest);
  }

  static async approveTravelRequest(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<TravelRequest | null> {
    const result = await query(
      `UPDATE travel_requests 
       SET status = 'approved', approved_by = $2, approval_date = CURRENT_TIMESTAMP, approval_notes = $3
       WHERE id = $1
       RETURNING *`,
      [id, approvedBy, notes]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const travelRequest = this.mapDbRowToTravelRequest(result.rows[0]);

    // Send travel blessing to the user
    await NotificationService.sendNotification({
      userId: travelRequest.userId,
      type: NotificationType.TRAVEL_BLESSING,
      title: 'Travel Approved - Safe Journey!',
      message: `Your travel request to ${travelRequest.destination} has been approved. May the Lord guide and protect you throughout your journey. Have a blessed trip!`,
    });

    return travelRequest;
  }

  static async rejectTravelRequest(
    id: string,
    approvedBy: string,
    notes?: string
  ): Promise<TravelRequest | null> {
    const result = await query(
      `UPDATE travel_requests 
       SET status = 'rejected', approved_by = $2, approval_date = CURRENT_TIMESTAMP, approval_notes = $3
       WHERE id = $1
       RETURNING *`,
      [id, approvedBy, notes]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const travelRequest = this.mapDbRowToTravelRequest(result.rows[0]);

    // Notify user about rejection
    await NotificationService.sendNotification({
      userId: travelRequest.userId,
      type: NotificationType.GENERAL,
      title: 'Travel Request Update',
      message: `Your travel request to ${travelRequest.destination} requires further discussion. ${notes || 'Please contact the admin for more information.'}`,
    });

    return travelRequest;
  }

  static async deleteTravelRequest(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM travel_requests WHERE id = $1`, [id]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  private static mapDbRowToTravelRequest(row: any): TravelRequest {
    return {
      id: row.id,
      userId: row.user_id,
      destination: row.destination,
      departureDate: row.departure_date,
      returnDate: row.return_date,
      reason: row.reason,
      isUrgent: row.is_urgent,
      status: row.status as TravelStatus,
      approvedBy: row.approved_by,
      approvalDate: row.approval_date,
      approvalNotes: row.approval_notes,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
