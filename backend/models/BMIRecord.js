const mongoose = require('mongoose');
const BMIRecordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false },
  weightKg: Number,
  heightCm: Number,
  bmi: Number,
  category: String,
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('BMIRecord', BMIRecordSchema);
