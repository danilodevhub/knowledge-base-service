import { PermissionService } from '../../../src/services/permissionService';
import { ResourceType, Action } from '../../../src/models/permission';
import { User } from '../../../src/models/user';
import * as userServiceModule from '../../../src/services/userService';

// Mock user data
const mockUsers: { [key: string]: User } = {
  'admin1': {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'editor1': {
    id: 'editor1',
    name: 'Editor User',
    email: 'editor@example.com',
    role: 'editor',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'viewer1': {
    id: 'viewer1',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  'invalidRole': {
    id: 'invalidRole',
    name: 'Invalid Role User',
    email: 'invalid@example.com',
    role: 'invalid' as any,
    createdAt: new Date(),
    updatedAt: new Date()
  }
};

describe('PermissionService', () => {
  let permissionService: PermissionService;
  let getUserByIdSpy: jest.SpyInstance;

  beforeEach(() => {
    // Mock the userService.getUserById method
    getUserByIdSpy = jest.spyOn(userServiceModule.userService, 'getUserById')
      .mockImplementation((userId: string) => mockUsers[userId] || null);
    
    // Create a fresh instance of PermissionService for each test
    permissionService = new PermissionService();
  });

  afterEach(() => {
    // Clean up the spy after each test
    getUserByIdSpy.mockRestore();
  });

  describe('hasPermission', () => {
    it('should return false if user does not exist', () => {
      expect(permissionService.hasPermission('nonexistent', ResourceType.TOPIC, Action.READ)).toBe(false);
    });

    it('should return true if user is the resource owner', () => {
      expect(permissionService.hasPermission('viewer1', ResourceType.TOPIC, Action.UPDATE, 'viewer1')).toBe(true);
    });

    it('should return false if strategy for the user role does not exist', () => {
      expect(permissionService.hasPermission('invalidRole', ResourceType.TOPIC, Action.READ)).toBe(false);
    });

    it('should use the appropriate strategy based on user role', () => {
      // Admin can do anything
      expect(permissionService.hasPermission('admin1', ResourceType.SYSTEM, Action.UPDATE)).toBe(true);
      
      // Editor can read, create, update topics but not delete them
      expect(permissionService.hasPermission('editor1', ResourceType.TOPIC, Action.CREATE)).toBe(true);
      expect(permissionService.hasPermission('editor1', ResourceType.TOPIC, Action.READ)).toBe(true);
      expect(permissionService.hasPermission('editor1', ResourceType.TOPIC, Action.UPDATE)).toBe(true);
      expect(permissionService.hasPermission('editor1', ResourceType.TOPIC, Action.DELETE)).toBe(false);
      
      // Viewer can only read topics
      expect(permissionService.hasPermission('viewer1', ResourceType.TOPIC, Action.READ)).toBe(true);
      expect(permissionService.hasPermission('viewer1', ResourceType.TOPIC, Action.CREATE)).toBe(false);
      expect(permissionService.hasPermission('viewer1', ResourceType.TOPIC, Action.UPDATE)).toBe(false);
      expect(permissionService.hasPermission('viewer1', ResourceType.TOPIC, Action.DELETE)).toBe(false);
    });

    it('should check cross-resource permissions correctly', () => {
      // Admin has access to all resources
      expect(permissionService.hasPermission('admin1', ResourceType.USER, Action.READ)).toBe(true);
      expect(permissionService.hasPermission('admin1', ResourceType.SYSTEM, Action.UPDATE)).toBe(true);
      
      // Editor can read users but not update
      expect(permissionService.hasPermission('editor1', ResourceType.USER, Action.READ)).toBe(true);
      expect(permissionService.hasPermission('editor1', ResourceType.USER, Action.UPDATE)).toBe(false);
      
      // Editor cannot access system resources
      expect(permissionService.hasPermission('editor1', ResourceType.SYSTEM, Action.READ)).toBe(false);
      
      // Viewer cannot access users or system
      expect(permissionService.hasPermission('viewer1', ResourceType.USER, Action.READ)).toBe(false);
      expect(permissionService.hasPermission('viewer1', ResourceType.SYSTEM, Action.READ)).toBe(false);
    });
  });

  describe('canCreate', () => {
    it('should check if user can create a resource', () => {
      expect(permissionService.canCreate('admin1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canCreate('admin1', ResourceType.USER)).toBe(true);
      expect(permissionService.canCreate('admin1', ResourceType.SYSTEM)).toBe(true);
      
      expect(permissionService.canCreate('editor1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canCreate('editor1', ResourceType.USER)).toBe(false);
      expect(permissionService.canCreate('editor1', ResourceType.SYSTEM)).toBe(false);
      
      expect(permissionService.canCreate('viewer1', ResourceType.TOPIC)).toBe(false);
      expect(permissionService.canCreate('viewer1', ResourceType.USER)).toBe(false);
      expect(permissionService.canCreate('viewer1', ResourceType.SYSTEM)).toBe(false);
    });
    
    it('should return false for non-existent users', () => {
      expect(permissionService.canCreate('nonexistent', ResourceType.TOPIC)).toBe(false);
    });
  });

  describe('canRead', () => {
    it('should check if user can read a resource', () => {
      expect(permissionService.canRead('admin1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canRead('admin1', ResourceType.USER)).toBe(true);
      expect(permissionService.canRead('admin1', ResourceType.SYSTEM)).toBe(true);
      
      expect(permissionService.canRead('editor1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canRead('editor1', ResourceType.USER)).toBe(true);
      expect(permissionService.canRead('editor1', ResourceType.SYSTEM)).toBe(false);
      
      expect(permissionService.canRead('viewer1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canRead('viewer1', ResourceType.USER)).toBe(false);
      expect(permissionService.canRead('viewer1', ResourceType.SYSTEM)).toBe(false);
    });

    it('should allow users to read their own resources', () => {
      expect(permissionService.canRead('viewer1', ResourceType.USER, 'viewer1')).toBe(true);
    });
    
    it('should return false for non-existent users', () => {
      expect(permissionService.canRead('nonexistent', ResourceType.TOPIC)).toBe(false);
    });
  });

  describe('canUpdate', () => {
    it('should check if user can update a resource', () => {
      expect(permissionService.canUpdate('admin1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canUpdate('admin1', ResourceType.USER)).toBe(true);
      expect(permissionService.canUpdate('admin1', ResourceType.SYSTEM)).toBe(true);
      
      expect(permissionService.canUpdate('editor1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canUpdate('editor1', ResourceType.USER)).toBe(false);
      expect(permissionService.canUpdate('editor1', ResourceType.SYSTEM)).toBe(false);
      
      expect(permissionService.canUpdate('viewer1', ResourceType.TOPIC)).toBe(false);
      expect(permissionService.canUpdate('viewer1', ResourceType.USER)).toBe(false);
      expect(permissionService.canUpdate('viewer1', ResourceType.SYSTEM)).toBe(false);
    });

    it('should allow users to update their own resources', () => {
      expect(permissionService.canUpdate('viewer1', ResourceType.USER, 'viewer1')).toBe(true);
    });
    
    it('should return false for non-existent users', () => {
      expect(permissionService.canUpdate('nonexistent', ResourceType.TOPIC)).toBe(false);
    });
  });

  describe('canDelete', () => {
    it('should check if user can delete a resource', () => {
      expect(permissionService.canDelete('admin1', ResourceType.TOPIC)).toBe(true);
      expect(permissionService.canDelete('admin1', ResourceType.USER)).toBe(true);
      expect(permissionService.canDelete('admin1', ResourceType.SYSTEM)).toBe(true);
      
      expect(permissionService.canDelete('editor1', ResourceType.TOPIC)).toBe(false);
      expect(permissionService.canDelete('editor1', ResourceType.USER)).toBe(false);
      expect(permissionService.canDelete('editor1', ResourceType.SYSTEM)).toBe(false);
      
      expect(permissionService.canDelete('viewer1', ResourceType.TOPIC)).toBe(false);
      expect(permissionService.canDelete('viewer1', ResourceType.USER)).toBe(false);
      expect(permissionService.canDelete('viewer1', ResourceType.SYSTEM)).toBe(false);
    });

    it('should allow users to delete their own resources', () => {
      expect(permissionService.canDelete('viewer1', ResourceType.USER, 'viewer1')).toBe(true);
    });
    
    it('should return false for non-existent users', () => {
      expect(permissionService.canDelete('nonexistent', ResourceType.TOPIC)).toBe(false);
    });
  });
}); 