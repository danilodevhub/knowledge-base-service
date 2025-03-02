import { 
    Topic, 
    TopicVersion, 
    VersionedEntity, 
    TopicFactory, 
    CompositeTopicComponent 
} from './topic';
import { TopicResource } from './topicResource';
import { v4 as uuidv4 } from 'uuid';

// Concrete implementation of a versioned topic
export class TopicImpl extends VersionedEntity implements Topic {
    id: string;
    title: string;
    description: string;
    parentId: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    childrenTopics: Topic[];
    resource: TopicResource | null;
    ownerId: string;

    constructor(
        id: string,
        title: string,
        description: string,
        parentId: string | null,
        version: number,
        createdAt: Date,
        updatedAt: Date,
        ownerId: string,
        resource: TopicResource | null = null
    ) {
        super(id, version);
        this.id = id;
        this.title = title;
        this.description = description;
        this.parentId = parentId;
        this.version = version;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.childrenTopics = [];
        this.resource = resource;
        this.ownerId = ownerId;
    }

    createNewVersion(): Topic {
        const newTopic = new TopicImpl(
            this.id,
            this.title,
            this.description,
            this.parentId,
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
    title: string;
    description: string;
    parentId: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    resource: TopicResource | null;
    ownerId: string;

    constructor(
        id: string,
        topicId: string,
        title: string,
        description: string,
        parentId: string | null,
        version: number,
        createdAt: Date,
        updatedAt: Date,
        ownerId: string,
        resource: TopicResource | null = null
    ) {
        this.id = id;
        this.topicId = topicId;
        this.title = title;
        this.description = description;
        this.parentId = parentId;
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
        title: string,
        description: string,
        parentId: string | null,
        ownerId: string,
        resource?: TopicResource
    ): Topic {
        return new TopicImpl(
            uuidv4(),
            title,
            description,
            parentId,
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
            topic.title,
            topic.description,
            topic.parentId,
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