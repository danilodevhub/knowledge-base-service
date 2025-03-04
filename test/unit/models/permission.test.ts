import {
  ResourceType,
  Action,
  AdminPermissionStrategy,
  EditorPermissionStrategy,
  ViewerPermissionStrategy,
  SelfPermissionStrategy,
} from '../../../src/models/permission';

describe('Permission Strategies', () => {
  describe('AdminPermissionStrategy', () => {
    const strategy = new AdminPermissionStrategy();

    it('should allow admins to perform any action on any resource', () => {
      // Test all resource types and actions
      for (const resourceType of Object.values(ResourceType)) {
        for (const action of Object.values(Action)) {
          expect(strategy.hasPermission('admin1', resourceType, action)).toBe(true);
        }
      }
    });
  });

  describe('EditorPermissionStrategy', () => {
    const strategy = new EditorPermissionStrategy();

    it('should allow editors to create, read, and update topics', () => {
      expect(strategy.hasPermission('editor1', ResourceType.TOPIC, Action.CREATE)).toBe(true);
      expect(strategy.hasPermission('editor1', ResourceType.TOPIC, Action.READ)).toBe(true);
      expect(strategy.hasPermission('editor1', ResourceType.TOPIC, Action.UPDATE)).toBe(true);
    });

    it('should not allow editors to delete topics', () => {
      expect(strategy.hasPermission('editor1', ResourceType.TOPIC, Action.DELETE)).toBe(false);
    });

    it('should allow editors to read user information', () => {
      expect(strategy.hasPermission('editor1', ResourceType.USER, Action.READ)).toBe(true);
    });

    it('should not allow editors to create, update, or delete users', () => {
      expect(strategy.hasPermission('editor1', ResourceType.USER, Action.CREATE)).toBe(false);
      expect(strategy.hasPermission('editor1', ResourceType.USER, Action.UPDATE)).toBe(false);
      expect(strategy.hasPermission('editor1', ResourceType.USER, Action.DELETE)).toBe(false);
    });

    it('should not allow editors to access system resources', () => {
      expect(strategy.hasPermission('editor1', ResourceType.SYSTEM, Action.READ)).toBe(false);
      expect(strategy.hasPermission('editor1', ResourceType.SYSTEM, Action.CREATE)).toBe(false);
      expect(strategy.hasPermission('editor1', ResourceType.SYSTEM, Action.UPDATE)).toBe(false);
      expect(strategy.hasPermission('editor1', ResourceType.SYSTEM, Action.DELETE)).toBe(false);
    });
  });

  describe('ViewerPermissionStrategy', () => {
    const strategy = new ViewerPermissionStrategy();

    it('should allow viewers to read topics', () => {
      expect(strategy.hasPermission('viewer1', ResourceType.TOPIC, Action.READ)).toBe(true);
    });

    it('should not allow viewers to create, update, or delete topics', () => {
      expect(strategy.hasPermission('viewer1', ResourceType.TOPIC, Action.CREATE)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.TOPIC, Action.UPDATE)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.TOPIC, Action.DELETE)).toBe(false);
    });

    it('should not allow viewers to access user or system resources', () => {
      // User resources
      expect(strategy.hasPermission('viewer1', ResourceType.USER, Action.READ)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.USER, Action.CREATE)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.USER, Action.UPDATE)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.USER, Action.DELETE)).toBe(false);

      // System resources
      expect(strategy.hasPermission('viewer1', ResourceType.SYSTEM, Action.READ)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.SYSTEM, Action.CREATE)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.SYSTEM, Action.UPDATE)).toBe(false);
      expect(strategy.hasPermission('viewer1', ResourceType.SYSTEM, Action.DELETE)).toBe(false);
    });
  });

  describe('SelfPermissionStrategy', () => {
    const strategy = new SelfPermissionStrategy();

    it('should allow users to manage their own resources', () => {
      expect(strategy.hasPermission('user1', ResourceType.USER, Action.READ, 'user1')).toBe(true);
      expect(strategy.hasPermission('user1', ResourceType.USER, Action.UPDATE, 'user1')).toBe(true);
      expect(strategy.hasPermission('user1', ResourceType.USER, Action.DELETE, 'user1')).toBe(true);
    });

    it("should not allow users to manage other users' resources", () => {
      expect(strategy.hasPermission('user1', ResourceType.USER, Action.READ, 'user2')).toBe(false);
      expect(strategy.hasPermission('user1', ResourceType.USER, Action.UPDATE, 'user2')).toBe(
        false,
      );
      expect(strategy.hasPermission('user1', ResourceType.USER, Action.DELETE, 'user2')).toBe(
        false,
      );
    });
  });
});
