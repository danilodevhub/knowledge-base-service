import * as daoFactoryModule from '../../../src/dao/daoFactory';
import { IDao } from '../../../src/dao/IDao';
import { Topic, TopicVersion } from '../../../src/models/topic';
import { TopicFactoryImpl } from '../../../src/models/topicImpl';
import { TopicResource } from '../../../src/models/topicResource';
import { TopicService } from '../../../src/services/topicService';

// Mock LogUtils to avoid console output during tests
jest.mock('../../../src/utils/logUtils', () => ({
  LogUtils: {
    logError: jest.fn(),
    logWarning: jest.fn(),
    logInfo: jest.fn()
  }
}));

// Mock data for topics
const mockTopics: Topic[] = [
  {
    id: 'topic1',
    name: 'Root Topic',
    content: 'This is the root topic content',
    parentTopicId: null,
    version: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ownerId: 'user1',
    resource: null,
    createNewVersion: jest.fn(),
    setResource: jest.fn(),
    removeResource: jest.fn()
  },
  {
    id: 'topic2',
    name: 'Child Topic 1',
    content: 'This is child topic 1 content',
    parentTopicId: 'topic1',
    version: 1,
    createdAt: new Date('2023-01-02'),
    updatedAt: new Date('2023-01-02'),
    ownerId: 'user1',
    resource: null,
    createNewVersion: jest.fn(),
    setResource: jest.fn(),
    removeResource: jest.fn()
  },
  {
    id: 'topic3',
    name: 'Child Topic 2',
    content: 'This is child topic 2 content',
    parentTopicId: 'topic1',
    version: 1,
    createdAt: new Date('2023-01-03'),
    updatedAt: new Date('2023-01-03'),
    ownerId: 'user2',
    resource: null,
    createNewVersion: jest.fn(),
    setResource: jest.fn(),
    removeResource: jest.fn()
  },
  {
    id: 'topic4',
    name: 'Grandchild Topic',
    content: 'This is a grandchild topic content',
    parentTopicId: 'topic2',
    version: 1,
    createdAt: new Date('2023-01-04'),
    updatedAt: new Date('2023-01-04'),
    ownerId: 'user1',
    resource: null,
    createNewVersion: jest.fn(),
    setResource: jest.fn(),
    removeResource: jest.fn()
  }
];

// Mock versions
const mockVersions: TopicVersion[] = [
  {
    id: 'version1',
    topicId: 'topic1',
    name: 'Root Topic',
    content: 'This is the root topic content',
    parentTopicId: null,
    version: 1,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    ownerId: 'user1',
    resource: null
  },
  {
    id: 'version2',
    topicId: 'topic1',
    name: 'Root Topic - Updated',
    content: 'This is the updated root topic content',
    parentTopicId: null,
    version: 2,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-05'),
    ownerId: 'user1',
    resource: null
  }
];

// Mock Topic Factory
class MockTopicFactory extends TopicFactoryImpl {
  createTopic(
    name: string,
    content: string,
    parentTopicId: string | null,
    ownerId: string,
    resource?: TopicResource
  ): Topic {
    const topic: Topic = {
      id: 'new-topic-id',
      name,
      content,
      parentTopicId,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId,
      resource: resource || null,
      createNewVersion: jest.fn(function(): Topic { 
        return { ...this, version: this.version + 1 }; 
      }),
      setResource: jest.fn(function(this: Topic, r: TopicResource) { this.resource = r; }),
      removeResource: jest.fn(function(this: Topic) { this.resource = null; })
    };
    return topic;
  }

  createTopicVersion(topic: Topic): TopicVersion {
    return {
      id: `version-${Date.now()}`,
      topicId: topic.id,
      name: topic.name,
      content: topic.content,
      parentTopicId: topic.parentTopicId,
      version: topic.version,
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
      ownerId: topic.ownerId,
      resource: topic.resource
    };
  }
}

// Mock Topic DAO
class MockTopicDao implements IDao<Topic> {
  private topics: Topic[] = [...mockTopics];

  findAll(): Topic[] {
    return [...this.topics];
  }

  findById(id: string): Topic | null {
    const topic = this.topics.find(t => t.id === id);
    return topic ? { ...topic } : null;
  }

  findBy(predicate: (item: Topic) => boolean): Topic | null {
    const topic = this.topics.find(predicate);
    return topic ? { ...topic } : null;
  }

  findManyBy(predicate: (item: Topic) => boolean): Topic[] {
    return this.topics.filter(predicate).map(t => ({ ...t }));
  }

  create(item: Topic): void {
    this.topics.push({ ...item });
  }

  update(predicate: (item: Topic) => boolean, item: Topic): void {
    const index = this.topics.findIndex(predicate);
    if (index !== -1) {
      this.topics[index] = { ...item };
    }
  }

  delete(predicate: (item: Topic) => boolean): void {
    const index = this.topics.findIndex(predicate);
    if (index !== -1) {
      this.topics.splice(index, 1);
    }
  }
}

// Mock Version DAO
class MockVersionDao implements IDao<TopicVersion> {
  private versions: TopicVersion[] = [...mockVersions];

  findAll(): TopicVersion[] {
    return [...this.versions];
  }

  findById(id: string): TopicVersion | null {
    const version = this.versions.find(v => v.id === id);
    return version ? { ...version } : null;
  }

  findBy(predicate: (item: TopicVersion) => boolean): TopicVersion | null {
    const version = this.versions.find(predicate);
    return version ? { ...version } : null;
  }

  findManyBy(predicate: (item: TopicVersion) => boolean): TopicVersion[] {
    return this.versions.filter(predicate).map(v => ({ ...v }));
  }

  create(item: TopicVersion): void {
    this.versions.push({ ...item });
  }

  update(predicate: (item: TopicVersion) => boolean, item: TopicVersion): void {
    const index = this.versions.findIndex(predicate);
    if (index !== -1) {
      this.versions[index] = { ...item };
    }
  }

  delete(predicate: (item: TopicVersion) => boolean): void {
    const initialLength = this.versions.length;
    this.versions = this.versions.filter(v => !predicate(v));
  }
}

describe('TopicService', () => {
  let topicService: TopicService;
  let mockTopicFactory: MockTopicFactory;
  let mockTopicDao: MockTopicDao;
  let mockVersionDao: MockVersionDao;
  let createJsonFileDaoSpy: jest.SpyInstance;

  beforeEach(() => {
    mockTopicFactory = new MockTopicFactory();
    mockTopicDao = new MockTopicDao();
    mockVersionDao = new MockVersionDao();

    // Mock the DaoFactory.createJsonFileDao method
    createJsonFileDaoSpy = jest.spyOn(daoFactoryModule.DaoFactory, 'createJsonFileDao')
      .mockImplementation((fileName: string) => {
        if (fileName === 'topics.json') {
          return mockTopicDao;
        } else if (fileName === 'topic-versions.json') {
          return mockVersionDao;
        }
        throw new Error(`Unexpected file name: ${fileName}`);
      });

    // Create a TopicService instance with the mocks
    topicService = new TopicService(mockTopicFactory, mockTopicDao, mockVersionDao);
  });

  afterEach(() => {
    createJsonFileDaoSpy.mockRestore();
  });

  describe('Constructor', () => {
    it('should use the provided dependencies if passed', () => {
      const service = new TopicService(mockTopicFactory, mockTopicDao, mockVersionDao);
      expect(service['topicFactory']).toBe(mockTopicFactory);
      expect(service['topicDao']).toBe(mockTopicDao);
      expect(service['versionDao']).toBe(mockVersionDao);
    });

    it('should create dependencies using DaoFactory if none provided', () => {
      const service = new TopicService();
      expect(createJsonFileDaoSpy).toHaveBeenCalledWith('topics.json');
      expect(createJsonFileDaoSpy).toHaveBeenCalledWith('topic-versions.json');
    });
  });

  describe('getAllTopics', () => {
    it('should return all topics', () => {
      const topics = topicService.getAllTopics();
      expect(topics.length).toBe(mockTopics.length);
      expect(topics[0].id).toBe(mockTopics[0].id);
      expect(topics[1].id).toBe(mockTopics[1].id);
    });
  });

  describe('getTopicById', () => {
    it('should return the topic when it exists', () => {
      const topic = topicService.getTopicById('topic1');
      expect(topic).not.toBeNull();
      expect(topic?.id).toBe('topic1');
      expect(topic?.name).toBe('Root Topic');
    });

    it('should return null when topic does not exist', () => {
      const topic = topicService.getTopicById('nonexistent');
      expect(topic).toBeNull();
    });

    it('should return null when id is undefined or null', () => {
      expect(topicService.getTopicById(undefined as any)).toBeNull();
      expect(topicService.getTopicById(null as any)).toBeNull();
    });
  });

  describe('getTopicVersion', () => {
    it('should return the specific version of a topic', () => {
      const version = topicService.getTopicVersion('topic1', 2);
      expect(version).not.toBeNull();
      expect(version?.id).toBe('version2');
      expect(version?.version).toBe(2);
      expect(version?.name).toBe('Root Topic - Updated');
    });

    it('should return null when version does not exist', () => {
      const version = topicService.getTopicVersion('topic1', 99);
      expect(version).toBeNull();
    });

    it('should return null when topic id is undefined or null', () => {
      expect(topicService.getTopicVersion(undefined as any, 1)).toBeNull();
      expect(topicService.getTopicVersion(null as any, 1)).toBeNull();
    });
  });

  describe('getAllTopicVersions', () => {
    it('should return all versions of a topic', () => {
      const versions = topicService.getAllTopicVersions('topic1');
      expect(versions.length).toBe(2);
      expect(versions[0].version).toBe(1);
      expect(versions[1].version).toBe(2);
    });

    it('should return empty array for nonexistent topic', () => {
      const versions = topicService.getAllTopicVersions('nonexistent');
      expect(versions).toEqual([]);
    });

    it('should return empty array when topic id is undefined or null', () => {
      expect(topicService.getAllTopicVersions(undefined as any)).toEqual([]);
      expect(topicService.getAllTopicVersions(null as any)).toEqual([]);
    });
  });

  describe('createTopic', () => {
    it('should create a new topic', () => {
      const newTopic = topicService.createTopic(
        'New Topic',
        'New Topic Content',
        null,
        'user1'
      );

      expect(newTopic).not.toBeNull();
      expect(newTopic.id).toBe('new-topic-id');
      expect(newTopic.name).toBe('New Topic');
      expect(newTopic.content).toBe('New Topic Content');
      expect(newTopic.parentTopicId).toBeNull();
      expect(newTopic.ownerId).toBe('user1');
      expect(newTopic.version).toBe(1);
    });

    it('should create a topic with a resource when resource data is provided', () => {
      const resourceData = {
        url: 'https://example.com',
        description: 'Example resource',
        type: 'article' as const
      };

      const newTopic = topicService.createTopic(
        'Topic with Resource',
        'Content with resource',
        null,
        'user1',
        resourceData
      );

      expect(newTopic).not.toBeNull();
      expect(newTopic.resource).not.toBeNull();
      expect(newTopic.resource?.url).toBe(resourceData.url);
      expect(newTopic.resource?.description).toBe(resourceData.description);
      expect(newTopic.resource?.type).toBe(resourceData.type);
    });

    it('should throw error if required parameters are missing', () => {
      expect(() => topicService.createTopic('', 'Content', null, 'user1')).toThrow();
      expect(() => topicService.createTopic('Name', '', null, 'user1')).toThrow();
      expect(() => topicService.createTopic('Name', 'Content', null, '')).toThrow();
    });
  });

  describe('updateTopic', () => {
    it('should update an existing topic', () => {
      const updatedTopic = topicService.updateTopic(
        'topic1',
        'Updated Root Topic',
        'Updated content'
      );

      expect(updatedTopic).not.toBeNull();
      expect(updatedTopic?.name).toBe('Updated Root Topic');
      expect(updatedTopic?.content).toBe('Updated content');
      expect(updatedTopic?.version).toBe(2);
    });

    it('should return null when topic does not exist', () => {
      const result = topicService.updateTopic(
        'nonexistent',
        'Updated Topic',
        'Updated content'
      );
      expect(result).toBeNull();
    });

    it('should return null when required parameters are missing', () => {
      expect(topicService.updateTopic('', 'Name', 'Content')).toBeNull();
      expect(topicService.updateTopic('topic1', '', 'Content')).toBeNull();
      expect(topicService.updateTopic('topic1', 'Name', '')).toBeNull();
    });

    it('should add a resource when topic has no resource but resourceData is provided', () => {
      const resourceData = {
        url: 'https://example.com',
        description: 'New resource',
        type: 'article' as const
      };

      const updatedTopic = topicService.updateTopic(
        'topic1',
        'Topic with New Resource',
        'Content with resource',
        resourceData
      );

      expect(updatedTopic).not.toBeNull();
      expect(updatedTopic?.resource).not.toBeNull();
      expect(updatedTopic?.resource?.url).toBe(resourceData.url);
    });

    it('should update an existing resource when topic has a resource and resourceData is provided', () => {
      // First add a resource
      const topic = topicService.getTopicById('topic1') as Topic;
      topic.resource = {
        id: 'resource1',
        topicId: 'topic1',
        url: 'https://old.example.com',
        description: 'Old resource',
        type: 'video'
      };
      mockTopicDao.update(t => t.id === 'topic1', topic);

      // Then update it
      const resourceData = {
        url: 'https://new.example.com',
        description: 'Updated resource',
        type: 'article' as const
      };

      const updatedTopic = topicService.updateTopic(
        'topic1',
        'Topic with Updated Resource',
        'Content with updated resource',
        resourceData
      );

      expect(updatedTopic).not.toBeNull();
      expect(updatedTopic?.resource).not.toBeNull();
      expect(updatedTopic?.resource?.id).toBe('resource1'); // ID should be the same
      expect(updatedTopic?.resource?.url).toBe(resourceData.url); // URL should be updated
      expect(updatedTopic?.resource?.type).toBe(resourceData.type); // Type should be updated
    });
  });

  describe('setTopicResource', () => {
    it('should add a resource to a topic', () => {
      const updatedTopic = topicService.setTopicResource(
        'topic1',
        'https://example.com',
        'New resource',
        'article'
      );

      expect(updatedTopic).not.toBeNull();
      expect(updatedTopic?.resource).not.toBeNull();
      expect(updatedTopic?.resource?.url).toBe('https://example.com');
      expect(updatedTopic?.resource?.description).toBe('New resource');
      expect(updatedTopic?.resource?.type).toBe('article');
      expect(updatedTopic?.version).toBe(2); // Version should be incremented
    });

    it('should update an existing resource', () => {
      // First add a resource
      const topic = topicService.getTopicById('topic1') as Topic;
      topic.resource = {
        id: 'resource1',
        topicId: 'topic1',
        url: 'https://old.example.com',
        description: 'Old resource',
        type: 'video'
      };
      mockTopicDao.update(t => t.id === 'topic1', topic);

      // Then update it
      const updatedTopic = topicService.setTopicResource(
        'topic1',
        'https://new.example.com',
        'Updated resource',
        'article'
      );

      expect(updatedTopic).not.toBeNull();
      expect(updatedTopic?.resource).not.toBeNull();
      expect(updatedTopic?.resource?.id).toBe('resource1'); // ID should be preserved
      expect(updatedTopic?.resource?.url).toBe('https://new.example.com');
      expect(updatedTopic?.resource?.type).toBe('article');
    });

    it('should return null when topic does not exist', () => {
      const result = topicService.setTopicResource(
        'nonexistent',
        'https://example.com',
        'Resource',
        'article'
      );
      expect(result).toBeNull();
    });

    it('should return null when required parameters are missing', () => {
      expect(topicService.setTopicResource('', 'url', 'desc', 'article')).toBeNull();
      expect(topicService.setTopicResource('topic1', '', 'desc', 'article')).toBeNull();
      expect(topicService.setTopicResource('topic1', 'url', '', 'article')).toBeNull();
      expect(topicService.setTopicResource('topic1', 'url', 'desc', '' as any)).toBeNull();
    });
  });

  describe('removeTopicResource', () => {
    it('should remove a resource from a topic', () => {
      // First add a resource
      const topic = topicService.getTopicById('topic1') as Topic;
      topic.resource = {
        id: 'resource1',
        topicId: 'topic1',
        url: 'https://example.com',
        description: 'Resource to remove',
        type: 'video'
      };
      mockTopicDao.update(t => t.id === 'topic1', topic);

      // Then remove it
      const updatedTopic = topicService.removeTopicResource('topic1');

      expect(updatedTopic).not.toBeNull();
      expect(updatedTopic?.resource).toBeNull();
      expect(updatedTopic?.version).toBe(2); // Version should be incremented
    });

    it('should return null when topic does not exist', () => {
      const result = topicService.removeTopicResource('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null when topic has no resource', () => {
      const result = topicService.removeTopicResource('topic2'); // topic2 has no resource
      expect(result).toBeNull();
    });

    it('should return null when id is undefined or null', () => {
      expect(topicService.removeTopicResource(undefined as any)).toBeNull();
      expect(topicService.removeTopicResource(null as any)).toBeNull();
    });
  });

  describe('deleteTopic', () => {
    it('should delete a topic with no children', () => {
      const result = topicService.deleteTopic('topic4'); // This is a leaf node
      expect(result.success).toBe(true);
      expect(topicService.getTopicById('topic4')).toBeNull();
    });

    it('should fail to delete a topic with children without cascade option', () => {
      const result = topicService.deleteTopic('topic1'); // This has children
      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot delete topic with');
    });

    it('should delete a topic and its children with cascade option', () => {
      const result = topicService.deleteTopic('topic1', { cascade: true });
      expect(result.success).toBe(true);
      expect(topicService.getTopicById('topic1')).toBeNull();
      expect(topicService.getTopicById('topic2')).toBeNull();
      expect(topicService.getTopicById('topic3')).toBeNull();
      expect(topicService.getTopicById('topic4')).toBeNull();
    });

    it('should return error for non-existent topic', () => {
      const result = topicService.deleteTopic('nonexistent');
      expect(result.success).toBe(false);
      expect(result.error).toBe('Topic not found');
    });

    it('should return error when id is undefined or null', () => {
      const result1 = topicService.deleteTopic(undefined as any);
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Topic ID is required');

      const result2 = topicService.deleteTopic(null as any);
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Topic ID is required');
    });
  });

  describe('getTopicHierarchy', () => {
    it('should return the topic hierarchy starting from a root topic', () => {
      const hierarchy = topicService.getTopicHierarchy('topic1');
      expect(hierarchy).not.toBeNull();
      expect(hierarchy?.topic.id).toBe('topic1');
      expect(hierarchy?.children.length).toBe(2);
      
      // Check if child topics are included
      const childIds = hierarchy?.children.map(child => child.topic.id);
      expect(childIds).toContain('topic2');
      expect(childIds).toContain('topic3');
      
      // Check if grandchild topic is included under the correct parent
      const child2 = hierarchy?.children.find(child => child.topic.id === 'topic2');
      expect(child2?.children.length).toBe(1);
      expect(child2?.children[0].topic.id).toBe('topic4');
    });

    it('should return the topic hierarchy starting from a leaf topic', () => {
      const hierarchy = topicService.getTopicHierarchy('topic4');
      expect(hierarchy).not.toBeNull();
      expect(hierarchy?.topic.id).toBe('topic4');
      expect(hierarchy?.children.length).toBe(0);
    });

    it('should return null when topic does not exist', () => {
      const hierarchy = topicService.getTopicHierarchy('nonexistent');
      expect(hierarchy).toBeNull();
    });

    it('should return null when id is undefined or null', () => {
      expect(topicService.getTopicHierarchy(undefined as any)).toBeNull();
      expect(topicService.getTopicHierarchy(null as any)).toBeNull();
    });
  });

  describe('findShortestPath', () => {
    it('should find the shortest path between two topics', () => {
      const result = topicService.findShortestPath('topic1', 'topic4');
      expect(result).not.toBeNull();
      expect(result?.path.length).toBe(3);
      expect(result?.path[0].id).toBe('topic1');
      expect(result?.path[1].id).toBe('topic2');
      expect(result?.path[2].id).toBe('topic4');
      expect(result?.distance).toBe(2);
    });

    it('should find path between topics at the same level', () => {
      const result = topicService.findShortestPath('topic2', 'topic3');
      expect(result).not.toBeNull();
      expect(result?.path.length).toBe(3);
      expect(result?.path[0].id).toBe('topic2');
      expect(result?.path[1].id).toBe('topic1');
      expect(result?.path[2].id).toBe('topic3');
      expect(result?.distance).toBe(2);
    });

    it('should return path with just the topic if source and target are the same', () => {
      const result = topicService.findShortestPath('topic1', 'topic1');
      expect(result).not.toBeNull();
      expect(result?.path.length).toBe(1);
      expect(result?.path[0].id).toBe('topic1');
      expect(result?.distance).toBe(0);
    });

    it('should return null when no path exists', () => {
      // Add an isolated topic
      const isolatedTopic = {
        id: 'isolated',
        name: 'Isolated Topic',
        content: 'This topic has no connections',
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
      mockTopicDao.create(isolatedTopic);

      const result = topicService.findShortestPath('topic1', 'isolated');
      expect(result).toBeNull();
    });

    it('should return null when either topic does not exist', () => {
      expect(topicService.findShortestPath('topic1', 'nonexistent')).toBeNull();
      expect(topicService.findShortestPath('nonexistent', 'topic1')).toBeNull();
    });

    it('should return null when ids are undefined or null', () => {
      expect(topicService.findShortestPath(undefined as any, 'topic1')).toBeNull();
      expect(topicService.findShortestPath('topic1', null as any)).toBeNull();
    });
  });

  describe('findLowestCommonAncestor', () => {
    it('should find the lowest common ancestor of two topics', () => {
      const ancestor = topicService.findLowestCommonAncestor('topic2', 'topic3');
      expect(ancestor).not.toBeNull();
      expect(ancestor?.id).toBe('topic1');
    });

    it('should identify a topic as the ancestor of itself and a descendant', () => {
      const ancestor = topicService.findLowestCommonAncestor('topic2', 'topic4');
      expect(ancestor).not.toBeNull();
      expect(ancestor?.id).toBe('topic2');
    });

    it('should identify a topic as its own ancestor', () => {
      const ancestor = topicService.findLowestCommonAncestor('topic1', 'topic1');
      expect(ancestor).not.toBeNull();
      expect(ancestor?.id).toBe('topic1');
    });

    it('should return null when no common ancestor exists', () => {
      // Add an isolated topic
      const isolatedTopic = {
        id: 'isolated',
        name: 'Isolated Topic',
        content: 'This topic has no connections',
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
      mockTopicDao.create(isolatedTopic);

      const ancestor = topicService.findLowestCommonAncestor('topic1', 'isolated');
      expect(ancestor).toBeNull();
    });

    it('should return null when either topic does not exist', () => {
      expect(topicService.findLowestCommonAncestor('topic1', 'nonexistent')).toBeNull();
      expect(topicService.findLowestCommonAncestor('nonexistent', 'topic1')).toBeNull();
    });

    it('should return null when ids are undefined or null', () => {
      expect(topicService.findLowestCommonAncestor(undefined as any, 'topic1')).toBeNull();
      expect(topicService.findLowestCommonAncestor('topic1', null as any)).toBeNull();
    });
  });
}); 