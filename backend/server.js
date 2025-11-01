require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const connectDB = require('./config/db');

const authRoutes = require('./routes/auth');
const bmiRoutes = require('./routes/bmi');
const instructorRoutes = require('./routes/instructor');
const dietPlanRoutes = require('./routes/dietPlan');

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'devsecret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

connectDB(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bmi_calculator');

app.use('/api/auth', authRoutes);
app.use('/api/bmi', bmiRoutes);
app.use('/api/instructor', instructorRoutes);
app.use('/api/diet-plan', dietPlanRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
