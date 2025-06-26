export interface BuildFramework {
  id: string;
  projectId: string;
  name: string;
  version: string;
  framework: 'react' | 'vue' | 'angular' | 'nextjs' | 'remix' | 'svelte';
  language: 'typescript' | 'javascript';
  styling: 'tailwind' | 'css-modules' | 'styled-components' | 'emotion' | 'sass';
  files: GeneratedFile[];
  packageJson: PackageConfiguration;
  buildConfig: BuildConfiguration;
  deployment: DeploymentConfig;
  documentation: Documentation;
  validationResults: ValidationResult[];
  generatedAt: Date;
  status: 'generating' | 'completed' | 'failed';
  downloadUrl?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  type: FileType;
  language: 'typescript' | 'javascript' | 'css' | 'json' | 'markdown' | 'html';
  size: number;
  dependencies: string[];
  exports?: string[];
  imports?: Import[];
}

export type FileType = 
  | 'component'
  | 'page'
  | 'layout'
  | 'service'
  | 'store'
  | 'type'
  | 'style'
  | 'config'
  | 'test'
  | 'documentation';

export interface Import {
  source: string;
  specifiers: ImportSpecifier[];
  type: 'named' | 'default' | 'namespace';
}

export interface ImportSpecifier {
  imported: string;
  local: string;
}

export interface PackageConfiguration {
  name: string;
  version: string;
  description: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  engines?: Record<string, string>;
}

export interface BuildConfiguration {
  framework: FrameworkConfig;
  typescript?: TypeScriptConfig;
  styling?: StylingConfig;
  testing?: TestingConfig;
  linting?: LintingConfig;
  deployment?: DeploymentPreset;
}

export interface FrameworkConfig {
  type: string;
  version: string;
  config: Record<string, any>;
}

export interface TypeScriptConfig {
  strict: boolean;
  target: string;
  module: string;
  jsx?: string;
  paths?: Record<string, string[]>;
  types?: string[];
}

export interface StylingConfig {
  type: string;
  preprocessor?: string;
  postcssPlugins?: string[];
  cssModules?: boolean;
  globalStyles?: string;
}

export interface TestingConfig {
  framework: 'jest' | 'vitest' | 'cypress' | 'playwright';
  setupFiles?: string[];
  testMatch?: string[];
  coverage?: boolean;
}

export interface LintingConfig {
  eslint: boolean;
  prettier: boolean;
  rules?: Record<string, any>;
}

export interface DeploymentConfig {
  platform: 'vercel' | 'netlify' | 'aws' | 'gcp' | 'azure' | 'custom';
  buildCommand: string;
  outputDirectory: string;
  environment?: Record<string, string>;
  serverless?: boolean;
  edge?: boolean;
}

export interface DeploymentPreset {
  name: string;
  platform: string;
  config: Record<string, any>;
}

export interface Documentation {
  readme: string;
  apiDocs?: string;
  componentDocs?: ComponentDocumentation[];
  deploymentGuide?: string;
  userGuide?: string;
}

export interface ComponentDocumentation {
  name: string;
  description: string;
  props: PropDocumentation[];
  examples: CodeExample[];
  accessibility?: string;
}

export interface PropDocumentation {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
  description: string;
}

export interface CodeExample {
  title: string;
  description?: string;
  code: string;
  language: string;
  preview?: boolean;
}

export interface ValidationResult {
  type: 'error' | 'warning' | 'info';
  file?: string;
  line?: number;
  column?: number;
  message: string;
  rule?: string;
  fixable?: boolean;
}

export interface CodeGeneration {
  id: string;
  projectId: string;
  screenId?: string;
  componentId?: string;
  type: GenerationType;
  input: any;
  output: string;
  language: string;
  framework: string;
  timestamp: Date;
}

export type GenerationType = 
  | 'component'
  | 'screen'
  | 'data_model'
  | 'api_client'
  | 'store'
  | 'router'
  | 'types'
  | 'styles';

export interface ComponentCodeGen {
  imports: Import[];
  props: PropDefinition[];
  state?: StateDefinition[];
  methods?: MethodDefinition[];
  render: string;
  styles?: string;
  exports: string;
}

export interface PropDefinition {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: any;
}

export interface StateDefinition {
  name: string;
  type: string;
  initialValue: any;
}

export interface MethodDefinition {
  name: string;
  parameters: Parameter[];
  returnType: string;
  body: string;
  async: boolean;
}

export interface Parameter {
  name: string;
  type: string;
  optional: boolean;
}

export interface ExportOptions {
  framework: string;
  language: 'typescript' | 'javascript';
  styling: string;
  includeTests: boolean;
  includeDocumentation: boolean;
  includeDeploymentConfig: boolean;
  optimizeForProduction: boolean;
  splitChunks: boolean;
  minify: boolean;
}

export interface ExportResult {
  success: boolean;
  frameworkId?: string;
  downloadUrl?: string;
  errors?: string[];
  warnings?: string[];
  stats?: ExportStats;
}

export interface ExportStats {
  totalFiles: number;
  totalSize: number;
  componentsGenerated: number;
  pagesGenerated: number;
  linesOfCode: number;
  estimatedBuildTime: number;
}