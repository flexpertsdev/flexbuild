import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  BuilderState, 
  DraggedItem, 
  DropTarget,
  ComponentDefinition,
  ComponentCategory 
} from '@/types/builder';

interface BuilderStore extends BuilderState {
  // View state
  setViewMode: (mode: BuilderState['viewMode']) => void;
  setZoom: (zoom: number) => void;
  toggleShowGrid: () => void;
  toggleShowRulers: () => void;
  setCanvasSize: (size: BuilderState['canvasSize']) => void;
  
  // Drag state
  startDrag: (item: DraggedItem, offset: { x: number; y: number }) => void;
  updateDragPosition: (position: { x: number; y: number }) => void;
  setDropTarget: (target: DropTarget | null) => void;
  endDrag: () => void;
  cancelDrag: () => void;
  
  // Component definitions
  componentDefinitions: Map<string, ComponentDefinition>;
  getComponentDefinition: (type: string) => ComponentDefinition | undefined;
  getComponentsByCategory: (category: ComponentCategory) => ComponentDefinition[];
  
  // Selection
  selectedComponentIds: string[];
  selectComponent: (componentId: string, multi?: boolean) => void;
  deselectComponent: (componentId: string) => void;
  clearSelection: () => void;
  
  // History
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

// Default component definitions
const defaultComponentDefinitions: ComponentDefinition[] = [
  // Layout Components
  {
    type: 'container',
    category: 'layout',
    displayName: 'Container',
    description: 'A flexible container for grouping elements',
    icon: 'Square',
    defaultProps: {
      direction: 'vertical',
      gap: 16,
      padding: 16,
      align: 'start',
      justify: 'start'
    },
    defaultStyles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      padding: '16px'
    },
    allowedChildren: ['*'],
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'grid',
    category: 'layout',
    displayName: 'Grid',
    description: 'A CSS grid container',
    icon: 'Grid3x3',
    defaultProps: {
      columns: 3,
      gap: 16,
      padding: 16
    },
    defaultStyles: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      padding: '16px'
    },
    allowedChildren: ['*'],
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  
  // Basic Components
  {
    type: 'text',
    category: 'basic',
    displayName: 'Text',
    description: 'Text content with typography options',
    icon: 'Type',
    defaultProps: {
      text: 'Enter your text here',
      variant: 'body',
      align: 'left'
    },
    defaultStyles: {
      fontSize: '16px',
      lineHeight: '1.5',
      color: '#111827'
    },
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'heading',
    category: 'basic',
    displayName: 'Heading',
    description: 'Heading text with levels H1-H6',
    icon: 'Heading',
    defaultProps: {
      text: 'Heading',
      level: 'h2',
      align: 'left'
    },
    defaultStyles: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.25',
      color: '#111827',
      marginBottom: '8px'
    },
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'button',
    category: 'basic',
    displayName: 'Button',
    description: 'Interactive button element',
    icon: 'RectangleHorizontal',
    defaultProps: {
      text: 'Click Me',
      variant: 'primary',
      size: 'medium'
    },
    defaultStyles: {
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: '500',
      backgroundColor: '#3B82F6',
      color: '#FFFFFF',
      border: 'none',
      cursor: 'pointer'
    },
    resizable: false,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'image',
    category: 'basic',
    displayName: 'Image',
    description: 'Display an image',
    icon: 'Image',
    defaultProps: {
      src: 'https://via.placeholder.com/300x200',
      alt: 'Placeholder image',
      objectFit: 'cover'
    },
    defaultStyles: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover'
    },
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  
  // Form Components
  {
    type: 'input',
    category: 'form',
    displayName: 'Input',
    description: 'Text input field',
    icon: 'TextCursor',
    defaultProps: {
      placeholder: 'Enter text...',
      type: 'text',
      label: 'Label'
    },
    defaultStyles: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px'
    },
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'select',
    category: 'form',
    displayName: 'Select',
    description: 'Dropdown selection',
    icon: 'ChevronDown',
    defaultProps: {
      placeholder: 'Select an option',
      options: [
        { label: 'Option 1', value: 'option1' },
        { label: 'Option 2', value: 'option2' }
      ],
      label: 'Label'
    },
    defaultStyles: {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #D1D5DB',
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: '#FFFFFF'
    },
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'checkbox',
    category: 'form',
    displayName: 'Checkbox',
    description: 'Checkbox input',
    icon: 'CheckSquare',
    defaultProps: {
      label: 'Checkbox label',
      checked: false
    },
    defaultStyles: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    resizable: false,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  
  // Data Components
  {
    type: 'list',
    category: 'data',
    displayName: 'List',
    description: 'Display data in a list format',
    icon: 'List',
    defaultProps: {
      itemTemplate: 'text',
      dataSource: 'static',
      items: []
    },
    defaultStyles: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    allowedChildren: ['*'],
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  },
  {
    type: 'card',
    category: 'data',
    displayName: 'Card',
    description: 'Card container for content',
    icon: 'Square',
    defaultProps: {
      elevation: 1,
      padding: 16
    },
    defaultStyles: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
    },
    allowedChildren: ['*'],
    resizable: true,
    draggable: true,
    duplicatable: true,
    deletable: true
  }
];

const componentDefinitionsMap = new Map(
  defaultComponentDefinitions.map(def => [def.type, def])
);

export const useBuilderStore = create<BuilderStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      viewMode: 'design',
      zoom: 100,
      showGrid: true,
      showRulers: false,
      canvasSize: {
        width: 1280,
        height: 800,
        device: 'desktop'
      },
      history: {
        past: [],
        present: { timestamp: Date.now(), state: {} },
        future: [],
        canUndo: false,
        canRedo: false
      },
      
      // Component definitions
      componentDefinitions: componentDefinitionsMap,
      
      // Selection state
      selectedComponentIds: [],
      
      // View actions
      setViewMode: (mode) => set({ viewMode: mode }),
      setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
      toggleShowGrid: () => set(state => ({ showGrid: !state.showGrid })),
      toggleShowRulers: () => set(state => ({ showRulers: !state.showRulers })),
      setCanvasSize: (size) => set({ canvasSize: size }),
      
      // Drag actions
      startDrag: (item, offset) => {
        set({
          dragState: {
            isDragging: true,
            draggedItem: item,
            dropTarget: null,
            dragOffset: offset
          }
        });
      },
      
      updateDragPosition: () => {
        const { dragState } = get();
        if (dragState?.isDragging) {
          // This would typically trigger drop target detection
          // For now, we'll just update the position
        }
      },
      
      setDropTarget: (target) => {
        set(state => ({
          dragState: state.dragState ? {
            ...state.dragState,
            dropTarget: target
          } : undefined
        }));
      },
      
      endDrag: () => {
        const { dragState } = get();
        if (dragState?.isDragging && dragState.dropTarget?.isValid) {
          // Handle the drop action here
          // This would create or move a component
        }
        set({ dragState: undefined });
      },
      
      cancelDrag: () => {
        set({ dragState: undefined });
      },
      
      // Component definition helpers
      getComponentDefinition: (type) => {
        return componentDefinitionsMap.get(type);
      },
      
      getComponentsByCategory: (category) => {
        return Array.from(componentDefinitionsMap.values()).filter(
          def => def.category === category
        );
      },
      
      // Selection actions
      selectComponent: (componentId, multi = false) => {
        set(state => ({
          selectedComponentIds: multi
            ? [...state.selectedComponentIds, componentId]
            : [componentId]
        }));
      },
      
      deselectComponent: (componentId) => {
        set(state => ({
          selectedComponentIds: state.selectedComponentIds.filter(id => id !== componentId)
        }));
      },
      
      clearSelection: () => {
        set({ selectedComponentIds: [] });
      },
      
      // History actions
      undo: () => {
        // TODO: Implement undo
      },
      
      redo: () => {
        // TODO: Implement redo
      },
      
      canUndo: false,
      canRedo: false
    }),
    {
      name: 'BuilderStore'
    }
  )
);

// Selector hooks
export const useViewMode = () => useBuilderStore(state => state.viewMode);
export const useZoom = () => useBuilderStore(state => state.zoom);
export const useShowGrid = () => useBuilderStore(state => state.showGrid);
export const useCanvasSize = () => useBuilderStore(state => state.canvasSize);
export const useDragState = () => useBuilderStore(state => state.dragState);
export const useSelectedComponentIds = () => useBuilderStore(state => state.selectedComponentIds);
export const useComponentDefinitions = () => useBuilderStore(state => state.componentDefinitions);