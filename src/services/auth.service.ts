import { databaseService } from './database.service';
import type { User } from '@/types';

interface AuthSession {
  user: User;
  token: string;
  expiresAt: Date;
}

class AuthService {
  private currentSession: AuthSession | null = null;
  private readonly SESSION_KEY = 'flexbuild_auth_session';

  constructor() {
    // Load session from localStorage on init
    this.loadSession();
  }

  private loadSession(): void {
    try {
      const savedSession = localStorage.getItem(this.SESSION_KEY);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        // Check if session is still valid
        if (new Date(session.expiresAt) > new Date()) {
          this.currentSession = {
            ...session,
            user: {
              ...session.user,
              createdAt: new Date(session.user.createdAt),
              lastActiveAt: new Date(session.user.lastActiveAt)
            },
            expiresAt: new Date(session.expiresAt)
          };
        } else {
          // Session expired, clear it
          this.signOut();
        }
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      this.signOut();
    }
  }

  private saveSession(session: AuthSession): void {
    this.currentSession = session;
    localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
  }

  private generateToken(): string {
    return crypto.randomUUID();
  }

  async signUp(email: string, _password: string, displayName: string): Promise<AuthSession> {
    // Check if user already exists
    const existingUser = await databaseService.users.getByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = await databaseService.users.create({
      email,
      displayName,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${displayName}`,
      createdAt: new Date(),
      lastActiveAt: new Date(),
      projectCount: 0,
      role: 'free'
    });

    // Create session
    const session: AuthSession = {
      user,
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.saveSession(session);
    return session;
  }

  async signIn(email: string, _password: string): Promise<AuthSession> {
    // Get user by email
    const user = await databaseService.users.getByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // In a real app, we'd verify the password hash here
    // For now, we'll just accept any password for demo purposes

    // Update last active
    await databaseService.users.update(user.id, {
      lastActiveAt: new Date()
    });

    // Create session
    const session: AuthSession = {
      user: {
        ...user,
        lastActiveAt: new Date()
      },
      token: this.generateToken(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };

    this.saveSession(session);
    return session;
  }

  async signOut(): Promise<void> {
    this.currentSession = null;
    localStorage.removeItem(this.SESSION_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    if (!this.currentSession) {
      return null;
    }

    // Check if session is still valid
    if (new Date(this.currentSession.expiresAt) <= new Date()) {
      await this.signOut();
      return null;
    }

    // Refresh user data from database
    const user = await databaseService.users.get(this.currentSession.user.id);
    if (user) {
      this.currentSession.user = user;
    }

    return this.currentSession.user;
  }

  getSession(): AuthSession | null {
    return this.currentSession;
  }

  isAuthenticated(): boolean {
    return !!this.currentSession && new Date(this.currentSession.expiresAt) > new Date();
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    if (!this.currentSession) {
      throw new Error('Not authenticated');
    }

    await databaseService.users.update(this.currentSession.user.id, updates);
    
    const updatedUser = await databaseService.users.get(this.currentSession.user.id);
    if (!updatedUser) {
      throw new Error('User not found');
    }

    // Update session
    this.currentSession.user = updatedUser;
    this.saveSession(this.currentSession);

    return updatedUser;
  }

  // Demo users for easy testing
  async createDemoUsers(): Promise<void> {
    const demoUsers = [
      {
        email: 'demo@flexbuild.app',
        password: 'demo123',
        displayName: 'Demo User',
        role: 'free' as const
      },
      {
        email: 'pro@flexbuild.app',
        password: 'pro123',
        displayName: 'Pro User',
        role: 'pro' as const
      }
    ];

    for (const demoUser of demoUsers) {
      try {
        const existingUser = await databaseService.users.getByEmail(demoUser.email);
        if (!existingUser) {
          await databaseService.users.create({
            email: demoUser.email,
            displayName: demoUser.displayName,
            avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${demoUser.displayName}`,
            createdAt: new Date(),
            lastActiveAt: new Date(),
            projectCount: 0,
            role: demoUser.role
          });
        }
      } catch (error) {
        console.error(`Failed to create demo user ${demoUser.email}:`, error);
      }
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export for use in components
export default authService;