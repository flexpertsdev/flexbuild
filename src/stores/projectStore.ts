import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { databaseService } from '@/services/database.service';
import type { Project, Screen, Component, DataModel, UserJourney, DesignSystem } from '@/types';

interface ProjectState {
  // Current project context
  currentProject: Project | null;
  currentScreen: Screen | null;
  selectedComponent: Component | null;
  
  // Collections
  screens: Screen[];
  components: Component[];
  dataModels: DataModel[];
  userJourneys: UserJourney[];
  designSystem: DesignSystem | null;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSaved: Date | null;
  
  // Actions - Project
  loadProject: (projectId: string) => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'createdAt' | 'lastModified'>) => Promise<Project>;
  updateProject: (updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  clearProject: () => void;
  
  // Actions - Screens
  createScreen: (screen: Omit<Screen, 'id' | 'createdAt' | 'lastModified'>) => Promise<Screen>;
  updateScreen: (screenId: string, updates: Partial<Screen>) => Promise<void>;
  deleteScreen: (screenId: string) => Promise<void>;
  setCurrentScreen: (screenId: string) => void;
  
  // Actions - Components
  createComponent: (component: Omit<Component, 'id'>) => Promise<Component>;
  updateComponent: (componentId: string, updates: Partial<Component>) => Promise<void>;
  deleteComponent: (componentId: string) => Promise<void>;
  selectComponent: (componentId: string | null) => void;
  
  // Actions - Data Models
  createDataModel: (model: Omit<DataModel, 'id'>) => Promise<DataModel>;
  updateDataModel: (modelId: string, updates: Partial<DataModel>) => Promise<void>;
  deleteDataModel: (modelId: string) => Promise<void>;
  
  // Actions - User Journeys
  createUserJourney: (journey: Omit<UserJourney, 'id'>) => Promise<UserJourney>;
  updateUserJourney: (journeyId: string, updates: Partial<UserJourney>) => Promise<void>;
  deleteUserJourney: (journeyId: string) => Promise<void>;
  
  // Actions - Design System
  updateDesignSystem: (updates: Partial<DesignSystem>) => Promise<void>;
  
  // Actions - Utilities
  clearError: () => void;
  autoSave: () => Promise<void>;
}

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        currentProject: null,
        currentScreen: null,
        selectedComponent: null,
        screens: [],
        components: [],
        dataModels: [],
        userJourneys: [],
        designSystem: null,
        isLoading: false,
        isSaving: false,
        error: null,
        lastSaved: null,

        // Project Actions
        loadProject: async (projectId: string) => {
          set({ isLoading: true, error: null });
          try {
            const project = await databaseService.projects.get(projectId);
            if (!project) {
              throw new Error('Project not found');
            }

            const screens = await databaseService.screens.getByProject(projectId);
            const components = screens.length > 0 
              ? await Promise.all(screens.map(s => databaseService.components.getByScreen(s.id)))
                  .then(results => results.flat())
              : [];

            // TODO: Load data models, user journeys, and design system
            
            set({
              currentProject: project,
              screens,
              components,
              currentScreen: screens[0] || null,
              isLoading: false,
              error: null
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to load project',
              isLoading: false
            });
            throw error;
          }
        },

        createProject: async (projectData) => {
          set({ isLoading: true, error: null });
          try {
            const project = await databaseService.projects.create(projectData);
            set({
              currentProject: project,
              screens: [],
              components: [],
              dataModels: [],
              userJourneys: [],
              designSystem: null,
              isLoading: false,
              error: null
            });
            return project;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create project',
              isLoading: false
            });
            throw error;
          }
        },

        updateProject: async (updates) => {
          const { currentProject } = get();
          if (!currentProject) {
            throw new Error('No project loaded');
          }

          set({ isSaving: true, error: null });
          try {
            await databaseService.projects.update(currentProject.id, updates);
            set({
              currentProject: { ...currentProject, ...updates, lastModified: new Date() },
              isSaving: false,
              lastSaved: new Date()
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update project',
              isSaving: false
            });
            throw error;
          }
        },

        deleteProject: async (projectId) => {
          set({ isLoading: true, error: null });
          try {
            await databaseService.projects.delete(projectId);
            set({
              currentProject: null,
              screens: [],
              components: [],
              dataModels: [],
              userJourneys: [],
              designSystem: null,
              isLoading: false
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete project',
              isLoading: false
            });
            throw error;
          }
        },

        clearProject: () => {
          set({
            currentProject: null,
            currentScreen: null,
            selectedComponent: null,
            screens: [],
            components: [],
            dataModels: [],
            userJourneys: [],
            designSystem: null,
            error: null
          });
        },

        // Screen Actions
        createScreen: async (screenData) => {
          const { currentProject } = get();
          if (!currentProject) {
            throw new Error('No project loaded');
          }

          set({ isSaving: true, error: null });
          try {
            const screen = await databaseService.screens.create({
              ...screenData,
              projectId: currentProject.id
            });
            
            set(state => ({
              screens: [...state.screens, screen],
              currentScreen: screen,
              isSaving: false,
              lastSaved: new Date()
            }));
            
            return screen;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create screen',
              isSaving: false
            });
            throw error;
          }
        },

        updateScreen: async (screenId, updates) => {
          set({ isSaving: true, error: null });
          try {
            await databaseService.screens.update(screenId, updates);
            
            set(state => ({
              screens: state.screens.map(s => 
                s.id === screenId 
                  ? { ...s, ...updates, lastModified: new Date() }
                  : s
              ),
              currentScreen: state.currentScreen?.id === screenId
                ? { ...state.currentScreen, ...updates, lastModified: new Date() }
                : state.currentScreen,
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update screen',
              isSaving: false
            });
            throw error;
          }
        },

        deleteScreen: async (screenId) => {
          set({ isSaving: true, error: null });
          try {
            await databaseService.screens.delete(screenId);
            
            set(state => {
              const updatedScreens = state.screens.filter(s => s.id !== screenId);
              const updatedComponents = state.components.filter(c => c.screenId !== screenId);
              
              return {
                screens: updatedScreens,
                components: updatedComponents,
                currentScreen: state.currentScreen?.id === screenId 
                  ? updatedScreens[0] || null
                  : state.currentScreen,
                selectedComponent: state.selectedComponent?.screenId === screenId
                  ? null
                  : state.selectedComponent,
                isSaving: false,
                lastSaved: new Date()
              };
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete screen',
              isSaving: false
            });
            throw error;
          }
        },

        setCurrentScreen: (screenId) => {
          set(state => ({
            currentScreen: state.screens.find(s => s.id === screenId) || null,
            selectedComponent: null
          }));
        },

        // Component Actions
        createComponent: async (componentData) => {
          const { currentProject } = get();
          if (!currentProject) {
            throw new Error('No project loaded');
          }

          set({ isSaving: true, error: null });
          try {
            const component = await databaseService.components.create({
              ...componentData,
              projectId: currentProject.id
            });
            
            set(state => ({
              components: [...state.components, component],
              selectedComponent: component,
              isSaving: false,
              lastSaved: new Date()
            }));
            
            return component;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create component',
              isSaving: false
            });
            throw error;
          }
        },

        updateComponent: async (componentId, updates) => {
          set({ isSaving: true, error: null });
          try {
            await databaseService.components.update(componentId, updates);
            
            set(state => ({
              components: state.components.map(c => 
                c.id === componentId ? { ...c, ...updates } : c
              ),
              selectedComponent: state.selectedComponent?.id === componentId
                ? { ...state.selectedComponent, ...updates }
                : state.selectedComponent,
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update component',
              isSaving: false
            });
            throw error;
          }
        },

        deleteComponent: async (componentId) => {
          set({ isSaving: true, error: null });
          try {
            await databaseService.components.delete(componentId);
            
            set(state => ({
              components: state.components.filter(c => c.id !== componentId),
              selectedComponent: state.selectedComponent?.id === componentId 
                ? null 
                : state.selectedComponent,
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete component',
              isSaving: false
            });
            throw error;
          }
        },

        selectComponent: (componentId) => {
          set(state => ({
            selectedComponent: componentId 
              ? state.components.find(c => c.id === componentId) || null
              : null
          }));
        },

        // Data Model Actions
        createDataModel: async (modelData) => {
          const { currentProject } = get();
          if (!currentProject) {
            throw new Error('No project loaded');
          }

          set({ isSaving: true, error: null });
          try {
            const id = crypto.randomUUID();
            const dataModel: DataModel = {
              ...modelData,
              id,
              projectId: currentProject.id
            };
            
            // TODO: Implement database service for data models
            
            set(state => ({
              dataModels: [...state.dataModels, dataModel],
              isSaving: false,
              lastSaved: new Date()
            }));
            
            return dataModel;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create data model',
              isSaving: false
            });
            throw error;
          }
        },

        updateDataModel: async (modelId, updates) => {
          set({ isSaving: true, error: null });
          try {
            // TODO: Implement database service for data models
            
            set(state => ({
              dataModels: state.dataModels.map(m => 
                m.id === modelId ? { ...m, ...updates } : m
              ),
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update data model',
              isSaving: false
            });
            throw error;
          }
        },

        deleteDataModel: async (modelId) => {
          set({ isSaving: true, error: null });
          try {
            // TODO: Implement database service for data models
            
            set(state => ({
              dataModels: state.dataModels.filter(m => m.id !== modelId),
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete data model',
              isSaving: false
            });
            throw error;
          }
        },

        // User Journey Actions
        createUserJourney: async (journeyData) => {
          const { currentProject } = get();
          if (!currentProject) {
            throw new Error('No project loaded');
          }

          set({ isSaving: true, error: null });
          try {
            const id = crypto.randomUUID();
            const userJourney: UserJourney = {
              ...journeyData,
              id,
              projectId: currentProject.id
            };
            
            // TODO: Implement database service for user journeys
            
            set(state => ({
              userJourneys: [...state.userJourneys, userJourney],
              isSaving: false,
              lastSaved: new Date()
            }));
            
            return userJourney;
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to create user journey',
              isSaving: false
            });
            throw error;
          }
        },

        updateUserJourney: async (journeyId, updates) => {
          set({ isSaving: true, error: null });
          try {
            // TODO: Implement database service for user journeys
            
            set(state => ({
              userJourneys: state.userJourneys.map(j => 
                j.id === journeyId ? { ...j, ...updates } : j
              ),
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update user journey',
              isSaving: false
            });
            throw error;
          }
        },

        deleteUserJourney: async (journeyId) => {
          set({ isSaving: true, error: null });
          try {
            // TODO: Implement database service for user journeys
            
            set(state => ({
              userJourneys: state.userJourneys.filter(j => j.id !== journeyId),
              isSaving: false,
              lastSaved: new Date()
            }));
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to delete user journey',
              isSaving: false
            });
            throw error;
          }
        },

        // Design System Actions
        updateDesignSystem: async (updates) => {
          const { currentProject, designSystem } = get();
          if (!currentProject) {
            throw new Error('No project loaded');
          }

          set({ isSaving: true, error: null });
          try {
            const updatedDesignSystem = designSystem 
              ? { ...designSystem, ...updates, lastModified: new Date() }
              : {
                  id: crypto.randomUUID(),
                  projectId: currentProject.id,
                  version: 1,
                  colors: {
                    primary: {
                      50: '#EFF6FF',
                      100: '#DBEAFE',
                      200: '#BFDBFE',
                      300: '#93C5FD',
                      400: '#60A5FA',
                      500: '#3B82F6',
                      600: '#2563EB',
                      700: '#1D4ED8',
                      800: '#1E40AF',
                      900: '#1E3A8A'
                    },
                    secondary: {
                      50: '#F5F3FF',
                      100: '#EDE9FE',
                      200: '#DDD6FE',
                      300: '#C4B5FD',
                      400: '#A78BFA',
                      500: '#8B5CF6',
                      600: '#7C3AED',
                      700: '#6D28D9',
                      800: '#5B21B6',
                      900: '#4C1D95'
                    },
                    neutral: {
                      50: '#F9FAFB',
                      100: '#F3F4F6',
                      200: '#E5E7EB',
                      300: '#D1D5DB',
                      400: '#9CA3AF',
                      500: '#6B7280',
                      600: '#4B5563',
                      700: '#374151',
                      800: '#1F2937',
                      900: '#111827'
                    },
                    success: '#10B981',
                    warning: '#F59E0B',
                    error: '#EF4444',
                    info: '#3B82F6',
                    custom: {}
                  },
                  typography: {
                    fontFamilies: [
                      { name: 'Inter', fallback: 'system-ui, sans-serif', type: 'sans-serif' as const },
                      { name: 'Georgia', fallback: 'serif', type: 'serif' as const },
                      { name: 'Menlo', fallback: 'monospace', type: 'monospace' as const }
                    ],
                    fontSizes: [
                      { name: 'xs', size: 12, unit: 'px' as const },
                      { name: 'sm', size: 14, unit: 'px' as const },
                      { name: 'base', size: 16, unit: 'px' as const },
                      { name: 'lg', size: 18, unit: 'px' as const },
                      { name: 'xl', size: 20, unit: 'px' as const },
                      { name: '2xl', size: 24, unit: 'px' as const },
                      { name: '3xl', size: 30, unit: 'px' as const },
                      { name: '4xl', size: 36, unit: 'px' as const },
                      { name: '5xl', size: 48, unit: 'px' as const }
                    ],
                    fontWeights: [
                      { name: 'light', value: 300 },
                      { name: 'regular', value: 400 },
                      { name: 'medium', value: 500 },
                      { name: 'semibold', value: 600 },
                      { name: 'bold', value: 700 }
                    ],
                    lineHeights: [
                      { name: 'tight', value: 1.25 },
                      { name: 'normal', value: 1.5 },
                      { name: 'relaxed', value: 1.75 },
                      { name: 'loose', value: 2 }
                    ],
                    letterSpacings: [
                      { name: 'tight', value: -0.05, unit: 'em' as const },
                      { name: 'normal', value: 0, unit: 'em' as const },
                      { name: 'wide', value: 0.05, unit: 'em' as const }
                    ]
                  },
                  spacing: {
                    base: 4,
                    unit: 'px' as const,
                    scale: [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 56, 64]
                  },
                  borders: {
                    widths: [0, 1, 2, 4, 8],
                    styles: ['solid', 'dashed', 'dotted', 'double', 'none'],
                    radii: [0, 2, 4, 6, 8, 12, 16, 24, 9999]
                  },
                  shadows: {
                    shadows: [
                      { name: 'sm', value: '0 1px 2px 0 rgb(0 0 0 / 0.05)' },
                      { name: 'base', value: '0 1px 3px 0 rgb(0 0 0 / 0.1)' },
                      { name: 'md', value: '0 4px 6px -1px rgb(0 0 0 / 0.1)' },
                      { name: 'lg', value: '0 10px 15px -3px rgb(0 0 0 / 0.1)' },
                      { name: 'xl', value: '0 20px 25px -5px rgb(0 0 0 / 0.1)' },
                      { name: '2xl', value: '0 25px 50px -12px rgb(0 0 0 / 0.25)' },
                      { name: 'inner', value: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)' },
                      { name: 'none', value: 'none' }
                    ]
                  },
                  animations: {
                    durations: [
                      { name: 'fast', value: 150 },
                      { name: 'normal', value: 300 },
                      { name: 'slow', value: 500 }
                    ],
                    easings: [
                      { name: 'linear', value: 'linear' },
                      { name: 'in', value: 'cubic-bezier(0.4, 0, 1, 1)' },
                      { name: 'out', value: 'cubic-bezier(0, 0, 0.2, 1)' },
                      { name: 'in-out', value: 'cubic-bezier(0.4, 0, 0.2, 1)' }
                    ],
                    animations: []
                  },
                  componentStyles: [],
                  ...updates,
                  lastModified: new Date()
                };

            // TODO: Implement database service for design system
            
            set({
              designSystem: updatedDesignSystem,
              isSaving: false,
              lastSaved: new Date()
            });
          } catch (error) {
            set({
              error: error instanceof Error ? error.message : 'Failed to update design system',
              isSaving: false
            });
            throw error;
          }
        },

        // Utility Actions
        clearError: () => {
          set({ error: null });
        },

        autoSave: async () => {
          const { currentProject, isSaving } = get();
          if (!currentProject || isSaving) return;

          set({ isSaving: true });
          try {
            await databaseService.projects.update(currentProject.id, {
              lastModified: new Date()
            });
            set({ isSaving: false, lastSaved: new Date() });
          } catch (error) {
            console.error('Autosave failed:', error);
            set({ isSaving: false });
          }
        }
      }),
      {
        name: 'project-storage',
        partialize: (state) => ({
          // Only persist the current project ID
          currentProjectId: state.currentProject?.id
        })
      }
    ),
    {
      name: 'ProjectStore'
    }
  )
);

// Selector hooks
export const useCurrentProject = () => useProjectStore((state) => state.currentProject);
export const useCurrentScreen = () => useProjectStore((state) => state.currentScreen);
export const useSelectedComponent = () => useProjectStore((state) => state.selectedComponent);
export const useProjectScreens = () => useProjectStore((state) => state.screens);
export const useProjectComponents = () => useProjectStore((state) => state.components);
export const useProjectDataModels = () => useProjectStore((state) => state.dataModels);
export const useProjectUserJourneys = () => useProjectStore((state) => state.userJourneys);
export const useProjectDesignSystem = () => useProjectStore((state) => state.designSystem);
export const useProjectLoading = () => useProjectStore((state) => state.isLoading);
export const useProjectSaving = () => useProjectStore((state) => state.isSaving);
export const useProjectError = () => useProjectStore((state) => state.error);
export const useProjectLastSaved = () => useProjectStore((state) => state.lastSaved);

// Auto-save interval (every 30 seconds)
if (typeof window !== 'undefined') {
  setInterval(() => {
    const { autoSave } = useProjectStore.getState();
    autoSave();
  }, 30000);
}