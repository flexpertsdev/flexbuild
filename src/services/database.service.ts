import type {
  User,
  Project,
  Screen,
  Component,
  DataModel,
  UserJourney,
  DesignSystem,
  AIChat,
  BuildFramework
} from '@/types';

// Database provider interface - can be implemented by IndexedDB or Supabase
export interface DatabaseProvider {
  // User operations
  users: {
    create(user: Omit<User, 'id'>): Promise<User>;
    get(id: string): Promise<User | null>;
    getByEmail(email: string): Promise<User | null>;
    update(id: string, updates: Partial<User>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Project operations
  projects: {
    create(project: Omit<Project, 'id' | 'createdAt' | 'lastModified'>): Promise<Project>;
    get(id: string): Promise<Project | null>;
    getByOwner(ownerId: string): Promise<Project[]>;
    update(id: string, updates: Partial<Project>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Screen operations
  screens: {
    create(screen: Omit<Screen, 'id' | 'createdAt' | 'lastModified'>): Promise<Screen>;
    get(id: string): Promise<Screen | null>;
    getByProject(projectId: string): Promise<Screen[]>;
    update(id: string, updates: Partial<Screen>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Component operations
  components: {
    create(component: Omit<Component, 'id'>): Promise<Component>;
    get(id: string): Promise<Component | null>;
    getByScreen(screenId: string): Promise<Component[]>;
    update(id: string, updates: Partial<Component>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Data model operations
  dataModels: {
    create(model: Omit<DataModel, 'id'>): Promise<DataModel>;
    get(id: string): Promise<DataModel | null>;
    getByProject(projectId: string): Promise<DataModel[]>;
    update(id: string, updates: Partial<DataModel>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // User journey operations
  userJourneys: {
    create(journey: Omit<UserJourney, 'id'>): Promise<UserJourney>;
    get(id: string): Promise<UserJourney | null>;
    getByProject(projectId: string): Promise<UserJourney[]>;
    update(id: string, updates: Partial<UserJourney>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Design system operations
  designSystems: {
    create(system: Omit<DesignSystem, 'id'>): Promise<DesignSystem>;
    get(id: string): Promise<DesignSystem | null>;
    getByProject(projectId: string): Promise<DesignSystem | null>;
    update(id: string, updates: Partial<DesignSystem>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // AI chat operations
  aiChats: {
    create(chat: Omit<AIChat, 'id'>): Promise<AIChat>;
    get(id: string): Promise<AIChat | null>;
    getByProject(projectId: string): Promise<AIChat[]>;
    update(id: string, updates: Partial<AIChat>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Build framework operations
  buildFrameworks: {
    create(framework: Omit<BuildFramework, 'id'>): Promise<BuildFramework>;
    get(id: string): Promise<BuildFramework | null>;
    getByProject(projectId: string): Promise<BuildFramework[]>;
    update(id: string, updates: Partial<BuildFramework>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  // Utility
  clearAll(): Promise<void>;
}

// Current database provider (will be IndexedDB for now)
import database, { db } from '@/lib/database';

// Create IndexedDB provider implementation
class IndexedDBProvider implements DatabaseProvider {
  users = database.users;
  projects = database.projects;
  screens = database.screens;
  components = database.components;

  // Implement remaining methods
  dataModels = {
    async create(model: Omit<DataModel, 'id'>): Promise<DataModel> {
      const id = crypto.randomUUID();
      const newModel: DataModel = { ...model, id };
      await db.dataModels.add({
        ...newModel,
        createdAt: Date.now(),
        lastModified: Date.now()
      });
      return newModel;
    },

    async get(id: string): Promise<DataModel | null> {
      const dbModel = await db.dataModels.get(id);
      if (!dbModel) return null;
      const { createdAt, lastModified, ...model } = dbModel;
      return model;
    },

    async getByProject(projectId: string): Promise<DataModel[]> {
      const dbModels = await db.dataModels.where('projectId').equals(projectId).toArray();
      return dbModels.map(({ createdAt, lastModified, ...model }) => model);
    },

    async update(id: string, updates: Partial<DataModel>): Promise<void> {
      await db.dataModels.where('id').equals(id).modify({
        ...updates,
        lastModified: Date.now()
      });
    },

    async delete(id: string): Promise<void> {
      await db.dataModels.delete(id);
    }
  };

  userJourneys = {
    async create(journey: Omit<UserJourney, 'id'>): Promise<UserJourney> {
      const id = crypto.randomUUID();
      const newJourney: UserJourney = { ...journey, id };
      await db.userJourneys.add({
        ...newJourney,
        createdAt: Date.now(),
        lastModified: Date.now()
      });
      return newJourney;
    },

    async get(id: string): Promise<UserJourney | null> {
      const dbJourney = await db.userJourneys.get(id);
      if (!dbJourney) return null;
      const { createdAt, lastModified, ...journey } = dbJourney;
      return journey;
    },

    async getByProject(projectId: string): Promise<UserJourney[]> {
      const dbJourneys = await db.userJourneys.where('projectId').equals(projectId).toArray();
      return dbJourneys.map(({ createdAt, lastModified, ...journey }) => journey);
    },

    async update(id: string, updates: Partial<UserJourney>): Promise<void> {
      await db.userJourneys.where('id').equals(id).modify({
        ...updates,
        lastModified: Date.now()
      });
    },

    async delete(id: string): Promise<void> {
      await db.userJourneys.delete(id);
    }
  };

  designSystems = {
    async create(system: Omit<DesignSystem, 'id'>): Promise<DesignSystem> {
      const id = crypto.randomUUID();
      const newSystem: DesignSystem = { ...system, id };
      await db.designSystems.add({
        ...newSystem,
        createdAt: Date.now(),
        lastModified: Date.now()
      });
      return newSystem;
    },

    async get(id: string): Promise<DesignSystem | null> {
      const dbSystem = await db.designSystems.get(id);
      if (!dbSystem) return null;
      const { createdAt, lastModified, ...system } = dbSystem;
      return system;
    },

    async getByProject(projectId: string): Promise<DesignSystem | null> {
      const dbSystem = await db.designSystems
        .where('projectId')
        .equals(projectId)
        .reverse()
        .sortBy('version')
        .then(systems => systems[0]);
      if (!dbSystem) return null;
      const { createdAt, lastModified, ...system } = dbSystem;
      return system;
    },

    async update(id: string, updates: Partial<DesignSystem>): Promise<void> {
      await db.designSystems.where('id').equals(id).modify({
        ...updates,
        lastModified: Date.now()
      });
    },

    async delete(id: string): Promise<void> {
      await db.designSystems.delete(id);
    }
  };

  aiChats = {
    async create(chat: Omit<AIChat, 'id'>): Promise<AIChat> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newChat: AIChat = {
        ...chat,
        id,
        createdAt: now,
        lastMessageAt: now
      };
      await db.aiChats.add({
        ...newChat,
        createdAt: now.getTime(),
        lastMessageAt: now.getTime()
      });
      return newChat;
    },

    async get(id: string): Promise<AIChat | null> {
      const dbChat = await db.aiChats.get(id);
      if (!dbChat) return null;
      return {
        ...dbChat,
        createdAt: new Date(dbChat.createdAt),
        lastMessageAt: new Date(dbChat.lastMessageAt)
      };
    },

    async getByProject(projectId: string): Promise<AIChat[]> {
      const dbChats = await db.aiChats.where('projectId').equals(projectId).toArray();
      return dbChats.map(chat => ({
        ...chat,
        createdAt: new Date(chat.createdAt),
        lastMessageAt: new Date(chat.lastMessageAt)
      }));
    },

    async update(id: string, updates: Partial<AIChat>): Promise<void> {
      const updateData: any = { ...updates };
      if (updates.lastMessageAt) {
        updateData.lastMessageAt = updates.lastMessageAt.getTime();
      }
      await db.aiChats.where('id').equals(id).modify(updateData);
    },

    async delete(id: string): Promise<void> {
      await db.aiChats.delete(id);
    }
  };

  buildFrameworks = {
    async create(framework: Omit<BuildFramework, 'id'>): Promise<BuildFramework> {
      const id = crypto.randomUUID();
      const now = new Date();
      const newFramework: BuildFramework = {
        ...framework,
        id,
        generatedAt: now
      };
      await db.buildFrameworks.add({
        ...newFramework,
        generatedAt: now.getTime()
      });
      return newFramework;
    },

    async get(id: string): Promise<BuildFramework | null> {
      const dbFramework = await db.buildFrameworks.get(id);
      if (!dbFramework) return null;
      return {
        ...dbFramework,
        generatedAt: new Date(dbFramework.generatedAt)
      };
    },

    async getByProject(projectId: string): Promise<BuildFramework[]> {
      const dbFrameworks = await db.buildFrameworks.where('projectId').equals(projectId).toArray();
      return dbFrameworks.map(framework => ({
        ...framework,
        generatedAt: new Date(framework.generatedAt)
      }));
    },

    async update(id: string, updates: Partial<BuildFramework>): Promise<void> {
      const updateData: any = { ...updates };
      if (updates.generatedAt) {
        updateData.generatedAt = updates.generatedAt.getTime();
      }
      await db.buildFrameworks.where('id').equals(id).modify(updateData);
    },

    async delete(id: string): Promise<void> {
      await db.buildFrameworks.delete(id);
    }
  };

  clearAll = database.clearAll;
}

// Export singleton instance
export const databaseService: DatabaseProvider = new IndexedDBProvider();

// Future: To switch to Supabase, just create SupabaseProvider class
// and change the above line to:
// export const databaseService: DatabaseProvider = new SupabaseProvider();