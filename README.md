# Knowledge Base Service

A RESTful API service for managing topics with versioning support and hierarchical organization.

## Features

- Create, read, update, and delete topics with version control
- Hierarchical topic organization (parent-child relationships)
- Version history for each topic
- Resource attachments (video, article, podcast, audio, image, pdf)
- Find shortest path between topics in the hierarchy (comming soon)
- Role-based access control (admin, editor, viewer)
- Cascade delete support for hierarchical topics

## Tech Stack

- Node.js (v16 or higher recommended)
- Express.js
- TypeScript
- RESTful API design
- Design Patterns:
  - Singleton (Services)
  - Factory (DAO creation)
  - Strategy (Permissions)
  - Composite (Topic hierarchy)
  - DAO & Repository (Data access)
  - Service Layer
  - Observer (Middleware)
  - Builder (Topic creation)
  - Version Control
  - MVC
  - Error Handler
  - Dependency Injection (manual)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up environment variables:
   ```
   cp .env.example .env
   ```
   Required environment variables:
   - `PORT`: Server port (default: 3000)
   - `NODE_ENV`: Environment (development/production)
   - `STORAGE_PATH`: Path for JSON storage files

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

## Running Tests

To run the tests, use the following commands:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (useful during development)
npm run test:watch
```

## Authentication

This service uses role-based access control with the following roles:
- Admin: Full access to all operations
- Editor: Can create, edit, and manage resources
- Viewer: Read-only access

Authentication is implemented via middleware that checks user roles and ownership.

## API Endpoints

### Topics

#### Basic CRUD Operations
- `GET /topics` - Get all topics (latest versions)
- `GET /topics/:id` - Get a specific topic by ID (latest version)
- `POST /topics` - Create a new topic
- `PUT /topics/:id` - Update a topic (creates a new version)
- `DELETE /topics/:id` - Delete a topic (add ?cascade=true to delete children)

#### Version Control
- `GET /topics/:id/versions` - Get all versions of a topic
- `GET /topics/:id/versions/:version` - Get a specific version of a topic

#### Hierarchy Operations
- `GET /topics/:id/hierarchy` - Get the topic hierarchy starting from a specific topic
- `GET /topics/path/:fromId/:toId` - Find shortest path between two topics
- `GET /topics/ancestor/:topicId1/:topicId2` - Find lowest common ancestor of two topics

### Topic Resources
- `PUT /topics/:id/resource` - Set a resource for a topic
- `DELETE /topics/:id/resource` - Remove a resource from a topic

### Health Check
- `GET /health` - Check if the service is running

## Request/Response Examples

### Create a Topic

**Request:**
```http
POST /topics
Content-Type: application/json

{
  "name": "Introduction to Soccer",
  "content": "Soccer is the world's most popular sport...",
  "parentTopicId": null,
  "resource": {
    "url": "https://example.com/soccer-intro",
    "description": "Comprehensive guide to soccer",
    "type": "article"
  }
}
```

**Response:**
```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "name": "Introduction to Soccer",
  "content": "Soccer is the world's most popular sport...",
  "parentTopicId": null,
  "version": 1,
  "ownerId": "user123",
  "createdAt": "2023-08-27T12:00:00.000Z",
  "updatedAt": "2023-08-27T12:00:00.000Z",
  "resource": {
    "id": "res123",
    "url": "https://example.com/soccer-intro",
    "description": "Comprehensive guide to soccer",
    "type": "article",
    "topicId": "123e4567-e89b-12d3-a456-426614174000"
  }
}
```

### Find Shortest Path

**Request:**
```http
GET /topics/path/123e4567-e89b-12d3-a456-426614174000/987fcdeb-a89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "path": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Introduction to Soccer",
      "version": 1
    },
    {
      "id": "456e4567-e89b-12d3-a456-426614174000",
      "name": "Soccer Rules",
      "version": 1
    },
    {
      "id": "987fcdeb-a89b-12d3-a456-426614174000",
      "name": "Offside Rule",
      "version": 1
    }
  ],
  "distance": 2
}
```

### Find Lowest Common Ancestor

**Request:**
```http
GET /topics/ancestor/123e4567-e89b-12d3-a456-426614174000/987fcdeb-a89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "ancestor": {
    "id": "456e4567-e89b-12d3-a456-426614174000",
    "name": "Soccer Rules",
    "version": 1
  },
  "distanceToFirst": 1,
  "distanceToSecond": 1
}
```

### Error Responses

```json
// 404 Not Found (Path not found)
{
  "message": "No path found between topics"
}

// 404 Not Found (Topic not found)
{
  "message": "Topic not found"
}

// 400 Bad Request (Same topic)
{
  "message": "Source and target topics must be different"
}

// 403 Forbidden
{
  "message": "You do not have permission to update this topic",
  "details": {
    "role": "viewer",
    "isOwner": false
  }
}

// 409 Conflict (Delete with children)
{
  "error": "Cannot delete topic with 2 child topics. Use cascade=true to delete all children."
}
```

### Resource Types

Valid resource types:
- video
- article
- podcast
- audio
- image
- pdf

## Testing with Postman

### Setup

1. Download the Postman collection:
   ```
   /postman/Knowledge-Base-Service.postman_collection.json
   ```

2. Import the collection into Postman:
   - Open Postman
   - Click "Import" button
   - Choose the downloaded collection file
   - Select the imported "Knowledge Base Service" collection

## License

MIT
