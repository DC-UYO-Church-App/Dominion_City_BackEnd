import { query } from '../config/database';
import { Book } from '../types';

export class BookService {
  static async createBook(data: {
    title: string;
    author: string;
    category: string;
    price: number;
    quantity: number;
    summary?: string;
    coverImage?: string;
    createdBy: string;
  }): Promise<Book> {
    const result = await query(
      `INSERT INTO books (title, author, category, price, quantity, summary, cover_image, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        data.title,
        data.author,
        data.category,
        data.price,
        data.quantity,
        data.summary,
        data.coverImage,
        data.createdBy,
      ]
    );

    return this.mapDbRowToBook(result.rows[0]);
  }

  static async getAllBooks(): Promise<Book[]> {
    const result = await query(`SELECT * FROM books ORDER BY created_at DESC`);
    return result.rows.map(this.mapDbRowToBook);
  }

  static async updateBook(
    id: string,
    updates: Partial<Omit<Book, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<Book | null> {
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
      return null;
    }

    values.push(id);

    const result = await query(
      `UPDATE books SET ${fields.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapDbRowToBook(result.rows[0]);
  }

  static async deleteBook(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM books WHERE id = $1`, [id]);
    return result.rowCount !== null && result.rowCount > 0;
  }

  static async getBookStats(): Promise<{
    totalBooks: number;
    totalUnsold: number;
    totalSold: number;
    last7Days: { label: string; sold: number }[];
  }> {
    const totalResult = await query(
      `SELECT COUNT(*)::int AS total_books,
              COALESCE(SUM(quantity), 0)::int AS total_unsold
       FROM books`
    );

    const soldResult = await query(
      `SELECT COALESCE(SUM(quantity), 0)::int AS total_sold
       FROM book_sales`
    );

    const seriesResult = await query(
      `WITH days AS (
         SELECT generate_series(
           CURRENT_DATE - INTERVAL '6 days',
           CURRENT_DATE,
           INTERVAL '1 day'
         )::date AS day
       )
       SELECT d.day,
              COALESCE(SUM(s.quantity), 0)::int AS sold
       FROM days d
       LEFT JOIN book_sales s
         ON s.created_at::date = d.day
       GROUP BY d.day
       ORDER BY d.day`
    );

    const totalBooks = totalResult.rows[0]?.total_books ?? 0;
    const totalUnsold = totalResult.rows[0]?.total_unsold ?? 0;
    const totalSold = soldResult.rows[0]?.total_sold ?? 0;

    return {
      totalBooks,
      totalUnsold,
      totalSold,
      last7Days: seriesResult.rows.map((row: any) => ({
        label: new Date(row.day).toLocaleDateString('en-US', { weekday: 'short' }),
        sold: row.sold ?? 0,
      })),
    };
  }

  static async getBookSales(): Promise<
    {
      id: string;
      bookId: string;
      title: string;
      coverImage?: string | null;
      buyerId: string;
      buyerName: string;
      buyerImage?: string | null;
      quantity: number;
      totalAmount: number;
      createdAt: Date;
    }[]
  > {
    const result = await query(
      `SELECT s.id,
              s.book_id,
              b.title,
              b.cover_image,
              s.buyer_id,
              u.first_name,
              u.last_name,
              u.profile_image,
              s.quantity,
              s.total_amount,
              s.created_at
       FROM book_sales s
       JOIN books b ON b.id = s.book_id
       JOIN users u ON u.id = s.buyer_id
       ORDER BY s.created_at DESC`
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      bookId: row.book_id,
      title: row.title,
      coverImage: row.cover_image,
      buyerId: row.buyer_id,
      buyerName: `${row.first_name} ${row.last_name}`.trim(),
      buyerImage: row.profile_image,
      quantity: row.quantity ?? 0,
      totalAmount: Number(row.total_amount ?? 0),
      createdAt: row.created_at,
    }));
  }

  private static camelToSnake(str: string): string {
    if (str === 'coverImage') return 'cover_image';
    if (str === 'createdBy') return 'created_by';
    return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  }

  private static mapDbRowToBook(row: any): Book {
    return {
      id: row.id,
      title: row.title,
      author: row.author,
      category: row.category,
      price: Number(row.price ?? 0),
      quantity: row.quantity ?? 0,
      summary: row.summary,
      coverImage: row.cover_image,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
