import dotenv from 'dotenv';

dotenv.config();

export const config = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || '0.0.0.0',
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'dominion_city_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-this-secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY || '',
    fromEmail: process.env.SENDGRID_FROM_EMAIL || 'noreply@dominioncityuyo.org',
    fromName: process.env.SENDGRID_FROM_NAME || 'Dominion City Uyo',
  },
  upload: {
    dir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  },
  rateLimit: {
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    timeWindow: parseInt(process.env.RATE_LIMIT_TIMEWINDOW || '900000', 10), // 15 minutes
  },
  church: {
    name: process.env.CHURCH_NAME || 'Dominion City Uyo (Golden Heart)',
    email: process.env.CHURCH_EMAIL || 'info@dominioncityuyo.org',
    phone: process.env.CHURCH_PHONE || '',
    address: process.env.CHURCH_ADDRESS || 'Uyo, Akwa Ibom State, Nigeria',
  },
  notifications: {
    absenceWarningThreshold: parseInt(process.env.ABSENCE_WARNING_THRESHOLD || '2', 10),
    absenceCriticalThreshold: parseInt(process.env.ABSENCE_CRITICAL_THRESHOLD || '4', 10),
    titheReminderThreshold: parseInt(process.env.TITHE_REMINDER_THRESHOLD || '2', 10),
  },
};
