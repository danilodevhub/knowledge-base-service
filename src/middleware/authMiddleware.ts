import { Request, Response, NextFunction } from 'express';

import { ResourceType, Action } from '../models/permission';
import { permissionService } from '../services/permissionService';
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
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

// Generic authorization middleware using the Strategy pattern
export const authorize = (
  resourceType: ResourceType,
  action: Action,
  getResourceOwnerId?: (req: Request) => string | undefined,
) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const resourceOwnerId = getResourceOwnerId ? getResourceOwnerId(req) : undefined;

    if (permissionService.hasPermission(req.user.id, resourceType, action, resourceOwnerId)) {
      next();
    } else {
      res.status(403).json({
        message: 'Access denied: Your role is not authorized to perform this action',
        details: {
          role: req.user.role,
          resourceType,
          action,
        },
      });
    }
  };
};

export const authorizeTopicRead = authorize(ResourceType.TOPIC, Action.READ);
export const authorizeTopicCreate = authorize(ResourceType.TOPIC, Action.CREATE);
export const authorizeTopicUpdate = authorize(ResourceType.TOPIC, Action.UPDATE);
export const authorizeTopicDelete = authorize(ResourceType.TOPIC, Action.DELETE);
