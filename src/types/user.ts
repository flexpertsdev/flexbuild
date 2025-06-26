export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
  createdAt: Date;
  lastSignInAt: Date;
}

export interface UserProfile {
  id: string;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  preferences: UserPreferences;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export type UserRole = 'free' | 'pro' | 'enterprise';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  emailNotifications: boolean;
  autoSave: boolean;
  defaultProjectType: 'web' | 'mobile' | 'dashboard';
  aiAssistanceLevel: 'minimal' | 'balanced' | 'maximum';
}

export interface Subscription {
  plan: UserRole;
  status: 'active' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  billingCycle?: 'monthly' | 'yearly';
  limits: SubscriptionLimits;
}

export interface SubscriptionLimits {
  maxProjects: number;
  maxScreensPerProject: number;
  maxCollaborators: number;
  aiRequestsPerMonth: number;
  exportEnabled: boolean;
  customDomains: boolean;
  prioritySupport: boolean;
}

export interface TeamMember {
  id: string;
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  joinedAt: Date;
  lastActiveAt: Date;
}

export interface Invitation {
  id: string;
  projectId: string;
  invitedBy: string;
  invitedEmail: string;
  role: 'admin' | 'editor' | 'viewer';
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  createdAt: Date;
  expiresAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  token: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActiveAt: Date;
  ipAddress?: string;
  userAgent?: string;
}