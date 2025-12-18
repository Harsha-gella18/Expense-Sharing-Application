const Group = require('../models/Group');

// Generate unique 6-digit join code
const generateJoinCode = async () => {
  let joinCode;
  let isUnique = false;

  while (!isUnique) {
    // Generate random 6-digit number
    joinCode = Math.floor(100000 + Math.random() * 900000);
    
    // Check if it's unique
    const existingGroup = await Group.findOne({ joinCode });
    if (!existingGroup) {
      isUnique = true;
    }
  }

  return joinCode;
};

module.exports = { generateJoinCode };
