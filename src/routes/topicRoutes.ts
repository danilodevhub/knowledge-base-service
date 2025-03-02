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

const router: Router = express.Router();

// GET all topics
router.get('/', getAllTopics);

// GET a specific topic by ID
router.get('/:id', getTopicById);

// GET all versions of a topic
router.get('/:id/versions', getAllTopicVersions);

// GET a specific version of a topic
router.get('/:id/versions/:version', getTopicVersion);

// GET topic hierarchy
router.get('/:id/hierarchy', getTopicHierarchy);

// POST a new topic
router.post('/', createTopic);

// PUT/update a topic (creates a new version)
router.put('/:id', updateTopic);

// PUT/set resource for a topic
router.put('/:id/resource', setTopicResource);

// DELETE resource from a topic
router.delete('/:id/resource', removeTopicResource);

// DELETE a topic
router.delete('/:id', deleteTopic);

export default router; 