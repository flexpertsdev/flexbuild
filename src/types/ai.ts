export interface AIChat {
  id: string;
  projectId: string;
  userId: string;
  messages: AIMessage[];
  context: ProjectContext;
  createdAt: Date;
  lastMessageAt: Date;
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: AIAction[];
  suggestions?: string[];
  confidence?: number;
  error?: string;
}

export interface AIAction {
  id: string;
  type: AIActionType;
  description: string;
  payload: any;
  status: 'pending' | 'applied' | 'rejected';
  appliedAt?: Date;
}

export type AIActionType = 
  | 'create_screen'
  | 'add_component'
  | 'update_component'
  | 'delete_component'
  | 'update_data_model'
  | 'modify_design_system'
  | 'generate_code'
  | 'suggest_improvement';

export interface ProjectContext {
  projectId: string;
  currentScreenId?: string;
  selectedComponentId?: string;
  screens: Screen[];
  components: Component[];
  dataModels: DataModel[];
  designSystem: DesignSystem;
}

export interface AIInference {
  id: string;
  projectId: string;
  type: InferenceType;
  input: any;
  output: any;
  confidence: number;
  timestamp: Date;
  processingTime: number;
}

export type InferenceType = 
  | 'data_model'
  | 'design_system'
  | 'user_journey'
  | 'component_suggestion'
  | 'code_generation';

export interface DataModelInference {
  models: InferredDataModel[];
  relationships: InferredRelationship[];
  endpoints: InferredEndpoint[];
  confidence: number;
}

export interface InferredDataModel {
  name: string;
  fields: DataField[];
  purpose: string;
  confidence: number;
  source: string[];
}

export interface InferredRelationship {
  fromModel: string;
  toModel: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  reason: string;
  confidence: number;
}

export interface InferredEndpoint {
  method: string;
  path: string;
  purpose: string;
  dataModel: string;
  confidence: number;
}

export interface DesignSystemInference {
  colors: ColorInference;
  typography: TypographyInference;
  spacing: SpacingInference;
  components: ComponentStyleInference[];
  confidence: number;
}

export interface ColorInference {
  primary: string;
  secondary: string;
  accent: string;
  neutral: string[];
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographyInference {
  fontFamily: string;
  baseFontSize: number;
  scale: number[];
  lineHeight: number;
  fontWeights: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
}

export interface SpacingInference {
  baseUnit: number;
  scale: number[];
  containerPadding: number;
  componentGap: number;
}

export interface ComponentStyleInference {
  componentType: string;
  defaultStyles: Record<string, any>;
  variants: Record<string, Record<string, any>>;
  responsive: Record<string, Record<string, any>>;
}

export interface UserJourneyInference {
  journeys: InferredJourney[];
  primaryFlow: string;
  confidence: number;
}

export interface InferredJourney {
  id: string;
  name: string;
  persona: string;
  goal: string;
  steps: JourneyStep[];
  priority: 'high' | 'medium' | 'low';
  confidence: number;
}

export interface JourneyStep {
  stepNumber: number;
  screenId: string;
  action: string;
  expectedOutcome: string;
  componentInteractions: string[];
}

export interface UserJourney {
  id: string;
  projectId: string;
  name: string;
  persona: string;
  goal: string;
  steps: JourneyStep[];
  successCriteria: string;
  priority: 'high' | 'medium' | 'low';
}

// Import necessary types
import type { Screen, Component, DataModel, DataField } from './project';
import type { DesignSystem } from './builder';