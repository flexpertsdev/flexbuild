import { useState } from 'react';
import { 
  Square, 
  Grid3x3, 
  Type, 
  Heading, 
  RectangleHorizontal,
  Image,
  TextCursor,
  ChevronDown,
  CheckSquare,
  List,
  Search,
  ChevronRight
} from 'lucide-react';
import { useBuilderStore } from '@/stores/builderStore';
import type { ComponentCategory, ComponentDefinition } from '@/types/builder';

// Icon mapping for component types
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Square,
  Grid3x3,
  Type,
  Heading,
  RectangleHorizontal,
  Image,
  TextCursor,
  ChevronDown,
  CheckSquare,
  List
};

const categoryConfig: Record<ComponentCategory, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  layout: { label: 'Layout', icon: Square },
  basic: { label: 'Basic', icon: Type },
  form: { label: 'Forms', icon: TextCursor },
  data: { label: 'Data', icon: List },
  navigation: { label: 'Navigation', icon: ChevronRight },
  feedback: { label: 'Feedback', icon: CheckSquare },
  media: { label: 'Media', icon: Image },
  advanced: { label: 'Advanced', icon: Grid3x3 }
};

export const ComponentPalette = () => {
  const { getComponentsByCategory, startDrag } = useBuilderStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<ComponentCategory>>(
    new Set(['layout', 'basic'])
  );

  const toggleCategory = (category: ComponentCategory) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  const handleDragStart = (component: ComponentDefinition, event: React.DragEvent) => {
    event.dataTransfer.effectAllowed = 'copy';
    
    // Calculate drag offset
    const rect = event.currentTarget.getBoundingClientRect();
    const offset = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };

    startDrag(
      {
        type: 'new_component',
        componentType: component.type,
        source: 'palette'
      },
      offset
    );
  };

  const filteredCategories = Object.keys(categoryConfig) as ComponentCategory[];
  
  return (
    <div className="w-full h-full flex flex-col bg-white">
      {/* Search Bar */}
      <div className="p-4 border-b border-neutral-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search components..."
            className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-y-auto">
        {filteredCategories.map(category => {
          const components = getComponentsByCategory(category);
          const CategoryIcon = categoryConfig[category].icon;
          const isExpanded = expandedCategories.has(category);
          
          // Filter components by search query
          const filteredComponents = searchQuery
            ? components.filter(c => 
                c.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.description.toLowerCase().includes(searchQuery.toLowerCase())
              )
            : components;

          if (filteredComponents.length === 0) return null;

          return (
            <div key={category} className="border-b border-neutral-100">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-neutral-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CategoryIcon className="w-4 h-4 text-neutral-600" />
                  <span className="text-sm font-medium text-neutral-900">
                    {categoryConfig[category].label}
                  </span>
                  <span className="text-xs text-neutral-500">
                    ({filteredComponents.length})
                  </span>
                </div>
                <ChevronRight 
                  className={`w-4 h-4 text-neutral-400 transition-transform ${
                    isExpanded ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {/* Component List */}
              {isExpanded && (
                <div className="px-2 py-2 space-y-1">
                  {filteredComponents.map(component => {
                    const IconComponent = iconMap[component.icon] || Square;
                    
                    return (
                      <div
                        key={component.type}
                        draggable
                        onDragStart={(e) => handleDragStart(component, e)}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-100 cursor-move transition-colors group"
                      >
                        <div className="flex-shrink-0 w-8 h-8 bg-neutral-100 rounded flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
                          <IconComponent className="w-4 h-4 text-neutral-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {component.displayName}
                          </p>
                          <p className="text-xs text-neutral-500 truncate">
                            {component.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tips */}
      <div className="p-4 border-t border-neutral-200 bg-neutral-50">
        <p className="text-xs text-neutral-600">
          <span className="font-medium">Tip:</span> Drag components to the canvas to add them
        </p>
      </div>
    </div>
  );
};