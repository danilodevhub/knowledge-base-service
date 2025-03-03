import { Topic, TopicVersion } from '../models/topic';
import { TopicImpl, TopicVersionImpl, TopicFactoryImpl, CompositeTopic } from '../models/topicImpl';
import { TopicResource } from '../models/topicResource';
import { StorageService } from './storageService';
import { v4 as uuidv4 } from 'uuid';

export class TopicService {
    private topicFactory: TopicFactoryImpl;
    private topicStorage: StorageService<Topic>;
    private versionStorage: StorageService<TopicVersion>;

    constructor() {
        this.topicFactory = new TopicFactoryImpl();
        this.topicStorage = new StorageService<Topic>('topics.json');
        this.versionStorage = new StorageService<TopicVersion>('topic-versions.json');
    }

    // Get all topics (latest versions)
    getAllTopics(): Topic[] {
        return this.topicStorage.readData();
    }

    // Get a specific topic by ID (latest version)
    getTopicById(id: string): Topic | null {
        return this.topicStorage.findOne(topic => topic.id === id);
    }

    // Get a specific version of a topic
    getTopicVersion(id: string, version: number): TopicVersion | null {
        return this.versionStorage.findOne(tv => tv.topicId === id && tv.version === version);
    }

    // Get all versions of a topic
    getAllTopicVersions(id: string): TopicVersion[] {
        return this.versionStorage.findMany(tv => tv.topicId === id);
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
        this.topicStorage.appendData(topic);
        
        // Create initial version
        const topicVersion = this.topicFactory.createTopicVersion(topic);
        this.versionStorage.appendData(topicVersion);
        
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
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return null;
        }
        
        // Update topic properties
        topic.name = name;
        topic.content = content;
        topic.updatedAt = new Date();
        
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
        this.topicStorage.updateData(t => t.id === id, topic);
        
        // Create a new version
        const newVersion = topic.createNewVersion();
        const topicVersion = this.topicFactory.createTopicVersion(newVersion);
        this.versionStorage.appendData(topicVersion);
        
        return topic;
    }

    // Set a resource for a topic
    setTopicResource(
        id: string, 
        url: string, 
        description: string, 
        type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf'
    ): Topic | null {
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
        
        // Update the topic in storage
        this.topicStorage.updateData(t => t.id === id, topic);
        
        // Create a new version
        const newVersion = topic.createNewVersion();
        const topicVersion = this.topicFactory.createTopicVersion(newVersion);
        this.versionStorage.appendData(topicVersion);
        
        return topic;
    }

    // Remove a resource from a topic
    removeTopicResource(id: string): Topic | null {
        const topic = this.getTopicById(id);
        
        if (!topic || !topic.resource) {
            return null;
        }
        
        topic.removeResource();
        
        // Update the topic in storage
        this.topicStorage.updateData(t => t.id === id, topic);
        
        // Create a new version
        const newVersion = topic.createNewVersion();
        const topicVersion = this.topicFactory.createTopicVersion(newVersion);
        this.versionStorage.appendData(topicVersion);
        
        return topic;
    }

    // Delete a topic and all its versions
    deleteTopic(id: string): boolean {
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return false;
        }
        
        // Remove all versions
        this.versionStorage.deleteData(tv => tv.topicId === id);
        
        // Remove the topic
        this.topicStorage.deleteData(t => t.id === id);
        
        // Remove all child topics recursively
        this.deleteChildTopics(id);
        
        return true;
    }

    // Helper method to delete child topics
    private deleteChildTopics(parentTopicId: string): void {
        const childTopics = this.topicStorage.findMany(t => t.parentTopicId === parentTopicId);
        
        for (const childTopic of childTopics) {
            this.deleteTopic(childTopic.id);
        }
    }

    // Get topic hierarchy using composite pattern
    getTopicHierarchy(id: string): CompositeTopic | null {
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return null;
        }
        
        return this.buildTopicHierarchy(topic);
    }

    // Helper method to build topic hierarchy
    private buildTopicHierarchy(topic: Topic): CompositeTopic {
        const compositeTopic = new CompositeTopic(topic);
        const childTopics = this.topicStorage.findMany(t => t.parentTopicId === topic.id);
        
        for (const childTopic of childTopics) {
            const childCompositeTopic = this.buildTopicHierarchy(childTopic);
            compositeTopic.addChild(childCompositeTopic);
        }
        
        return compositeTopic;
    }
}

// Export singleton instance
export const topicService = new TopicService(); 