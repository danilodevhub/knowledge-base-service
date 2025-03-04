// Permission Strategy Pattern

// Resource types that can be accessed
export enum ResourceType {
  TOPIC = 'topic',
  USER = 'user',
  SYSTEM = 'system'
}

// Actions that can be performed on resources
export enum Action {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',  
}

// Permission Strategy interface
export interface PermissionStrategy {
  hasPermission(userId: string, resourceType: ResourceType, action: Action, resourceOwnerId?: string): boolean;
}

// Admin Permission Strategy
export class AdminPermissionStrategy implements PermissionStrategy {
  hasPermission(userId: string, resourceType: ResourceType, action: Action, resourceOwnerId?: string): boolean {
    // Admins can do anything
    return true;
  }
}

// Editor Permission Strategy
export class EditorPermissionStrategy implements PermissionStrategy {
  hasPermission(userId: string, resourceType: ResourceType, action: Action, resourceOwnerId?: string): boolean {
    // Editors can create, read, update topics but cannot delete them
    // Editors cannot manage system settings or users
    if (resourceType === ResourceType.TOPIC) {
      return action !== Action.DELETE;
    }
    
    if (resourceType === ResourceType.USER) {
      return action === Action.READ;
    }
    
    return false;
  }
}

// Viewer Permission Strategy
export class ViewerPermissionStrategy implements PermissionStrategy {
  hasPermission(userId: string, resourceType: ResourceType, action: Action, resourceOwnerId?: string): boolean {
    // Viewers can only read topics
    return resourceType === ResourceType.TOPIC && action === Action.READ;
  }
}

// Self Permission Strategy (for users managing their own resources)
export class SelfPermissionStrategy implements PermissionStrategy {
  hasPermission(userId: string, resourceType: ResourceType, action: Action, resourceOwnerId?: string): boolean {
    // Users can manage their own resources
    return userId === resourceOwnerId;
  }
} 