import { Topic, TopicVersion } from '../models/topic';
import { TopicImpl, TopicVersionImpl, TopicFactoryImpl, CompositeTopic } from '../models/topicImpl';
import { TopicResource } from '../models/topicResource';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage (replace with database in production)
let topics: Topic[] = [];
let topicVersions: TopicVersion[] = [];

export class TopicService {
    private topicFactory: TopicFactoryImpl;

    constructor() {
        this.topicFactory = new TopicFactoryImpl();
    }

    // Get all topics (latest versions)
    getAllTopics(): Topic[] {
        return topics;
    }

    // Get a specific topic by ID (latest version)
    getTopicById(id: string): Topic | null {
        return topics.find(topic => topic.id === id) || null;
    }

    // Get a specific version of a topic
    getTopicVersion(id: string, version: number): TopicVersion | null {
        return topicVersions.find(tv => tv.topicId === id && tv.version === version) || null;
    }

    // Get all versions of a topic
    getAllTopicVersions(id: string): TopicVersion[] {
        return topicVersions.filter(tv => tv.topicId === id);
    }

    // Create a new topic
    createTopic(
        title: string, 
        description: string, 
        parentId: string | null,
        ownerId: string,
        resourceData?: { url: string, description: string, type: string }
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
        const topic = this.topicFactory.createTopic(title, description, parentId, ownerId, resource);
        
        // Set the topicId on the resource if it exists
        if (resource) {
            resource.topicId = topic.id;
        }
        
        // Store the topic
        topics.push(topic);
        
        // Create initial version
        const topicVersion = this.topicFactory.createTopicVersion(topic);
        topicVersions.push(topicVersion);
        
        return topic;
    }

    // Update a topic (creates a new version)
    updateTopic(
        id: string, 
        title: string, 
        description: string,
        resourceData?: { url: string, description: string, type: string }
    ): Topic | null {
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return null;
        }
        
        // Update topic properties
        topic.title = title;
        topic.description = description;
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
        
        // Create a new version
        const newVersion = topic.createNewVersion();
        const topicVersion = this.topicFactory.createTopicVersion(newVersion);
        topicVersions.push(topicVersion);
        
        return topic;
    }

    // Set a resource for a topic
    setTopicResource(
        id: string, 
        url: string, 
        description: string, 
        type: string
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
        
        // Create a new version
        const newVersion = topic.createNewVersion();
        const topicVersion = this.topicFactory.createTopicVersion(newVersion);
        topicVersions.push(topicVersion);
        
        return topic;
    }

    // Remove a resource from a topic
    removeTopicResource(id: string): Topic | null {
        const topic = this.getTopicById(id);
        
        if (!topic || !topic.resource) {
            return null;
        }
        
        topic.removeResource();
        
        // Create a new version
        const newVersion = topic.createNewVersion();
        const topicVersion = this.topicFactory.createTopicVersion(newVersion);
        topicVersions.push(topicVersion);
        
        return topic;
    }

    // Delete a topic and all its versions
    deleteTopic(id: string): boolean {
        const topic = this.getTopicById(id);
        
        if (!topic) {
            return false;
        }
        
        // Remove all versions
        topicVersions = topicVersions.filter(tv => tv.topicId !== id);
        
        // Remove the topic
        topics = topics.filter(t => t.id !== id);
        
        // Remove all child topics recursively
        this.deleteChildTopics(id);
        
        return true;
    }

    // Helper method to delete child topics
    private deleteChildTopics(parentId: string): void {
        const childTopics = topics.filter(t => t.parentId === parentId);
        
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
        const childTopics = topics.filter(t => t.parentId === topic.id);
        
        for (const childTopic of childTopics) {
            const childCompositeTopic = this.buildTopicHierarchy(childTopic);
            compositeTopic.addChild(childCompositeTopic);
        }
        
        return compositeTopic;
    }
}

// Export singleton instance
export const topicService = new TopicService(); 