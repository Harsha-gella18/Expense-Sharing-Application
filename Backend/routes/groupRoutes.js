const express = require('express');
const { body } = require('express-validator');
const groupController = require('../controllers/groupController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create group
router.post('/',
  [
    body('name').trim().notEmpty().withMessage('Group name is required')
  ],
  groupController.createGroup
);

// Request to join group
router.post('/join',
  [
    body('joinCode').isInt().withMessage('Valid join code is required')
  ],
  groupController.joinGroup
);

// Get user's groups
router.get('/', groupController.getUserGroups);

// Get group by ID
router.get('/:groupId', groupController.getGroupById);

// Get pending join requests for a group
router.get('/:groupId/join-requests', groupController.getJoinRequests);

// Respond to join request
router.post('/:groupId/join-requests/:requestId/respond',
  [
    body('action').isIn(['ACCEPT', 'REJECT']).withMessage('Action must be ACCEPT or REJECT')
  ],
  groupController.respondToJoinRequest
);

module.exports = router;
