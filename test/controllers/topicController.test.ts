import { TopicController } from '../../src/controllers/topicController';
import { TopicService } from '../../src/services/topicService';
import { permissionService } from '../../src/services/permissionService';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../src/middleware/authMiddleware';
import { LogUtils } from '../../src/utils/logUtils';
import { Topic } from '../../src/models/topic';
import { TopicResource } from '../../src/models/topicResource';
import { ResourceType, Action } from '../../src/models/permission';

// Mock the dependencies
jest.mock('../../src/services/topicService');
jest.mock('../../src/services/permissionService');
jest.mock('../../src/utils/logUtils');

// Define a mock topic for testing
const mockTopic: Topic = {
  id: 'topic1',
  name: 'Test Topic',
  content: 'Test content',
  parentTopicId: null,
  version: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
  ownerId: 'user1',
  resource: null,
  createNewVersion: jest.fn(),
  setResource: jest.fn(),
  removeResource: jest.fn()
};

// Define mock versions
const mockVersions = [
  {
    id: 'version1',
    topicId: 'topic1',
    name: 'Test Topic',
    content: 'Test content',
    parentTopicId: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'user1',
    resource: null
  },
  {
    id: 'version2',
    topicId: 'topic1',
    name: 'Test Topic Updated',
    content: 'Test content updated',
    parentTopicId: null,
    version: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
    ownerId: 'user1',
    resource: null
  }
];

// Mock response object
const mockResponse = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res as Response;
};

// Mock next function
const mockNext: NextFunction = jest.fn();

describe('TopicController', () => {
  let topicController: TopicController;
  let mockTopicService: jest.Mocked<TopicService>;
  let req: Partial<AuthRequest>;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTopicService = new TopicService() as jest.Mocked<TopicService>;
    topicController = new TopicController(mockTopicService);
    res = mockResponse();
    req = {
      params: {},
      query: {},
      body: {},
      user: {
        id: 'user1',
        role: 'editor'
      }
    };
  });

  describe('getAllTopics', () => {
    it('should return all topics with 200 status code', () => {
      // Arrange
      mockTopicService.getAllTopics = jest.fn().mockReturnValue([mockTopic]);

      // Act
      topicController.getAllTopics(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getAllTopics).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([mockTopic]);
    });

    it('should call next with error if getting topics fails', () => {
      // Arrange
      const error = new Error('Database error');
      mockTopicService.getAllTopics = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act
      topicController.getAllTopics(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTopicById', () => {
    it('should return a topic when it exists', () => {
      // Arrange
      req.params = { id: 'topic1' };
      mockTopicService.getTopicById = jest.fn().mockReturnValue(mockTopic);

      // Act
      topicController.getTopicById(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicById).toHaveBeenCalledWith('topic1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTopic);
    });

    it('should return 404 when topic does not exist', () => {
      // Arrange
      req.params = { id: 'nonexistent' };
      mockTopicService.getTopicById = jest.fn().mockReturnValue(null);

      // Act
      topicController.getTopicById(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicById).toHaveBeenCalledWith('nonexistent');
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    it('should call next with error if getting topic fails', () => {
      // Arrange
      req.params = { id: 'topic1' };
      const error = new Error('Database error');
      mockTopicService.getTopicById = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act
      topicController.getTopicById(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getTopicVersion', () => {
    it('should return a specific version of a topic', () => {
      // Arrange
      req.params = { id: 'topic1', version: '2' };
      mockTopicService.getTopicVersion = jest.fn().mockReturnValue(mockVersions[1]);

      // Act
      topicController.getTopicVersion(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicVersion).toHaveBeenCalledWith('topic1', 2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVersions[1]);
    });

    it('should return 400 when version is invalid', () => {
      // Arrange
      req.params = { id: 'topic1', version: 'invalid' };

      // Act
      topicController.getTopicVersion(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid version number' });
    });

    it('should return 404 when topic version does not exist', () => {
      // Arrange
      req.params = { id: 'topic1', version: '3' };
      mockTopicService.getTopicVersion = jest.fn().mockReturnValue(null);

      // Act
      topicController.getTopicVersion(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicVersion).toHaveBeenCalledWith('topic1', 3);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic version not found' });
    });
  });

  describe('getAllTopicVersions', () => {
    it('should return all versions of a topic', () => {
      // Arrange
      req.params = { id: 'topic1' };
      mockTopicService.getAllTopicVersions = jest.fn().mockReturnValue(mockVersions);

      // Act
      topicController.getAllTopicVersions(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getAllTopicVersions).toHaveBeenCalledWith('topic1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockVersions);
    });
  });

  describe('createTopic', () => {
    it('should create a topic successfully', () => {
      // Arrange
      req.body = {
        name: 'New Topic',
        content: 'New content',
        parentTopicId: null
      };
      mockTopicService.createTopic = jest.fn().mockReturnValue(mockTopic);

      // Act
      topicController.createTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.createTopic).toHaveBeenCalledWith(
        'New Topic',
        'New content',
        null,
        'user1',
        undefined
      );
      expect(LogUtils.logInfo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTopic);
    });

    it('should return 400 when name is missing', () => {
      // Arrange
      req.body = {
        content: 'New content'
      };

      // Act
      topicController.createTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and content are required' });
    });

    it('should return 400 when content is missing', () => {
      // Arrange
      req.body = {
        name: 'New Topic'
      };

      // Act
      topicController.createTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and content are required' });
    });

    it('should return 400 when resource is invalid', () => {
      // Arrange
      req.body = {
        name: 'New Topic',
        content: 'New content',
        resource: {
          url: 'https://example.com',
          description: 'Example resource'
          // Missing type
        }
      };

      // Act
      topicController.createTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Resource must include url, description, and type' });
    });

    it('should return 400 when resource type is invalid', () => {
      // Arrange
      req.body = {
        name: 'New Topic',
        content: 'New content',
        resource: {
          url: 'https://example.com',
          description: 'Example resource',
          type: 'invalid-type'
        }
      };

      // Act
      topicController.createTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ 
        message: 'Resource type must be one of: video, article, podcast, audio, image, pdf' 
      });
    });

    it('should return 401 when user ID is missing', () => {
      // Arrange
      req.body = {
        name: 'New Topic',
        content: 'New content'
      };
      req.user = undefined;

      // Act
      topicController.createTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not found in request' });
    });
  });

  describe('updateTopic', () => {
    beforeEach(() => {
      req.params = { id: 'topic1' };
      req.body = {
        name: 'Updated Topic',
        content: 'Updated content'
      };
      mockTopicService.getTopicById = jest.fn().mockReturnValue(mockTopic);
      mockTopicService.updateTopic = jest.fn().mockReturnValue({ ...mockTopic, name: 'Updated Topic', content: 'Updated content' });
      (permissionService.hasPermission as jest.Mock) = jest.fn().mockReturnValue(true);
    });

    it('should update a topic successfully', () => {
      // Act
      topicController.updateTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicById).toHaveBeenCalledWith('topic1');
      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        'user1',
        ResourceType.TOPIC,
        Action.UPDATE,
        'user1'
      );
      expect(mockTopicService.updateTopic).toHaveBeenCalledWith(
        'topic1',
        'Updated Topic',
        'Updated content',
        undefined
      );
      expect(LogUtils.logInfo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when name or content is missing', () => {
      // Arrange
      req.body = { name: 'Updated Topic' };

      // Act
      topicController.updateTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name and content are required' });
    });

    it('should return 401 when user ID is missing', () => {
      // Arrange
      req.user = undefined;

      // Act
      topicController.updateTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'User ID not found in request' });
    });

    it('should return 404 when topic does not exist', () => {
      // Arrange
      mockTopicService.getTopicById = jest.fn().mockReturnValue(null);

      // Act
      topicController.updateTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    it('should return 403 when user does not have permission', () => {
      // Arrange
      (permissionService.hasPermission as jest.Mock) = jest.fn().mockReturnValue(false);

      // Act
      topicController.updateTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'You do not have permission to update this topic',
        details: {
          role: 'editor',
          isOwner: true
        }
      });
    });

    it('should return 500 when update fails', () => {
      // Arrange
      mockTopicService.updateTopic = jest.fn().mockReturnValue(null);

      // Act
      topicController.updateTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update topic' });
    });
  });

  describe('deleteTopic', () => {
    beforeEach(() => {
      req.params = { id: 'topic1' };
      req.query = { cascade: 'false' };
      mockTopicService.getTopicById = jest.fn().mockReturnValue(mockTopic);
      mockTopicService.deleteTopic = jest.fn().mockReturnValue({ success: true });
      (permissionService.hasPermission as jest.Mock) = jest.fn().mockReturnValue(true);
    });

    it('should delete a topic successfully', () => {
      // Act
      topicController.deleteTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicById).toHaveBeenCalledWith('topic1');
      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        'user1',
        ResourceType.TOPIC,
        Action.DELETE,
        'user1'
      );
      expect(mockTopicService.deleteTopic).toHaveBeenCalledWith('topic1', { cascade: false });
      expect(res.status).toHaveBeenCalledWith(204);
    });

    it('should return 404 when topic does not exist', () => {
      // Arrange
      mockTopicService.getTopicById = jest.fn().mockReturnValue(null);

      // Act
      topicController.deleteTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    it('should return 403 when user does not have permission', () => {
      // Arrange
      (permissionService.hasPermission as jest.Mock) = jest.fn().mockReturnValue(false);

      // Act
      topicController.deleteTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 409 when delete fails', () => {
      // Arrange
      mockTopicService.deleteTopic = jest.fn().mockReturnValue({
        success: false,
        error: 'Cannot delete topic with child topics. Use cascade=true to delete all children.'
      });

      // Act
      topicController.deleteTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Cannot delete topic with child topics. Use cascade=true to delete all children.'
      });
    });

    it('should handle errors and log them', () => {
      // Arrange
      const error = new Error('Database error');
      mockTopicService.getTopicById = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act
      topicController.deleteTopic(req as AuthRequest, res, mockNext);

      // Assert
      expect(LogUtils.logError).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('setTopicResource', () => {
    beforeEach(() => {
      req.params = { id: 'topic1' };
      req.body = {
        url: 'https://example.com',
        description: 'Example resource',
        type: 'article'
      };
      mockTopicService.getTopicById = jest.fn().mockReturnValue(mockTopic);
      mockTopicService.setTopicResource = jest.fn().mockReturnValue({ ...mockTopic, resource: {
        id: 'resource1',
        url: 'https://example.com',
        description: 'Example resource',
        type: 'article',
        topicId: 'topic1'
      }});
      (permissionService.hasPermission as jest.Mock) = jest.fn().mockReturnValue(true);
    });

    it('should set a resource successfully', () => {
      // Act
      topicController.setTopicResource(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicById).toHaveBeenCalledWith('topic1');
      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        'user1',
        ResourceType.TOPIC,
        Action.UPDATE,
        'user1'
      );
      expect(mockTopicService.setTopicResource).toHaveBeenCalledWith(
        'topic1',
        'https://example.com',
        'Example resource',
        'article'
      );
      expect(LogUtils.logInfo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when required fields are missing', () => {
      // Arrange
      req.body = {
        url: 'https://example.com',
        description: 'Example resource'
        // Missing type
      };

      // Act
      topicController.setTopicResource(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'URL, description, and type are required' });
    });

    it('should return 404 when topic does not exist', () => {
      // Arrange
      mockTopicService.getTopicById = jest.fn().mockReturnValue(null);

      // Act
      topicController.setTopicResource(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });
  });

  describe('removeTopicResource', () => {
    beforeEach(() => {
      req.params = { id: 'topic1' };
      const mockTopicWithResource = {
        ...mockTopic,
        resource: {
          id: 'resource1',
          url: 'https://example.com',
          description: 'Example resource',
          type: 'article',
          topicId: 'topic1'
        }
      };
      mockTopicService.getTopicById = jest.fn().mockReturnValue(mockTopicWithResource);
      mockTopicService.removeTopicResource = jest.fn().mockReturnValue(mockTopic);
      (permissionService.hasPermission as jest.Mock) = jest.fn().mockReturnValue(true);
    });

    it('should remove a resource successfully', () => {
      // Act
      topicController.removeTopicResource(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicById).toHaveBeenCalledWith('topic1');
      expect(permissionService.hasPermission).toHaveBeenCalledWith(
        'user1',
        ResourceType.TOPIC,
        Action.UPDATE,
        'user1'
      );
      expect(mockTopicService.removeTopicResource).toHaveBeenCalledWith('topic1');
      expect(LogUtils.logInfo).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 404 when topic does not exist', () => {
      // Arrange
      mockTopicService.getTopicById = jest.fn().mockReturnValue(null);

      // Act
      topicController.removeTopicResource(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });

    it('should return 404 when topic has no resource', () => {
      // Arrange
      mockTopicService.getTopicById = jest.fn().mockReturnValue(mockTopic); // mockTopic has no resource

      // Act
      topicController.removeTopicResource(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic does not have a resource' });
    });
  });

  describe('getTopicHierarchy', () => {
    it('should return topic hierarchy', () => {
      // Arrange
      req.params = { id: 'topic1' };
      const mockHierarchy = {
        id: 'topic1',
        name: 'Test Topic',
        content: 'Test content',
        children: []
      };
      mockTopicService.getTopicHierarchy = jest.fn().mockReturnValue(mockHierarchy);

      // Act
      topicController.getTopicHierarchy(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.getTopicHierarchy).toHaveBeenCalledWith('topic1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockHierarchy);
    });

    it('should return 404 when topic does not exist', () => {
      // Arrange
      req.params = { id: 'nonexistent' };
      mockTopicService.getTopicHierarchy = jest.fn().mockReturnValue(null);

      // Act
      topicController.getTopicHierarchy(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topic not found' });
    });
  });

  describe('getShortestPath', () => {
    beforeEach(() => {
      req.params = { fromId: 'topic1', toId: 'topic2' };
      const pathResult = {
        path: [mockTopic, { ...mockTopic, id: 'topic2' }],
        distance: 1
      };
      mockTopicService.findShortestPath = jest.fn().mockReturnValue(pathResult);
    });

    it('should return the shortest path', () => {
      // Act
      topicController.getShortestPath(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.findShortestPath).toHaveBeenCalledWith('topic1', 'topic2');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should return 400 when source and target are the same', () => {
      // Arrange
      req.params = { fromId: 'topic1', toId: 'topic1' };

      // Act
      topicController.getShortestPath(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Source and target topics must be different' });
    });

    it('should return 404 when path is not found', () => {
      // Arrange
      mockTopicService.findShortestPath = jest.fn().mockReturnValue(null);

      // Act
      topicController.getShortestPath(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No path found between topics' });
    });

    it('should handle errors and log them', () => {
      // Arrange
      const error = new Error('Error finding path');
      mockTopicService.findShortestPath = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act
      topicController.getShortestPath(req as AuthRequest, res, mockNext);

      // Assert
      expect(LogUtils.logError).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getLowestCommonAncestor', () => {
    beforeEach(() => {
      req.params = { topicId1: 'topic1', topicId2: 'topic2' };
      mockTopicService.findLowestCommonAncestor = jest.fn().mockReturnValue(mockTopic);
    });

    it('should return the lowest common ancestor', () => {
      // Act
      topicController.getLowestCommonAncestor(req as AuthRequest, res, mockNext);

      // Assert
      expect(mockTopicService.findLowestCommonAncestor).toHaveBeenCalledWith('topic1', 'topic2');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ ancestor: mockTopic });
    });

    it('should return 400 when topics are the same', () => {
      // Arrange
      req.params = { topicId1: 'topic1', topicId2: 'topic1' };

      // Act
      topicController.getLowestCommonAncestor(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Topics must be different for finding common ancestor' });
    });

    it('should return 404 when ancestor is not found', () => {
      // Arrange
      mockTopicService.findLowestCommonAncestor = jest.fn().mockReturnValue(null);

      // Act
      topicController.getLowestCommonAncestor(req as AuthRequest, res, mockNext);

      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'No common ancestor found' });
    });

    it('should handle errors and log them', () => {
      // Arrange
      const error = new Error('Error finding ancestor');
      mockTopicService.findLowestCommonAncestor = jest.fn().mockImplementation(() => {
        throw error;
      });

      // Act
      topicController.getLowestCommonAncestor(req as AuthRequest, res, mockNext);

      // Assert
      expect(LogUtils.logError).toHaveBeenCalled();
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 