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
    name: string;
    content: string;
    parentTopicId: string | null;
    childrenTopics: Topic[];
    parentId: string | null;
    children: Topic[];
    resource: TopicResource | null;

    constructor(
        id: string,
        name: string,
        content: string,
        parentTopicId: string | null = null,
        version: number = 1,
        resource: TopicResource | null = null
    ) {
        super(id, version);
        this.name = name;
        this.content = content;
        this.parentTopicId = parentTopicId;
        this.parentId = parentTopicId; // To satisfy IHierarchical interface
        this.childrenTopics = [];
        this.children = []; // To satisfy IHierarchical interface
        this.resource = resource;
    }

    createNewVersion(): TopicImpl {
        const newTopic = new TopicImpl(
            this.id,
            this.name,
            this.content,
            this.parentTopicId,
            this.version + 1,
            this.resource ? { ...this.resource } : null // Copy resource to the new version if it exists
        );
        return newTopic;
    }

    // Set the resource for the topic
    setResource(resource: TopicResource): void {
        this.resource = resource;
    }

    // Remove the resource from the topic
    removeResource(): void {
        this.resource = null;
    }
}

// Concrete implementation of a topic version
export class TopicVersionImpl implements TopicVersion {
    id: string;
    topicId: string;
    name: string;
    content: string;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    resource: TopicResource | null;

    constructor(
        id: string,
        topicId: string,
        name: string,
        content: string,
        version: number,
        resource: TopicResource | null = null
    ) {
        this.id = id;
        this.topicId = topicId;
        this.name = name;
        this.content = content;
        this.version = version;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.resource = resource;
    }
}

// Concrete implementation of the topic factory
export class TopicFactoryImpl extends TopicFactory {
    createTopic(
        name: string, 
        content: string, 
        parentTopicId: string | null,
        resource: TopicResource | null = null
    ): Topic {
        const id = uuidv4();
        return new TopicImpl(id, name, content, parentTopicId, 1, resource);
    }

    createTopicVersion(
        topicId: string, 
        name: string, 
        content: string, 
        version: number,
        resource: TopicResource | null = null
    ): TopicVersion {
        const id = uuidv4();
        return new TopicVersionImpl(id, topicId, name, content, version, resource);
    }
}

// Concrete implementation of the composite pattern for topics
export class CompositeTopic extends CompositeTopicComponent {
    private topic: Topic;
    private children: CompositeTopicComponent[];

    constructor(topic: Topic) {
        super(topic.id);
        this.topic = topic;
        this.children = [];
    }

    add(component: CompositeTopicComponent): void {
        this.children.push(component);
    }

    remove(componentId: string): void {
        const index = this.children.findIndex(child => child.id === componentId);
        if (index !== -1) {
            this.children.splice(index, 1);
        }
    }

    getChild(componentId: string): CompositeTopicComponent | null {
        return this.children.find(child => child.id === componentId) || null;
    }

    getChildren(): CompositeTopicComponent[] {
        return [...this.children];
    }

    getTopic(): Topic {
        return this.topic;
    }
} 