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

    // Get all topics (latest versions only)
    getAllTopics(): Topic[] {
        return topics;
    }

    // Get a specific topic by ID (latest version)
    getTopicById(id: string): Topic | null {
        return topics.find(topic => topic.id === id) || null;
    }

    // Get a specific version of a topic
    getTopicVersion(topicId: string, version: number): TopicVersion | null {
        return topicVersions.find(tv => tv.topicId === topicId && tv.version === version) || null;
    }

    // Get all versions of a topic
    getAllTopicVersions(topicId: string): TopicVersion[] {
        return topicVersions.filter(tv => tv.topicId === topicId)
            .sort((a, b) => b.version - a.version); // Sort by version descending
    }

    // Create a new topic
    createTopic(
        name: string, 
        content: string, 
        parentTopicId: string | null = null,
        resourceData?: {
            url: string;
            description: string;
            type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf';
        }
    ): Topic {
        // Create resource if data is provided
        let resource: TopicResource | null = null;
        if (resourceData) {
            resource = {
                id: uuidv4(),
                topicId: '', // Will be set after topic creation
                url: resourceData.url,
                description: resourceData.description,
                type: resourceData.type,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        const newTopic = this.topicFactory.createTopic(name, content, parentTopicId, resource);
        
        // Set the topicId in the resource if it exists
        if (resource) {
            resource.topicId = newTopic.id;
        }
        
        // Create initial version
        const initialVersion = this.topicFactory.createTopicVersion(
            newTopic.id,
            name,
            content,
            1,
            resource
        );
        
        // Add to storage
        topics.push(newTopic);
        topicVersions.push(initialVersion);
        
        // Update parent-child relationship if parent exists
        if (parentTopicId) {
            const parentTopic = this.getTopicById(parentTopicId);
            if (parentTopic) {
                parentTopic.childrenTopics.push(newTopic);
                parentTopic.children.push(newTopic);
            }
        }
        
        return newTopic;
    }

    // Update a topic (creates a new version)
    updateTopic(
        id: string, 
        name: string, 
        content: string,
        resourceData?: {
            url: string;
            description: string;
            type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf';
        }
    ): Topic | null {
        const existingTopic = this.getTopicById(id);
        if (!existingTopic) {
            return null;
        }

        // Update the topic
        existingTopic.name = name;
        existingTopic.content = content;
        existingTopic.updatedAt = new Date();
        existingTopic.version += 1;

        // Update or create resource if data is provided
        if (resourceData) {
            if (existingTopic.resource) {
                // Update existing resource
                existingTopic.resource.url = resourceData.url;
                existingTopic.resource.description = resourceData.description;
                existingTopic.resource.type = resourceData.type;
                existingTopic.resource.updatedAt = new Date();
            } else {
                // Create new resource
                existingTopic.resource = {
                    id: uuidv4(),
                    topicId: existingTopic.id,
                    url: resourceData.url,
                    description: resourceData.description,
                    type: resourceData.type,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }
        }

        // Create a new version record
        const newVersion = this.topicFactory.createTopicVersion(
            id,
            name,
            content,
            existingTopic.version,
            existingTopic.resource ? { ...existingTopic.resource } : null
        );
        
        // Add to versions storage
        topicVersions.push(newVersion);
        
        return existingTopic;
    }

    // Add or update a resource for a topic
    setTopicResource(
        topicId: string,
        url: string,
        description: string,
        type: 'video' | 'article' | 'podcast' | 'audio' | 'image' | 'pdf'
    ): Topic | null {
        const topic = this.getTopicById(topicId);
        if (!topic) {
            return null;
        }

        // Create or update the resource
        if (topic.resource) {
            // Update existing resource
            topic.resource.url = url;
            topic.resource.description = description;
            topic.resource.type = type;
            topic.resource.updatedAt = new Date();
        } else {
            // Create new resource
            topic.resource = {
                id: uuidv4(),
                topicId,
                url,
                description,
                type,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        }

        topic.updatedAt = new Date();
        return topic;
    }

    // Remove a resource from a topic
    removeTopicResource(topicId: string): Topic | null {
        const topic = this.getTopicById(topicId);
        if (!topic || !topic.resource) {
            return null;
        }

        // Remove the resource
        topic.resource = null;
        topic.updatedAt = new Date();

        return topic;
    }

    // Delete a topic and all its versions
    deleteTopic(id: string): boolean {
        const topicIndex = topics.findIndex(topic => topic.id === id);
        if (topicIndex === -1) {
            return false;
        }

        // Remove from parent's children if it has a parent
        const topic = topics[topicIndex];
        if (topic.parentTopicId) {
            const parentTopic = this.getTopicById(topic.parentTopicId);
            if (parentTopic) {
                parentTopic.childrenTopics = parentTopic.childrenTopics.filter(
                    child => child.id !== id
                );
                parentTopic.children = parentTopic.children.filter(
                    child => child.id !== id
                );
            }
        }

        // Remove all child topics recursively
        this.deleteChildTopics(id);

        // Remove the topic
        topics.splice(topicIndex, 1);
        
        // Remove all versions of this topic
        topicVersions = topicVersions.filter(tv => tv.topicId !== id);
        
        return true;
    }

    // Helper method to recursively delete child topics
    private deleteChildTopics(parentId: string): void {
        const childTopics = topics.filter(topic => topic.parentTopicId === parentId);
        
        for (const childTopic of childTopics) {
            this.deleteChildTopics(childTopic.id);
            
            // Remove the child topic
            const childIndex = topics.findIndex(t => t.id === childTopic.id);
            if (childIndex !== -1) {
                topics.splice(childIndex, 1);
            }
            
            // Remove all versions of this child topic
            topicVersions = topicVersions.filter(tv => tv.topicId !== childTopic.id);
        }
    }

    // Get topic hierarchy (composite pattern)
    getTopicHierarchy(rootTopicId: string): CompositeTopic | null {
        const rootTopic = this.getTopicById(rootTopicId);
        if (!rootTopic) {
            return null;
        }

        return this.buildTopicHierarchy(rootTopic);
    }

    // Helper method to build topic hierarchy recursively
    private buildTopicHierarchy(topic: Topic): CompositeTopic {
        const compositeTopic = new CompositeTopic(topic);
        
        for (const childTopic of topic.childrenTopics) {
            const childCompositeTopic = this.buildTopicHierarchy(childTopic);
            compositeTopic.add(childCompositeTopic);
        }
        
        return compositeTopic;
    }
} 