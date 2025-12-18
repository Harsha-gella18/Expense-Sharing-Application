const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Expense = require('../models/Expense');
const ExpenseApproval = require('../models/ExpenseApproval');
const Group = require('../models/Group');
const {
  calculateSplitAmounts,
  validateSplitDetails,
  updateBalances
} = require('../services/expenseService');

// Create expense
exports.createExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { description, totalAmount, paidBy, splitType, splitDetails } = req.body;
    const userId = req.userId;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only group members can create expenses' });
    }

    // Validate that paidBy is a group member
    const isPaidByMember = group.members.some(
      member => member.userId.toString() === paidBy
    );
    if (!isPaidByMember) {
      return res.status(400).json({ error: 'Paid by user must be a group member' });
    }

    // Validate split details
    const validation = validateSplitDetails(totalAmount, splitType, splitDetails);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Extract participants from split details
    const participants = splitDetails.map(detail => detail.userId);

    // Create expense
    const expense = new Expense({
      groupId,
      description,
      totalAmount,
      paidBy,
      splitType,
      splitDetails,
      participants,
      createdBy: userId
    });

    await expense.save();

    // Create approval records for all participants except creator (optional)
    // In this implementation, creator auto-approves
    const approvalPromises = participants.map(participantId => {
      const approval = new ExpenseApproval({
        expenseId: expense._id,
        userId: participantId,
        status: participantId === userId ? 'ACCEPTED' : 'PENDING'
      });
      if (participantId === userId) {
        approval.respondedAt = new Date();
      }
      return approval.save();
    });

    await Promise.all(approvalPromises);

    res.status(201).json({
      message: 'Expense created successfully',
      expense: {
        id: expense._id,
        description: expense.description,
        totalAmount: expense.totalAmount,
        status: expense.status,
        createdAt: expense.createdAt
      }
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Server error creating expense' });
  }
};

// Respond to expense (accept/reject)
exports.respondToExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { expenseId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.userId;

    // Find expense
    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    if (expense.status !== 'PENDING') {
      return res.status(400).json({ error: 'Expense is not pending' });
    }

    // Check if user is a participant
    const isParticipant = expense.participants.some(
      p => p.toString() === userId
    );
    if (!isParticipant) {
      return res.status(403).json({ error: 'Only participants can respond to this expense' });
    }

    // Find approval record
    const approval = await ExpenseApproval.findOne({
      expenseId,
      userId
    });

    if (!approval) {
      return res.status(404).json({ error: 'Approval record not found' });
    }

    if (approval.status !== 'PENDING') {
      return res.status(400).json({ error: 'You have already responded to this expense' });
    }

    // Update approval
    if (action === 'ACCEPT') {
      approval.status = 'ACCEPTED';
      approval.respondedAt = new Date();
      await approval.save();

      // Check if all participants have accepted
      const allApprovals = await ExpenseApproval.find({ expenseId });
      const allAccepted = allApprovals.every(a => a.status === 'ACCEPTED');

      if (allAccepted) {
        // Update expense status
        expense.status = 'APPROVED';
        await expense.save();

        // Calculate split amounts
        console.log('Calculating split amounts for expense:', expense._id);
        console.log('Total amount:', expense.totalAmount);
        console.log('Split type:', expense.splitType);
        console.log('Split details:', JSON.stringify(expense.splitDetails));
        
        const splitAmounts = calculateSplitAmounts(
          expense.totalAmount,
          expense.splitType,
          expense.splitDetails
        );

        console.log('Calculated split amounts:', splitAmounts);
        console.log('Paid by:', expense.paidBy);

        // Update balances
        await updateBalances(expense.groupId, expense.paidBy, splitAmounts);

        return res.json({
          message: 'Expense accepted and approved. Balances updated.',
          expense: {
            id: expense._id,
            status: expense.status
          }
        });
      }

      res.json({
        message: 'Expense accepted. Waiting for other participants.',
        expense: {
          id: expense._id,
          status: expense.status
        }
      });
    } else if (action === 'REJECT') {
      approval.status = 'REJECTED';
      approval.respondedAt = new Date();
      await approval.save();

      // Update expense status
      expense.status = 'REJECTED';
      await expense.save();

      res.json({
        message: 'Expense rejected',
        expense: {
          id: expense._id,
          status: expense.status
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ACCEPT or REJECT' });
    }
  } catch (error) {
    console.error('Respond to expense error:', error);
    res.status(500).json({ error: 'Server error responding to expense' });
  }
};

// Get group expenses
exports.getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    // Verify user is a group member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only group members can view expenses' });
    }

    // Get expenses
    const expenses = await Expense.find({ groupId })
      .populate('paidBy', 'username email')
      .populate('createdBy', 'username email')
      .populate('splitDetails.userId', 'username email')
      .sort({ createdAt: -1 });

    // Get approval status for each expense
    const expensesWithApprovals = await Promise.all(
      expenses.map(async expense => {
        const approvals = await ExpenseApproval.find({ expenseId: expense._id })
          .populate('userId', 'username email');
        
        return {
          ...expense.toObject(),
          approvals
        };
      })
    );

    res.json({ expenses: expensesWithApprovals });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Server error fetching expenses' });
  }
};
