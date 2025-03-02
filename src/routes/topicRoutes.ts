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
    removeTopicResource
} from '../controllers/topicController';
import { authenticate, authorizeAdmin, authorizeEditorOrAdmin, authorizeUser } from '../middleware/authMiddleware';

const router: Router = express.Router();

// Public routes - no authentication required
// GET all topics
router.get('/', authenticate, authorizeUser, getAllTopics);

// GET a specific topic by ID
router.get('/:id', authenticate, authorizeUser, getTopicById);

// GET all versions of a topic
router.get('/:id/versions', authenticate, authorizeUser, getAllTopicVersions);

// GET a specific version of a topic
router.get('/:id/versions/:version', authenticate, authorizeUser, getTopicVersion);

// GET topic hierarchy
router.get('/:id/hierarchy', authenticate, authorizeUser, getTopicHierarchy);

// POST a new topic - only admin or editor
router.post('/', authenticate, authorizeEditorOrAdmin, createTopic);

// PUT/update a topic - only admin or editor
router.put('/:id', authenticate, authorizeEditorOrAdmin, updateTopic);

// PUT/set resource for a topic - only admin or editor
router.put('/:id/resource', authenticate, authorizeEditorOrAdmin, setTopicResource);

// DELETE resource from a topic - only admin or editor
router.delete('/:id/resource', authenticate, authorizeEditorOrAdmin, removeTopicResource);

// DELETE a topic - only admin
router.delete('/:id', authenticate, authorizeAdmin, deleteTopic);

export default router; 