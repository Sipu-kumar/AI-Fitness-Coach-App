const express = require('express');
const router = express.Router();
const BMIRecord = require('../models/BMIRecord');

// calculate & store BMI (requires logged-in user)
router.post('/', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ msg: 'Login required' });
    const { weightKg, heightCm } = req.body;
    if (!weightKg || !heightCm) return res.status(400).json({ msg: 'weightKg and heightCm required' });
    const heightM = heightCm / 100;
    const bmi = +(weightKg / (heightM * heightM)).toFixed(2);
    const category = bmiCategory(bmi);
    const record = new BMIRecord({ userId: req.session.userId, weightKg, heightCm, bmi, category });
    await record.save();
    res.json(record);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// get history (for logged-in user)
router.get('/history', async (req, res) => {
  try {
    if (!req.session.userId) return res.status(401).json({ msg: 'Login required' });
    const records = await BMIRecord.find({ userId: req.session.userId }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
});

function bmiCategory(bmi) {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obesity';
}

module.exports = router;
