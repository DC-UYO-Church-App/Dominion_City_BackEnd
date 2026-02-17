import { query } from '../config/database';
import { Message, MessageStatus } from '../types';

export class MessageService {
  static async sendMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
  }): Promise<Message> {
    const result = await query(
      `INSERT INTO messages (sender_id, receiver_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.senderId, data.receiverId, data.content]
    );

    return this.mapDbRowToMessage(result.rows[0]);
  }

  static async getMessageById(id: string): Promise<Message | null> {
    const result = await query(`SELECT * FROM messages WHERE id = $1`, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToMessage(result.rows[0]);
  }

  static async getConversation(userId1: string, userId2: string): Promise<Message[]> {
    const result = await query(
      `SELECT * FROM messages 
       WHERE (sender_id = $1 AND receiver_id = $2) 
          OR (sender_id = $2 AND receiver_id = $1)
       ORDER BY created_at ASC`,
      [userId1, userId2]
    );

    return result.rows.map(this.mapDbRowToMessage);
  }

  static async getUserConversations(userId: string): Promise<any[]> {
    const result = await query(
      `SELECT DISTINCT ON (other_user_id) 
        other_user_id,
        u.first_name,
        u.last_name,
        u.profile_image,
        m.content as last_message,
        m.created_at as last_message_time,
        m.status,
        (SELECT COUNT(*) FROM messages 
         WHERE receiver_id = $1 AND sender_id = other_user_id AND status != 'read') as unread_count
       FROM (
         SELECT 
           CASE WHEN sender_id = $1 THEN receiver_id ELSE sender_id END as other_user_id,
           id, content, created_at, status
         FROM messages 
         WHERE sender_id = $1 OR receiver_id = $1
       ) m
       JOIN users u ON u.id = m.other_user_id
       ORDER BY other_user_id, m.created_at DESC`,
      [userId]
    );

    return result.rows.map((row) => ({
      userId: row.other_user_id,
      firstName: row.first_name,
      lastName: row.last_name,
      profileImage: row.profile_image,
      lastMessage: row.last_message,
      lastMessageTime: row.last_message_time,
      unreadCount: parseInt(row.unread_count || '0', 10),
    }));
  }

  static async markAsRead(messageId: string): Promise<Message | null> {
    const result = await query(
      `UPDATE messages 
       SET status = 'read', read_at = CURRENT_TIMESTAMP 
       WHERE id = $1
       RETURNING *`,
      [messageId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToMessage(result.rows[0]);
  }

  static async markConversationAsRead(receiverId: string, senderId: string): Promise<void> {
    await query(
      `UPDATE messages 
       SET status = 'read', read_at = CURRENT_TIMESTAMP 
       WHERE receiver_id = $1 AND sender_id = $2 AND status != 'read'`,
      [receiverId, senderId]
    );
  }

  static async deleteMessage(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM messages WHERE id = $1`, [id]);

    return result.rowCount !== null && result.rowCount > 0;
  }

  private static mapDbRowToMessage(row: any): Message {
    return {
      id: row.id,
      senderId: row.sender_id,
      receiverId: row.receiver_id,
      content: row.content,
      status: row.status as MessageStatus,
      readAt: row.read_at,
      createdAt: row.created_at,
    };
  }
}
