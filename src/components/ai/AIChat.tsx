import { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles,
  Code2,
  Zap,
  Copy,
  Check,
  Bot,
  User
} from 'lucide-react';
import { useAIStore, useAIMessages, useAILoading, useAISuggestions } from '@/stores/aiStore';
import type { AIMessage, CodeSnippet } from '@/stores/aiStore';
import { useAIActions } from '@/hooks/useAIActions';

export const AIChat = () => {
  const { isOpen, toggleChat, sendMessage } = useAIStore();
  const messages = useAIMessages();
  const isLoading = useAILoading();
  const suggestions = useAISuggestions();
  const { generateComponent, generateForm, generateLayout } = useAIActions();
  
  const [input, setInput] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    const message = input.trim();
    setInput('');
    
    // Send message and get potential action
    const action = await sendMessage(message);
    
    // Execute action if returned
    if (action) {
      switch (action.type) {
        case 'generate_component':
          await generateComponent(
            action.params.componentType,
            action.params.props,
            action.params.position
          );
          break;
          
        case 'generate_form':
          await generateForm(action.params.fields);
          break;
          
        case 'generate_layout':
          await generateLayout(action.params);
          break;
      }
    }
  };
  
  const handleSuggestionClick = async (suggestion: string) => {
    setInput('');
    
    // Send message and get potential action
    const action = await sendMessage(suggestion);
    
    // Execute action if returned
    if (action) {
      switch (action.type) {
        case 'generate_component':
          await generateComponent(
            action.params.componentType,
            action.params.props,
            action.params.position
          );
          break;
          
        case 'generate_form':
          await generateForm(action.params.fields);
          break;
          
        case 'generate_layout':
          await generateLayout(action.params);
          break;
      }
    }
  };
  
  const copyCode = (snippet: CodeSnippet) => {
    navigator.clipboard.writeText(snippet.code);
    setCopiedId(snippet.id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  
  const renderMessage = (message: AIMessage) => {
    const isUser = message.role === 'user';
    
    return (
      <div
        key={message.id}
        className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
        )}
        
        <div
          className={`max-w-[80%] ${
            isUser
              ? 'bg-primary-600 text-white rounded-2xl rounded-tr-sm'
              : 'bg-neutral-100 text-neutral-900 rounded-2xl rounded-tl-sm'
          } px-4 py-3`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {/* Code snippets if any */}
          {message.metadata?.codeSnippets && (
            <div className="mt-3 space-y-2">
              {message.metadata.codeSnippets.map(snippet => (
                <div
                  key={snippet.id}
                  className="bg-neutral-900 text-neutral-100 rounded-lg p-3 text-xs"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-400">
                      {snippet.filename || snippet.language}
                    </span>
                    <button
                      onClick={() => copyCode(snippet)}
                      className="text-neutral-400 hover:text-white transition-colors"
                    >
                      {copiedId === snippet.id ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto">
                    <code>{snippet.code}</code>
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 bg-neutral-200 rounded-lg flex items-center justify-center">
            <User className="w-5 h-5 text-neutral-700" />
          </div>
        )}
      </div>
    );
  };
  
  if (!isOpen) {
    return (
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-secondary-500 to-secondary-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
      >
        <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform" />
      </button>
    );
  }
  
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">FlexBuild AI</h3>
            <p className="text-xs text-white text-opacity-80">Your AI coding assistant</p>
          </div>
        </div>
        <button
          onClick={toggleChat}
          className="p-1 hover:bg-white hover:bg-opacity-20 rounded transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-100 to-secondary-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-secondary-600" />
            </div>
            <h4 className="font-medium text-neutral-900 mb-2">
              How can I help you build?
            </h4>
            <p className="text-sm text-neutral-600 mb-6">
              Ask me anything about creating components, styling, or adding functionality
            </p>
            
            {/* Quick actions */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleSuggestionClick('Help me create a navigation bar')}
                className="text-left p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors group"
              >
                <Zap className="w-4 h-4 text-secondary-600 mb-1" />
                <p className="text-xs font-medium text-neutral-900">Quick Start</p>
                <p className="text-xs text-neutral-600">Create navigation</p>
              </button>
              <button
                onClick={() => handleSuggestionClick('Show me how to add a form')}
                className="text-left p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors group"
              >
                <Code2 className="w-4 h-4 text-secondary-600 mb-1" />
                <p className="text-xs font-medium text-neutral-900">Components</p>
                <p className="text-xs text-neutral-600">Build a form</p>
              </button>
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="bg-neutral-100 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      {/* Suggestions */}
      {messages.length === 0 && suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <p className="text-xs font-medium text-neutral-600 mb-2">Suggestions</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.slice(0, 3).map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-full hover:bg-neutral-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-neutral-200">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask me anything..."
            className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-secondary-500 focus:border-transparent"
            rows={1}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white rounded-lg hover:from-secondary-600 hover:to-secondary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
};