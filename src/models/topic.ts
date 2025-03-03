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

// Base topic interface
export interface ITopic {
    id: string;
    name: string;
    content: string;
    parentTopicId: string | null;
    version: number;
    createdAt: Date;
    updatedAt: Date;
    resource: TopicResource | null;
    ownerId: string;
}

// Topic interface with methods
export interface Topic extends ITopic {
    createNewVersion(): Topic;
    setResource(resource: TopicResource): void;
    removeResource(): void;
}

// Topic version interface
export interface TopicVersion extends ITopic {
    topicId: string;
}

// Factory pattern for creating topics
export interface TopicFactory {
    createTopic(name: string, content: string, parentTopicId: string | null, ownerId: string, resource?: TopicResource): Topic;
    createTopicVersion(topic: Topic): TopicVersion;
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