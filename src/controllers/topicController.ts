import { NextFunction , Response } from 'express';

import { AuthRequest } from '../middleware/authMiddleware';
import { ResourceType, Action } from '../models/permission';
import { permissionService } from '../services/permissionService';
import { TopicService } from '../services/topicService';
import { LogUtils } from '../utils/logUtils';

// Service name constant for logging
const SERVICE_NAME = 'TopicController';

// Topic Controller class with dependency injection
export class TopicController {
  private topicService: TopicService;
  
  constructor(topicService?: TopicService) {
    this.topicService = topicService || new TopicService();
  }

  // GET all topics
  getAllTopics = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const topics = this.topicService.getAllTopics();
      res.status(200).json(topics);
    } catch (error) {
      next(error);
    }
  };

  // GET a specific topic by ID
  getTopicById = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const topic = this.topicService.getTopicById(id);
      
      if (!topic) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }
      
      res.status(200).json(topic);
    } catch (error) {
      next(error);
    }
  };

  // GET a specific version of a topic
  getTopicVersion = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const version = parseInt(req.params.version);
      
      if (isNaN(version) || version < 1) {
        res.status(400).json({ message: 'Invalid version number' });
        return;
      }
      
      const topicVersion = this.topicService.getTopicVersion(id, version);
      
      if (!topicVersion) {
        res.status(404).json({ message: 'Topic version not found' });
        return;
      }
      
      res.status(200).json(topicVersion);
    } catch (error) {
      next(error);
    }
  };

  // GET all versions of a topic
  getAllTopicVersions = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const versions = this.topicService.getAllTopicVersions(id);
      res.status(200).json(versions);
    } catch (error) {
      next(error);
    }
  };

  // POST a new topic
  createTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const { name, content, parentTopicId, resource } = req.body;
      
      // Validate required fields
      if (!name || !content) {
        res.status(400).json({ message: 'Name and content are required' });
        return;
      }
      
      // Validate resource if provided
      if (resource) {
        if (!resource.url || !resource.description || !resource.type) {
          res.status(400).json({ message: 'Resource must include url, description, and type' });
          return;
        }
        
        const validTypes = ['video', 'article', 'podcast', 'audio', 'image', 'pdf'];
        if (!validTypes.includes(resource.type)) {
          res.status(400).json({ 
            message: `Resource type must be one of: ${validTypes.join(', ')}` 
          });
          return;
        }
      }
      
      // Get user ID from authenticated request
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User ID not found in request' });
        return;
      }
      
      // Log the user who created the topic
      LogUtils.logInfo(SERVICE_NAME, 'createTopic', `Topic created by user ${userId}`, { userId, role: req.user?.role });
      
      // Create the topic with the user as owner
      const topic = this.topicService.createTopic(
        name, 
        content, 
        parentTopicId || null,
        userId,
        resource
      );
      
      res.status(201).json(topic);
    } catch (error) {
      next(error);
    }
  };

  // PUT update a topic
  updateTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const { name, content, resource } = req.body;
      
      // Validate required fields
      if (!name || !content) {
        res.status(400).json({ message: 'Name and content are required' });
        return;
      }
      
      // Validate resource if provided
      if (resource) {
        if (!resource.url || !resource.description || !resource.type) {
          res.status(400).json({ message: 'Resource must include url, description, and type' });
          return;
        }
        
        const validTypes = ['video', 'article', 'podcast', 'audio', 'image', 'pdf'];
        if (!validTypes.includes(resource.type)) {
          res.status(400).json({ 
            message: `Resource type must be one of: ${validTypes.join(', ')}` 
          });
          return;
        }
      }
      
      // Check permissions
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User ID not found in request' });
        return;
      }
      
      // Get the topic to check ownership
      const existingTopic = this.topicService.getTopicById(id);
      if (!existingTopic) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }
      
      // Check permissions (only owner or admin can update)
      const hasPermission = permissionService.hasPermission(
        req.user!.id,
        ResourceType.TOPIC,
        Action.UPDATE,
        existingTopic.ownerId
      );
      
      if (!hasPermission) {
        res.status(403).json({ 
          message: 'You do not have permission to update this topic',
          details: {
            role: req.user?.role,
            isOwner: existingTopic.ownerId === userId
          }
        });
        return;
      }
      
      // Log the user who updated the topic
      LogUtils.logInfo(SERVICE_NAME, 'updateTopic', `Topic updated by user ${userId}`, { userId, role: req.user?.role, topicId: id });
      
      // Update the topic
      const updatedTopic = this.topicService.updateTopic(id, name, content, resource);
      
      if (!updatedTopic) {
        res.status(500).json({ message: 'Failed to update topic' });
        return;
      }
      
      res.status(200).json(updatedTopic);
    } catch (error) {
      next(error);
    }
  };

  // PUT set resource for a topic
  setTopicResource = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const { url, description, type } = req.body;
      
      // Validate required fields
      if (!url || !description || !type) {
        res.status(400).json({ message: 'URL, description, and type are required' });
        return;
      }
      
      // Validate resource type
      const validTypes = ['video', 'article', 'podcast', 'audio', 'image', 'pdf'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ 
          message: `Resource type must be one of: ${validTypes.join(', ')}` 
        });
        return;
      }
      
      // Check permissions
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User ID not found in request' });
        return;
      }
      
      // Get the topic to check ownership
      const existingTopic = this.topicService.getTopicById(id);
      if (!existingTopic) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }
      
      // Check permissions (only owner or admin can update)
      const hasPermission = permissionService.hasPermission(
        req.user!.id,
        ResourceType.TOPIC,
        Action.UPDATE,
        existingTopic.ownerId
      );
      
      if (!hasPermission) {
        res.status(403).json({ 
          message: 'You do not have permission to update this topic',
          details: {
            role: req.user?.role,
            isOwner: existingTopic.ownerId === userId
          }
        });
        return;
      }
      
      // Log the user who set the resource
      LogUtils.logInfo(SERVICE_NAME, 'setTopicResource', `Resource set by user ${userId}`, { userId, role: req.user?.role, topicId: id, resourceType: type });
      
      // Set the resource
      const updatedTopic = this.topicService.setTopicResource(id, url, description, type);
      
      if (!updatedTopic) {
        res.status(500).json({ message: 'Failed to set resource' });
        return;
      }
      
      res.status(200).json(updatedTopic);
    } catch (error) {
      next(error);
    }
  };

  // DELETE resource from a topic
  removeTopicResource = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      
      // Check permissions
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User ID not found in request' });
        return;
      }
      
      // Get the topic to check ownership
      const existingTopic = this.topicService.getTopicById(id);
      if (!existingTopic) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }
      
      // Check if topic has a resource
      if (!existingTopic.resource) {
        res.status(404).json({ message: 'Topic does not have a resource' });
        return;
      }
      
      // Check permissions (only owner or admin can update)
      const hasPermission = permissionService.hasPermission(
        req.user!.id,
        ResourceType.TOPIC,
        Action.UPDATE,
        existingTopic.ownerId
      );
      
      if (!hasPermission) {
        res.status(403).json({ 
          message: 'You do not have permission to update this topic',
          details: {
            role: req.user?.role,
            isOwner: existingTopic.ownerId === userId
          }
        });
        return;
      }
      
      // Log the user who removed the resource
      LogUtils.logInfo(SERVICE_NAME, 'removeTopicResource', `Resource removed by user ${userId}`, { userId, role: req.user?.role, topicId: id });
      
      // Remove the resource
      const updatedTopic = this.topicService.removeTopicResource(id);
      
      if (!updatedTopic) {
        res.status(500).json({ message: 'Failed to remove resource' });
        return;
      }
      
      res.status(200).json(updatedTopic);
    } catch (error) {
      next(error);
    }
  };

  // DELETE a topic
  deleteTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const cascade = req.query.cascade === 'true';
      
      // Check permissions
      const userId = req.user?.id;
      if (!userId) {
        res.status(401).json({ message: 'User ID not found in request' });
        return;
      }
      
      // Get the topic to check ownership
      const existingTopic = this.topicService.getTopicById(id);
      if (!existingTopic) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }
      
      // Check permissions (only owner or admin can delete)
      const hasPermission = permissionService.hasPermission(
        req.user!.id,
        ResourceType.TOPIC,
        Action.DELETE,
        existingTopic.ownerId
      );
      
      if (!hasPermission) {
        res.status(403).json({ 
          message: 'You do not have permission to delete this topic',
          details: {
            role: req.user?.role,
            isOwner: existingTopic.ownerId === userId
          }
        });
        return;
      }
      
      // Delete the topic
      const result = this.topicService.deleteTopic(id, { cascade });
      
      if (!result.success) {
        res.status(409).json({ error: result.error });
        return;
      }
      
      res.status(204).end();
    } catch (error) {
      LogUtils.logError(SERVICE_NAME, 'deleteTopic', error, { 
        id: req.params.id, 
        cascade: req.query.cascade === 'true' 
      });
      next(error);
    }
  };

  // GET topic hierarchy
  getTopicHierarchy = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const id = req.params.id;
      const hierarchy = this.topicService.getTopicHierarchy(id);
      
      if (!hierarchy) {
        res.status(404).json({ message: 'Topic not found' });
        return;
      }
      
      res.status(200).json(hierarchy);
    } catch (error) {
      next(error);
    }
  };

  // GET shortest path between topics
  getShortestPath = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const fromId = req.params.fromId;
      const toId = req.params.toId;
      
      // Validate IDs
      if (fromId === toId) {
        res.status(400).json({ message: 'Source and target topics must be different' });
        return;
      }
      
      const result = this.topicService.findShortestPath(fromId, toId);
      
      if (!result) {
        res.status(404).json({ message: 'No path found between topics' });
        return;
      }
      
      res.status(200).json(result);
    } catch (error) {
      LogUtils.logError(SERVICE_NAME, 'getShortestPath', error, { fromId: req.params.fromId, toId: req.params.toId });
      next(error);
    }
  };

  // GET lowest common ancestor
  getLowestCommonAncestor = (req: AuthRequest, res: Response, next: NextFunction): void => {
    try {
      const topicId1 = req.params.topicId1;
      const topicId2 = req.params.topicId2;
      
      // Validate IDs
      if (topicId1 === topicId2) {
        res.status(400).json({ message: 'Topics must be different for finding common ancestor' });
        return;
      }
      
      const ancestor = this.topicService.findLowestCommonAncestor(topicId1, topicId2);
      
      if (!ancestor) {
        res.status(404).json({ message: 'No common ancestor found' });
        return;
      }
      
      res.status(200).json({ ancestor });
    } catch (error) {
      LogUtils.logError(SERVICE_NAME, 'getLowestCommonAncestor', error, {
        topicId1: req.params.topicId1,
        topicId2: req.params.topicId2
      });
      next(error);
    }
  };
}

// Create an instance of the controller for routes
const topicController = new TopicController();

// Export the controller instance and individual methods for routes
export const {
  getAllTopics,
  getTopicById,
  getTopicVersion,
  getAllTopicVersions,
  createTopic,
  updateTopic,
  setTopicResource,
  removeTopicResource,
  deleteTopic,
  getTopicHierarchy,
  getShortestPath,
  getLowestCommonAncestor
} = topicController; 