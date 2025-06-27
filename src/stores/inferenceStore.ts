import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { DataModel, DesignSystem, UserJourney, Component, Screen } from '@/types';
import { inferenceService, type InferenceResult, type ProjectInference } from '@/services/inference';

interface InferenceState {
  // Data models
  dataModels: DataModel[];
  dataModelInference: InferenceResult<DataModel[]> | null;
  
  // Design system
  designSystem: DesignSystem | null;
  designSystemInference: InferenceResult<DesignSystem> | null;
  
  // User journeys
  userJourneys: UserJourney[];
  userJourneyInference: InferenceResult<UserJourney[]> | null;
  
  // Project analysis
  projectAnalysis: ProjectInference | null;
  improvements: string[];
  
  // Component suggestions
  componentSuggestions: Array<{
    componentType: string;
    reason: string;
    confidence: number;
  }>;
  
  // Data flow analysis
  dataFlows: Array<{
    source: string;
    target: string;
    dataType: string;
    confidence: number;
  }>;
  
  // Loading states
  isInferring: boolean;
  inferenceError: string | null;
  
  // Actions
  inferDataModels: (projectId: string, components: Component[]) => Promise<void>;
  extractDesignSystem: (projectId: string, components: Component[]) => Promise<void>;
  generateUserJourneys: (projectId: string, screens: Screen[]) => Promise<void>;
  analyzeProject: (projectId: string) => Promise<void>;
  suggestComponents: (screenId: string, existingComponents: Component[]) => Promise<void>;
  analyzeDataFlow: (components: Component[]) => Promise<void>;
  
  // Utility actions
  clearInference: () => void;
  setError: (error: string | null) => void;
}

export const useInferenceStore = create<InferenceState>()(
  devtools(
    (set, get) => ({
      // Initial state
      dataModels: [],
      dataModelInference: null,
      designSystem: null,
      designSystemInference: null,
      userJourneys: [],
      userJourneyInference: null,
      projectAnalysis: null,
      improvements: [],
      componentSuggestions: [],
      dataFlows: [],
      isInferring: false,
      inferenceError: null,
      
      // Infer data models from components
      inferDataModels: async (projectId: string, components: Component[]) => {
        set({ isInferring: true, inferenceError: null });
        
        try {
          const result = await inferenceService.inferDataModels(projectId, components);
          
          set({
            dataModels: result.data,
            dataModelInference: result,
            isInferring: false
          });
          
          // Add suggestions to improvements
          if (result.suggestions.length > 0) {
            set(state => ({
              improvements: [...state.improvements, ...result.suggestions]
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to infer data models';
          set({ 
            isInferring: false, 
            inferenceError: errorMessage 
          });
        }
      },
      
      // Extract design system from components
      extractDesignSystem: async (projectId: string, components: Component[]) => {
        set({ isInferring: true, inferenceError: null });
        
        try {
          const result = await inferenceService.extractDesignSystem(projectId, components);
          
          set({
            designSystem: result.data,
            designSystemInference: result,
            isInferring: false
          });
          
          // Add suggestions to improvements
          if (result.suggestions.length > 0) {
            set(state => ({
              improvements: [...state.improvements, ...result.suggestions]
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to extract design system';
          set({ 
            isInferring: false, 
            inferenceError: errorMessage 
          });
        }
      },
      
      // Generate user journeys from screens
      generateUserJourneys: async (projectId: string, screens: Screen[]) => {
        set({ isInferring: true, inferenceError: null });
        
        try {
          const result = await inferenceService.generateUserJourneys(projectId, screens);
          
          set({
            userJourneys: result.data,
            userJourneyInference: result,
            isInferring: false
          });
          
          // Add suggestions to improvements
          if (result.suggestions.length > 0) {
            set(state => ({
              improvements: [...state.improvements, ...result.suggestions]
            }));
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to generate user journeys';
          set({ 
            isInferring: false, 
            inferenceError: errorMessage 
          });
        }
      },
      
      // Analyze entire project
      analyzeProject: async (projectId: string) => {
        set({ isInferring: true, inferenceError: null });
        
        try {
          const analysis = await inferenceService.analyzeProject(projectId);
          
          set({
            projectAnalysis: analysis,
            dataModels: analysis.dataModels,
            designSystem: analysis.designSystem,
            userJourneys: analysis.userJourneys,
            improvements: analysis.improvements,
            isInferring: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to analyze project';
          set({ 
            isInferring: false, 
            inferenceError: errorMessage 
          });
        }
      },
      
      // Suggest components for a screen
      suggestComponents: async (screenId: string, existingComponents: Component[]) => {
        set({ isInferring: true, inferenceError: null });
        
        try {
          const suggestions = await inferenceService.suggestComponents(screenId, existingComponents);
          
          set({
            componentSuggestions: suggestions,
            isInferring: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to suggest components';
          set({ 
            isInferring: false, 
            inferenceError: errorMessage 
          });
        }
      },
      
      // Analyze data flow between components
      analyzeDataFlow: async (components: Component[]) => {
        set({ isInferring: true, inferenceError: null });
        
        try {
          const flows = await inferenceService.analyzeDataFlow(components);
          
          set({
            dataFlows: flows,
            isInferring: false
          });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to analyze data flow';
          set({ 
            isInferring: false, 
            inferenceError: errorMessage 
          });
        }
      },
      
      // Clear all inference data
      clearInference: () => {
        set({
          dataModels: [],
          dataModelInference: null,
          designSystem: null,
          designSystemInference: null,
          userJourneys: [],
          userJourneyInference: null,
          projectAnalysis: null,
          improvements: [],
          componentSuggestions: [],
          dataFlows: [],
          isInferring: false,
          inferenceError: null
        });
      },
      
      // Set error
      setError: (error: string | null) => {
        set({ inferenceError: error });
      }
    }),
    {
      name: 'inference-store'
    }
  )
);

// Selectors
export const selectDataModels = (state: InferenceState) => state.dataModels;
export const selectDesignSystem = (state: InferenceState) => state.designSystem;
export const selectUserJourneys = (state: InferenceState) => state.userJourneys;
export const selectImprovements = (state: InferenceState) => state.improvements;
export const selectComponentSuggestions = (state: InferenceState) => state.componentSuggestions;
export const selectDataFlows = (state: InferenceState) => state.dataFlows;
export const selectInferenceLoading = (state: InferenceState) => state.isInferring;
export const selectInferenceError = (state: InferenceState) => state.inferenceError;

// Computed selectors
export const selectHasInferenceData = (state: InferenceState) => 
  state.dataModels.length > 0 || 
  state.designSystem !== null || 
  state.userJourneys.length > 0;

export const selectInferenceConfidence = (state: InferenceState) => {
  const confidences: number[] = [];
  
  if (state.dataModelInference) {
    confidences.push(state.dataModelInference.confidence);
  }
  
  if (state.designSystemInference) {
    confidences.push(state.designSystemInference.confidence);
  }
  
  if (state.userJourneyInference) {
    confidences.push(state.userJourneyInference.confidence);
  }
  
  if (confidences.length === 0) return 0;
  
  return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
};