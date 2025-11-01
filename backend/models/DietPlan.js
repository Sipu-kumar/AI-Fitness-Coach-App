const mongoose = require('mongoose');

const DietPlanSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  instructorId: { 
    type: String, 
    required: true,
    default: 'instructor'
  },
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  bmiCategory: { 
    type: String, 
    required: true,
    enum: ['Underweight', 'Normal weight', 'Overweight', 'Obesity']
  },
  targetBMI: { 
    type: Number, 
    required: true
  },
  duration: { 
    type: String, 
    required: true,
    trim: true
  },
  meals: {
    breakfast: {
      description: { type: String, required: true },
      calories: { type: Number, required: true },
      foods: [{ type: String }]
    },
    lunch: {
      description: { type: String, required: true },
      calories: { type: Number, required: true },
      foods: [{ type: String }]
    },
    dinner: {
      description: { type: String, required: true },
      calories: { type: Number, required: true },
      foods: [{ type: String }]
    },
    snacks: {
      description: { type: String, required: true },
      calories: { type: Number, required: true },
      foods: [{ type: String }]
    }
  },
  dailyCalories: { 
    type: Number, 
    required: true
  },
  instructions: [{ 
    type: String, 
    required: true 
  }],
  tips: [{ 
    type: String 
  }],
  isActive: { 
    type: Boolean, 
    default: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Update the updatedAt field before saving
DietPlanSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DietPlan', DietPlanSchema);
