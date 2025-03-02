import { Request, Response, NextFunction } from 'express';
import { TopicService } from '../services/topicService';

// Initialize the topic service
const topicService = new TopicService();

// GET all topics
export const getAllTopics = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const topics = topicService.getAllTopics();
    res.status(200).json(topics);
  } catch (error) {
    next(error);
  }
};

// GET a specific topic by ID
export const getTopicById = (req: Request, res: Response, next: NextFunction): void => {
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
export const getTopicVersion = (req: Request, res: Response, next: NextFunction): void => {
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
export const getAllTopicVersions = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const topicId = req.params.id;
    const versions = topicService.getAllTopicVersions(topicId);
    
    res.status(200).json(versions);
  } catch (error) {
    next(error);
  }
};

// POST a new topic
export const createTopic = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const { name, content, parentTopicId } = req.body;
    
    if (!name || !content) {
      res.status(400).json({ message: 'Name and content are required' });
      return;
    }
    
    const newTopic = topicService.createTopic(name, content, parentTopicId || null);
    res.status(201).json(newTopic);
  } catch (error) {
    next(error);
  }
};

// PUT/update a topic (creates a new version)
export const updateTopic = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
    const { name, content } = req.body;
    
    if (!name || !content) {
      res.status(400).json({ message: 'Name and content are required' });
      return;
    }
    
    const updatedTopic = topicService.updateTopic(id, name, content);
    
    if (!updatedTopic) {
      res.status(404).json({ message: 'Topic not found' });
      return;
    }
    
    res.status(200).json(updatedTopic);
  } catch (error) {
    next(error);
  }
};

// DELETE a topic
export const deleteTopic = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const id = req.params.id;
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
export const getTopicHierarchy = (req: Request, res: Response, next: NextFunction): void => {
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