import type { Screen, UserJourney, JourneyStep, Component } from '@/types';
import type { InferenceResult } from '@/services/inference';

interface ScreenConnection {
  fromScreen: Screen;
  toScreen: Screen;
  triggers: string[];
  confidence: number;
}

interface PersonaPattern {
  name: string;
  description: string;
  goals: string[];
  screenPatterns: string[];
}

/**
 * Generate user journeys from screens
 */
export async function generateUserJourneysFromScreens(
  screens: Screen[],
  projectId: string
): Promise<InferenceResult<UserJourney[]>> {
  const journeys: UserJourney[] = [];
  const reasoning: string[] = [];
  const suggestions: string[] = [];
  
  if (screens.length === 0) {
    return {
      data: [],
      confidence: 0,
      reasoning: ['No screens available to generate journeys'],
      suggestions: ['Add screens to your project to generate user journeys']
    };
  }
  
  // Detect screen connections
  const connections = detectScreenConnections(screens);
  reasoning.push(`Detected ${connections.length} screen connections`);
  
  // Identify personas based on screen types
  const personas = identifyPersonas(screens);
  reasoning.push(`Identified ${personas.length} user personas`);
  
  // Generate journeys for each persona
  personas.forEach((persona, index) => {
    const personaJourneys = generatePersonaJourneys(
      persona,
      screens,
      connections,
      projectId
    );
    
    journeys.push(...personaJourneys);
    reasoning.push(`Generated ${personaJourneys.length} journeys for ${persona.name}`);
  });
  
  // Generate suggestions
  if (journeys.length === 0) {
    suggestions.push('Add navigation elements to connect your screens');
    suggestions.push('Define clear user goals for journey generation');
  }
  
  const homeScreen = screens.find(s => s.isHomePage);
  if (!homeScreen) {
    suggestions.push('Mark one screen as the home page for better journey flow');
  }
  
  const orphanScreens = findOrphanScreens(screens, connections);
  if (orphanScreens.length > 0) {
    suggestions.push(`Connect ${orphanScreens.length} isolated screens to the main flow`);
  }
  
  // Calculate overall confidence
  const avgConfidence = journeys.reduce((sum, j) => sum + (j.confidence || 0.5), 0) / Math.max(1, journeys.length);
  
  return {
    data: journeys,
    confidence: avgConfidence,
    reasoning,
    suggestions
  };
}

/**
 * Detect connections between screens
 */
function detectScreenConnections(screens: Screen[]): ScreenConnection[] {
  const connections: ScreenConnection[] = [];
  
  screens.forEach(fromScreen => {
    screens.forEach(toScreen => {
      if (fromScreen.id === toScreen.id) return;
      
      // Check for explicit navigation patterns
      const triggers = detectNavigationTriggers(fromScreen, toScreen);
      
      if (triggers.length > 0) {
        connections.push({
          fromScreen,
          toScreen,
          triggers,
          confidence: calculateConnectionConfidence(fromScreen, toScreen, triggers)
        });
      }
    });
  });
  
  // Add implicit connections based on screen types
  addImplicitConnections(screens, connections);
  
  return connections;
}

/**
 * Detect navigation triggers between screens
 */
function detectNavigationTriggers(fromScreen: Screen, toScreen: Screen): string[] {
  const triggers: string[] = [];
  
  // Check route paths
  if (fromScreen.routePath && toScreen.routePath) {
    // Landing -> Login pattern
    if (fromScreen.type === 'landing' && toScreen.type === 'form' && toScreen.name.toLowerCase().includes('login')) {
      triggers.push('Login button click');
    }
    
    // List -> Detail pattern
    if (fromScreen.type === 'list' && toScreen.type === 'detail') {
      triggers.push('Item selection');
    }
    
    // Form -> Success/List pattern
    if (fromScreen.type === 'form' && (toScreen.type === 'list' || toScreen.name.toLowerCase().includes('success'))) {
      triggers.push('Form submission');
    }
    
    // Any -> Settings pattern
    if (toScreen.type === 'settings') {
      triggers.push('Settings navigation');
    }
  }
  
  return triggers;
}

/**
 * Add implicit connections based on common patterns
 */
function addImplicitConnections(screens: Screen[], connections: ScreenConnection[]): void {
  const homeScreen = screens.find(s => s.isHomePage) || screens.find(s => s.type === 'landing');
  
  if (homeScreen) {
    // Connect home to main screens
    screens.forEach(screen => {
      if (screen.id !== homeScreen.id && !connections.some(c => c.fromScreen.id === homeScreen.id && c.toScreen.id === screen.id)) {
        if (shouldConnectFromHome(screen)) {
          connections.push({
            fromScreen: homeScreen,
            toScreen: screen,
            triggers: ['Main navigation'],
            confidence: 0.7
          });
        }
      }
    });
  }
  
  // Connect profile/settings to each other
  const profileScreen = screens.find(s => s.type === 'profile');
  const settingsScreen = screens.find(s => s.type === 'settings');
  
  if (profileScreen && settingsScreen) {
    if (!connections.some(c => c.fromScreen.id === profileScreen.id && c.toScreen.id === settingsScreen.id)) {
      connections.push({
        fromScreen: profileScreen,
        toScreen: settingsScreen,
        triggers: ['Settings link'],
        confidence: 0.8
      });
    }
  }
}

/**
 * Identify user personas based on screen patterns
 */
function identifyPersonas(screens: Screen[]): PersonaPattern[] {
  const personas: PersonaPattern[] = [];
  const screenTypes = new Set(screens.map(s => s.type));
  
  // New User persona
  if (screenTypes.has('landing') || screenTypes.has('form')) {
    personas.push({
      name: 'New User',
      description: 'First-time visitor exploring the app',
      goals: ['Sign up', 'Understand features', 'Complete onboarding'],
      screenPatterns: ['landing', 'form', 'profile']
    });
  }
  
  // Regular User persona
  if (screenTypes.has('list') || screenTypes.has('detail')) {
    personas.push({
      name: 'Regular User',
      description: 'Active user performing daily tasks',
      goals: ['View content', 'Create items', 'Manage data'],
      screenPatterns: ['list', 'detail', 'form']
    });
  }
  
  // Power User persona
  if (screenTypes.has('settings') || screens.length > 5) {
    personas.push({
      name: 'Power User',
      description: 'Advanced user optimizing workflow',
      goals: ['Customize settings', 'Bulk operations', 'Advanced features'],
      screenPatterns: ['settings', 'profile', 'list', 'detail']
    });
  }
  
  // If no specific personas detected, add generic
  if (personas.length === 0) {
    personas.push({
      name: 'General User',
      description: 'User exploring the application',
      goals: ['Navigate app', 'Complete tasks'],
      screenPatterns: screens.map(s => s.type)
    });
  }
  
  return personas;
}

/**
 * Generate journeys for a specific persona
 */
function generatePersonaJourneys(
  persona: PersonaPattern,
  screens: Screen[],
  connections: ScreenConnection[],
  projectId: string
): UserJourney[] {
  const journeys: UserJourney[] = [];
  
  persona.goals.forEach((goal, index) => {
    const journey = generateJourneyForGoal(
      persona,
      goal,
      screens,
      connections,
      projectId,
      index
    );
    
    if (journey) {
      journeys.push(journey);
    }
  });
  
  return journeys;
}

/**
 * Generate a journey for a specific goal
 */
function generateJourneyForGoal(
  persona: PersonaPattern,
  goal: string,
  screens: Screen[],
  connections: ScreenConnection[],
  projectId: string,
  index: number
): UserJourney | null {
  const steps: JourneyStep[] = [];
  const visitedScreens = new Set<string>();
  
  // Find starting screen
  const startScreen = findStartScreen(screens, goal);
  if (!startScreen) return null;
  
  // Build journey path
  let currentScreen = startScreen;
  let stepNumber = 1;
  
  while (currentScreen && stepNumber <= 10) { // Prevent infinite loops
    if (visitedScreens.has(currentScreen.id)) break;
    visitedScreens.add(currentScreen.id);
    
    const action = determineActionForScreen(currentScreen, goal);
    const expectedOutcome = determineExpectedOutcome(currentScreen, goal);
    
    steps.push({
      stepNumber,
      screenId: currentScreen.id,
      action,
      expectedOutcome,
      componentInteractions: inferComponentInteractions(currentScreen, action)
    });
    
    // Find next screen
    const nextConnection = findBestNextScreen(
      currentScreen,
      connections,
      goal,
      visitedScreens
    );
    
    if (!nextConnection || isGoalComplete(currentScreen, goal)) {
      break;
    }
    
    currentScreen = nextConnection.toScreen;
    stepNumber++;
  }
  
  if (steps.length === 0) return null;
  
  return {
    id: crypto.randomUUID(),
    projectId,
    name: `${persona.name}: ${goal}`,
    persona: persona.name,
    goal,
    steps,
    successCriteria: generateSuccessCriteria(goal, steps),
    priority: determinePriority(persona, index),
    confidence: 0.8
  };
}

/**
 * Find the best starting screen for a goal
 */
function findStartScreen(screens: Screen[], goal: string): Screen | null {
  const goalLower = goal.toLowerCase();
  
  // Priority order for start screens
  const startScreen = 
    screens.find(s => s.isHomePage) ||
    screens.find(s => s.type === 'landing') ||
    screens.find(s => goalLower.includes('sign') && s.type === 'form') ||
    screens.find(s => goalLower.includes('view') && s.type === 'list') ||
    screens[0];
    
  return startScreen;
}

/**
 * Determine action for a screen in context of goal
 */
function determineActionForScreen(screen: Screen, goal: string): string {
  const goalLower = goal.toLowerCase();
  
  switch (screen.type) {
    case 'landing':
      if (goalLower.includes('sign up')) return 'Click sign up button';
      if (goalLower.includes('sign in')) return 'Click login button';
      return 'Explore landing page';
      
    case 'form':
      if (screen.name.toLowerCase().includes('login')) return 'Enter credentials and submit';
      if (screen.name.toLowerCase().includes('signup')) return 'Fill registration form';
      return 'Complete form fields';
      
    case 'list':
      if (goalLower.includes('view')) return 'Browse items in list';
      if (goalLower.includes('create')) return 'Click create button';
      return 'Select item from list';
      
    case 'detail':
      if (goalLower.includes('edit')) return 'Click edit button';
      if (goalLower.includes('delete')) return 'Click delete button';
      return 'View item details';
      
    case 'profile':
      if (goalLower.includes('customize')) return 'Edit profile information';
      return 'View profile information';
      
    case 'settings':
      if (goalLower.includes('customize')) return 'Modify settings';
      return 'Review settings options';
      
    default:
      return 'Interact with screen';
  }
}

/**
 * Determine expected outcome for a screen action
 */
function determineExpectedOutcome(screen: Screen, goal: string): string {
  const goalLower = goal.toLowerCase();
  
  switch (screen.type) {
    case 'landing':
      return 'User understands value proposition';
      
    case 'form':
      if (screen.name.toLowerCase().includes('login')) return 'User successfully authenticated';
      if (screen.name.toLowerCase().includes('signup')) return 'Account created successfully';
      return 'Form submitted successfully';
      
    case 'list':
      if (goalLower.includes('view')) return 'Data displayed correctly';
      return 'Navigation to detail view';
      
    case 'detail':
      if (goalLower.includes('edit')) return 'Edit mode activated';
      return 'Complete information displayed';
      
    case 'profile':
      return 'Profile information updated';
      
    case 'settings':
      return 'Settings saved successfully';
      
    default:
      return 'Action completed successfully';
  }
}

/**
 * Infer component interactions for a screen action
 */
function inferComponentInteractions(screen: Screen, action: string): string[] {
  const interactions: string[] = [];
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes('click')) {
    interactions.push('Button click');
  }
  
  if (actionLower.includes('fill') || actionLower.includes('enter')) {
    interactions.push('Form input');
    interactions.push('Validation feedback');
  }
  
  if (actionLower.includes('select')) {
    interactions.push('Item selection');
    interactions.push('Hover state');
  }
  
  if (actionLower.includes('browse') || actionLower.includes('view')) {
    interactions.push('Scroll interaction');
    interactions.push('Content loading');
  }
  
  return interactions;
}

/**
 * Find best next screen based on goal and connections
 */
function findBestNextScreen(
  currentScreen: Screen,
  connections: ScreenConnection[],
  goal: string,
  visitedScreens: Set<string>
): ScreenConnection | null {
  const availableConnections = connections
    .filter(c => c.fromScreen.id === currentScreen.id && !visitedScreens.has(c.toScreen.id))
    .sort((a, b) => b.confidence - a.confidence);
  
  if (availableConnections.length === 0) return null;
  
  // Try to find connection that aligns with goal
  const goalAligned = availableConnections.find(c => 
    isScreenAlignedWithGoal(c.toScreen, goal)
  );
  
  return goalAligned || availableConnections[0];
}

/**
 * Check if screen aligns with goal
 */
function isScreenAlignedWithGoal(screen: Screen, goal: string): boolean {
  const goalLower = goal.toLowerCase();
  const screenNameLower = screen.name.toLowerCase();
  
  if (goalLower.includes('sign up') && screen.type === 'form' && screenNameLower.includes('sign')) return true;
  if (goalLower.includes('view') && screen.type === 'list') return true;
  if (goalLower.includes('create') && screen.type === 'form') return true;
  if (goalLower.includes('settings') && screen.type === 'settings') return true;
  if (goalLower.includes('profile') && screen.type === 'profile') return true;
  
  return false;
}

/**
 * Check if goal is complete based on current screen
 */
function isGoalComplete(screen: Screen, goal: string): boolean {
  const goalLower = goal.toLowerCase();
  
  if (goalLower.includes('sign up') && screen.name.toLowerCase().includes('success')) return true;
  if (goalLower.includes('view') && screen.type === 'detail') return true;
  if (goalLower.includes('create') && screen.name.toLowerCase().includes('success')) return true;
  if (goalLower.includes('settings') && screen.type === 'settings') return true;
  
  return false;
}

/**
 * Generate success criteria for journey
 */
function generateSuccessCriteria(goal: string, steps: JourneyStep[]): string {
  const lastStep = steps[steps.length - 1];
  
  if (goal.toLowerCase().includes('sign up')) {
    return 'User account created and redirected to dashboard';
  }
  
  if (goal.toLowerCase().includes('create')) {
    return 'New item created and visible in list';
  }
  
  if (goal.toLowerCase().includes('view')) {
    return 'User successfully viewed desired content';
  }
  
  if (goal.toLowerCase().includes('customize')) {
    return 'Settings saved and applied throughout app';
  }
  
  return `User completed ${steps.length} steps and achieved ${goal}`;
}

/**
 * Determine priority based on persona and goal index
 */
function determinePriority(persona: PersonaPattern, goalIndex: number): 'high' | 'medium' | 'low' {
  if (persona.name === 'New User' && goalIndex === 0) return 'high';
  if (persona.name === 'Regular User' && goalIndex < 2) return 'high';
  if (goalIndex === 0) return 'medium';
  return 'low';
}

/**
 * Check if screen should be connected from home
 */
function shouldConnectFromHome(screen: Screen): boolean {
  // Main navigable screen types
  const mainTypes = ['list', 'profile', 'settings'];
  if (mainTypes.includes(screen.type)) return true;
  
  // Named screens that suggest main features
  const mainNames = ['dashboard', 'home', 'main', 'overview'];
  if (mainNames.some(name => screen.name.toLowerCase().includes(name))) return true;
  
  return false;
}

/**
 * Find screens not connected to any others
 */
function findOrphanScreens(screens: Screen[], connections: ScreenConnection[]): Screen[] {
  const connectedScreenIds = new Set<string>();
  
  connections.forEach(conn => {
    connectedScreenIds.add(conn.fromScreen.id);
    connectedScreenIds.add(conn.toScreen.id);
  });
  
  return screens.filter(screen => !connectedScreenIds.has(screen.id));
}

/**
 * Calculate connection confidence
 */
function calculateConnectionConfidence(
  fromScreen: Screen,
  toScreen: Screen,
  triggers: string[]
): number {
  let confidence = 0.5;
  
  // Boost for explicit triggers
  confidence += triggers.length * 0.1;
  
  // Boost for logical flow
  if (fromScreen.type === 'landing' && toScreen.type === 'form') confidence += 0.2;
  if (fromScreen.type === 'list' && toScreen.type === 'detail') confidence += 0.3;
  if (fromScreen.type === 'form' && toScreen.name.includes('success')) confidence += 0.3;
  
  return Math.min(confidence, 1);
}