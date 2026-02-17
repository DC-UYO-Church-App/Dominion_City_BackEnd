export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PASTOR = 'pastor',
  HOD = 'hod',
  CELL_LEADER = 'cell_leader',
  WORKER = 'worker',
  MEMBER = 'member',
}

export enum AttendanceStatus {
  PRESENT = 'present',
  ABSENT = 'absent',
  EXCUSED = 'excused',
}

export enum TravelStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum TitheFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

export enum NotificationType {
  BIRTHDAY = 'birthday',
  ABSENCE_WARNING = 'absence_warning',
  ABSENCE_CRITICAL = 'absence_critical',
  TITHE_REMINDER = 'tithe_reminder',
  EVENT_REMINDER = 'event_reminder',
  FIRST_TIMER_WELCOME = 'first_timer_welcome',
  TRAVEL_BLESSING = 'travel_blessing',
  GENERAL = 'general',
}

export enum ChurchProgram {
  DCA_BASIC = 'dca_basic',
  DCA_ADVANCE = 'dca_advance',
  ENCOUNTER = 'encounter',
  DLI_BASIC = 'dli_basic',
  DLI_ADVANCE = 'dli_advance',
}

export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  departmentId?: string;
  cellGroupId?: string;
  dateOfBirth?: Date;
  address?: string;
  isFirstTimer: boolean;
  joinDate: Date;
  profileImage?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  hodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CellGroup {
  id: string;
  name: string;
  leaderId?: string;
  meetingDay: string;
  meetingTime: string;
  address: string;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Attendance {
  id: string;
  userId: string;
  serviceDate: Date;
  checkInTime: Date;
  status: AttendanceStatus;
  isFirstTimer: boolean;
  notes?: string;
  createdAt: Date;
}

export interface Tithe {
  id: string;
  userId: string;
  amount: number;
  frequency: TitheFrequency;
  paymentDate: Date;
  paymentMethod: string;
  receiptNumber: string;
  notes?: string;
  createdAt: Date;
}

export interface Sermon {
  id: string;
  title: string;
  preacher: string;
  sermonDate: Date;
  description?: string;
  audioUrl?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  category: string;
  duration?: number;
  uploadedBy: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelRequest {
  id: string;
  userId: string;
  destination: string;
  departureDate: Date;
  returnDate: Date;
  reason?: string;
  isUrgent: boolean;
  status: TravelStatus;
  approvedBy?: string;
  approvalDate?: Date;
  approvalNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  status: MessageStatus;
  readAt?: Date;
  createdAt: Date;
}

export interface ProgramCompletion {
  id: string;
  userId: string;
  program: ChurchProgram;
  completionDate: Date;
  certificateUrl?: string;
  instructorId?: string;
  notes?: string;
  createdAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
}
