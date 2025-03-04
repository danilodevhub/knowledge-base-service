import * as daoFactoryModule from '../../../src/dao/daoFactory';
import { IDao } from '../../../src/dao/IDao';
import { User } from '../../../src/models/user';
import { UserService } from '../../../src/services/userService';

// Mock user data
const mockUsers: User[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'editor1',
    name: 'Editor User',
    email: 'editor@example.com',
    role: 'editor',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'viewer1',
    name: 'Viewer User',
    email: 'viewer@example.com',
    role: 'viewer',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'malformed',
    name: 'Malformed User',
    email: 'malformed@example.com',
    role: 'viewer' as any, // Using 'as any' to simulate type issues at runtime
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Mock DAO implementation
class MockUserDao implements IDao<User> {
  private users: User[] = [...mockUsers];

  findAll(): User[] {
    return this.users;
  }

  findById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  findBy(predicate: (item: User) => boolean): User | null {
    return this.users.find(predicate) || null;
  }

  findManyBy(predicate: (item: User) => boolean): User[] {
    return this.users.filter(predicate);
  }

  create(item: User): void {
    this.users.push(item);
  }

  update(predicate: (item: User) => boolean, item: User): void {
    const index = this.users.findIndex(predicate);
    if (index !== -1) {
      this.users[index] = item;
    }
  }

  delete(predicate: (item: User) => boolean): void {
    const index = this.users.findIndex(predicate);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

// Create a user with a null role to test edge cases
const createUserWithNullRole = () => {
  const user = { ...mockUsers[0], id: 'nullRole', role: null as any };
  return user;
};

describe('UserService', () => {
  let userService: UserService;
  let mockUserDao: MockUserDao;
  let createJsonFileDaoSpy: jest.SpyInstance;

  beforeEach(() => {
    // Create a fresh mock DAO for each test
    mockUserDao = new MockUserDao();
    
    // Mock the DaoFactory.createJsonFileDao method
    createJsonFileDaoSpy = jest.spyOn(daoFactoryModule.DaoFactory, 'createJsonFileDao')
      .mockReturnValue(mockUserDao);
    
    // Create a UserService instance with the mock DAO
    userService = new UserService(mockUserDao);
  });

  afterEach(() => {
    // Clean up the spy after each test
    createJsonFileDaoSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should use the provided DAO if one is passed', () => {
      const customDao = new MockUserDao();
      const service = new UserService(customDao);
      expect(service['userDao']).toBe(customDao);
    });

    it('should create a DAO using DaoFactory if none is provided', () => {
      // Create a new service without passing a DAO
      const service = new UserService();
      
      // Verify that DaoFactory.createJsonFileDao was called
      expect(createJsonFileDaoSpy).toHaveBeenCalledWith('users.json');
    });
  });

  describe('getUserById', () => {
    it('should return user when user with ID exists', () => {
      const user = userService.getUserById('admin1');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('admin1');
      expect(user?.name).toBe('Admin User');
      expect(user?.role).toBe('admin');
    });

    it('should return null when user with ID does not exist', () => {
      const user = userService.getUserById('nonexistent');
      expect(user).toBeNull();
    });

    it('should handle case where ID is undefined', () => {
      const user = userService.getUserById(undefined as any);
      expect(user).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when user with email exists', () => {
      const user = userService.getUserByEmail('admin@example.com');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('admin1');
      expect(user?.name).toBe('Admin User');
      expect(user?.role).toBe('admin');
    });

    it('should return null when user with email does not exist', () => {
      const user = userService.getUserByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });

    it('should handle case-insensitive email lookup', () => {
      // Add a test user with uppercase email to the mock DAO
      mockUserDao.create({
        id: 'testuser',
        name: 'Test User',
        email: 'Test@Example.com',
        role: 'viewer',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Test case-insensitive lookup
      const user = userService.getUserByEmail('test@example.com');
      expect(user).not.toBeNull();
      expect(user?.id).toBe('testuser');
    });
    
    it('should handle null or undefined email', () => {
      expect(userService.getUserByEmail(null as any)).toBeNull();
      expect(userService.getUserByEmail(undefined as any)).toBeNull();
    });
  });

  describe('isAdmin', () => {
    it('should return true when user is an admin', () => {
      expect(userService.isAdmin('admin1')).toBe(true);
    });

    it('should return false when user is not an admin', () => {
      expect(userService.isAdmin('editor1')).toBe(false);
      expect(userService.isAdmin('viewer1')).toBe(false);
    });

    it('should return false when user does not exist', () => {
      expect(userService.isAdmin('nonexistent')).toBe(false);
    });

    it('should handle user with null role', () => {
      // Create a user with null role
      const userWithNullRole = createUserWithNullRole();
      mockUserDao.create(userWithNullRole);
      
      expect(userService.isAdmin(userWithNullRole.id)).toBe(false);
    });
  });

  describe('isEditor', () => {
    it('should return true when user is an editor', () => {
      expect(userService.isEditor('editor1')).toBe(true);
    });

    it('should return false when user is not an editor', () => {
      expect(userService.isEditor('admin1')).toBe(false);
      expect(userService.isEditor('viewer1')).toBe(false);
    });

    it('should return false when user does not exist', () => {
      expect(userService.isEditor('nonexistent')).toBe(false);
    });

    it('should handle user with null role', () => {
      // Create a user with null role
      const userWithNullRole = createUserWithNullRole();
      mockUserDao.create(userWithNullRole);
      
      expect(userService.isEditor(userWithNullRole.id)).toBe(false);
    });
  });

  describe('canModifyContent', () => {
    it('should return true when user is an admin', () => {
      expect(userService.canModifyContent('admin1')).toBe(true);
    });

    it('should return true when user is an editor', () => {
      expect(userService.canModifyContent('editor1')).toBe(true);
    });

    it('should return false when user is a viewer', () => {
      expect(userService.canModifyContent('viewer1')).toBe(false);
    });

    it('should return false when user does not exist', () => {
      expect(userService.canModifyContent('nonexistent')).toBe(false);
    });

    it('should handle user with null role', () => {
      // Create a user with null role
      const userWithNullRole = createUserWithNullRole();
      mockUserDao.create(userWithNullRole);
      
      expect(userService.canModifyContent(userWithNullRole.id)).toBe(false);
    });
  });
}); 