const express = require('express');
const router = express.Router();
const DietPlan = require('../models/DietPlan');
const User = require('../models/User');

// Middleware to check if instructor is logged in
const requireInstructor = (req, res, next) => {
  if (!req.session.instructorId) {
    return res.status(401).json({ msg: 'Instructor authentication required' });
  }
  next();
};

// Create a new diet plan (instructor only)
router.post('/create', requireInstructor, async (req, res) => {
  try {
    const {
      userId,
      title,
      description,
      bmiCategory,
      targetBMI,
      duration,
      meals,
      dailyCalories,
      instructions,
      tips
    } = req.body;

    // Validate required fields
    if (!userId || !title || !description || !bmiCategory || !targetBMI || !duration || !meals || !dailyCalories || !instructions) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Deactivate any existing active diet plan for this user
    await DietPlan.updateMany(
      { userId, isActive: true },
      { isActive: false }
    );

    // Create new diet plan
    const dietPlan = new DietPlan({
      userId,
      instructorId: req.session.instructorId,
      title,
      description,
      bmiCategory,
      targetBMI,
      duration,
      meals,
      dailyCalories,
      instructions,
      tips: tips || []
    });

    await dietPlan.save();

    // Populate user data for response
    await dietPlan.populate('userId', 'name email');

    res.status(201).json({
      msg: 'Diet plan created successfully',
      dietPlan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all diet plans for a specific user (instructor view)
router.get('/user/:userId', requireInstructor, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const dietPlans = await DietPlan.find({ userId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(dietPlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get active diet plan for a user (user view)
router.get('/my-plan', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: 'Login required' });
    }

    const dietPlan = await DietPlan.findOne({ 
      userId: req.session.userId, 
      isActive: true 
    }).populate('userId', 'name email');

    if (!dietPlan) {
      return res.status(404).json({ msg: 'No active diet plan found' });
    }

    res.json(dietPlan);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all diet plans for a user (user view)
router.get('/my-plans', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ msg: 'Login required' });
    }

    const dietPlans = await DietPlan.find({ userId: req.session.userId })
      .sort({ createdAt: -1 });

    res.json(dietPlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Update diet plan (instructor only)
router.put('/:planId', requireInstructor, async (req, res) => {
  try {
    const { planId } = req.params;
    const updateData = req.body;

    const dietPlan = await DietPlan.findById(planId);
    if (!dietPlan) {
      return res.status(404).json({ msg: 'Diet plan not found' });
    }

    // Update the diet plan
    Object.assign(dietPlan, updateData);
    dietPlan.updatedAt = Date.now();
    
    await dietPlan.save();
    await dietPlan.populate('userId', 'name email');

    res.json({
      msg: 'Diet plan updated successfully',
      dietPlan
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Deactivate diet plan (instructor only)
router.put('/:planId/deactivate', requireInstructor, async (req, res) => {
  try {
    const { planId } = req.params;

    const dietPlan = await DietPlan.findById(planId);
    if (!dietPlan) {
      return res.status(404).json({ msg: 'Diet plan not found' });
    }

    dietPlan.isActive = false;
    dietPlan.updatedAt = Date.now();
    await dietPlan.save();

    res.json({ msg: 'Diet plan deactivated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all diet plans (instructor view)
router.get('/all', requireInstructor, async (req, res) => {
  try {
    const dietPlans = await DietPlan.find({})
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(dietPlans);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
