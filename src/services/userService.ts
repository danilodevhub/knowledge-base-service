import { User } from '../models/user';
import { IDao } from '../dao/IDao';
import { DaoFactory } from '../dao/daoFactory';

export class UserService {
  private userDao: IDao<User>;

  constructor() {
    this.userDao = DaoFactory.createJsonFileDao<User>('users.json');
  }

  // Get user by ID
  getUserById(id: string): User | null {
    return this.userDao.findById(id);
  }

  // Get user by email
  getUserByEmail(email: string): User | null {
    return this.userDao.findBy(user => user.email === email);
  }

  // Check if user has admin role
  isAdmin(userId: string): boolean {
    const user = this.getUserById(userId);
    return user?.role === 'admin';
  }

  // Check if user has editor role
  isEditor(userId: string): boolean {
    const user = this.getUserById(userId);
    return user?.role === 'editor';
  }

  // Check if user can modify content (admin or editor)
  canModifyContent(userId: string): boolean {
    const user = this.getUserById(userId);
    return user?.role === 'admin' || user?.role === 'editor';
  }
}

// Export singleton instance
export const userService = new UserService(); 