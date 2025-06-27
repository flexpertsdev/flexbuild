import type { Component, DataModel, DataField, Relationship } from '@/types';
import type { InferenceResult } from '@/services/inference';

/**
 * Infer data models from components
 */
export async function inferDataModelsFromComponents(
  components: Component[],
  projectId: string
): Promise<InferenceResult<DataModel[]>> {
  const dataModels: DataModel[] = [];
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  let totalConfidence = 0;
  
  // Group components by type to identify patterns
  const componentGroups = groupComponentsByType(components);
  
  // Analyze forms to create data models
  const formModels = analyzeFormComponents(componentGroups.forms || [], projectId);
  dataModels.push(...formModels.models);
  reasoning.push(...formModels.reasoning);
  totalConfidence += formModels.confidence;
  
  // Analyze lists/grids to enhance data models
  const listModels = analyzeListComponents(componentGroups.lists || [], projectId, dataModels);
  reasoning.push(...listModels.reasoning);
  totalConfidence += listModels.confidence;
  
  // Analyze cards to identify display models
  const cardModels = analyzeCardComponents(componentGroups.cards || [], projectId, dataModels);
  dataModels.push(...cardModels.models);
  reasoning.push(...cardModels.reasoning);
  totalConfidence += cardModels.confidence;
  
  // Detect relationships between models
  const relationships = detectRelationships(dataModels, components);
  applyRelationships(dataModels, relationships);
  reasoning.push(...relationships.reasoning);
  
  // Generate suggestions
  if (dataModels.length === 0) {
    suggestions.push('Add forms or data-driven components to generate data models');
  }
  
  if (formModels.models.length > 0 && !componentGroups.lists) {
    suggestions.push('Consider adding list views to display your form data');
  }
  
  const avgConfidence = totalConfidence / Math.max(3, dataModels.length);
  
  return {
    data: dataModels,
    confidence: avgConfidence,
    reasoning,
    suggestions
  };
}

/**
 * Group components by their type
 */
function groupComponentsByType(components: Component[]): Record<string, Component[]> {
  const groups: Record<string, Component[]> = {};
  
  components.forEach(component => {
    const type = normalizeComponentType(component.componentType);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(component);
  });
  
  return groups;
}

/**
 * Normalize component types for grouping
 */
function normalizeComponentType(componentType: string): string {
  const typeMap: Record<string, string> = {
    'form': 'forms',
    'input': 'forms',
    'textarea': 'forms',
    'select': 'forms',
    'checkbox': 'forms',
    'radio': 'forms',
    'list': 'lists',
    'grid': 'lists',
    'table': 'lists',
    'card': 'cards',
    'product-card': 'cards',
    'user-card': 'cards'
  };
  
  return typeMap[componentType.toLowerCase()] || 'other';
}

/**
 * Analyze form components to create data models
 */
function analyzeFormComponents(
  formComponents: Component[],
  projectId: string
): { models: DataModel[]; reasoning: string[]; confidence: number } {
  const models: DataModel[] = [];
  const reasoning: string[] = [];
  let confidence = 0;
  
  if (formComponents.length === 0) {
    return { models, reasoning, confidence: 0 };
  }
  
  // Group form fields by proximity
  const formGroups = groupFormsByProximity(formComponents);
  
  formGroups.forEach((group, index) => {
    const modelName = inferModelName(group) || `Model${index + 1}`;
    const fields = inferFieldsFromComponents(group);
    
    if (fields.length > 0) {
      const model: DataModel = {
        id: crypto.randomUUID(),
        projectId,
        name: modelName,
        fields,
        relationships: [],
        endpoints: generateCRUDEndpoints(modelName),
        inferredFrom: group.map(c => c.id),
        confidence: 0.8,
        isUserDefined: false
      };
      
      models.push(model);
      reasoning.push(`Inferred ${modelName} model from ${group.length} form components`);
      confidence += 0.8;
    }
  });
  
  return {
    models,
    reasoning,
    confidence: confidence / Math.max(1, models.length)
  };
}

/**
 * Group form components by their proximity
 */
function groupFormsByProximity(components: Component[]): Component[][] {
  const groups: Component[][] = [];
  const used = new Set<string>();
  
  components.forEach(component => {
    if (used.has(component.id)) return;
    
    const group = [component];
    used.add(component.id);
    
    // Find nearby form components
    components.forEach(other => {
      if (!used.has(other.id) && areComponentsNear(component, other)) {
        group.push(other);
        used.add(other.id);
      }
    });
    
    groups.push(group);
  });
  
  return groups;
}

/**
 * Check if two components are near each other
 */
function areComponentsNear(comp1: Component, comp2: Component): boolean {
  const threshold = 200; // pixels
  const dx = Math.abs(comp1.position.x - comp2.position.x);
  const dy = Math.abs(comp1.position.y - comp2.position.y);
  return Math.sqrt(dx * dx + dy * dy) < threshold;
}

/**
 * Infer model name from components
 */
function inferModelName(components: Component[]): string | null {
  // Look for labels or text that might indicate the model name
  const labels = components
    .filter(c => c.componentType === 'label' || c.componentType === 'text')
    .map(c => c.props?.text || c.props?.label || '')
    .filter(Boolean);
  
  if (labels.length > 0) {
    // Try to find a common theme
    const commonWords = findCommonWords(labels);
    if (commonWords.length > 0) {
      return capitalize(commonWords[0]);
    }
  }
  
  // Check for specific field patterns
  const fieldTypes = components.map(c => c.componentType.toLowerCase());
  if (fieldTypes.includes('email') && fieldTypes.includes('password')) {
    return 'User';
  }
  if (fieldTypes.includes('title') && fieldTypes.includes('description')) {
    return 'Post';
  }
  if (fieldTypes.includes('name') && fieldTypes.includes('price')) {
    return 'Product';
  }
  
  return null;
}

/**
 * Infer fields from form components
 */
function inferFieldsFromComponents(components: Component[]): DataField[] {
  const fields: DataField[] = [];
  
  components.forEach(component => {
    const field = inferFieldFromComponent(component);
    if (field) {
      fields.push(field);
    }
  });
  
  // Always add ID field
  if (!fields.find(f => f.name === 'id')) {
    fields.unshift({
      name: 'id',
      type: 'string',
      required: true,
      validation: [{ type: 'uuid' }]
    });
  }
  
  // Add timestamps
  if (!fields.find(f => f.name === 'createdAt')) {
    fields.push({
      name: 'createdAt',
      type: 'date',
      required: true,
      defaultValue: 'now()'
    });
  }
  
  if (!fields.find(f => f.name === 'updatedAt')) {
    fields.push({
      name: 'updatedAt',
      type: 'date',
      required: true,
      defaultValue: 'now()'
    });
  }
  
  return fields;
}

/**
 * Infer field from a single component
 */
function inferFieldFromComponent(component: Component): DataField | null {
  const { componentType, props = {} } = component;
  const type = componentType.toLowerCase();
  
  // Determine field name
  const fieldName = props.name || props.id || props.label || type;
  
  // Determine field type
  let fieldType: DataField['type'] = 'string';
  const validation: any[] = [];
  
  switch (type) {
    case 'email':
    case 'input[type="email"]':
      validation.push({ type: 'email' });
      break;
      
    case 'number':
    case 'input[type="number"]':
      fieldType = 'number';
      if (props.min !== undefined) validation.push({ type: 'min', value: props.min });
      if (props.max !== undefined) validation.push({ type: 'max', value: props.max });
      break;
      
    case 'date':
    case 'input[type="date"]':
    case 'datepicker':
      fieldType = 'date';
      break;
      
    case 'checkbox':
    case 'toggle':
    case 'switch':
      fieldType = 'boolean';
      break;
      
    case 'select':
    case 'dropdown':
      if (props.multiple) {
        fieldType = 'array';
      }
      if (props.options?.length > 0) {
        validation.push({ type: 'enum', values: props.options });
      }
      break;
      
    case 'textarea':
      validation.push({ type: 'maxLength', value: 1000 });
      break;
  }
  
  // Check for required
  const required = props.required || props.validate?.required || false;
  
  return {
    name: camelCase(fieldName),
    type: fieldType,
    required,
    validation: validation.length > 0 ? validation : undefined,
    defaultValue: props.defaultValue
  };
}

/**
 * Analyze list components to enhance data models
 */
function analyzeListComponents(
  listComponents: Component[],
  projectId: string,
  existingModels: DataModel[]
): { reasoning: string[]; confidence: number } {
  const reasoning: string[] = [];
  let confidence = 0;
  
  listComponents.forEach(list => {
    // Look for list items to understand data structure
    const listItems = list.children || [];
    if (listItems.length > 0) {
      const itemFields = inferFieldsFromComponents(listItems);
      
      // Try to match with existing models
      const matchedModel = findMatchingModel(itemFields, existingModels);
      if (matchedModel) {
        reasoning.push(`List component displays ${matchedModel.name} data`);
        confidence += 0.9;
      } else {
        reasoning.push('List component structure suggests additional data model');
        confidence += 0.6;
      }
    }
  });
  
  return {
    reasoning,
    confidence: confidence / Math.max(1, listComponents.length)
  };
}

/**
 * Analyze card components to identify display models
 */
function analyzeCardComponents(
  cardComponents: Component[],
  projectId: string,
  existingModels: DataModel[]
): { models: DataModel[]; reasoning: string[]; confidence: number } {
  const models: DataModel[] = [];
  const reasoning: string[] = [];
  let confidence = 0;
  
  // Group cards by similar structure
  const cardGroups = groupSimilarCards(cardComponents);
  
  cardGroups.forEach((group, index) => {
    const fields = inferFieldsFromCardStructure(group[0]);
    
    if (fields.length > 0) {
      // Check if matches existing model
      const existingModel = findMatchingModel(fields, existingModels);
      
      if (!existingModel) {
        const modelName = inferModelNameFromCard(group[0]) || `CardModel${index + 1}`;
        
        const model: DataModel = {
          id: crypto.randomUUID(),
          projectId,
          name: modelName,
          fields,
          relationships: [],
          endpoints: generateCRUDEndpoints(modelName),
          inferredFrom: group.map(c => c.id),
          confidence: 0.7,
          isUserDefined: false
        };
        
        models.push(model);
        reasoning.push(`Inferred ${modelName} model from card structure`);
        confidence += 0.7;
      } else {
        reasoning.push(`Card displays ${existingModel.name} data`);
        confidence += 0.8;
      }
    }
  });
  
  return {
    models,
    reasoning,
    confidence: confidence / Math.max(1, cardGroups.length)
  };
}

/**
 * Detect relationships between data models
 */
function detectRelationships(
  models: DataModel[],
  components: Component[]
): { relationships: Array<{ from: string; to: string; type: string }>; reasoning: string[] } {
  const relationships: Array<{ from: string; to: string; type: string }> = [];
  const reasoning: string[] = [];
  
  // Look for foreign key patterns
  models.forEach(model => {
    model.fields.forEach(field => {
      // Check for ID references
      if (field.name.endsWith('Id') && field.name !== 'id') {
        const referencedModel = field.name.slice(0, -2);
        const targetModel = models.find(m => 
          m.name.toLowerCase() === referencedModel.toLowerCase()
        );
        
        if (targetModel) {
          relationships.push({
            from: model.id,
            to: targetModel.id,
            type: 'belongs_to'
          });
          reasoning.push(`${model.name} belongs to ${targetModel.name}`);
        }
      }
      
      // Check for array fields that might be relations
      if (field.type === 'array' && field.name !== 'tags') {
        const possibleModel = singularize(field.name);
        const targetModel = models.find(m => 
          m.name.toLowerCase() === possibleModel.toLowerCase()
        );
        
        if (targetModel) {
          relationships.push({
            from: model.id,
            to: targetModel.id,
            type: 'has_many'
          });
          reasoning.push(`${model.name} has many ${targetModel.name}`);
        }
      }
    });
  });
  
  return { relationships, reasoning };
}

/**
 * Apply detected relationships to models
 */
function applyRelationships(
  models: DataModel[],
  relationships: { relationships: Array<{ from: string; to: string; type: string }>; reasoning: string[] }
): void {
  relationships.relationships.forEach(rel => {
    const fromModel = models.find(m => m.id === rel.from);
    const toModel = models.find(m => m.id === rel.to);
    
    if (fromModel && toModel) {
      fromModel.relationships.push({
        type: rel.type as any,
        model: toModel.name,
        foreignKey: `${camelCase(toModel.name)}Id`,
        required: false
      });
    }
  });
}

/**
 * Generate CRUD endpoints for a model
 */
function generateCRUDEndpoints(modelName: string): any[] {
  const plural = pluralize(modelName.toLowerCase());
  const singular = modelName.toLowerCase();
  
  return [
    {
      method: 'GET',
      path: `/api/${plural}`,
      description: `Get all ${plural}`,
      responseType: `${modelName}[]`
    },
    {
      method: 'GET',
      path: `/api/${plural}/:id`,
      description: `Get ${singular} by ID`,
      responseType: modelName
    },
    {
      method: 'POST',
      path: `/api/${plural}`,
      description: `Create new ${singular}`,
      requestType: `Create${modelName}DTO`,
      responseType: modelName
    },
    {
      method: 'PUT',
      path: `/api/${plural}/:id`,
      description: `Update ${singular}`,
      requestType: `Update${modelName}DTO`,
      responseType: modelName
    },
    {
      method: 'DELETE',
      path: `/api/${plural}/:id`,
      description: `Delete ${singular}`,
      responseType: 'void'
    }
  ];
}

// Utility functions
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function camelCase(str: string): string {
  return str.replace(/[-_\s]+(.)?/g, (_, c) => c ? c.toUpperCase() : '');
}

function pluralize(str: string): string {
  if (str.endsWith('y')) return str.slice(0, -1) + 'ies';
  if (str.endsWith('s')) return str + 'es';
  return str + 's';
}

function singularize(str: string): string {
  if (str.endsWith('ies')) return str.slice(0, -3) + 'y';
  if (str.endsWith('es')) return str.slice(0, -2);
  if (str.endsWith('s')) return str.slice(0, -1);
  return str;
}

function findCommonWords(strings: string[]): string[] {
  const wordCounts = new Map<string, number>();
  
  strings.forEach(str => {
    const words = str.toLowerCase().split(/\s+/);
    words.forEach(word => {
      if (word.length > 3) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });
  });
  
  return Array.from(wordCounts.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .map(([word]) => word);
}

function groupSimilarCards(cards: Component[]): Component[][] {
  // For now, just return each card as its own group
  return cards.map(card => [card]);
}

function inferFieldsFromCardStructure(card: Component): DataField[] {
  // This would analyze the card's children to determine fields
  return [];
}

function inferModelNameFromCard(card: Component): string | null {
  // This would try to determine the model name from card content
  return null;
}

function findMatchingModel(fields: DataField[], models: DataModel[]): DataModel | null {
  // This would compare field structures to find matching models
  return null;
}