import express, { Router } from 'express';

import {
  getAllTopics,
  getTopicById,
  getTopicVersion,
  getAllTopicVersions,
  createTopic,
  updateTopic,
  deleteTopic,
  getTopicHierarchy,
  setTopicResource,
  removeTopicResource,
  getShortestPath,
  getLowestCommonAncestor,
} from '../controllers/topicController';
import {
  authenticate,
  authorizeTopicRead,
  authorizeTopicCreate,
  authorizeTopicUpdate,
  authorizeTopicDelete,
} from '../middleware/authMiddleware';

const router: Router = express.Router();

// Public routes - no authentication required
// GET all topics
router.get('/', authenticate, authorizeTopicRead, getAllTopics);

// GET a specific topic by ID
router.get('/:id', authenticate, authorizeTopicRead, getTopicById);

// GET all versions of a topic
router.get('/:id/versions', authenticate, authorizeTopicRead, getAllTopicVersions);

// GET a specific version of a topic
router.get('/:id/versions/:version', authenticate, authorizeTopicRead, getTopicVersion);

// GET topic hierarchy
router.get('/:id/hierarchy', authenticate, authorizeTopicRead, getTopicHierarchy);

// GET shortest path between topics
router.get('/path/:fromId/:toId', authenticate, authorizeTopicRead, getShortestPath);

// GET lowest common ancestor of two topics
router.get(
  '/ancestor/:topicId1/:topicId2',
  authenticate,
  authorizeTopicRead,
  getLowestCommonAncestor,
);

// Protected routes - authentication and authorization required
// POST a new topic
router.post('/', authenticate, authorizeTopicCreate, createTopic);

// PUT update a topic
router.put('/:id', authenticate, authorizeTopicUpdate, updateTopic);

// PUT set a resource for a topic
router.put('/:id/resource', authenticate, authorizeTopicUpdate, setTopicResource);

// DELETE a resource from a topic
router.delete('/:id/resource', authenticate, authorizeTopicUpdate, removeTopicResource);

// DELETE a topic
router.delete('/:id', authenticate, authorizeTopicDelete, deleteTopic);

export default router;
