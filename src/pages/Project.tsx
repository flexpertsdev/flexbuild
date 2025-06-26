import { useEffect, useState } from 'react';
import { useProject } from '@/hooks/useProject';
import { ComponentPalette } from '@/components/builder/ComponentPalette';
import { VisualCanvas } from '@/components/builder/VisualCanvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { useProjectStore } from '@/stores/projectStore';
import { 
  Loader2, 
  AlertCircle, 
  Save, 
  Download, 
  Share2, 
  Settings,
  Plus,
  Layers,
  Database,
  Route,
  Palette,
  Component,
  Eye,
  Code2,
  Smartphone,
  Tablet,
  Monitor,
  ZoomIn,
  ZoomOut,
  Grid,
  X
} from 'lucide-react';
import { useBuilderStore } from '@/stores/builderStore';
import { AIChat } from '@/components/ai/AIChat';
import { useAIStore } from '@/stores/aiStore';

export const Project = () => {
  const {
    project,
    screens,
    isLoading,
    isSaving,
    error,
    lastSaved,
    createScreen,
    clearError
  } = useProject();
  
  const { setCurrentScreen } = useProjectStore();
  const { 
    viewMode, 
    setViewMode, 
    zoom, 
    setZoom, 
    showGrid, 
    toggleShowGrid,
    canvasSize,
    setCanvasSize
  } = useBuilderStore();
  
  const [selectedScreenId, setSelectedScreenId] = useState<string | null>(null);
  const [showComponents, setShowComponents] = useState(true);
  
  const { setContext } = useAIStore();

  useEffect(() => {
    // Clear any errors when component mounts
    clearError();
  }, [clearError]);
  
  useEffect(() => {
    // Select the first screen by default if no screen is selected
    if (screens.length > 0 && !selectedScreenId) {
      const firstScreen = screens[0];
      setSelectedScreenId(firstScreen.id);
      setCurrentScreen(firstScreen.id);
    }
  }, [screens, selectedScreenId, setCurrentScreen]);
  
  useEffect(() => {
    // Update AI context when project or screen changes
    if (project && selectedScreenId) {
      setContext({
        projectId: project.id,
        screenId: selectedScreenId
      });
    }
  }, [project, selectedScreenId, setContext]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Error Loading Project</h2>
          <p className="text-neutral-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Project Not Found</h2>
          <p className="text-neutral-600">The requested project could not be found.</p>
        </div>
      </div>
    );
  }

  const handleCreateScreen = async () => {
    try {
      const newScreen = await createScreen({
        name: `Screen ${screens.length + 1}`,
        type: 'landing',
        isHomePage: screens.length === 0,
        purpose: 'Main screen',
        routePath: `/screen-${screens.length + 1}`,
        componentCount: 0,
        projectId: project.id
      });
      
      if (newScreen) {
        setSelectedScreenId(newScreen.id);
        setCurrentScreen(newScreen.id);
      }
    } catch (error) {
      console.error('Failed to create screen:', error);
    }
  };
  
  const handleSelectScreen = (screenId: string) => {
    setSelectedScreenId(screenId);
    setCurrentScreen(screenId);
  };
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 10, 200));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 10, 25));
  };
  
  const handleDeviceChange = (device: 'desktop' | 'tablet' | 'mobile') => {
    const sizes = {
      desktop: { width: 1280, height: 800, device: 'desktop' as const },
      tablet: { width: 768, height: 1024, device: 'tablet' as const },
      mobile: { width: 375, height: 812, device: 'mobile' as const }
    };
    setCanvasSize(sizes[device]);
  };

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Left Sidebar - Project Navigation */}
      <div className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        {/* Project Header */}
        <div className="p-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900 truncate">{project.name}</h2>
          <p className="text-sm text-neutral-600 mt-1">
            {project.screenCount} screens • {project.componentCount} components
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex-1 overflow-y-auto">
          {/* Screens Section */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Screens
              </h3>
              <button
                onClick={handleCreateScreen}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                title="Add Screen"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            
            {screens.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-neutral-500 mb-3">No screens yet</p>
                <button
                  onClick={handleCreateScreen}
                  className="text-sm text-primary-600 hover:text-primary-700"
                >
                  Create first screen
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {screens.map((screen) => (
                  <button
                    key={screen.id}
                    onClick={() => handleSelectScreen(screen.id)}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      selectedScreenId === screen.id 
                        ? 'bg-primary-100 text-primary-700 hover:bg-primary-200' 
                        : 'hover:bg-neutral-100'
                    }`}
                  >
                    {screen.name}
                    {screen.isHomePage && (
                      <span className="ml-2 text-xs text-neutral-500">Home</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data Models Section */}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Models
              </h3>
              <button
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                title="Add Data Model"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            <p className="text-sm text-neutral-500">No data models yet</p>
          </div>

          {/* User Journeys Section */}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Route className="w-4 h-4" />
                User Journeys
              </h3>
              <button
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                title="Add User Journey"
              >
                <Plus className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            <p className="text-sm text-neutral-500">No user journeys yet</p>
          </div>

          {/* Design System Section */}
          <div className="p-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-neutral-700 flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Design System
              </h3>
              <button
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
                title="Edit Design System"
              >
                <Settings className="w-4 h-4 text-neutral-600" />
              </button>
            </div>
            <p className="text-sm text-neutral-500">Default theme</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-neutral-200 space-y-2">
          <button className="w-full px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
            <Download className="w-4 h-4" />
            Export Code
          </button>
          <button className="w-full px-4 py-2 text-sm border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Project
          </button>
        </div>
      </div>

      {/* Component Palette */}
      {showComponents && (
        <div className="w-64 bg-white border-r border-neutral-200">
          <div className="h-14 px-4 border-b border-neutral-200 flex items-center justify-between">
            <h3 className="font-medium text-neutral-900 flex items-center gap-2">
              <Component className="w-4 h-4" />
              Components
            </h3>
            <button
              onClick={() => setShowComponents(false)}
              className="p-1 hover:bg-neutral-100 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ComponentPalette />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            {/* View Mode Switcher */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('design')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'design' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Design
              </button>
              <button
                onClick={() => setViewMode('preview')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'preview' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => setViewMode('code')}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  viewMode === 'code' 
                    ? 'bg-white text-neutral-900 shadow-sm' 
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                <Code2 className="w-4 h-4 inline mr-1" />
                Code
              </button>
            </div>

            {/* Device Preview */}
            <div className="flex items-center gap-1 border-l pl-4">
              <button
                onClick={() => handleDeviceChange('desktop')}
                className={`p-2 rounded transition-colors ${
                  canvasSize.device === 'desktop'
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Desktop"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeviceChange('tablet')}
                className={`p-2 rounded transition-colors ${
                  canvasSize.device === 'tablet'
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Tablet"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeviceChange('mobile')}
                className={`p-2 rounded transition-colors ${
                  canvasSize.device === 'mobile'
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Mobile"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border-l pl-4">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-neutral-100 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-neutral-600 min-w-[3rem] text-center">
                {zoom}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-neutral-100 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={toggleShowGrid}
                className={`p-2 rounded transition-colors ${
                  showGrid
                    ? 'bg-neutral-200 text-neutral-900'
                    : 'hover:bg-neutral-100 text-neutral-600'
                }`}
                title="Toggle Grid"
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>

            {/* Toggle Components Palette */}
            {!showComponents && (
              <button
                onClick={() => setShowComponents(true)}
                className="p-2 hover:bg-neutral-100 rounded transition-colors"
                title="Show Components"
              >
                <Component className="w-4 h-4" />
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {lastSaved && (
              <p className="text-sm text-neutral-600">
                Last saved {new Date(lastSaved).toLocaleTimeString()}
              </p>
            )}
            {isSaving && (
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </div>
            )}
            <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
              <Save className="w-5 h-5 text-neutral-700" />
            </button>
            <button className="p-2 hover:bg-neutral-100 rounded transition-colors">
              <Settings className="w-5 h-5 text-neutral-700" />
            </button>
          </div>
        </div>

        {/* Canvas/Builder Area */}
        <div className="flex-1">
          {viewMode === 'design' && (
            <VisualCanvas />
          )}
          {viewMode === 'preview' && (
            <div className="flex-1 bg-neutral-100 flex items-center justify-center">
              <p className="text-neutral-600">Preview mode coming soon</p>
            </div>
          )}
          {viewMode === 'code' && (
            <div className="flex-1 bg-neutral-900 flex items-center justify-center">
              <p className="text-neutral-400">Code view coming soon</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar - Properties Panel */}
      <div className="w-80 bg-white border-l border-neutral-200">
        <PropertiesPanel />
      </div>
      
      {/* AI Chat */}
      <AIChat />
    </div>
  );
};