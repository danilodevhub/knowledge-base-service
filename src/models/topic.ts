// Base interfaces
export interface IEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface IVersionable extends IEntity {
    version: number;
}

export interface IHierarchical<T> {
    parentId: string | null;
    children: T[];
}

// Import TopicResource interface
import { TopicResource } from './topicResource';

// Topic interfaces
export interface ITopic extends IVersionable, IHierarchical<ITopic> {
    name: string;
    content: string;
    resource: TopicResource | null; // Changed from resources array to single resource
}

// Concrete implementation
export interface Topic extends ITopic {
    id: string;
    name: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;
    parentTopicId: string | null;
    childrenTopics: Topic[];
    resource: TopicResource | null; // Changed from resources array to single resource
}

// Topic version interface
export interface TopicVersion extends IEntity {
    topicId: string;
    name: string;
    content: string;
    version: number;
    resource: TopicResource | null; // Changed from resources array to single resource
}

// Abstract classes for implementing design patterns
export abstract class VersionedEntity implements IVersionable {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    version: number;

    constructor(id: string, version: number = 1) {
        this.id = id;
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.version = version;
    }

    abstract createNewVersion(): VersionedEntity;
}

// Factory pattern for creating topics
export abstract class TopicFactory {
    abstract createTopic(name: string, content: string, parentTopicId: string | null, resource?: TopicResource | null): Topic;
    abstract createTopicVersion(topicId: string, name: string, content: string, version: number, resource?: TopicResource | null): TopicVersion;
}

// Composite pattern for hierarchical topics
export abstract class CompositeTopicComponent implements IEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(id: string) {
        this.id = id;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    abstract add(component: CompositeTopicComponent): void;
    abstract remove(componentId: string): void;
    abstract getChild(componentId: string): CompositeTopicComponent | null;
    abstract getChildren(): CompositeTopicComponent[];
}