import Queue from 'bull';
import { config } from '../config';
import { AttendanceService } from '../services/attendanceService';
import { TitheService } from '../services/titheService';
import { NotificationService } from '../services/notificationService';
import { NotificationType } from '../types';
import { query } from '../config/database';

// Create job queues
export const birthdayQueue = new Queue('birthday-notifications', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  },
});

export const absenceQueue = new Queue('absence-notifications', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  },
});

export const titheReminderQueue = new Queue('tithe-reminders', {
  redis: {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
  },
});

// Birthday notification processor
birthdayQueue.process(async (_job) => {
  console.log('Processing birthday notifications...');

  const result = await query(
    `SELECT id, first_name, last_name, email 
     FROM users 
     WHERE EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
     AND EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
     AND is_active = true`
  );

  for (const user of result.rows) {
    await NotificationService.sendNotification({
      userId: user.id,
      type: NotificationType.BIRTHDAY,
      title: 'Happy Birthday! 🎉',
      message: `Happy Birthday ${user.first_name}! ${config.church.name} celebrates you today. May this new year of your life be filled with God's blessings, joy, and prosperity. We love you!`,
    });
  }

  console.log(`Sent ${result.rows.length} birthday notifications`);
});

// Absence notification processor
absenceQueue.process(async (_job) => {
  console.log('Processing absence notifications...');
  await AttendanceService.checkAndNotifyAbsences();
  console.log('Absence notifications processed');
});

// Tithe reminder processor
titheReminderQueue.process(async (_job) => {
  console.log('Processing tithe reminders...');
  await TitheService.checkAndNotifyMissedTithes();
  console.log('Tithe reminders processed');
});

// Schedule jobs
export async function setupCronJobs() {
  // Send birthday messages at midnight every day
  await birthdayQueue.add(
    {},
    {
      repeat: {
        cron: '0 0 * * *', // Daily at midnight
      },
    }
  );

  // Check for absences every Monday at 10 AM
  await absenceQueue.add(
    {},
    {
      repeat: {
        cron: '0 10 * * 1', // Every Monday at 10:00 AM
      },
    }
  );

  // Check for missed tithes every Friday at 5 PM
  await titheReminderQueue.add(
    {},
    {
      repeat: {
        cron: '0 17 * * 5', // Every Friday at 5:00 PM
      },
    }
  );

  console.log('Cron jobs scheduled successfully');
}

// Graceful shutdown
export async function shutdownJobs() {
  await birthdayQueue.close();
  await absenceQueue.close();
  await titheReminderQueue.close();
  console.log('All job queues closed');
}
