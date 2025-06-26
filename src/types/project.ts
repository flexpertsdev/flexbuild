export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  createdAt: Date;
  lastActiveAt: Date;
  projectCount: number;
  role: 'free' | 'pro' | 'enterprise';
}

export interface Project {
  id: string;
  name: string;
  appType: 'web' | 'mobile' | 'dashboard' | 'ecommerce' | 'social' | 'productivity';
  description?: string;
  ownerId: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  createdAt: Date;
  lastModified: Date;
  lastModifiedBy: string;
  screenCount: number;
  componentCount: number;
  collaboratorCount: number;
  hasGeneratedFramework: boolean;
}

export interface Screen {
  id: string;
  projectId: string;
  name: string;
  type: 'landing' | 'list' | 'detail' | 'form' | 'profile' | 'settings';
  purpose: string;
  routePath: string;
  isHomePage: boolean;
  mockupHtml?: string;
  mockupCss?: string;
  backgroundColor?: string;
  componentCount: number;
  createdAt: Date;
  lastModified: Date;
}

export interface Component {
  id: string;
  screenId: string;
  projectId: string;
  componentType: string;
  props: Record<string, any>;
  styles: Record<string, any>;
  children: string[];
  parentId?: string;
  actions: Action[];
  dataBinding?: DataBinding;
  visible?: boolean;
  locked?: boolean;
}

export interface DataBinding {
  source: 'static' | 'dynamic' | 'api' | 'store';
  value?: any;
  field?: string;
  modelId?: string;
  endpoint?: string;
}

export interface Action {
  id: string;
  type: 'navigate' | 'api_call' | 'state_change' | 'modal' | 'custom';
  trigger: 'click' | 'hover' | 'load' | 'submit';
  payload: Record<string, any>;
  targetScreenId?: string;
  targetComponentId?: string;
}

export interface DataModel {
  id: string;
  projectId: string;
  name: string;
  fields: DataField[];
  relationships: Relationship[];
  endpoints: APIEndpoint[];
  inferredFrom: string[];
  confidence: number;
  isUserDefined: boolean;
}

export interface DataField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  required: boolean;
  defaultValue?: any;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'min' | 'max' | 'pattern' | 'email' | 'url' | 'custom';
  value: any;
  message?: string;
}

export interface Relationship {
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  fromModel: string;
  fromField: string;
  toModel: string;
  toField: string;
  cascade?: boolean;
}

export interface APIEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  parameters: APIParameter[];
  response: APIResponse;
  authentication: boolean;
}

export interface APIParameter {
  name: string;
  type: 'path' | 'query' | 'body' | 'header';
  dataType: string;
  required: boolean;
  description?: string;
}

export interface APIResponse {
  statusCode: number;
  dataType: string;
  example?: any;
}