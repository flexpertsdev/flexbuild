import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    componentId?: string;
    screenId?: string;
    actionType?: 'generate' | 'modify' | 'explain' | 'suggest';
    codeSnippets?: CodeSnippet[];
  };
}

export interface CodeSnippet {
  id: string;
  language: string;
  code: string;
  filename?: string;
  description?: string;
}

export interface AIContext {
  projectId: string;
  screenId?: string;
  selectedComponentId?: string;
  codeContext?: string;
}

interface AIStore {
  // State
  messages: AIMessage[];
  isLoading: boolean;
  isOpen: boolean;
  context: AIContext | null;
  suggestions: string[];
  
  // Actions
  sendMessage: (content: string) => Promise<{
    type: 'generate_component' | 'generate_form' | 'generate_layout';
    params: any;
  } | null>;
  clearMessages: () => void;
  toggleChat: () => void;
  openChat: () => void;
  closeChat: () => void;
  setContext: (context: AIContext) => void;
  addMessage: (message: Omit<AIMessage, 'id' | 'timestamp'>) => void;
  updateLastMessage: (content: string) => void;
  setSuggestions: (suggestions: string[]) => void;
}

// Mock AI responses for now
const generateMockResponse = async (userMessage: string, _context?: AIContext): Promise<{
  content: string;
  action?: {
    type: 'generate_component' | 'generate_form' | 'generate_layout';
    params: any;
  };
}> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
  
  const lowerMessage = userMessage.toLowerCase();
  
  // Context-aware responses
  if (lowerMessage.includes('button')) {
    // Check if user wants to create a button
    if (lowerMessage.includes('add') || lowerMessage.includes('create') || lowerMessage.includes('make')) {
      return {
        content: 'I\'ll add a button to your canvas. You can customize it using the properties panel.',
        action: {
          type: 'generate_component',
          params: {
            componentType: 'button',
            props: {
              text: 'Click me',
              variant: 'primary',
              size: 'medium'
            },
            position: { x: 100, y: 100 }
          }
        }
      };
    }
    
    return {
      content: `I'll help you create a button component. Here's what I can do:

1. **Add a Button** - I can add a button to your current screen
2. **Style the Button** - Customize colors, size, and hover effects
3. **Add Click Actions** - Navigate to another screen or trigger an API call

Would you like me to add a button to your canvas?`
    };
  }
  
  if (lowerMessage.includes('form')) {
    // Check for specific form types
    if (lowerMessage.includes('contact')) {
      return {
        content: 'I\'ll create a contact form with name, email, and message fields.',
        action: {
          type: 'generate_form',
          params: {
            fields: [
              { type: 'text', label: 'Name', placeholder: 'Your name', required: true },
              { type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
              { type: 'textarea', label: 'Message', placeholder: 'Your message...', required: true }
            ]
          }
        }
      };
    }
    
    if (lowerMessage.includes('login')) {
      return {
        content: 'I\'ll create a login form with email and password fields.',
        action: {
          type: 'generate_form',
          params: {
            fields: [
              { type: 'email', label: 'Email', placeholder: 'your@email.com', required: true },
              { type: 'password', label: 'Password', placeholder: 'Enter password', required: true }
            ]
          }
        }
      };
    }
    
    return {
      content: `I can help you build a form! Here are some options:

1. **Contact Form** - Name, email, message fields
2. **Login Form** - Email/username and password
3. **Registration Form** - Full user registration
4. **Custom Form** - Tell me what fields you need

Which type of form would you like to create?`
    };
  }
  
  if (lowerMessage.includes('hero') || lowerMessage.includes('landing')) {
    return {
      content: 'I\'ll create a hero section with a heading, description, and call-to-action button.',
      action: {
        type: 'generate_layout',
        params: 'hero'
      }
    };
  }
  
  if (lowerMessage.includes('navbar') || lowerMessage.includes('navigation')) {
    return {
      content: 'I\'ll create a navigation bar with logo and menu items.',
      action: {
        type: 'generate_layout',
        params: 'navbar'
      }
    };
  }
  
  if (lowerMessage.includes('api') || lowerMessage.includes('data')) {
    return {
      content: `I can help you connect to APIs and manage data:

1. **REST API Integration** - Connect to external APIs
2. **Data Models** - Create data structures for your app
3. **Mock Data** - Generate sample data for testing
4. **Data Binding** - Connect components to data sources

What would you like to work with?`
    };
  }
  
  if (lowerMessage.includes('help')) {
    return {
      content: `I'm FlexBuild AI, here to help you build your app! I can:

🎨 **Design & Layout**
- Create and style components
- Build responsive layouts
- Apply themes and colors

🔧 **Functionality**
- Add interactivity and actions
- Create forms and inputs
- Set up navigation

📊 **Data & APIs**
- Connect to APIs
- Create data models
- Bind data to components

💡 **Suggestions**
- Best practices
- Performance tips
- Accessibility improvements

What would you like to work on?`
    };
  }
  
  // Default response
  return {
    content: `I understand you want to: "${userMessage}". 

I can help you with:
- Adding components to your screen
- Styling and customizing elements
- Setting up interactions and data
- Generating code snippets

Could you be more specific about what you'd like to create or modify?`
  };
};

export const useAIStore = create<AIStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      isLoading: false,
      isOpen: false,
      context: null,
      suggestions: [
        'Add a navigation bar',
        'Create a hero section',
        'Build a contact form',
        'Add a footer',
        'Create a card component'
      ],
      
      // Actions
      sendMessage: async (content: string) => {
        const { messages, context } = get();
        
        // Add user message
        const userMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
          role: 'user',
          content
        };
        
        set({
          messages: [...messages, {
            ...userMessage,
            id: crypto.randomUUID(),
            timestamp: new Date()
          }],
          isLoading: true
        });
        
        try {
          // Generate AI response (mock for now)
          const response = await generateMockResponse(content, context || undefined);
          
          const assistantMessage: Omit<AIMessage, 'id' | 'timestamp'> = {
            role: 'assistant',
            content: response.content,
            metadata: {
              screenId: context?.screenId,
              actionType: response.action ? 'generate' : 'suggest'
            }
          };
          
          const messageId = crypto.randomUUID();
          
          set(state => ({
            messages: [...state.messages, {
              ...assistantMessage,
              id: messageId,
              timestamp: new Date()
            }],
            isLoading: false
          }));
          
          // Return the action if any
          return response.action;
          
        } catch (error) {
          console.error('AI response error:', error);
          set({ isLoading: false });
          return null;
        }
      },
      
      clearMessages: () => {
        set({ messages: [] });
      },
      
      toggleChat: () => {
        set(state => ({ isOpen: !state.isOpen }));
      },
      
      openChat: () => {
        set({ isOpen: true });
      },
      
      closeChat: () => {
        set({ isOpen: false });
      },
      
      setContext: (context: AIContext) => {
        set({ context });
      },
      
      addMessage: (message) => {
        set(state => ({
          messages: [...state.messages, {
            ...message,
            id: crypto.randomUUID(),
            timestamp: new Date()
          }]
        }));
      },
      
      updateLastMessage: (content: string) => {
        set(state => {
          const messages = [...state.messages];
          if (messages.length > 0) {
            messages[messages.length - 1].content = content;
          }
          return { messages };
        });
      },
      
      setSuggestions: (suggestions: string[]) => {
        set({ suggestions });
      }
    }),
    {
      name: 'AIStore'
    }
  )
);

// Selector hooks
export const useAIMessages = () => useAIStore(state => state.messages);
export const useAILoading = () => useAIStore(state => state.isLoading);
export const useAIChatOpen = () => useAIStore(state => state.isOpen);
export const useAISuggestions = () => useAIStore(state => state.suggestions);