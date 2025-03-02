import { Request, Response, NextFunction } from 'express';
import { userService } from '../services/userService';

// Extended Request interface to include user property
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

// Middleware to authenticate user from token
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    
    // In a real application, you would verify the JWT token here
    // For this example, we'll assume the token is the user ID
    const user = userService.getUserById(token);
    
    if (!user) {
      res.status(401).json({ message: 'Invalid token' });
      return;
    }
    
    // Attach user to request object
    req.user = {
      id: user.id,
      role: user.role
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Middleware to authorize admin users only
export const authorizeAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || req.user.role !== 'admin') {
    res.status(403).json({ message: 'Access denied: Your role is not authorized to perform this action' });
    return;
  }
  
  next();
};

// Middleware to authorize admin or editor users
export const authorizeEditorOrAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor')) {
    res.status(403).json({ message: 'Access denied: Your role is not authorized to perform this action' });
    return;
  }
  
  next();
};

// Middleware to authorize any authenticated user
export const authorizeUser = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(403).json({ message: 'Access denied: Authentication required' });
    return;
  }
  
  next();
}; 