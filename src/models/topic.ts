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

// Topic interfaces
export interface ITopic extends IVersionable, IHierarchical<ITopic> {
    name: string;
    content: string;
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
}

// Topic version interface
export interface TopicVersion extends IEntity {
    topicId: string;
    name: string;
    content: string;
    version: number;
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
    abstract createTopic(name: string, content: string, parentTopicId: string | null): Topic;
    abstract createTopicVersion(topicId: string, name: string, content: string, version: number): TopicVersion;
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