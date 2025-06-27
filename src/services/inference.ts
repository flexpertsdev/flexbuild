import type { Component, DataModel, DataField, DesignSystem, UserJourney, Screen } from '@/types';
import { databaseService } from './database.service';
import { inferDataModelsFromComponents } from '@/lib/dataModelInference';
import { extractDesignSystemFromComponents } from '@/lib/designSystemExtraction';
import { generateUserJourneysFromScreens } from '@/lib/userJourneyGeneration';

export interface InferenceResult<T> {
  data: T;
  confidence: number;
  reasoning: string[];
  suggestions: string[];
}

export interface ProjectInference {
  dataModels: DataModel[];
  designSystem: DesignSystem;
  userJourneys: UserJourney[];
  improvements: string[];
}

class InferenceService {
  /**
   * Analyze components and infer data models
   */
  async inferDataModels(
    projectId: string,
    components: Component[]
  ): Promise<InferenceResult<DataModel[]>> {
    try {
      const result = await inferDataModelsFromComponents(components, projectId);
      
      // Save inferred models to database
      for (const model of result.data) {
        await databaseService.dataModels.create(model);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to infer data models:', error);
      return {
        data: [],
        confidence: 0,
        reasoning: ['Failed to analyze components'],
        suggestions: []
      };
    }
  }

  /**
   * Extract design system from components
   */
  async extractDesignSystem(
    projectId: string,
    components: Component[]
  ): Promise<InferenceResult<DesignSystem>> {
    try {
      const result = await extractDesignSystemFromComponents(components, projectId);
      
      // Save design system to database
      await databaseService.designSystems.create(result.data);
      
      return result;
    } catch (error) {
      console.error('Failed to extract design system:', error);
      return {
        data: this.getDefaultDesignSystem(projectId),
        confidence: 0,
        reasoning: ['Failed to analyze component styles'],
        suggestions: []
      };
    }
  }

  /**
   * Generate user journeys from screens
   */
  async generateUserJourneys(
    projectId: string,
    screens: Screen[]
  ): Promise<InferenceResult<UserJourney[]>> {
    try {
      const result = await generateUserJourneysFromScreens(screens, projectId);
      
      // Save user journeys to database
      for (const journey of result.data) {
        await databaseService.userJourneys.create(journey);
      }
      
      return result;
    } catch (error) {
      console.error('Failed to generate user journeys:', error);
      return {
        data: [],
        confidence: 0,
        reasoning: ['Failed to analyze screen flows'],
        suggestions: []
      };
    }
  }

  /**
   * Analyze entire project and provide comprehensive inference
   */
  async analyzeProject(projectId: string): Promise<ProjectInference> {
    try {
      // Get all project data
      const screens = await databaseService.screens.getByProject(projectId);
      const components: Component[] = [];
      
      // Collect all components from all screens
      for (const screen of screens) {
        const screenComponents = await databaseService.components.getByScreen(screen.id);
        components.push(...screenComponents);
      }
      
      // Run all inference operations
      const [dataModelsResult, designSystemResult, userJourneysResult] = await Promise.all([
        this.inferDataModels(projectId, components),
        this.extractDesignSystem(projectId, components),
        this.generateUserJourneys(projectId, screens)
      ]);
      
      // Generate improvement suggestions
      const improvements = this.generateImprovementSuggestions(
        dataModelsResult,
        designSystemResult,
        userJourneysResult,
        screens,
        components
      );
      
      return {
        dataModels: dataModelsResult.data,
        designSystem: designSystemResult.data,
        userJourneys: userJourneysResult.data,
        improvements
      };
    } catch (error) {
      console.error('Failed to analyze project:', error);
      throw error;
    }
  }

  /**
   * Suggest components based on current screen context
   */
  async suggestComponents(
    screenId: string,
    existingComponents: Component[]
  ): Promise<{ componentType: string; reason: string; confidence: number }[]> {
    const suggestions: { componentType: string; reason: string; confidence: number }[] = [];
    
    // Analyze existing components
    const hasForm = existingComponents.some(c => 
      c.componentType === 'form' || c.componentType === 'input'
    );
    const hasButton = existingComponents.some(c => c.componentType === 'button');
    const hasList = existingComponents.some(c => 
      c.componentType === 'list' || c.componentType === 'grid'
    );
    
    // Suggest complementary components
    if (hasForm && !hasButton) {
      suggestions.push({
        componentType: 'button',
        reason: 'Forms typically need submit buttons',
        confidence: 0.9
      });
    }
    
    if (hasList && !existingComponents.some(c => c.componentType === 'search')) {
      suggestions.push({
        componentType: 'search',
        reason: 'Lists benefit from search functionality',
        confidence: 0.8
      });
    }
    
    if (!existingComponents.some(c => c.componentType === 'header')) {
      suggestions.push({
        componentType: 'header',
        reason: 'Screens should have consistent navigation',
        confidence: 0.85
      });
    }
    
    return suggestions;
  }

  /**
   * Analyze component connections and suggest data flow
   */
  async analyzeDataFlow(
    components: Component[]
  ): Promise<{ source: string; target: string; dataType: string; confidence: number }[]> {
    const dataFlows: { source: string; target: string; dataType: string; confidence: number }[] = [];
    
    // Find potential data relationships
    for (let i = 0; i < components.length; i++) {
      for (let j = i + 1; j < components.length; j++) {
        const comp1 = components[i];
        const comp2 = components[j];
        
        // Check for form -> list relationship
        if (comp1.componentType === 'form' && comp2.componentType === 'list') {
          dataFlows.push({
            source: comp1.id,
            target: comp2.id,
            dataType: 'form_submission',
            confidence: 0.8
          });
        }
        
        // Check for search -> list relationship
        if (comp1.componentType === 'search' && comp2.componentType === 'list') {
          dataFlows.push({
            source: comp1.id,
            target: comp2.id,
            dataType: 'filter_query',
            confidence: 0.9
          });
        }
      }
    }
    
    return dataFlows;
  }

  /**
   * Generate improvement suggestions
   */
  private generateImprovementSuggestions(
    dataModels: InferenceResult<DataModel[]>,
    designSystem: InferenceResult<DesignSystem>,
    userJourneys: InferenceResult<UserJourney[]>,
    screens: Screen[],
    components: Component[]
  ): string[] {
    const suggestions: string[] = [];
    
    // Data model suggestions
    if (dataModels.confidence < 0.7) {
      suggestions.push('Consider defining clearer data relationships between components');
    }
    
    // Design consistency suggestions
    if (designSystem.confidence < 0.8) {
      suggestions.push('Improve design consistency by using unified color palette and spacing');
    }
    
    // User flow suggestions
    if (userJourneys.data.length === 0) {
      suggestions.push('Add clear navigation between screens to create user journeys');
    }
    
    // Screen coverage suggestions
    const screenTypes = new Set(screens.map(s => s.type));
    if (!screenTypes.has('landing')) {
      suggestions.push('Consider adding a landing page for better user onboarding');
    }
    if (!screenTypes.has('settings')) {
      suggestions.push('Add a settings screen for user preferences');
    }
    
    // Component diversity suggestions
    const componentTypes = new Set(components.map(c => c.componentType));
    if (componentTypes.size < 5) {
      suggestions.push('Diversify your UI with more component types');
    }
    
    return suggestions;
  }

  /**
   * Get default design system
   */
  private getDefaultDesignSystem(projectId: string): DesignSystem {
    return {
      id: crypto.randomUUID(),
      projectId,
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a'
        },
        secondary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444'
      },
      typography: {
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        scale: {
          xs: '0.75rem',
          sm: '0.875rem',
          base: '1rem',
          lg: '1.125rem',
          xl: '1.25rem',
          '2xl': '1.5rem',
          '3xl': '1.875rem',
          '4xl': '2.25rem'
        }
      },
      spacing: {
        unit: 4,
        scale: {
          xs: 4,
          sm: 8,
          md: 16,
          lg: 24,
          xl: 32,
          '2xl': 48,
          '3xl': 64
        }
      },
      componentStyles: [],
      generatedCSS: '',
      version: 1
    };
  }
}

// Export singleton instance
export const inferenceService = new InferenceService();

// Export for use in components
export default inferenceService;