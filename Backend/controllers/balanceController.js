const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Balance = require('../models/Balance');
const Settlement = require('../models/Settlement');
const Group = require('../models/Group');
const { updateBalanceBetweenUsers } = require('../services/expenseService');

// Get group balances
exports.getGroupBalances = async (req, res) => {
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
      return res.status(403).json({ error: 'Only group members can view balances' });
    }

    // Get all balances
    const balances = await Balance.find({ groupId })
      .populate('fromUser', 'username email')
      .populate('toUser', 'username email')
      .sort({ updatedAt: -1 });

    res.json({ balances });
  } catch (error) {
    console.error('Get balances error:', error);
    res.status(500).json({ error: 'Server error fetching balances' });
  }
};

// Settle balance
exports.settleBalance = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { toUser, amount } = req.body;
    const fromUser = req.userId;

    // Verify group exists and user is a member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === fromUser
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only group members can settle balances' });
    }

    // Verify toUser is a member
    const isToUserMember = group.members.some(
      member => member.userId.toString() === toUser
    );
    if (!isToUserMember) {
      return res.status(400).json({ error: 'Target user must be a group member' });
    }

    // Find existing balance
    const balance = await Balance.findOne({
      groupId,
      fromUser,
      toUser
    });

    if (!balance) {
      return res.status(404).json({ error: 'No balance found between these users' });
    }

    if (amount > balance.amount) {
      return res.status(400).json({ error: 'Settlement amount exceeds balance' });
    }

    // Create settlement record with PENDING status
    const settlement = new Settlement({
      groupId,
      fromUser,
      toUser,
      amount,
      status: 'PENDING'
    });
    await settlement.save();

    res.json({
      message: 'Settlement request sent. Waiting for approval from the recipient.',
      settlement: {
        id: settlement._id,
        amount: settlement.amount,
        status: settlement.status,
        createdAt: settlement.createdAt
      }
    });
  } catch (error) {
    console.error('Settle balance error:', error);
    res.status(500).json({ error: 'Server error settling balance' });
  }
};

// Get group settlements
exports.getGroupSettlements = async (req, res) => {
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
      return res.status(403).json({ error: 'Only group members can view settlements' });
    }

    // Get all settlements for this group
    const settlements = await Settlement.find({ groupId })
      .populate('fromUser', 'username email')
      .populate('toUser', 'username email')
      .sort({ createdAt: -1 });

    res.json({ settlements });
  } catch (error) {
    console.error('Get settlements error:', error);
    res.status(500).json({ error: 'Server error fetching settlements' });
  }
};

// Respond to settlement (accept/reject)
exports.respondToSettlement = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { settlementId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.userId;

    // Find settlement
    const settlement = await Settlement.findById(settlementId);
    if (!settlement) {
      return res.status(404).json({ error: 'Settlement not found' });
    }

    // Verify user is the recipient (toUser)
    if (settlement.toUser.toString() !== userId) {
      return res.status(403).json({ error: 'Only the recipient can respond to this settlement' });
    }

    if (settlement.status !== 'PENDING') {
      return res.status(400).json({ error: 'This settlement has already been processed' });
    }

    if (action === 'ACCEPT') {
      settlement.status = 'ACCEPTED';
      settlement.respondedAt = new Date();
      await settlement.save();

      // Update balance - reduce the debt
      const balance = await Balance.findOne({
        groupId: settlement.groupId,
        fromUser: settlement.fromUser,
        toUser: settlement.toUser
      });

      if (balance) {
        balance.amount -= settlement.amount;
        balance.updatedAt = new Date();
        
        if (balance.amount <= 0.01) {
          await Balance.deleteOne({ _id: balance._id });
        } else {
          await balance.save();
        }
      }

      res.json({
        message: 'Settlement accepted. Balance updated.',
        settlement: {
          id: settlement._id,
          status: settlement.status
        }
      });
    } else if (action === 'REJECT') {
      settlement.status = 'REJECTED';
      settlement.respondedAt = new Date();
      await settlement.save();

      res.json({
        message: 'Settlement rejected',
        settlement: {
          id: settlement._id,
          status: settlement.status
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ACCEPT or REJECT' });
    }
  } catch (error) {
    console.error('Respond to settlement error:', error);
    res.status(500).json({ error: 'Server error responding to settlement' });
  }
};
