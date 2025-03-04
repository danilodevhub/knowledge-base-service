import { 
    Topic, 
    TopicVersion, 
    VersionedEntity, 
    TopicFactory
} from './topic';
import { TopicResource } from './topicResource';
import { v4 as uuidv4 } from 'uuid';

// Concrete implementation of a versioned topic
export class TopicImpl extends VersionedEntity implements Topic {
    id: string;
    name: string;
    content: string;
    parentTopicId: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;    
    resource: TopicResource | null;
    ownerId: string;

    constructor(
        id: string,
        name: string,
        content: string,
        parentTopicId: string | null,
        version: number,
        createdAt: Date,
        updatedAt: Date,
        ownerId: string,
        resource: TopicResource | null = null
    ) {
        super(id, version);
        this.id = id;
        this.name = name;
        this.content = content;
        this.parentTopicId = parentTopicId;
        this.version = version;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;        
        this.resource = resource;
        this.ownerId = ownerId;
    }

    createNewVersion(): Topic {
        const newTopic = new TopicImpl(
            this.id,
            this.name,
            this.content,
            this.parentTopicId,
            this.version + 1,
            this.createdAt,
            new Date(),
            this.ownerId,
            this.resource
        );
        return newTopic;
    }

    // Set the resource for the topic
    setResource(resource: TopicResource): void {
        this.resource = resource;
        this.updatedAt = new Date();
    }

    // Remove the resource from the topic
    removeResource(): void {
        this.resource = null;
        this.updatedAt = new Date();
    }
}

// Concrete implementation of a topic version
export class TopicVersionImpl implements TopicVersion {
    id: string;
    topicId: string;
    name: string;
    content: string;
    parentTopicId: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    resource: TopicResource | null;
    ownerId: string;

    constructor(
        id: string,
        topicId: string,
        name: string,
        content: string,
        parentTopicId: string | null,
        version: number,
        createdAt: Date,
        updatedAt: Date,
        ownerId: string,
        resource: TopicResource | null = null
    ) {
        this.id = id;
        this.topicId = topicId;
        this.name = name;
        this.content = content;
        this.parentTopicId = parentTopicId;
        this.version = version;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.resource = resource;
        this.ownerId = ownerId;
    }
}

// Concrete implementation of the topic factory
export class TopicFactoryImpl implements TopicFactory {
    createTopic(
        name: string,
        content: string,
        parentTopicId: string | null,
        ownerId: string,
        resource?: TopicResource
    ): Topic {
        return new TopicImpl(
            uuidv4(),
            name,
            content,
            parentTopicId,
            1,
            new Date(),
            new Date(),
            ownerId,
            resource || null
        );
    }

    createTopicVersion(topic: Topic): TopicVersion {
        return new TopicVersionImpl(
            uuidv4(),
            topic.id,
            topic.name,
            topic.content,
            topic.parentTopicId,
            topic.version,
            topic.createdAt,
            topic.updatedAt,
            topic.ownerId,
            topic.resource
        );
    }
}

// Composite pattern for topic hierarchy
export class CompositeTopic {
    topic: Topic;
    children: CompositeTopic[];

    constructor(topic: Topic) {
        this.topic = topic;
        this.children = [];
    }

    addChild(child: CompositeTopic): void {
        this.children.push(child);
    }
} 