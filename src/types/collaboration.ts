export interface CollaborationSession {
  id: string;
  projectId: string;
  activeUsers: ActiveUser[];
  cursors: CursorPosition[];
  selections: Selection[];
  changes: ChangeEvent[];
  createdAt: Date;
  lastActivityAt: Date;
}

export interface ActiveUser {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  color: string;
  cursorPosition?: CursorPosition;
  selectedElement?: string;
  status: 'active' | 'idle' | 'away';
  joinedAt: Date;
  lastSeenAt: Date;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  screenId: string;
  timestamp: Date;
}

export interface Selection {
  userId: string;
  elementId: string;
  elementType: 'component' | 'screen' | 'property';
  timestamp: Date;
}

export interface ChangeEvent {
  id: string;
  userId: string;
  type: ChangeType;
  target: ChangeTarget;
  before: any;
  after: any;
  timestamp: Date;
  synchronized: boolean;
}

export type ChangeType = 
  | 'component_add'
  | 'component_update'
  | 'component_delete'
  | 'component_move'
  | 'component_resize'
  | 'screen_create'
  | 'screen_update'
  | 'screen_delete'
  | 'property_update'
  | 'style_update'
  | 'data_binding_update';

export interface ChangeTarget {
  type: 'component' | 'screen' | 'project';
  id: string;
  parentId?: string;
}

export interface Presence {
  userId: string;
  state: PresenceState;
  metadata?: Record<string, any>;
}

export interface PresenceState {
  online: boolean;
  screenId?: string;
  selectedComponentId?: string;
  isTyping?: boolean;
  lastActivityType?: string;
}

export interface Comment {
  id: string;
  projectId: string;
  screenId?: string;
  componentId?: string;
  userId: string;
  parentId?: string;
  content: string;
  resolved: boolean;
  createdAt: Date;
  updatedAt: Date;
  replies: Comment[];
  mentions: string[];
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: 'image' | 'file';
  url: string;
  name: string;
  size: number;
  mimeType: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export type NotificationType = 
  | 'comment_mention'
  | 'comment_reply'
  | 'project_shared'
  | 'project_updated'
  | 'collaborator_joined'
  | 'export_ready'
  | 'ai_suggestion';

export interface CollaborationConflict {
  id: string;
  type: 'concurrent_edit' | 'delete_conflict' | 'move_conflict';
  changes: ChangeEvent[];
  resolution?: ConflictResolution;
  timestamp: Date;
}

export interface ConflictResolution {
  strategy: 'accept_local' | 'accept_remote' | 'merge' | 'manual';
  resolvedBy: string;
  resolvedAt: Date;
  result: any;
}

export interface Activity {
  id: string;
  projectId: string;
  userId: string;
  type: ActivityType;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export type ActivityType = 
  | 'project_created'
  | 'project_opened'
  | 'screen_added'
  | 'component_added'
  | 'design_updated'
  | 'collaborator_invited'
  | 'export_generated'
  | 'ai_interaction';

export interface CollaborationStats {
  totalCollaborators: number;
  activeCollaborators: number;
  totalComments: number;
  unresolvedComments: number;
  totalChanges: number;
  changesLast24h: number;
  mostActiveUser: string;
  lastActivityAt: Date;
}