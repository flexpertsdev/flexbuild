import { useState } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useBuilderStore } from '@/stores/builderStore';
import { 
  X,
  Palette,
  Layout,
  Database,
  Code,
  MousePointer,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';

interface PropertyGroup {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  expanded: boolean;
}

export const PropertiesPanel = () => {
  const { components, updateComponent } = useProjectStore();
  const { selectedComponentIds, clearSelection, componentDefinitions } = useBuilderStore();
  
  const [propertyGroups, setPropertyGroups] = useState<Record<string, PropertyGroup>>({
    general: { label: 'General', icon: Layout, expanded: true },
    properties: { label: 'Properties', icon: MousePointer, expanded: true },
    styling: { label: 'Styling', icon: Palette, expanded: false },
    data: { label: 'Data', icon: Database, expanded: false },
    advanced: { label: 'Advanced', icon: Code, expanded: false }
  });

  const toggleGroup = (groupKey: string) => {
    setPropertyGroups(prev => ({
      ...prev,
      [groupKey]: {
        ...prev[groupKey],
        expanded: !prev[groupKey].expanded
      }
    }));
  };

  // Get selected component
  const selectedComponent = selectedComponentIds.length === 1
    ? components.find(c => c.id === selectedComponentIds[0])
    : null;

  const componentDef = selectedComponent
    ? componentDefinitions.get(selectedComponent.componentType)
    : null;

  const handlePropertyChange = (property: string, value: any) => {
    if (!selectedComponent) return;

    updateComponent(selectedComponent.id, {
      props: {
        ...selectedComponent.props,
        [property]: value
      }
    });
  };

  const handleStyleChange = (style: string, value: any) => {
    if (!selectedComponent) return;

    updateComponent(selectedComponent.id, {
      styles: {
        ...selectedComponent.styles,
        [style]: value
      }
    });
  };

  const renderPropertyInput = (key: string, value: any, type: string = 'text') => {
    switch (type) {
      case 'boolean':
        return (
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => handlePropertyChange(key, e.target.checked)}
            className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
          />
        );
      
      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            {/* Options would be defined per property */}
          </select>
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value || 0}
            onChange={(e) => handlePropertyChange(key, parseFloat(e.target.value))}
            className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handlePropertyChange(key, e.target.value)}
            className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        );
    }
  };

  const renderStyleInput = (key: string, value: any, hasUnit: boolean = false) => {
    const units = hasUnit ? ['px', '%', 'em', 'rem', 'vh', 'vw'] : null;
    const numericValue = value ? parseFloat(value) : 0;
    const currentUnit = value ? value.toString().replace(/[\d.-]/g, '') : 'px';

    return (
      <div className="flex gap-1">
        <input
          type="number"
          value={numericValue}
          onChange={(e) => {
            const newValue = e.target.value + (units ? currentUnit : '');
            handleStyleChange(key, newValue);
          }}
          className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded-l focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        />
        {units && (
          <select
            value={currentUnit}
            onChange={(e) => {
              const newValue = numericValue + e.target.value;
              handleStyleChange(key, newValue);
            }}
            className="px-2 py-1 text-sm border border-neutral-300 rounded-r focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            {units.map(u => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        )}
      </div>
    );
  };

  if (selectedComponentIds.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <MousePointer className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-600">No component selected</p>
          <p className="text-sm text-neutral-500 mt-1">
            Select a component to edit properties
          </p>
        </div>
      </div>
    );
  }

  if (selectedComponentIds.length > 1) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-neutral-600">Multiple components selected</p>
          <p className="text-sm text-neutral-500 mt-1">
            Select a single component to edit
          </p>
        </div>
      </div>
    );
  }

  if (!selectedComponent || !componentDef) {
    return null;
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded flex items-center justify-center">
            <MousePointer className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <h3 className="font-medium text-sm">{componentDef.displayName}</h3>
            <p className="text-xs text-neutral-500">ID: {selectedComponent.id.slice(0, 8)}</p>
          </div>
        </div>
        <button
          onClick={clearSelection}
          className="p-1 hover:bg-neutral-100 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Properties */}
      <div className="flex-1 overflow-y-auto">
        {/* General Properties */}
        <div className="border-b border-neutral-100">
          <button
            onClick={() => toggleGroup('general')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium">General</span>
            </div>
            {propertyGroups.general.expanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          
          {propertyGroups.general.expanded && (
            <div className="px-4 py-3 space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">
                  Component Type
                </label>
                <input
                  type="text"
                  value={componentDef.displayName}
                  disabled
                  className="w-full px-2 py-1 text-sm bg-neutral-100 border border-neutral-300 rounded cursor-not-allowed"
                />
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 transition-colors">
                  {selectedComponent.visible !== false ? (
                    <>
                      <Eye className="w-3 h-3" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3 h-3" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
                <button className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-sm border border-neutral-300 rounded hover:bg-neutral-50 transition-colors">
                  {selectedComponent.locked !== true ? (
                    <>
                      <Unlock className="w-3 h-3" />
                      <span>Unlocked</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3" />
                      <span>Locked</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Component Properties */}
        <div className="border-b border-neutral-100">
          <button
            onClick={() => toggleGroup('properties')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium">Properties</span>
            </div>
            {propertyGroups.properties.expanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          
          {propertyGroups.properties.expanded && (
            <div className="px-4 py-3 space-y-3">
              {/* Dynamic properties based on component type */}
              {selectedComponent.componentType === 'text' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Text Content
                    </label>
                    <textarea
                      value={selectedComponent.props.text || ''}
                      onChange={(e) => handlePropertyChange('text', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {selectedComponent.componentType === 'button' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Button Text
                    </label>
                    {renderPropertyInput('text', selectedComponent.props.text)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Variant
                    </label>
                    <select
                      value={selectedComponent.props.variant || 'primary'}
                      onChange={(e) => handlePropertyChange('variant', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="outline">Outline</option>
                      <option value="ghost">Ghost</option>
                    </select>
                  </div>
                </>
              )}
              
              {selectedComponent.componentType === 'image' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Image URL
                    </label>
                    {renderPropertyInput('src', selectedComponent.props.src)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Alt Text
                    </label>
                    {renderPropertyInput('alt', selectedComponent.props.alt)}
                  </div>
                </>
              )}
              
              {selectedComponent.componentType === 'input' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Label
                    </label>
                    {renderPropertyInput('label', selectedComponent.props.label)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Placeholder
                    </label>
                    {renderPropertyInput('placeholder', selectedComponent.props.placeholder)}
                  </div>
                  <div>
                    <label className="text-xs font-medium text-neutral-700 block mb-1">
                      Type
                    </label>
                    <select
                      value={selectedComponent.props.type || 'text'}
                      onChange={(e) => handlePropertyChange('type', e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="text">Text</option>
                      <option value="email">Email</option>
                      <option value="password">Password</option>
                      <option value="number">Number</option>
                      <option value="tel">Phone</option>
                      <option value="url">URL</option>
                    </select>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Styling */}
        <div className="border-b border-neutral-100">
          <button
            onClick={() => toggleGroup('styling')}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-medium">Styling</span>
            </div>
            {propertyGroups.styling.expanded ? (
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-neutral-400" />
            )}
          </button>
          
          {propertyGroups.styling.expanded && (
            <div className="px-4 py-3 space-y-3">
              {/* Layout */}
              <div>
                <h4 className="text-xs font-medium text-neutral-700 mb-2">Layout</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Width</label>
                    {renderStyleInput('width', selectedComponent.styles.width, true)}
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Height</label>
                    {renderStyleInput('height', selectedComponent.styles.height, true)}
                  </div>
                </div>
              </div>
              
              {/* Spacing */}
              <div>
                <h4 className="text-xs font-medium text-neutral-700 mb-2">Spacing</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Padding</label>
                    {renderStyleInput('padding', selectedComponent.styles.padding, true)}
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Margin</label>
                    {renderStyleInput('margin', selectedComponent.styles.margin, true)}
                  </div>
                </div>
              </div>
              
              {/* Colors */}
              <div>
                <h4 className="text-xs font-medium text-neutral-700 mb-2">Colors</h4>
                <div className="space-y-2">
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Background</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        className="w-8 h-8 border border-neutral-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-neutral-600 block mb-1">Text Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={selectedComponent.styles.color || '#000000'}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="w-8 h-8 border border-neutral-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={selectedComponent.styles.color || '#000000'}
                        onChange={(e) => handleStyleChange('color', e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};