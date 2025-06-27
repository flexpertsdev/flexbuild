import type { Component, DesignSystem, ColorScale, ComponentStyle } from '@/types';
import type { InferenceResult } from '@/services/inference';

interface ColorUsage {
  color: string;
  count: number;
  contexts: string[];
}

interface SpacingUsage {
  value: number;
  count: number;
  contexts: string[];
}

interface FontUsage {
  family: string;
  size: string;
  weight: string;
  count: number;
}

/**
 * Extract design system from components
 */
export async function extractDesignSystemFromComponents(
  components: Component[],
  projectId: string
): Promise<InferenceResult<DesignSystem>> {
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  
  // Extract color usage
  const colorAnalysis = analyzeColorUsage(components);
  reasoning.push(...colorAnalysis.reasoning);
  
  // Extract typography patterns
  const typographyAnalysis = analyzeTypography(components);
  reasoning.push(...typographyAnalysis.reasoning);
  
  // Extract spacing patterns
  const spacingAnalysis = analyzeSpacing(components);
  reasoning.push(...spacingAnalysis.reasoning);
  
  // Extract component-specific styles
  const componentStyles = extractComponentStyles(components);
  reasoning.push(`Extracted styles for ${componentStyles.length} component types`);
  
  // Generate CSS custom properties
  const generatedCSS = generateDesignSystemCSS(
    colorAnalysis.colors,
    typographyAnalysis.typography,
    spacingAnalysis.spacing
  );
  
  // Calculate confidence based on consistency
  const confidence = calculateDesignSystemConfidence(
    colorAnalysis,
    typographyAnalysis,
    spacingAnalysis
  );
  
  // Generate suggestions
  if (colorAnalysis.suggestions.length > 0) {
    suggestions.push(...colorAnalysis.suggestions);
  }
  
  if (typographyAnalysis.suggestions.length > 0) {
    suggestions.push(...typographyAnalysis.suggestions);
  }
  
  if (spacingAnalysis.suggestions.length > 0) {
    suggestions.push(...spacingAnalysis.suggestions);
  }
  
  const designSystem: DesignSystem = {
    id: crypto.randomUUID(),
    projectId,
    colors: colorAnalysis.colors,
    typography: typographyAnalysis.typography,
    spacing: spacingAnalysis.spacing,
    componentStyles,
    generatedCSS,
    version: 1
  };
  
  return {
    data: designSystem,
    confidence,
    reasoning,
    suggestions
  };
}

/**
 * Analyze color usage across components
 */
function analyzeColorUsage(components: Component[]): {
  colors: DesignSystem['colors'];
  reasoning: string[];
  suggestions: string[];
  consistency: number;
} {
  const colorUsages: ColorUsage[] = [];
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  
  // Collect all color values
  components.forEach(component => {
    const colors = extractColorsFromComponent(component);
    colors.forEach(({ color, context }) => {
      const existing = colorUsages.find(u => u.color === color);
      if (existing) {
        existing.count++;
        if (!existing.contexts.includes(context)) {
          existing.contexts.push(context);
        }
      } else {
        colorUsages.push({ color, count: 1, contexts: [context] });
      }
    });
  });
  
  // Sort by usage frequency
  colorUsages.sort((a, b) => b.count - a.count);
  
  // Identify primary colors (most used)
  const primaryCandidates = colorUsages.slice(0, 5);
  const primaryColor = primaryCandidates.find(c => 
    c.contexts.includes('background') || c.contexts.includes('button')
  ) || primaryCandidates[0];
  
  // Generate color scales
  const primaryScale = generateColorScale(primaryColor?.color || '#3b82f6', 'primary');
  const secondaryScale = generateColorScale('#8b5cf6', 'secondary');
  const neutralScale = generateNeutralScale();
  
  reasoning.push(`Identified ${colorUsages.length} unique colors across components`);
  reasoning.push(`Primary color: ${primaryColor?.color || 'default blue'} (used ${primaryColor?.count || 0} times)`);
  
  // Check color consistency
  const consistency = calculateColorConsistency(colorUsages);
  if (consistency < 0.7) {
    suggestions.push('Consider consolidating colors - too many unique colors detected');
    suggestions.push(`Found ${colorUsages.length} colors, recommend using 8-12 colors max`);
  }
  
  // Detect missing semantic colors
  const hasSuccess = colorUsages.some(c => isGreenish(c.color));
  const hasError = colorUsages.some(c => isReddish(c.color));
  const hasWarning = colorUsages.some(c => isYellowish(c.color));
  
  if (!hasSuccess) suggestions.push('Add a success color (green) for positive feedback');
  if (!hasError) suggestions.push('Add an error color (red) for error states');
  if (!hasWarning) suggestions.push('Add a warning color (yellow/orange) for warnings');
  
  return {
    colors: {
      primary: primaryScale,
      secondary: secondaryScale,
      neutral: neutralScale,
      success: hasSuccess ? findColorByHue(colorUsages, 'green') : '#10b981',
      warning: hasWarning ? findColorByHue(colorUsages, 'yellow') : '#f59e0b',
      error: hasError ? findColorByHue(colorUsages, 'red') : '#ef4444'
    },
    reasoning,
    suggestions,
    consistency
  };
}

/**
 * Analyze typography usage
 */
function analyzeTypography(components: Component[]): {
  typography: DesignSystem['typography'];
  reasoning: string[];
  suggestions: string[];
  consistency: number;
} {
  const fontUsages: FontUsage[] = [];
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  
  // Collect font usage
  components.forEach(component => {
    const fonts = extractFontsFromComponent(component);
    fonts.forEach(font => {
      const existing = fontUsages.find(f => 
        f.family === font.family && 
        f.size === font.size && 
        f.weight === font.weight
      );
      
      if (existing) {
        existing.count++;
      } else {
        fontUsages.push({ ...font, count: 1 });
      }
    });
  });
  
  // Determine primary font family
  const fontFamilies = new Map<string, number>();
  fontUsages.forEach(f => {
    fontFamilies.set(f.family, (fontFamilies.get(f.family) || 0) + f.count);
  });
  
  const sortedFamilies = Array.from(fontFamilies.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const primaryFont = sortedFamilies[0]?.[0] || "'Inter', system-ui, -apple-system, sans-serif";
  
  // Extract font sizes
  const fontSizes = new Map<string, number>();
  fontUsages.forEach(f => {
    fontSizes.set(f.size, (fontSizes.get(f.size) || 0) + f.count);
  });
  
  const scale = generateTypographyScale(fontSizes);
  
  reasoning.push(`Primary font: ${primaryFont}`);
  reasoning.push(`Found ${fontSizes.size} different font sizes`);
  
  // Check typography consistency
  if (sortedFamilies.length > 2) {
    suggestions.push('Consider using fewer font families for better consistency');
  }
  
  if (fontSizes.size > 8) {
    suggestions.push('Too many font sizes - consider using a consistent type scale');
  }
  
  const consistency = calculateTypographyConsistency(fontUsages);
  
  return {
    typography: {
      fontFamily: primaryFont,
      scale
    },
    reasoning,
    suggestions,
    consistency
  };
}

/**
 * Analyze spacing patterns
 */
function analyzeSpacing(components: Component[]): {
  spacing: DesignSystem['spacing'];
  reasoning: string[];
  suggestions: string[];
  consistency: number;
} {
  const spacingUsages: SpacingUsage[] = [];
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  
  // Collect spacing values
  components.forEach(component => {
    const spacings = extractSpacingFromComponent(component);
    spacings.forEach(({ value, context }) => {
      const existing = spacingUsages.find(s => s.value === value);
      if (existing) {
        existing.count++;
        if (!existing.contexts.includes(context)) {
          existing.contexts.push(context);
        }
      } else {
        spacingUsages.push({ value, count: 1, contexts: [context] });
      }
    });
  });
  
  // Find base unit (most common small spacing)
  const smallSpacings = spacingUsages
    .filter(s => s.value > 0 && s.value <= 16)
    .sort((a, b) => b.count - a.count);
  
  const baseUnit = smallSpacings[0]?.value || 4;
  
  // Generate spacing scale based on base unit
  const scale = generateSpacingScale(baseUnit);
  
  reasoning.push(`Base spacing unit: ${baseUnit}px`);
  reasoning.push(`Found ${spacingUsages.length} unique spacing values`);
  
  // Check if spacings follow a consistent scale
  const consistency = calculateSpacingConsistency(spacingUsages, baseUnit);
  
  if (consistency < 0.7) {
    suggestions.push(`Use multiples of ${baseUnit}px for consistent spacing`);
  }
  
  return {
    spacing: {
      unit: baseUnit,
      scale
    },
    reasoning,
    suggestions,
    consistency
  };
}

/**
 * Extract component-specific styles
 */
function extractComponentStyles(components: Component[]): ComponentStyle[] {
  const stylesByType = new Map<string, ComponentStyle>();
  
  components.forEach(component => {
    const { componentType, customStyles = {} } = component;
    
    if (!stylesByType.has(componentType)) {
      stylesByType.set(componentType, {
        componentType,
        baseStyles: {},
        variants: {},
        states: {}
      });
    }
    
    const componentStyle = stylesByType.get(componentType)!;
    
    // Merge styles
    Object.entries(customStyles).forEach(([key, value]) => {
      if (key.startsWith('hover:') || key.startsWith('focus:') || key.startsWith('active:')) {
        const state = key.split(':')[0];
        if (!componentStyle.states[state]) {
          componentStyle.states[state] = {};
        }
        componentStyle.states[state][key.split(':')[1]] = value;
      } else {
        componentStyle.baseStyles[key] = value;
      }
    });
  });
  
  return Array.from(stylesByType.values());
}

/**
 * Generate color scale from a base color
 */
function generateColorScale(baseColor: string, name: string): ColorScale {
  // This is a simplified version - in production, use a proper color library
  return {
    50: lighten(baseColor, 0.95),
    100: lighten(baseColor, 0.9),
    200: lighten(baseColor, 0.8),
    300: lighten(baseColor, 0.6),
    400: lighten(baseColor, 0.3),
    500: baseColor,
    600: darken(baseColor, 0.1),
    700: darken(baseColor, 0.3),
    800: darken(baseColor, 0.5),
    900: darken(baseColor, 0.7)
  };
}

/**
 * Generate neutral color scale
 */
function generateNeutralScale(): ColorScale {
  return {
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
  };
}

/**
 * Generate typography scale
 */
function generateTypographyScale(fontSizes: Map<string, number>): Record<string, string> {
  const defaultScale = {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem'
  };
  
  // Try to map detected sizes to scale
  const sortedSizes = Array.from(fontSizes.keys())
    .map(s => parseFloat(s))
    .filter(s => !isNaN(s))
    .sort((a, b) => a - b);
  
  if (sortedSizes.length >= 4) {
    // Custom scale based on detected sizes
    return {
      xs: `${sortedSizes[0]}px`,
      sm: `${sortedSizes[1]}px`,
      base: `${sortedSizes[2] || 16}px`,
      lg: `${sortedSizes[3]}px`,
      xl: `${sortedSizes[4] || sortedSizes[3] * 1.25}px`,
      '2xl': `${sortedSizes[5] || sortedSizes[3] * 1.5}px`,
      '3xl': `${sortedSizes[6] || sortedSizes[3] * 1.875}px`,
      '4xl': `${sortedSizes[7] || sortedSizes[3] * 2.25}px`
    };
  }
  
  return defaultScale;
}

/**
 * Generate spacing scale
 */
function generateSpacingScale(baseUnit: number): Record<string, number> {
  return {
    xs: baseUnit,
    sm: baseUnit * 2,
    md: baseUnit * 4,
    lg: baseUnit * 6,
    xl: baseUnit * 8,
    '2xl': baseUnit * 12,
    '3xl': baseUnit * 16
  };
}

/**
 * Generate CSS custom properties for design system
 */
function generateDesignSystemCSS(
  colors: DesignSystem['colors'],
  typography: DesignSystem['typography'],
  spacing: DesignSystem['spacing']
): string {
  const lines: string[] = [':root {'];
  
  // Colors
  Object.entries(colors.primary).forEach(([key, value]) => {
    lines.push(`  --color-primary-${key}: ${value};`);
  });
  
  Object.entries(colors.secondary).forEach(([key, value]) => {
    lines.push(`  --color-secondary-${key}: ${value};`);
  });
  
  Object.entries(colors.neutral).forEach(([key, value]) => {
    lines.push(`  --color-neutral-${key}: ${value};`);
  });
  
  lines.push(`  --color-success: ${colors.success};`);
  lines.push(`  --color-warning: ${colors.warning};`);
  lines.push(`  --color-error: ${colors.error};`);
  
  // Typography
  lines.push(`  --font-family: ${typography.fontFamily};`);
  Object.entries(typography.scale).forEach(([key, value]) => {
    lines.push(`  --font-size-${key}: ${value};`);
  });
  
  // Spacing
  lines.push(`  --spacing-unit: ${spacing.unit}px;`);
  Object.entries(spacing.scale).forEach(([key, value]) => {
    lines.push(`  --spacing-${key}: ${value}px;`);
  });
  
  lines.push('}');
  
  return lines.join('\n');
}

// Utility functions
function extractColorsFromComponent(component: Component): { color: string; context: string }[] {
  const colors: { color: string; context: string }[] = [];
  const { customStyles = {}, props = {} } = component;
  
  // Check custom styles
  if (customStyles.backgroundColor) {
    colors.push({ color: customStyles.backgroundColor, context: 'background' });
  }
  if (customStyles.color) {
    colors.push({ color: customStyles.color, context: 'text' });
  }
  if (customStyles.borderColor) {
    colors.push({ color: customStyles.borderColor, context: 'border' });
  }
  
  // Check props
  if (props.color) {
    colors.push({ color: props.color, context: component.componentType });
  }
  if (props.backgroundColor) {
    colors.push({ color: props.backgroundColor, context: 'background' });
  }
  
  return colors.filter(c => isValidColor(c.color));
}

function extractFontsFromComponent(component: Component): Omit<FontUsage, 'count'>[] {
  const fonts: Omit<FontUsage, 'count'>[] = [];
  const { customStyles = {} } = component;
  
  const family = customStyles.fontFamily || "'Inter', system-ui, -apple-system, sans-serif";
  const size = customStyles.fontSize || '1rem';
  const weight = customStyles.fontWeight || 'normal';
  
  fonts.push({ family, size, weight });
  
  return fonts;
}

function extractSpacingFromComponent(component: Component): { value: number; context: string }[] {
  const spacings: { value: number; context: string }[] = [];
  const { customStyles = {} } = component;
  
  const spacingProps = ['padding', 'margin', 'gap', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'marginTop', 'marginBottom', 'marginLeft', 'marginRight'];
  
  spacingProps.forEach(prop => {
    if (customStyles[prop]) {
      const value = parseSpacingValue(customStyles[prop]);
      if (value !== null) {
        spacings.push({ value, context: prop });
      }
    }
  });
  
  return spacings;
}

function isValidColor(color: string): boolean {
  return /^#[0-9A-F]{6}$/i.test(color) || /^rgb/.test(color) || /^hsl/.test(color);
}

function lighten(color: string, amount: number): string {
  // Simplified color manipulation
  return color; // In production, use a proper color library
}

function darken(color: string, amount: number): string {
  // Simplified color manipulation
  return color; // In production, use a proper color library
}

function isGreenish(color: string): boolean {
  // Simplified hue detection
  return color.includes('green') || /#[0-9a-f]*[89ab][0-9a-f]*/i.test(color);
}

function isReddish(color: string): boolean {
  // Simplified hue detection
  return color.includes('red') || /#[ef][0-9a-f]*/i.test(color);
}

function isYellowish(color: string): boolean {
  // Simplified hue detection
  return color.includes('yellow') || color.includes('orange') || /#[ef][ef]/i.test(color);
}

function findColorByHue(colors: ColorUsage[], hue: string): string {
  const found = colors.find(c => {
    if (hue === 'green') return isGreenish(c.color);
    if (hue === 'red') return isReddish(c.color);
    if (hue === 'yellow') return isYellowish(c.color);
    return false;
  });
  
  return found?.color || '#6b7280';
}

function parseSpacingValue(value: string | number): number | null {
  if (typeof value === 'number') return value;
  
  const match = value.match(/^(\d+)(px)?$/);
  if (match) {
    return parseInt(match[1], 10);
  }
  
  return null;
}

function calculateColorConsistency(colors: ColorUsage[]): number {
  if (colors.length === 0) return 1;
  
  // Ideal is 8-12 colors
  const ideal = 10;
  const deviation = Math.abs(colors.length - ideal) / ideal;
  
  return Math.max(0, 1 - deviation);
}

function calculateTypographyConsistency(fonts: FontUsage[]): number {
  if (fonts.length === 0) return 1;
  
  // Check how many fonts follow a scale
  const sizes = new Set(fonts.map(f => f.size));
  const ideal = 6; // Ideal number of font sizes
  const deviation = Math.abs(sizes.size - ideal) / ideal;
  
  return Math.max(0, 1 - deviation);
}

function calculateSpacingConsistency(spacings: SpacingUsage[], baseUnit: number): number {
  if (spacings.length === 0) return 1;
  
  // Check how many spacings are multiples of base unit
  const multiples = spacings.filter(s => s.value % baseUnit === 0);
  
  return multiples.length / spacings.length;
}

function calculateDesignSystemConfidence(
  colorAnalysis: { consistency: number },
  typographyAnalysis: { consistency: number },
  spacingAnalysis: { consistency: number }
): number {
  const weights = {
    color: 0.4,
    typography: 0.3,
    spacing: 0.3
  };
  
  return (
    colorAnalysis.consistency * weights.color +
    typographyAnalysis.consistency * weights.typography +
    spacingAnalysis.consistency * weights.spacing
  );
}