const mongoose = require('mongoose');
const connectDB = async (uri) => {
  const u = uri || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bmi_calculator';
  await mongoose.connect(u, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('MongoDB connected');
};
module.exports = connectDB;
