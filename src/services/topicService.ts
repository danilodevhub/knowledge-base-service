import { Topic, TopicVersion } from '../models/topic';
import { TopicImpl, TopicVersionImpl, TopicFactoryImpl, CompositeTopic } from '../models/topicImpl';
import { TopicResource } from '../models/topicResource';
import { IDao } from '../dao/IDao';
import { DaoFactory } from '../dao/daoFactory';
import { v4 as uuidv4 } from 'uuid';
import { LogUtils } from '../utils/logUtils';

// Simple error logger
// Moved to LogUtils class

export interface PathNode {
    topic: Topic;
    distance: number;
    path: Topic[];
}

export class TopicService {
    private topicFactory: TopicFactoryImpl;
    private topicDao: IDao<Topic>;
    private versionDao: IDao<TopicVersion>;
    private readonly SERVICE_NAME = 'TopicService';

    constructor(
        topicFactory?: TopicFactoryImpl,
        topicDao?: IDao<Topic>,
        versionDao?: IDao<TopicVersion>
    ) {
        this.topicFactory = topicFactory || new TopicFactoryImpl();
        this.topicDao = topicDao || DaoFactory.createJsonFileDao<Topic>('topics.json');
        this.versionDao = versionDao || DaoFactory.createJsonFileDao<TopicVersion>('topic-versions.json');
    }

    // Get all topics (latest versions)
    getAllTopics(): Topic[] {
        const topics = this.topicDao.findAll();
        return topics.map(topic => this.convertToTopicImpl(topic));
    }

    // Get a specific topic by ID (latest version)
    getTopicById(id: string): Topic | null {
        if (!id) return null;
        
        const topicData = this.topicDao.findById(id);
        if (!topicData) {
            return null;
        }
        return this.convertToTopicImpl(topicData);
    }

    // Get a specific version of a topic
    getTopicVersion(id: string, version: number): TopicVersion | null {
        if (!id) return null;
        
        const versionData = this.versionDao.findBy(tv => tv.topicId === id && tv.version === version);
        if (!versionData) {
            return null;
        }
        return new TopicVersionImpl(
            versionData.id,
            versionData.topicId,
            versionData.name,
            versionData.content,
            versionData.parentTopicId,
            versionData.version,
            new Date(versionData.createdAt),
            new Date(versionData.updatedAt),
            versionData.ownerId,
            versionData.resource
        );
    }

    // Get all versions of a topic
    getAllTopicVersions(id: string): TopicVersion[] {
        if (!id) return [];
        
        const versions = this.versionDao.findManyBy(tv => tv.topicId === id);
        return versions.map(version => new TopicVersionImpl(
            version.id,
            version.topicId,
            version.name,
            version.content,
            version.parentTopicId,
            version.version,
            new Date(version.createdAt),
            new Date(version.updatedAt),
            version.ownerId,
            version.resource
        ));
    }

    // Create a new topic
    createTopic(
        name: string, 
        content: string, 
        parentTopicId: string | null,
        ownerId: string,
        resourceData?: { 
            url: string, 
            description: string, 
            type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf' 
        }
    ): Topic {
        if (!name || !content || !ownerId) {
            throw new Error('Name, content, and ownerId are required');
        }
        
        // Create resource if data is provided
        let resource: TopicResource | undefined = undefined;
        
        if (resourceData) {
            resource = {
                id: uuidv4(),
                url: resourceData.url,
                description: resourceData.description,
                type: resourceData.type,
                topicId: '' // Will be set after topic creation
            };
        }
        
        // Create the topic
        const topic = this.topicFactory.createTopic(name, content, parentTopicId, ownerId, resource);
        
        // Set the topicId on the resource if it exists
        if (resource) {
            resource.topicId = topic.id;
        }
        
        // Store the topic
        this.topicDao.create(topic);
        
        // Create initial version
        const topicVersion = this.topicFactory.createTopicVersion(topic);
        this.versionDao.create(topicVersion);
        
        return topic;
    }

    // Update a topic (creates a new version)
    updateTopic(
        id: string, 
        name: string, 
        content: string,
        resourceData?: { 
            url: string, 
            description: string, 
            type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf' 
        }
    ): Topic | null {
        if (!id || !name || !content) {
            return null;
        }
        
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return null;
        }
        
        // Update topic properties
        topic.name = name;
        topic.content = content;
        topic.updatedAt = new Date();
        topic.version += 1; // Increment version number
        
        // Handle resource update
        if (resourceData) {
            if (!topic.resource) {
                // Create new resource
                const resource: TopicResource = {
                    id: uuidv4(),
                    url: resourceData.url,
                    description: resourceData.description,
                    type: resourceData.type,
                    topicId: topic.id
                };
                topic.setResource(resource);
            } else {
                // Update existing resource
                topic.resource.url = resourceData.url;
                topic.resource.description = resourceData.description;
                topic.resource.type = resourceData.type;
            }
        }
        
        // Update the topic in storage
        this.topicDao.update(t => t.id === id, topic);
        
        // Create a new version with the same version number
        const topicVersion = this.topicFactory.createTopicVersion(topic);
        this.versionDao.create(topicVersion);
        
        return topic;
    }

    // Set a resource for a topic
    setTopicResource(
        id: string, 
        url: string, 
        description: string, 
        type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf'
    ): Topic | null {
        if (!id || !url || !description || !type) {
            return null;
        }
        
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return null;
        }
        
        const resource: TopicResource = {
            id: topic.resource?.id || uuidv4(),
            url,
            description,
            type,
            topicId: topic.id
        };
        
        topic.setResource(resource);
        topic.version += 1; // Increment version number
        topic.updatedAt = new Date();
        
        // Update the topic in storage
        this.topicDao.update(t => t.id === id, topic);
        
        // Create a new version with the same version number
        const topicVersion = this.topicFactory.createTopicVersion(topic);
        this.versionDao.create(topicVersion);
        
        return topic;
    }

    // Remove a resource from a topic
    removeTopicResource(id: string): Topic | null {
        if (!id) return null;
        
        const topic = this.getTopicById(id);
        
        if (!topic || !topic.resource) {
            return null;
        }
        
        topic.removeResource();
        topic.version += 1; // Increment version number
        topic.updatedAt = new Date();
        
        // Update the topic in storage
        this.topicDao.update(t => t.id === id, topic);
        
        // Create a new version with the same version number
        const topicVersion = this.topicFactory.createTopicVersion(topic);
        this.versionDao.create(topicVersion);
        
        return topic;
    }

    // Delete a topic and all its versions
    deleteTopic(id: string, options: { cascade?: boolean } = {}): { success: boolean; error?: string } {
        if (!id) {
            return { success: false, error: 'Topic ID is required' };
        }
        
        try {
            const topic = this.getTopicById(id);
            
            if (!topic) {
                return { success: false, error: 'Topic not found' };
            }

            // Check for child topics
            const childTopics = this.topicDao.findManyBy(t => t.parentTopicId === id);
            
            if (childTopics.length > 0 && !options.cascade) {
                return {
                    success: false,
                    error: `Cannot delete topic with ${childTopics.length} child topics. Use cascade=true to delete all children.`
                };
            }

            if (options.cascade) {
                this.deleteChildTopics(id);
            }

            // Remove all versions
            this.versionDao.delete(tv => tv.topicId === id);
            
            // Remove the topic
            this.topicDao.delete(t => t.id === id);
            
            return { success: true };
        } catch (error: any) {
            LogUtils.logError(this.SERVICE_NAME, 'deleteTopic', error, { topicId: id, cascade: options.cascade });
            return { 
                success: false, 
                error: `Failed to delete topic: ${error.message}` 
            };
        }
    }

    // Helper method to delete child topics
    private deleteChildTopics(parentTopicId: string): void {
        if (!parentTopicId) return;
        
        try {
            const childTopics = this.topicDao.findManyBy(t => t.parentTopicId === parentTopicId);
            for (const childTopic of childTopics) {
                this.deleteTopic(childTopic.id, { cascade: true });
            }
        } catch (error: any) {
            LogUtils.logError(this.SERVICE_NAME, 'deleteChildTopics', error, { parentTopicId });
            throw error; // Re-throw to be handled by the parent method
        }
    }

    // Get topic hierarchy using composite pattern
    getTopicHierarchy(id: string): CompositeTopic | null {
        if (!id) return null;
        
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return null;
        }
        
        return this.buildTopicHierarchy(topic);
    }

    // Helper method to build topic hierarchy
    private buildTopicHierarchy(topic: Topic): CompositeTopic {
        const compositeTopic = new CompositeTopic(topic);
        const childTopicsData = this.topicDao.findManyBy(t => t.parentTopicId === topic.id);
        const childTopics = childTopicsData.map(childData => this.convertToTopicImpl(childData));
        
        for (const childTopic of childTopics) {
            const childCompositeTopic = this.buildTopicHierarchy(childTopic);
            compositeTopic.addChild(childCompositeTopic);
        }
        
        return compositeTopic;
    }

    // Helper method to convert plain object to TopicImpl instance
    private convertToTopicImpl(topicData: any): TopicImpl {
        return new TopicImpl(
            topicData.id,
            topicData.name,
            topicData.content,
            topicData.parentTopicId,
            topicData.version,
            new Date(topicData.createdAt),
            new Date(topicData.updatedAt),
            topicData.ownerId,
            topicData.resource
        );
    }

    // Find shortest path between two topics
    findShortestPath(fromTopicId: string, toTopicId: string): { path: Topic[]; distance: number } | null {
        if (!fromTopicId || !toTopicId) {
            return null;
        }
        
        try {
            const fromTopic = this.getTopicById(fromTopicId);
            const toTopic = this.getTopicById(toTopicId);

            if (!fromTopic || !toTopic) {
                return null;
            }

            // If same topic, return path with just that topic
            if (fromTopicId === toTopicId) {
                return { path: [fromTopic], distance: 0 };
            }

            const visited = new Set<string>();
            const queue: PathNode[] = [{
                topic: fromTopic,
                distance: 0,
                path: [fromTopic]
            }];

            while (queue.length > 0) {
                // Get the next node to explore
                const current = queue.shift()!;
                const currentId = current.topic.id;

                if (visited.has(currentId)) {
                    continue;
                }
                visited.add(currentId);

                // Check parent path
                if (current.topic.parentTopicId) {
                    const parent = this.getTopicById(current.topic.parentTopicId);
                    if (parent && !visited.has(parent.id)) {
                        const parentPath = [...current.path, parent];
                        if (parent.id === toTopicId) {
                            return { path: parentPath, distance: current.distance + 1 };
                        }
                        queue.push({
                            topic: parent,
                            distance: current.distance + 1,
                            path: parentPath
                        });
                    }
                }

                // Check children paths
                const children = this.topicDao.findManyBy(t => t.parentTopicId === currentId);
                for (const child of children) {
                    if (!visited.has(child.id)) {
                        const childTopic = this.convertToTopicImpl(child);
                        const childPath = [...current.path, childTopic];
                        if (child.id === toTopicId) {
                            return { path: childPath, distance: current.distance + 1 };
                        }
                        queue.push({
                            topic: childTopic,
                            distance: current.distance + 1,
                            path: childPath
                        });
                    }
                }
            }

            // No path found
            return null;
        } catch (error: any) {
            LogUtils.logError(this.SERVICE_NAME, 'findShortestPath', error, { fromTopicId, toTopicId });
            return null;
        }
    }

    // Find the lowest common ancestor of two topics
    findLowestCommonAncestor(topicId1: string, topicId2: string): Topic | null {
        if (!topicId1 || !topicId2) {
            return null;
        }
        
        try {
            const topic1 = this.getTopicById(topicId1);
            const topic2 = this.getTopicById(topicId2);

            if (!topic1 || !topic2) {
                return null;
            }

            // Get path to root for first topic
            const path1 = this.getPathToRoot(topic1);
            const ancestors1 = new Set(path1.map(t => t.id));

            // Check each ancestor of second topic against first topic's path
            let current: Topic | null = topic2;
            while (current) {
                if (ancestors1.has(current.id)) {
                    return current;
                }
                current = current.parentTopicId ? this.getTopicById(current.parentTopicId) : null;
            }

            return null;
        } catch (error: any) {
            LogUtils.logError(this.SERVICE_NAME, 'findLowestCommonAncestor', error, { topicId1, topicId2 });
            return null;
        }
    }

    // Helper method to get path from topic to root
    private getPathToRoot(topic: Topic): Topic[] {
        if (!topic) return [];
        
        const path: Topic[] = [topic];
        let current: Topic | null = topic;

        while (current?.parentTopicId) {
            const parent = this.getTopicById(current.parentTopicId);
            if (!parent) break;
            path.push(parent);
            current = parent;
        }

        return path;
    }
}

// Export singleton instance
export const topicService = new TopicService(); 