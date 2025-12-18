const { validationResult } = require('express-validator');
const Group = require('../models/Group');
const GroupJoinRequest = require('../models/GroupJoinRequest');
const { generateJoinCode } = require('../services/groupService');

// Create a new group
exports.createGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name } = req.body;
    const userId = req.userId;

    // Generate unique join code
    const joinCode = await generateJoinCode();

    // Create group with creator as first member
    const group = new Group({
      name,
      joinCode,
      members: [{ userId, joinedAt: new Date() }]
    });

    await group.save();

    res.status(201).json({
      message: 'Group created successfully',
      group: {
        id: group._id,
        name: group.name,
        joinCode: group.joinCode,
        members: group.members
      }
    });
  } catch (error) {
    console.error('Create group error:', error);
    res.status(500).json({ error: 'Server error creating group' });
  }
};

// Request to join a group
exports.joinGroup = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { joinCode } = req.body;
    const userId = req.userId;

    // Find group by join code
    const group = await Group.findOne({ joinCode });
    if (!group) {
      return res.status(404).json({ error: 'Group not found with this join code' });
    }

    // Check if user is already a member
    const isAlreadyMember = group.members.some(
      member => member.userId.toString() === userId
    );
    if (isAlreadyMember) {
      return res.status(400).json({ error: 'You are already a member of this group' });
    }

    // Check if there's already a pending request
    const existingRequest = await GroupJoinRequest.findOne({
      groupId: group._id,
      userId,
      status: 'PENDING'
    });
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending join request for this group' });
    }

    // Create join request
    const joinRequest = new GroupJoinRequest({
      groupId: group._id,
      userId
    });

    await joinRequest.save();

    res.status(201).json({
      message: 'Join request sent successfully',
      joinRequest: {
        id: joinRequest._id,
        groupId: joinRequest.groupId,
        status: joinRequest.status,
        requestedAt: joinRequest.requestedAt
      }
    });
  } catch (error) {
    console.error('Join group error:', error);
    res.status(500).json({ error: 'Server error joining group' });
  }
};

// Get user's groups
exports.getUserGroups = async (req, res) => {
  try {
    const userId = req.userId;

    const groups = await Group.find({ 'members.userId': userId })
      .populate('members.userId', 'username email')
      .sort({ createdAt: -1 });

    res.json({ groups });
  } catch (error) {
    console.error('Get groups error:', error);
    res.status(500).json({ error: 'Server error fetching groups' });
  }
};

// Get group by ID
exports.getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    const group = await Group.findById(groupId)
      .populate('members.userId', 'username email');

    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify user is a member
    const isMember = group.members.some(
      member => member.userId._id.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only group members can view group details' });
    }

    res.json({ group });
  } catch (error) {
    console.error('Get group by ID error:', error);
    res.status(500).json({ error: 'Server error fetching group' });
  }
};

// Get pending join requests for a group
exports.getJoinRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only group members can view join requests' });
    }

    // Get pending join requests
    const joinRequests = await GroupJoinRequest.find({
      groupId,
      status: 'PENDING'
    })
      .populate('userId', 'username email')
      .sort({ requestedAt: -1 });

    res.json({ joinRequests });
  } catch (error) {
    console.error('Get join requests error:', error);
    res.status(500).json({ error: 'Server error fetching join requests' });
  }
};

// Respond to join request (accept/reject)
exports.respondToJoinRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, requestId } = req.params;
    const { action } = req.body; // 'ACCEPT' or 'REJECT'
    const userId = req.userId;

    // Verify user is a member of the group
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const isMember = group.members.some(
      member => member.userId.toString() === userId
    );
    if (!isMember) {
      return res.status(403).json({ error: 'Only group members can respond to join requests' });
    }

    // Find join request
    const joinRequest = await GroupJoinRequest.findOne({
      _id: requestId,
      groupId,
      status: 'PENDING'
    });

    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found or already processed' });
    }

    // Update request status
    if (action === 'ACCEPT') {
      joinRequest.status = 'ACCEPTED';
      joinRequest.respondedAt = new Date();
      await joinRequest.save();

      // Add user to group
      group.members.push({
        userId: joinRequest.userId,
        joinedAt: new Date()
      });
      await group.save();

      res.json({
        message: 'Join request accepted',
        joinRequest: {
          id: joinRequest._id,
          status: joinRequest.status
        }
      });
    } else if (action === 'REJECT') {
      joinRequest.status = 'REJECTED';
      joinRequest.respondedAt = new Date();
      await joinRequest.save();

      res.json({
        message: 'Join request rejected',
        joinRequest: {
          id: joinRequest._id,
          status: joinRequest.status
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use ACCEPT or REJECT' });
    }
  } catch (error) {
    console.error('Respond to join request error:', error);
    res.status(500).json({ error: 'Server error responding to join request' });
  }
};
