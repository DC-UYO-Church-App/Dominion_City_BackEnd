import { pool } from '../config/database';
import { hashPassword } from '../utils/password';

async function seed() {
  try {
    console.log('Seeding database...');

    // Create admin user
    const hashedPassword = await hashPassword('Admin@123');
    await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone_number, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      ['admin@dominioncityuyo.org', hashedPassword, 'Admin', 'User', '+2341234567890', 'admin']
    );

    // Create departments
    await pool.query(
      `INSERT INTO departments (name, description)
       VALUES 
         ('Ushering', 'Church ushering department'),
         ('Media', 'Media and technology department'),
         ('Music', 'Music and worship department'),
         ('Protocol', 'Protocol and events department'),
         ('Children', 'Children ministry')
       ON CONFLICT (name) DO NOTHING`
    );

    // Create sample cell groups
    await pool.query(
      `INSERT INTO cell_groups (name, meeting_day, meeting_time, address, latitude, longitude)
       VALUES 
         ('Ikot Ekpene Cell', 'Thursday', '17:00', 'Ikot Ekpene Road, Uyo', 5.0339, 7.9110),
         ('Ewet Housing Cell', 'Wednesday', '18:00', 'Ewet Housing Estate, Uyo', 5.0154, 7.9345),
         ('Use Offot Cell', 'Tuesday', '17:30', 'Use Offot, Uyo', 5.0456, 7.9512)
       ON CONFLICT DO NOTHING`
    );

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seed();
