import {
  PermissionStrategy,
  AdminPermissionStrategy,
  EditorPermissionStrategy,
  ViewerPermissionStrategy,
  SelfPermissionStrategy,
  ResourceType,
  Action,
} from '../models/permission';

import { userService as defaultUserService, UserService } from './userService';

export class PermissionService {
  private strategies: Map<string, PermissionStrategy> = new Map();
  private selfStrategy: SelfPermissionStrategy;
  private userService: UserService;

  constructor(userServiceInstance: UserService = defaultUserService) {
    // Initialize strategies
    this.strategies.set('admin', new AdminPermissionStrategy());
    this.strategies.set('editor', new EditorPermissionStrategy());
    this.strategies.set('viewer', new ViewerPermissionStrategy());
    this.selfStrategy = new SelfPermissionStrategy();
    this.userService = userServiceInstance;
  }

  /**
   * Check if a user has permission to perform an action on a resource
   * @param userId The ID of the user
   * @param resourceType The type of resource being accessed
   * @param action The action being performed
   * @param resourceOwnerId The ID of the resource owner (if applicable)
   * @returns boolean indicating if the user has permission
   */
  hasPermission(
    userId: string,
    resourceType: ResourceType,
    action: Action,
    resourceOwnerId?: string,
  ): boolean {
    // Get the user's role
    const user = this.userService.getUserById(userId);

    if (!user) {
      return false;
    }

    // Check if the user is the owner of the resource
    if (
      resourceOwnerId &&
      this.selfStrategy.hasPermission(userId, resourceType, action, resourceOwnerId)
    ) {
      return true;
    }

    // Get the appropriate strategy based on the user's role
    const strategy = this.strategies.get(user.role);

    if (!strategy) {
      return false;
    }

    // Use the strategy to check permission
    return strategy.hasPermission(userId, resourceType, action, resourceOwnerId);
  }

  /**
   * Check if a user can create a resource
   */
  canCreate(userId: string, resourceType: ResourceType): boolean {
    return this.hasPermission(userId, resourceType, Action.CREATE);
  }

  /**
   * Check if a user can read a resource
   */
  canRead(userId: string, resourceType: ResourceType, resourceOwnerId?: string): boolean {
    return this.hasPermission(userId, resourceType, Action.READ, resourceOwnerId);
  }

  /**
   * Check if a user can update a resource
   */
  canUpdate(userId: string, resourceType: ResourceType, resourceOwnerId?: string): boolean {
    return this.hasPermission(userId, resourceType, Action.UPDATE, resourceOwnerId);
  }

  /**
   * Check if a user can delete a resource
   */
  canDelete(userId: string, resourceType: ResourceType, resourceOwnerId?: string): boolean {
    return this.hasPermission(userId, resourceType, Action.DELETE, resourceOwnerId);
  }
}

// Export singleton instance
export const permissionService = new PermissionService();
