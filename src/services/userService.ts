import { User } from '../models/user';
import fs from 'fs';
import path from 'path';

// Path to the users JSON file
const usersFilePath = path.join(__dirname, '../../src/storage/users-table.json');

export class UserService {
  private users: User[] = [];

  constructor() {
    this.loadUsers();
  }

  // Load users from JSON file
  private loadUsers(): void {
    try {
      const data = fs.readFileSync(usersFilePath, 'utf8');
      this.users = JSON.parse(data);
    } catch (error) {
      console.error('Error loading users:', error);
      this.users = [];
    }
  }

  // Get user by ID
  getUserById(id: string): User | null {
    return this.users.find(user => user.id === id) || null;
  }

  // Get user by email
  getUserByEmail(email: string): User | null {
    return this.users.find(user => user.email === email) || null;
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