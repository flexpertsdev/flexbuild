import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { useAuth } from '@/hooks/useAuth';

export const useProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  
  const {
    currentProject,
    currentScreen,
    selectedComponent,
    screens,
    components,
    dataModels,
    userJourneys,
    designSystem,
    isLoading,
    isSaving,
    error,
    lastSaved,
    loadProject,
    createProject,
    updateProject,
    deleteProject,
    clearProject,
    createScreen,
    updateScreen,
    deleteScreen,
    setCurrentScreen,
    createComponent,
    updateComponent,
    deleteComponent,
    selectComponent,
    createDataModel,
    updateDataModel,
    deleteDataModel,
    createUserJourney,
    updateUserJourney,
    deleteUserJourney,
    updateDesignSystem,
    clearError
  } = useProjectStore();

  // Load project when projectId changes
  useEffect(() => {
    if (projectId && user) {
      loadProject(projectId).catch((error) => {
        console.error('Failed to load project:', error);
        navigate('/dashboard');
      });
    }
    
    return () => {
      clearProject();
    };
  }, [projectId, user, loadProject, clearProject, navigate]);

  // Enhanced actions with navigation
  const createProjectAndNavigate = useCallback(async (projectData: Parameters<typeof createProject>[0]) => {
    try {
      const project = await createProject(projectData);
      navigate(`/project/${project.id}`);
      return project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }, [createProject, navigate]);

  const deleteProjectAndNavigate = useCallback(async () => {
    if (!currentProject) return;
    
    try {
      await deleteProject(currentProject.id);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }, [currentProject, deleteProject, navigate]);

  // Screen management helpers
  const navigateToScreen = useCallback((screenId: string) => {
    if (!currentProject) return;
    
    setCurrentScreen(screenId);
    navigate(`/project/${currentProject.id}/screen/${screenId}`);
  }, [currentProject, setCurrentScreen, navigate]);

  const createScreenAndNavigate = useCallback(async (screenData: Parameters<typeof createScreen>[0]) => {
    try {
      const screen = await createScreen(screenData);
      navigateToScreen(screen.id);
      return screen;
    } catch (error) {
      console.error('Failed to create screen:', error);
      throw error;
    }
  }, [createScreen, navigateToScreen]);

  // Component selection helpers
  const selectComponentById = useCallback((componentId: string | null) => {
    selectComponent(componentId);
  }, [selectComponent]);

  const selectComponentByIndex = useCallback((index: number) => {
    const screenComponents = components.filter(c => c.screenId === currentScreen?.id);
    if (screenComponents[index]) {
      selectComponent(screenComponents[index].id);
    }
  }, [components, currentScreen, selectComponent]);

  // Export project data
  const exportProject = useCallback(() => {
    if (!currentProject) return null;

    return {
      project: currentProject,
      screens,
      components,
      dataModels,
      userJourneys,
      designSystem,
      exportedAt: new Date().toISOString()
    };
  }, [currentProject, screens, components, dataModels, userJourneys, designSystem]);

  // Get components for current screen
  const currentScreenComponents = components.filter(c => c.screenId === currentScreen?.id);

  return {
    // State
    project: currentProject,
    screen: currentScreen,
    component: selectedComponent,
    screens,
    components: currentScreenComponents,
    allComponents: components,
    dataModels,
    userJourneys,
    designSystem,
    isLoading,
    isSaving,
    error,
    lastSaved,
    
    // Project actions
    createProject: createProjectAndNavigate,
    updateProject,
    deleteProject: deleteProjectAndNavigate,
    exportProject,
    
    // Screen actions
    createScreen: createScreenAndNavigate,
    updateScreen,
    deleteScreen,
    setCurrentScreen: navigateToScreen,
    
    // Component actions
    createComponent,
    updateComponent,
    deleteComponent,
    selectComponent: selectComponentById,
    selectComponentByIndex,
    clearSelection: () => selectComponent(null),
    
    // Data model actions
    createDataModel,
    updateDataModel,
    deleteDataModel,
    
    // User journey actions
    createUserJourney,
    updateUserJourney,
    deleteUserJourney,
    
    // Design system actions
    updateDesignSystem,
    
    // Utilities
    clearError,
    isOwner: currentProject?.ownerId === user?.id,
    canEdit: currentProject?.ownerId === user?.id || 
             (currentProject?.collaboratorCount ?? 0) > 0
  };
};