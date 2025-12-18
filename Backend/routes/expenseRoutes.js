const express = require('express');
const { body } = require('express-validator');
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Create expense in a group
router.post('/groups/:groupId/expenses',
  [
    body('description').trim().notEmpty().withMessage('Description is required'),
    body('totalAmount').isFloat({ min: 0 }).withMessage('Valid total amount is required'),
    body('paidBy').notEmpty().withMessage('Paid by user is required'),
    body('splitType').isIn(['EQUAL', 'EXACT', 'PERCENTAGE']).withMessage('Invalid split type'),
    body('splitDetails').isArray({ min: 1 }).withMessage('Split details must be a non-empty array')
  ],
  expenseController.createExpense
);

// Respond to expense (accept/reject)
router.post('/expenses/:expenseId/respond',
  [
    body('action').isIn(['ACCEPT', 'REJECT']).withMessage('Action must be ACCEPT or REJECT')
  ],
  expenseController.respondToExpense
);

// Get group expenses
router.get('/groups/:groupId/expenses', expenseController.getGroupExpenses);

module.exports = router;
