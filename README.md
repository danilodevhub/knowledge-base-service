# Knowledge Base Service

A RESTful API service for managing topics with versioning support.

## Features

- Create, read, update, and delete topics with version control
- Hierarchical topic organization (parent-child relationships)
- Version history for each topic
- Composite pattern for topic hierarchies
- Factory pattern for creating topics and versions

## Tech Stack

- Node.js
- Express.js
- TypeScript
- RESTful API design
- Design Patterns (Factory, Composite)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd knowledge-base-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Edit the `.env` file to configure your environment.

## Development

Start the development server with hot reloading:
```
npm run dev
```

## Building for Production

Build the TypeScript code:
```
npm run build
```

## Running in Production

```
npm start
```

## API Endpoints

### Topics

- `GET /knowledge-base/topics` - Get all topics (latest versions)
- `GET /knowledge-base/topics/:id` - Get a specific topic by ID (latest version)
- `GET /knowledge-base/topics/:id/versions` - Get all versions of a topic
- `GET /knowledge-base/topics/:id/versions/:version` - Get a specific version of a topic
- `GET /knowledge-base/topics/:id/hierarchy` - Get the topic hierarchy starting from a specific topic
- `POST /knowledge-base/topics` - Create a new topic
- `PUT /knowledge-base/topics/:id` - Update a topic (creates a new version)
- `DELETE /knowledge-base/topics/:id` - Delete a topic and all its versions

### Health Check

- `GET /health` - Check if the service is running

## Request/Response Examples

### Create a Topic

**Request:**
```http
POST /knowledge-base/topics
Content-Type: application/json

{
  "name": "Introduction to TypeScript",
  "content": "TypeScript is a strongly typed programming language that builds on JavaScript...",
  "parentTopicId": null
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Introduction to TypeScript",
  "content": "TypeScript is a strongly typed programming language that builds on JavaScript...",
  "parentTopicId": null,
  "childrenTopics": [],
  "version": 1,
  "createdAt": "2023-08-27T12:00:00.000Z",
  "updatedAt": "2023-08-27T12:00:00.000Z"
}
```

### Update a Topic (Create New Version)

**Request:**
```http
PUT /knowledge-base/topics/123e4567-e89b-12d3-a456-426614174000
Content-Type: application/json

{
  "name": "Introduction to TypeScript",
  "content": "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale..."
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Introduction to TypeScript",
  "content": "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale...",
  "parentTopicId": null,
  "childrenTopics": [],
  "version": 2,
  "createdAt": "2023-08-27T12:00:00.000Z",
  "updatedAt": "2023-08-27T12:30:00.000Z"
}
```

## License

MIT 