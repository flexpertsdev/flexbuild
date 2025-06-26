import { useRef, useState } from 'react';
import { useProjectStore, useCurrentScreen } from '@/stores/projectStore';
import { useBuilderStore } from '@/stores/builderStore';
import { Plus, MousePointer, Move } from 'lucide-react';
import { ComponentRenderer } from './ComponentRenderer';

export const VisualCanvas = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const screen = useCurrentScreen();
  const { components, createComponent } = useProjectStore();
  const { 
    zoom, 
    showGrid, 
    canvasSize,
    dragState,
    setDropTarget,
    endDrag,
    selectedComponentIds,
    selectComponent,
    clearSelection
  } = useBuilderStore();

  const [dropIndicator, setDropIndicator] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';

    if (!dragState?.isDragging || !screen) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    // Calculate position relative to canvas
    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    // Show drop indicator
    setDropIndicator({
      x: Math.round(x / 16) * 16, // Snap to 16px grid
      y: Math.round(y / 16) * 16,
      width: 200,
      height: 100
    });

    // Update drop target
    setDropTarget({
      targetId: screen.id,
      targetType: 'screen',
      position: { x, y },
      isValid: true
    });
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the canvas entirely
    if (e.currentTarget === e.target) {
      setDropIndicator(null);
      setDropTarget(null);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDropIndicator(null);

    if (!dragState?.isDragging || !screen) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / (zoom / 100);
    const y = (e.clientY - rect.top) / (zoom / 100);

    if (dragState.draggedItem?.type === 'new_component' && dragState.draggedItem?.componentType) {
      // Create new component
      const componentDef = useBuilderStore.getState().getComponentDefinition(dragState.draggedItem.componentType);
      if (!componentDef) return;

      await createComponent({
        screenId: screen.id,
        projectId: screen.projectId,
        componentType: dragState.draggedItem.componentType,
        props: componentDef.defaultProps,
        styles: {
          ...componentDef.defaultStyles,
          position: 'absolute',
          left: `${Math.round(x / 16) * 16}px`,
          top: `${Math.round(y / 16) * 16}px`
        },
        children: [],
        parentId: undefined,
        actions: []
      });
    }

    endDrag();
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    // Clear selection if clicking on empty canvas
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  };

  const handleComponentClick = (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const isMultiSelect = e.ctrlKey || e.metaKey;
    selectComponent(componentId, isMultiSelect);
  };

  // Filter components for current screen
  const screenComponents = components.filter(c => c.screenId === screen?.id);

  if (!screen) {
    return (
      <div className="flex-1 flex items-center justify-center bg-neutral-100">
        <div className="text-center">
          <p className="text-neutral-600">No screen selected</p>
          <p className="text-sm text-neutral-500 mt-1">
            Create or select a screen to start building
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-neutral-100 overflow-hidden relative">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white rounded-lg shadow-sm border border-neutral-200 p-1">
        <button
          className="p-2 hover:bg-neutral-100 rounded transition-colors"
          title="Select tool"
        >
          <MousePointer className="w-4 h-4" />
        </button>
        <button
          className="p-2 hover:bg-neutral-100 rounded transition-colors"
          title="Move tool"
        >
          <Move className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-neutral-200" />
        <div className="px-3 py-2 text-sm text-neutral-600">
          {zoom}%
        </div>
      </div>

      {/* Canvas Container */}
      <div className="w-full h-full overflow-auto p-8">
        <div
          className="mx-auto relative"
          style={{
            width: `${canvasSize.width}px`,
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
        >
          {/* Canvas */}
          <div
            ref={canvasRef}
            className={`bg-white shadow-xl relative ${
              showGrid ? 'bg-grid-pattern' : ''
            }`}
            style={{
              width: `${canvasSize.width}px`,
              height: `${canvasSize.height}px`,
              minHeight: '100vh'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleCanvasClick}
          >
            {/* Screen content */}
            {screenComponents.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <Plus className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-neutral-500">Drag components here to start building</p>
                </div>
              </div>
            ) : (
              <div className="relative w-full h-full">
                {screenComponents.map(component => (
                  <ComponentRenderer
                    key={component.id}
                    component={component}
                    isSelected={selectedComponentIds.includes(component.id)}
                    onClick={(e) => handleComponentClick(component.id, e)}
                  />
                ))}
              </div>
            )}

            {/* Drop Indicator */}
            {dropIndicator && (
              <div
                className="absolute border-2 border-dashed border-primary-500 bg-primary-50 bg-opacity-20 pointer-events-none rounded"
                style={{
                  left: `${dropIndicator.x}px`,
                  top: `${dropIndicator.y}px`,
                  width: `${dropIndicator.width}px`,
                  height: `${dropIndicator.height}px`
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};