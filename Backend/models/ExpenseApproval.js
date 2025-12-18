const mongoose = require('mongoose');

const expenseApprovalSchema = new mongoose.Schema({
  expenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expense',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
    default: 'PENDING'
  },
  respondedAt: {
    type: Date
  }
});

// Compound index to ensure one approval per user per expense
expenseApprovalSchema.index({ expenseId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseApproval', expenseApprovalSchema);
