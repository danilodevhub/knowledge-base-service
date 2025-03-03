import { NextFunction } from 'express';
import { TopicService } from '../services/topicService';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';
import { ResourceType, Action } from '../models/permission';
import { permissionService } from '../services/permissionService';

// Initialize the topic service
const topicService = new TopicService();

// GET all topics
export const getAllTopics = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const topics = topicService.getAllTopics();
    res.status(200).json(topics);
  } catch (error) {
    next(error);
  }
};

// GET a specific topic by ID
export const getTopicById = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const topic = topicService.getTopicById(id);
    
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
export const getTopicVersion = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const version = parseInt(req.params.version);
    
    if (isNaN(version) || version < 1) {
      res.status(400).json({ message: 'Invalid version number' });
      return;
    }
    
    const topicVersion = topicService.getTopicVersion(id, version);
    
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
export const getAllTopicVersions = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const versions = topicService.getAllTopicVersions(id);
    
    res.status(200).json(versions);
  } catch (error) {
    next(error);
  }
};

// POST a new topic
export const createTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
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
    console.log(`Topic created by user: ${userId} (${req.user?.role})`);
    
    // Create the topic with the user as owner
    const topic = topicService.createTopic(
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

// PUT/update a topic
export const updateTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const { name, content, resource } = req.body;
    
    // Validate required fields
    if (!name || !content) {
      res.status(400).json({ message: 'Name and content are required' });
      return;
    }
    
    // Get the topic to check ownership
    const existingTopic = topicService.getTopicById(id);
    if (!existingTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    // Check if user has permission to update this topic
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in request' });
      return;
    }
    
    // Additional permission check using Strategy pattern
    if (!permissionService.canUpdate(userId, ResourceType.TOPIC, existingTopic.ownerId)) {
      res.status(403).json({ 
        message: 'You do not have permission to update this topic',
        details: {
          role: req.user?.role,
          isOwner: userId === existingTopic.ownerId
        }
      });
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
    
    // Log the user who updated the topic
    console.log(`Topic updated by user: ${userId} (${req.user?.role})`);
    
    // Update the topic
    const updatedTopic = topicService.updateTopic(id, name, content, resource);
    
    if (!updatedTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    res.status(200).json(updatedTopic);
  } catch (error) {
    next(error);
  }
};

// PUT/set resource for a topic
export const setTopicResource = (req: AuthRequest, res: Response, next: NextFunction): void => {
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
    
    // Get the topic to check ownership
    const existingTopic = topicService.getTopicById(id);
    if (!existingTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    // Check if user has permission to update this topic
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in request' });
      return;
    }
    
    // Additional permission check using Strategy pattern
    if (!permissionService.canUpdate(userId, ResourceType.TOPIC, existingTopic.ownerId)) {
      res.status(403).json({ 
        message: 'You do not have permission to update this topic',
        details: {
          role: req.user?.role,
          isOwner: userId === existingTopic.ownerId
        }
      });
      return;
    }
    
    // Log the user who set the resource
    console.log(`Resource set by user: ${userId} (${req.user?.role})`);
    
    // Set the resource
    const updatedTopic = topicService.setTopicResource(id, url, description, type);
    
    if (!updatedTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    res.status(200).json(updatedTopic);
  } catch (error) {
    next(error);
  }
};

// DELETE resource from a topic
export const removeTopicResource = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    
    // Get the topic to check ownership
    const existingTopic = topicService.getTopicById(id);
    if (!existingTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    if (!existingTopic.resource) {
      res.status(404).json({ message: 'Topic has no resource to remove' });
      return;
    }
    
    // Check if user has permission to update this topic
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in request' });
      return;
    }
    
    // Additional permission check using Strategy pattern
    if (!permissionService.canUpdate(userId, ResourceType.TOPIC, existingTopic.ownerId)) {
      res.status(403).json({ 
        message: 'You do not have permission to update this topic',
        details: {
          role: req.user?.role,
          isOwner: userId === existingTopic.ownerId
        }
      });
      return;
    }
    
    // Log the user who removed the resource
    console.log(`Resource removed by user: ${userId} (${req.user?.role})`);
    
    // Remove the resource
    const updatedTopic = topicService.removeTopicResource(id);
    
    if (!updatedTopic) {
      res.status(404).json({ message: 'Topic not found or has no resource' });
      return;
    }
    
    res.status(200).json(updatedTopic);
  } catch (error) {
    next(error);
  }
};

// DELETE a topic
export const deleteTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    
    // Get the topic to check ownership
    const existingTopic = topicService.getTopicById(id);
    if (!existingTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    // Check if user has permission to delete this topic
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'User ID not found in request' });
      return;
    }
    
    // Additional permission check using Strategy pattern
    if (!permissionService.canDelete(userId, ResourceType.TOPIC, existingTopic.ownerId)) {
      res.status(403).json({ 
        message: 'You do not have permission to delete this topic',
        details: {
          role: req.user?.role,
          isOwner: userId === existingTopic.ownerId
        }
      });
      return;
    }
    
    // Log the user who deleted the topic
    console.log(`Topic deleted by user: ${userId} (${req.user?.role})`);
    
    const deleted = topicService.deleteTopic(id);
    
    if (!deleted) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    res.status(200).json({ message: 'Topic deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// GET topic hierarchy
export const getTopicHierarchy = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const hierarchy = topicService.getTopicHierarchy(id);
    
    if (!hierarchy) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    res.status(200).json(hierarchy);
  } catch (error) {
    next(error);
  }
}; 