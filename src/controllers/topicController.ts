import { NextFunction } from 'express';
import { TopicService } from '../services/topicService';
import { AuthRequest } from '../middleware/authMiddleware';
import { Response } from 'express';

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
    const topicId = req.params.id;
    const version = parseInt(req.params.version, 10);
    
    if (isNaN(version)) {
      res.status(400).json({ message: 'Invalid version number' });
      return;
    }
    
    const topicVersion = topicService.getTopicVersion(topicId, version);
    
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
    const topicId = req.params.id;
    const versions = topicService.getAllTopicVersions(topicId);
    
    res.status(200).json(versions);
  } catch (error) {
    next(error);
  }
};

// POST a new topic
export const createTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const { name, content, parentTopicId, resource } = req.body;
    
    if (!name || !content) {
      res.status(400).json({ message: 'Name and content are required' });
      return;
    }
    
    // Validate resource if provided
    let resourceData;
    if (resource) {
      const { url, description, type } = resource;
      if (!url || !description || !type) {
        res.status(400).json({ message: 'Resource must have url, description, and type' });
        return;
      }
      
      // Validate resource type
      const validTypes = ['video', 'article', 'podcast', 'audio', 'image', 'pdf'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ 
          message: `Invalid resource type. Must be one of: ${validTypes.join(', ')}` 
        });
        return;
      }
      
      resourceData = { url, description, type };
    }
    
    // Log the user who created the topic
    console.log(`Topic created by user: ${req.user?.id} (${req.user?.role})`);
    
    const newTopic = topicService.createTopic(
      name, 
      content, 
      parentTopicId || null,
      resourceData
    );
    
    res.status(201).json(newTopic);
  } catch (error) {
    next(error);
  }
};

// PUT/update a topic (creates a new version)
export const updateTopic = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const { name, content, resource } = req.body;
    
    if (!name || !content) {
      res.status(400).json({ message: 'Name and content are required' });
      return;
    }
    
    // Validate resource if provided
    let resourceData;
    if (resource) {
      const { url, description, type } = resource;
      if (!url || !description || !type) {
        res.status(400).json({ message: 'Resource must have url, description, and type' });
        return;
      }
      
      // Validate resource type
      const validTypes = ['video', 'article', 'podcast', 'audio', 'image', 'pdf'];
      if (!validTypes.includes(type)) {
        res.status(400).json({ 
          message: `Invalid resource type. Must be one of: ${validTypes.join(', ')}` 
        });
        return;
      }
      
      resourceData = { url, description, type };
    }
    
    // Log the user who updated the topic
    console.log(`Topic updated by user: ${req.user?.id} (${req.user?.role})`);
    
    const updatedTopic = topicService.updateTopic(id, name, content, resourceData);
    
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
    const topicId = req.params.id;
    const { url, description, type } = req.body;
    
    if (!url || !description || !type) {
      res.status(400).json({ message: 'URL, description, and type are required' });
      return;
    }
    
    // Validate resource type
    const validTypes = ['video', 'article', 'podcast', 'audio', 'image', 'pdf'];
    if (!validTypes.includes(type)) {
      res.status(400).json({ 
        message: `Invalid resource type. Must be one of: ${validTypes.join(', ')}` 
      });
      return;
    }
    
    // Log the user who set the resource
    console.log(`Resource set by user: ${req.user?.id} (${req.user?.role})`);
    
    const updatedTopic = topicService.setTopicResource(
      topicId,
      url,
      description,
      type as 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf'
    );
    
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
    const topicId = req.params.id;
    
    // Log the user who removed the resource
    console.log(`Resource removed by user: ${req.user?.id} (${req.user?.role})`);
    
    const updatedTopic = topicService.removeTopicResource(topicId);
    
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
    
    // Log the user who deleted the topic
    console.log(`Topic deleted by user: ${req.user?.id} (${req.user?.role})`);
    
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