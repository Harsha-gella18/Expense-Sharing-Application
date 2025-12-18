const express = require('express');
const { body } = require('express-validator');
const balanceController = require('../controllers/balanceController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get group balances
router.get('/groups/:groupId/balances', balanceController.getGroupBalances);

// Get group settlements
router.get('/groups/:groupId/settlements', balanceController.getGroupSettlements);

// Settle balance
router.post('/groups/:groupId/settle',
  [
    body('toUser').notEmpty().withMessage('To user is required'),
    body('amount').isFloat({ min: 0 }).withMessage('Valid amount is required')
  ],
  balanceController.settleBalance
);

// Respond to settlement
router.post('/settlements/:settlementId/respond',
  [
    body('action').isIn(['ACCEPT', 'REJECT']).withMessage('Action must be ACCEPT or REJECT')
  ],
  balanceController.respondToSettlement
);

module.exports = router;
