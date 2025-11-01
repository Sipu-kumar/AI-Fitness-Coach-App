const express = require('express');
const router = express.Router();
const User = require('../models/User');
const BMIRecord = require('../models/BMIRecord');

// Middleware to check if instructor is logged in
const requireInstructor = (req, res, next) => {
  if (!req.session.instructorId) {
    return res.status(401).json({ msg: 'Instructor authentication required' });
  }
  next();
};

// Get all users with their BMI records
router.get('/all-users', requireInstructor, async (req, res) => {
  try {
    // Get all users
    const users = await User.find({}).select('-password');
    
    // Get BMI records for each user
    const usersWithBMI = await Promise.all(
      users.map(async (user) => {
        const bmiRecords = await BMIRecord.find({ userId: user._id })
          .sort({ createdAt: -1 })
          .limit(10); // Limit to last 10 records per user for performance
        
        return {
          ...user.toObject(),
          bmiRecords
        };
      })
    );
    
    res.json(usersWithBMI);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get specific user's BMI history
router.get('/user/:userId/bmi-history', requireInstructor, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Get all BMI records for this user
    const bmiRecords = await BMIRecord.find({ userId })
      .sort({ createdAt: -1 });
    
    res.json({
      user,
      bmiRecords
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get instructor dashboard statistics
router.get('/stats', requireInstructor, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBMIRecords = await BMIRecord.countDocuments();
    
    // Get users with BMI records
    const usersWithBMI = await User.aggregate([
      {
        $lookup: {
          from: 'bmirecords',
          localField: '_id',
          foreignField: 'userId',
          as: 'bmiRecords'
        }
      },
      {
        $match: {
          'bmiRecords.0': { $exists: true }
        }
      },
      {
        $count: 'activeUsers'
      }
    ]);
    
    // Calculate average BMI
    const avgBMIResult = await BMIRecord.aggregate([
      {
        $group: {
          _id: null,
          avgBMI: { $avg: '$bmi' }
        }
      }
    ]);
    
    const stats = {
      totalUsers,
      activeUsers: usersWithBMI[0]?.activeUsers || 0,
      totalBMIRecords,
      averageBMI: avgBMIResult[0]?.avgBMI ? parseFloat(avgBMIResult[0].avgBMI.toFixed(1)) : 0
    };
    
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
