import { useCallback } from 'react';
import { useProjectStore } from '@/stores/projectStore';
import { useBuilderStore } from '@/stores/builderStore';
import { useAIStore } from '@/stores/aiStore';

export const useAIActions = () => {
  const createComponent = useProjectStore(state => state.createComponent);
  const currentScreen = useProjectStore(state => state.currentScreen);
  const { componentDefinitions } = useBuilderStore();
  const { addMessage } = useAIStore();
  
  const generateComponent = useCallback(async (
    componentType: string,
    props?: Record<string, any>,
    position?: { x: number; y: number }
  ) => {
    if (!currentScreen) {
      addMessage({
        role: 'system',
        content: 'Please select a screen first to add components.'
      });
      return null;
    }
    
    const componentDef = componentDefinitions.get(componentType);
    if (!componentDef) {
      addMessage({
        role: 'system',
        content: `Component type "${componentType}" is not recognized.`
      });
      return null;
    }
    
    try {
      const newComponent = await createComponent({
        screenId: currentScreen.id,
        projectId: '', // Will be filled by store
        componentType,
        props: { ...componentDef.defaultProps, ...props },
        styles: {
          ...componentDef.defaultStyles,
          position: position ? 'absolute' : 'relative',
          left: position ? `${position.x}px` : undefined,
          top: position ? `${position.y}px` : undefined
        },
        children: [],
        actions: []
      });
      
      addMessage({
        role: 'assistant',
        content: `✅ Created a ${componentDef.displayName} component!`,
        metadata: {
          componentId: newComponent?.id,
          screenId: currentScreen.id,
          actionType: 'generate'
        }
      });
      
      return newComponent;
    } catch (error) {
      console.error('Failed to create component:', error);
      addMessage({
        role: 'system',
        content: 'Failed to create component. Please try again.'
      });
      return null;
    }
  }, [currentScreen, componentDefinitions, createComponent, addMessage]);
  
  const generateForm = useCallback(async (fields: Array<{
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
  }>) => {
    if (!currentScreen) {
      addMessage({
        role: 'system',
        content: 'Please select a screen first to add a form.'
      });
      return;
    }
    
    try {
      // Create form container
      const formContainer = await generateComponent('container', {
        direction: 'vertical',
        gap: 16,
        padding: 24
      });
      
      if (!formContainer) return;
      
      // Add form fields
      for (const field of fields) {
        await generateComponent('input', {
          label: field.label,
          placeholder: field.placeholder || `Enter ${field.label.toLowerCase()}`,
          type: field.type,
          required: field.required
        });
      }
      
      // Add submit button
      await generateComponent('button', {
        text: 'Submit',
        variant: 'primary'
      });
      
      addMessage({
        role: 'assistant',
        content: `✅ Created a form with ${fields.length} fields!`,
        metadata: {
          screenId: currentScreen.id,
          actionType: 'generate'
        }
      });
    } catch (error) {
      console.error('Failed to create form:', error);
      addMessage({
        role: 'system',
        content: 'Failed to create form. Please try again.'
      });
    }
  }, [currentScreen, generateComponent, addMessage]);
  
  const generateLayout = useCallback(async (layoutType: 'hero' | 'navbar' | 'footer' | 'sidebar') => {
    if (!currentScreen) {
      addMessage({
        role: 'system',
        content: 'Please select a screen first to add a layout.'
      });
      return;
    }
    
    try {
      switch (layoutType) {
        case 'hero':
          const heroContainer = await generateComponent('container', {
            direction: 'vertical',
            padding: 48,
            gap: 24,
            align: 'center'
          });
          
          if (heroContainer) {
            await generateComponent('heading', {
              text: 'Welcome to Your App',
              level: 'h1'
            });
            
            await generateComponent('text', {
              text: 'Build amazing applications with FlexBuild AI'
            });
            
            await generateComponent('button', {
              text: 'Get Started',
              variant: 'primary',
              size: 'large'
            });
          }
          break;
          
        case 'navbar':
          const navContainer = await generateComponent('container', {
            direction: 'horizontal',
            padding: 16,
            gap: 32,
            align: 'center',
            justify: 'space-between'
          });
          
          if (navContainer) {
            await generateComponent('heading', {
              text: 'Logo',
              level: 'h3'
            });
            
            const linksContainer = await generateComponent('container', {
              direction: 'horizontal',
              gap: 24
            });
            
            if (linksContainer) {
              await generateComponent('text', { text: 'Home' });
              await generateComponent('text', { text: 'About' });
              await generateComponent('text', { text: 'Services' });
              await generateComponent('text', { text: 'Contact' });
            }
          }
          break;
          
        default:
          addMessage({
            role: 'system',
            content: `Layout type "${layoutType}" is not implemented yet.`
          });
          return;
      }
      
      addMessage({
        role: 'assistant',
        content: `✅ Created a ${layoutType} layout!`,
        metadata: {
          screenId: currentScreen.id,
          actionType: 'generate'
        }
      });
    } catch (error) {
      console.error('Failed to create layout:', error);
      addMessage({
        role: 'system',
        content: 'Failed to create layout. Please try again.'
      });
    }
  }, [currentScreen, generateComponent, addMessage]);
  
  return {
    generateComponent,
    generateForm,
    generateLayout
  };
};