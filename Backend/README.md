# Dominion City Church Management System - Backend

A comprehensive backend API for managing church operations, attendance tracking, member engagement, and administrative tasks for Dominion City Uyo (Golden Heart) Church.

## Features

- **User Management**: Role-based access control (Admin, Pastor, HOD, Cell Leader, Member, Worker)
- **Attendance Tracking**: Digital sign-in with first-timer detection and absence notifications
- **Automated Notifications**: Birthday messages, event reminders, and absence alerts
- **Tithing Management**: Track contributions, generate receipts, and send reminders
- **Cell Group Management**: Location-based cell finder and group communication
- **Sermon Library**: Upload, categorize, and access sermon recordings
- **Travel Management**: Request approval workflow with automated blessings
- **In-App Messaging**: Real-time communication between members
- **Department Management**: HOD access to member engagement and attendance
- **Program Tracking**: Monitor completion of church foundational classes

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Fastify
- **Database**: PostgreSQL
- **Cache/Queue**: Redis with Bull
- **Email**: SendGrid
- **Authentication**: JWT
- **Real-time**: WebSockets

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- Redis (v6 or higher)
- SendGrid account for email notifications

### Installation

1. Clone the repository and navigate to the Backend folder:
```bash
cd Backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration

5. Run database migrations:
```bash
npm run migrate
```

6. (Optional) Seed the database with sample data:
```bash
npm run seed
```

### Development

Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Production

Build the project:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

## API Documentation

Once the server is running, visit `http://localhost:3000/docs` for the interactive API documentation.

## Project Structure

```
Backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── database/        # Database migrations and queries
│   ├── jobs/            # Background jobs
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript types
│   └── index.ts         # Application entry point
├── uploads/             # File uploads directory
├── .env.example         # Environment variables template
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
