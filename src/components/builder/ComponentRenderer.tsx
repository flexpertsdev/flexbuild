import { useState } from 'react';
import type { Component } from '@/types/project';
import { useBuilderStore } from '@/stores/builderStore';
import { 
  Square, 
  Type, 
  Heading, 
  RectangleHorizontal,
  Image,
  TextCursor,
  ChevronDown,
  CheckSquare,
  List,
  Grid3x3,
  Move,
  Trash2,
  Copy
} from 'lucide-react';

interface ComponentRendererProps {
  component: Component;
  isSelected: boolean;
  onClick: (e: React.MouseEvent) => void;
}

// Icon mapping for component types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  container: Square,
  grid: Grid3x3,
  text: Type,
  heading: Heading,
  button: RectangleHorizontal,
  image: Image,
  input: TextCursor,
  select: ChevronDown,
  checkbox: CheckSquare,
  list: List,
  card: Square
};

export const ComponentRenderer = ({ component, isSelected, onClick }: ComponentRendererProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const componentDef = useBuilderStore(state => state.getComponentDefinition(component.componentType));
  
  const renderComponent = () => {
    // Merge default styles with component styles
    const styles: React.CSSProperties = {
      ...componentDef?.defaultStyles,
      ...component.styles,
      // Ensure positioning
      position: component.styles.position || 'relative'
    } as React.CSSProperties;

    switch (component.componentType) {
      case 'container':
      case 'grid':
      case 'card':
        return (
          <div
            className={`component-container ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
            style={styles}
          >
            {component.children.length === 0 && (
              <div className="flex items-center justify-center h-full min-h-[100px] text-neutral-400">
                <p className="text-sm">Empty {component.componentType}</p>
              </div>
            )}
          </div>
        );

      case 'text':
        return (
          <p style={styles}>
            {component.props.text || 'Text component'}
          </p>
        );

      case 'heading':
        const level = component.props.level || 'h2';
        const HeadingContent = <span style={styles}>{component.props.text || 'Heading'}</span>;
        
        switch (level) {
          case 'h1': return <h1>{HeadingContent}</h1>;
          case 'h2': return <h2>{HeadingContent}</h2>;
          case 'h3': return <h3>{HeadingContent}</h3>;
          case 'h4': return <h4>{HeadingContent}</h4>;
          case 'h5': return <h5>{HeadingContent}</h5>;
          case 'h6': return <h6>{HeadingContent}</h6>;
          default: return <h2>{HeadingContent}</h2>;
        }

      case 'button':
        return (
          <button
            style={styles}
            className={`component-button ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
          >
            {component.props.text || 'Button'}
          </button>
        );

      case 'image':
        return (
          <img
            src={component.props.src || 'https://via.placeholder.com/300x200'}
            alt={component.props.alt || 'Image'}
            style={styles}
            className={isSelected ? 'ring-2 ring-primary-500' : ''}
          />
        );

      case 'input':
        return (
          <div style={{ width: styles?.width || '100%' }}>
            {component.props.label && (
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {component.props.label}
              </label>
            )}
            <input
              type={component.props.type || 'text'}
              placeholder={component.props.placeholder || 'Enter text...'}
              style={styles}
              className={`component-input ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
              readOnly
            />
          </div>
        );

      case 'select':
        return (
          <div style={{ width: styles?.width || '100%' }}>
            {component.props.label && (
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                {component.props.label}
              </label>
            )}
            <select
              style={styles}
              className={`component-select ${isSelected ? 'ring-2 ring-primary-500' : ''}`}
              disabled
            >
              <option>{component.props.placeholder || 'Select an option'}</option>
              {component.props.options?.map((opt: any, idx: number) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'checkbox':
        return (
          <label style={styles} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={component.props.checked || false}
              readOnly
              className={isSelected ? 'ring-2 ring-primary-500' : ''}
            />
            <span>{component.props.label || 'Checkbox'}</span>
          </label>
        );

      case 'list':
        return (
          <div style={styles} className={isSelected ? 'ring-2 ring-primary-500' : ''}>
            {component.children.length === 0 && (
              <div className="text-neutral-400 p-4 text-center">
                <List className="w-8 h-8 mx-auto mb-2" />
                <p className="text-sm">Empty list</p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div
            style={styles}
            className={`p-4 border-2 border-dashed border-neutral-300 ${
              isSelected ? 'ring-2 ring-primary-500' : ''
            }`}
          >
            <p className="text-sm text-neutral-500">
              Unknown component: {component.componentType}
            </p>
          </div>
        );
    }
  };

  const IconComponent = iconMap[component.componentType] || Square;

  return (
    <div
      className={`component-wrapper relative group ${isSelected ? 'z-10' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        position: component.styles.position || 'relative',
        left: component.styles.left,
        top: component.styles.top,
        width: component.styles.width,
        height: component.styles.height
      }}
    >
      {/* Component Label */}
      {(isHovered || isSelected) && (
        <div
          className={`absolute -top-8 left-0 flex items-center gap-1 px-2 py-1 text-xs rounded ${
            isSelected 
              ? 'bg-primary-500 text-white' 
              : 'bg-neutral-900 text-white'
          }`}
        >
          <IconComponent className="w-3 h-3" />
          <span>{componentDef?.displayName || component.componentType}</span>
        </div>
      )}

      {/* Component Actions */}
      {isSelected && (
        <div className="absolute -right-2 -top-2 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-neutral-200 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
            title="Move"
            onClick={(e) => e.stopPropagation()}
          >
            <Move className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:bg-neutral-100 rounded transition-colors"
            title="Duplicate"
            onClick={(e) => e.stopPropagation()}
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            className="p-1 hover:bg-neutral-100 rounded transition-colors text-error"
            title="Delete"
            onClick={(e) => e.stopPropagation()}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Render the actual component */}
      {renderComponent()}

      {/* Selection outline */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary-500 pointer-events-none rounded" />
      )}
    </div>
  );
};