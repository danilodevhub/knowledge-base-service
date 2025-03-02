import { 
    Topic, 
    TopicVersion, 
    VersionedEntity, 
    TopicFactory, 
    CompositeTopicComponent 
} from './topic';
import { v4 as uuidv4 } from 'uuid';

// Concrete implementation of a versioned topic
export class TopicImpl extends VersionedEntity implements Topic {
    name: string;
    content: string;
    parentTopicId: string | null;
    childrenTopics: Topic[];
    parentId: string | null;
    children: Topic[];

    constructor(
        id: string,
        name: string,
        content: string,
        parentTopicId: string | null = null,
        version: number = 1
    ) {
        super(id, version);
        this.name = name;
        this.content = content;
        this.parentTopicId = parentTopicId;
        this.parentId = parentTopicId; // To satisfy IHierarchical interface
        this.childrenTopics = [];
        this.children = []; // To satisfy IHierarchical interface
    }

    createNewVersion(): TopicImpl {
        const newTopic = new TopicImpl(
            this.id,
            this.name,
            this.content,
            this.parentTopicId,
            this.version + 1
        );
        return newTopic;
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

    constructor(
        id: string,
        topicId: string,
        name: string,
        content: string,
        version: number
    ) {
        this.id = id;
        this.topicId = topicId;
        this.name = name;
        this.content = content;
        this.version = version;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }
}

// Concrete implementation of the topic factory
export class TopicFactoryImpl extends TopicFactory {
    createTopic(name: string, content: string, parentTopicId: string | null): Topic {
        const id = uuidv4();
        return new TopicImpl(id, name, content, parentTopicId);
    }

    createTopicVersion(topicId: string, name: string, content: string, version: number): TopicVersion {
        const id = uuidv4();
        return new TopicVersionImpl(id, topicId, name, content, version);
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