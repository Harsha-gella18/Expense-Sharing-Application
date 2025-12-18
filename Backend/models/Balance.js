const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one balance record per pair per group
balanceSchema.index({ groupId: 1, fromUser: 1, toUser: 1 }, { unique: true });

module.exports = mongoose.model('Balance', balanceSchema);
