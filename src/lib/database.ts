import Dexie, { type Table } from 'dexie';
import type {
  User,
  Project,
  Screen,
  Component,
  DataModel,
  UserJourney,
  DesignSystem,
  AIChat,
  BuildFramework,
  TeamMember,
  Comment,
  Activity
} from '@/types';

// Database version
const DB_VERSION = 1;

// Custom types for database records (with timestamps)
interface DBUser extends Omit<User, 'createdAt' | 'lastActiveAt'> {
  createdAt: number;
  lastActiveAt: number;
}

interface DBProject extends Omit<Project, 'createdAt' | 'lastModified'> {
  createdAt: number;
  lastModified: number;
}

interface DBScreen extends Omit<Screen, 'createdAt' | 'lastModified'> {
  createdAt: number;
  lastModified: number;
}

interface DBComponent extends Component {
  createdAt: number;
  lastModified: number;
}

interface DBDataModel extends DataModel {
  createdAt: number;
  lastModified: number;
}

interface DBUserJourney extends UserJourney {
  createdAt: number;
  lastModified: number;
}

interface DBDesignSystem extends DesignSystem {
  createdAt: number;
  lastModified: number;
}

interface DBAIChat extends Omit<AIChat, 'createdAt' | 'lastMessageAt'> {
  createdAt: number;
  lastMessageAt: number;
}

interface DBBuildFramework extends Omit<BuildFramework, 'generatedAt'> {
  generatedAt: number;
}

interface DBTeamMember extends Omit<TeamMember, 'joinedAt' | 'lastActiveAt'> {
  joinedAt: number;
  lastActiveAt: number;
}

interface DBComment extends Omit<Comment, 'createdAt' | 'updatedAt'> {
  createdAt: number;
  updatedAt: number;
}

interface DBActivity extends Omit<Activity, 'timestamp'> {
  timestamp: number;
}

// Define the database class
export class FlexBuildDB extends Dexie {
  // Tables
  users!: Table<DBUser>;
  projects!: Table<DBProject>;
  screens!: Table<DBScreen>;
  components!: Table<DBComponent>;
  dataModels!: Table<DBDataModel>;
  userJourneys!: Table<DBUserJourney>;
  designSystems!: Table<DBDesignSystem>;
  aiChats!: Table<DBAIChat>;
  buildFrameworks!: Table<DBBuildFramework>;
  teamMembers!: Table<DBTeamMember>;
  comments!: Table<DBComment>;
  activities!: Table<DBActivity>;

  constructor() {
    super('FlexBuildDB');

    this.version(DB_VERSION).stores({
      // User management
      users: 'id, email, role, createdAt',

      // Projects
      projects: 'id, ownerId, name, status, createdAt, lastModified',

      // Screens
      screens: 'id, projectId, name, type, isHomePage, createdAt',

      // Components
      components: 'id, screenId, projectId, componentType, createdAt',

      // Data models
      dataModels: 'id, projectId, name, isUserDefined, createdAt',

      // User journeys
      userJourneys: 'id, projectId, name, priority, createdAt',

      // Design systems
      designSystems: 'id, projectId, version, createdAt',

      // AI chat history
      aiChats: 'id, projectId, userId, createdAt, lastMessageAt',

      // Build frameworks
      buildFrameworks: 'id, projectId, framework, status, generatedAt',

      // Team/collaboration
      teamMembers: 'id, [projectId+userId], role, joinedAt',

      // Comments
      comments: 'id, projectId, screenId, componentId, userId, resolved, createdAt',

      // Activity logs
      activities: 'id, projectId, userId, type, timestamp'
    });
  }

  // Helper methods for type conversion
  toDBUser(user: User): DBUser {
    return {
      ...user,
      createdAt: user.createdAt.getTime(),
      lastActiveAt: user.lastActiveAt.getTime()
    };
  }

  fromDBUser(dbUser: DBUser): User {
    return {
      ...dbUser,
      createdAt: new Date(dbUser.createdAt),
      lastActiveAt: new Date(dbUser.lastActiveAt)
    };
  }

  toDBProject(project: Project): DBProject {
    return {
      ...project,
      createdAt: project.createdAt.getTime(),
      lastModified: project.lastModified.getTime()
    };
  }

  fromDBProject(dbProject: DBProject): Project {
    return {
      ...dbProject,
      createdAt: new Date(dbProject.createdAt),
      lastModified: new Date(dbProject.lastModified)
    };
  }

  // Add more conversion methods as needed...
}

// Create database instance
export const db = new FlexBuildDB();

// Database operations wrapper for clean API
export const database = {
  // User operations
  users: {
    async create(user: Omit<User, 'id'>): Promise<User> {
      const id = crypto.randomUUID();
      const newUser: User = {
        ...user,
        id,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        projectCount: 0
      };
      await db.users.add(db.toDBUser(newUser));
      return newUser;
    },

    async get(id: string): Promise<User | null> {
      const dbUser = await db.users.get(id);
      return dbUser ? db.fromDBUser(dbUser) : null;
    },

    async getByEmail(email: string): Promise<User | null> {
      const dbUser = await db.users.where('email').equals(email).first();
      return dbUser ? db.fromDBUser(dbUser) : null;
    },

    async update(id: string, updates: Partial<User>): Promise<void> {
      const existing = await db.users.get(id);
      if (!existing) throw new Error('User not found');
      
      const updatedUser = db.fromDBUser(existing);
      Object.assign(updatedUser, updates);
      await db.users.put(db.toDBUser(updatedUser));
    },

    async delete(id: string): Promise<void> {
      await db.users.delete(id);
    }
  },

  // Project operations
  projects: {
    async create(project: Omit<Project, 'id' | 'createdAt' | 'lastModified'>): Promise<Project> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newProject: Project = {
        ...project,
        id,
        createdAt: now,
        lastModified: now,
        screenCount: 0,
        componentCount: 0,
        collaboratorCount: 0,
        hasGeneratedFramework: false
      };
      await db.projects.add(db.toDBProject(newProject));
      return newProject;
    },

    async get(id: string): Promise<Project | null> {
      const dbProject = await db.projects.get(id);
      return dbProject ? db.fromDBProject(dbProject) : null;
    },

    async getByOwner(ownerId: string): Promise<Project[]> {
      const dbProjects = await db.projects.where('ownerId').equals(ownerId).toArray();
      return dbProjects.map(db.fromDBProject);
    },

    async update(id: string, updates: Partial<Project>): Promise<void> {
      const existing = await db.projects.get(id);
      if (!existing) throw new Error('Project not found');
      
      const updatedProject = db.fromDBProject(existing);
      Object.assign(updatedProject, updates, {
        lastModified: new Date()
      });
      await db.projects.put(db.toDBProject(updatedProject));
    },

    async delete(id: string): Promise<void> {
      // Delete all related data
      await db.screens.where('projectId').equals(id).delete();
      await db.components.where('projectId').equals(id).delete();
      await db.dataModels.where('projectId').equals(id).delete();
      await db.userJourneys.where('projectId').equals(id).delete();
      await db.designSystems.where('projectId').equals(id).delete();
      await db.aiChats.where('projectId').equals(id).delete();
      await db.buildFrameworks.where('projectId').equals(id).delete();
      await db.comments.where('projectId').equals(id).delete();
      await db.activities.where('projectId').equals(id).delete();
      await db.teamMembers.where('projectId').equals(id).delete();
      
      // Finally delete the project
      await db.projects.delete(id);
    }
  },

  // Screen operations
  screens: {
    async create(screen: Omit<Screen, 'id' | 'createdAt' | 'lastModified'>): Promise<Screen> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newScreen: Screen = {
        ...screen,
        id,
        createdAt: now,
        lastModified: now,
        componentCount: 0
      };
      await db.screens.add({
        ...newScreen,
        createdAt: now.getTime(),
        lastModified: now.getTime()
      });
      
      // Update project screen count
      await db.projects.where('id').equals(screen.projectId).modify(project => {
        project.screenCount = (project.screenCount || 0) + 1;
      });
      
      return newScreen;
    },

    async get(id: string): Promise<Screen | null> {
      const dbScreen = await db.screens.get(id);
      if (!dbScreen) return null;
      
      return {
        ...dbScreen,
        createdAt: new Date(dbScreen.createdAt),
        lastModified: new Date(dbScreen.lastModified)
      };
    },

    async getByProject(projectId: string): Promise<Screen[]> {
      const dbScreens = await db.screens.where('projectId').equals(projectId).toArray();
      return dbScreens.map(screen => ({
        ...screen,
        createdAt: new Date(screen.createdAt),
        lastModified: new Date(screen.lastModified)
      }));
    },

    async update(id: string, updates: Partial<Screen>): Promise<void> {
      const existing = await db.screens.get(id);
      if (!existing) throw new Error('Screen not found');
      
      const { createdAt, lastModified, ...dbUpdates } = updates as any;
      await db.screens.where('id').equals(id).modify({
        ...dbUpdates,
        lastModified: Date.now()
      });
    },

    async delete(id: string): Promise<void> {
      const screen = await db.screens.get(id);
      if (!screen) return;
      
      // Delete all components in this screen
      await db.components.where('screenId').equals(id).delete();
      
      // Update project screen count
      await db.projects.where('id').equals(screen.projectId).modify(project => {
        project.screenCount = Math.max(0, (project.screenCount || 0) - 1);
      });
      
      await db.screens.delete(id);
    }
  },

  // Component operations
  components: {
    async create(component: Omit<Component, 'id'>): Promise<Component> {
      const id = crypto.randomUUID();
      const newComponent: Component = {
        ...component,
        id
      };
      await db.components.add({
        ...newComponent,
        createdAt: Date.now(),
        lastModified: Date.now()
      });
      
      // Update counts
      await db.screens.where('id').equals(component.screenId).modify(screen => {
        screen.componentCount = (screen.componentCount || 0) + 1;
      });
      await db.projects.where('id').equals(component.projectId).modify(project => {
        project.componentCount = (project.componentCount || 0) + 1;
      });
      
      return newComponent;
    },

    async get(id: string): Promise<Component | null> {
      const dbComponent = await db.components.get(id);
      if (!dbComponent) return null;
      
      const { createdAt, lastModified, ...component } = dbComponent;
      return component;
    },

    async getByScreen(screenId: string): Promise<Component[]> {
      const dbComponents = await db.components.where('screenId').equals(screenId).toArray();
      return dbComponents.map(({ createdAt, lastModified, ...component }) => component);
    },

    async update(id: string, updates: Partial<Component>): Promise<void> {
      await db.components.where('id').equals(id).modify({
        ...updates,
        lastModified: Date.now()
      });
    },

    async delete(id: string): Promise<void> {
      const component = await db.components.get(id);
      if (!component) return;
      
      // Update counts
      await db.screens.where('id').equals(component.screenId).modify(screen => {
        screen.componentCount = Math.max(0, (screen.componentCount || 0) - 1);
      });
      await db.projects.where('id').equals(component.projectId).modify(project => {
        project.componentCount = Math.max(0, (project.componentCount || 0) - 1);
      });
      
      await db.components.delete(id);
    }
  },

  // Clear all data (useful for testing)
  async clearAll(): Promise<void> {
    await db.transaction('rw', db.tables, async () => {
      await Promise.all(db.tables.map(table => table.clear()));
    });
  }
};

// Export for use in services
export default database;