const mongoose = require('mongoose');
const Balance = require('../models/Balance');

/**
 * Calculate split amounts based on split type
 */
const calculateSplitAmounts = (totalAmount, splitType, splitDetails) => {
  const amounts = {};

  if (splitType === 'EQUAL') {
    const perPersonAmount = totalAmount / splitDetails.length;
    splitDetails.forEach(detail => {
      const userId = typeof detail.userId === 'string' ? detail.userId : detail.userId.toString();
      amounts[userId] = perPersonAmount;
    });
  } else if (splitType === 'EXACT') {
    splitDetails.forEach(detail => {
      const userId = typeof detail.userId === 'string' ? detail.userId : detail.userId.toString();
      amounts[userId] = detail.value;
    });
  } else if (splitType === 'PERCENTAGE') {
    splitDetails.forEach(detail => {
      const userId = typeof detail.userId === 'string' ? detail.userId : detail.userId.toString();
      amounts[userId] = (detail.value / 100) * totalAmount;
    });
  }

  return amounts;
};

/**
 * Validate split details
 */
const validateSplitDetails = (totalAmount, splitType, splitDetails) => {
  if (splitType === 'EXACT') {
    const sum = splitDetails.reduce((acc, detail) => acc + detail.value, 0);
    if (Math.abs(sum - totalAmount) > 0.01) {
      return { valid: false, error: 'Sum of exact amounts must equal total amount' };
    }
  } else if (splitType === 'PERCENTAGE') {
    const sum = splitDetails.reduce((acc, detail) => acc + detail.value, 0);
    if (Math.abs(sum - 100) > 0.01) {
      return { valid: false, error: 'Sum of percentages must equal 100' };
    }
  }

  return { valid: true };
};

/**
 * Update balances after expense approval
 */
const updateBalances = async (groupId, paidBy, splitAmounts) => {
  const paidById = typeof paidBy === 'string' ? paidBy : paidBy.toString();

  // For each participant who owes money
  for (const [userId, amount] of Object.entries(splitAmounts)) {
    if (userId === paidById) {
      continue; // Skip the person who paid
    }

    // Update balance: userId owes paidBy
    await updateBalanceBetweenUsers(groupId, userId, paidById, amount);
  }
};

/**
 * Update balance between two users
 */
const updateBalanceBetweenUsers = async (groupId, fromUserId, toUserId, amount, session = null) => {
  // Check if there's an existing balance from->to
  const query = { groupId, fromUser: fromUserId, toUser: toUserId };
  let balance = session 
    ? await Balance.findOne(query).session(session)
    : await Balance.findOne(query);

  // Check if there's a reverse balance to->from
  const reverseQuery = { groupId, fromUser: toUserId, toUser: fromUserId };
  let reverseBalance = session
    ? await Balance.findOne(reverseQuery).session(session)
    : await Balance.findOne(reverseQuery);

  if (balance) {
    // Add to existing balance
    balance.amount += amount;
    balance.updatedAt = new Date();
    if (session) {
      await balance.save({ session });
    } else {
      await balance.save();
    }
  } else if (reverseBalance) {
    // Subtract from reverse balance
    if (reverseBalance.amount > amount) {
      reverseBalance.amount -= amount;
      reverseBalance.updatedAt = new Date();
      if (session) {
        await reverseBalance.save({ session });
      } else {
        await reverseBalance.save();
      }
    } else if (reverseBalance.amount < amount) {
      // Reverse and create new balance
      const diff = amount - reverseBalance.amount;
      if (session) {
        await Balance.deleteOne({ _id: reverseBalance._id }).session(session);
      } else {
        await Balance.deleteOne({ _id: reverseBalance._id });
      }
      
      balance = new Balance({
        groupId,
        fromUser: fromUserId,
        toUser: toUserId,
        amount: diff
      });
      if (session) {
        await balance.save({ session });
      } else {
        await balance.save();
      }
    } else {
      // Equal amounts, delete the balance
      if (session) {
        await Balance.deleteOne({ _id: reverseBalance._id }).session(session);
      } else {
        await Balance.deleteOne({ _id: reverseBalance._id });
      }
    }
  } else {
    // Create new balance
    balance = new Balance({
      groupId,
      fromUser: fromUserId,
      toUser: toUserId,
      amount
    });
    if (session) {
      await balance.save({ session });
    } else {
      await balance.save();
    }
  }

  // Clean up zero balances
  const deleteQuery = { groupId, amount: { $lte: 0.01 } };
  if (session) {
    await Balance.deleteMany(deleteQuery).session(session);
  } else {
    await Balance.deleteMany(deleteQuery);
  }
};

module.exports = {
  calculateSplitAmounts,
  validateSplitDetails,
  updateBalances,
  updateBalanceBetweenUsers
};
