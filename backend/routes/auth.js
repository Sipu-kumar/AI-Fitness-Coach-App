const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");

// signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: "Missing fields" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: "Email already used" });
    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashed, role });
    await user.save();
    req.session.userId = user._id;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ msg: "Missing fields" });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });
    req.session.userId = user._id;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ msg: "Logged out" });
  });
});

// get current user
router.get("/me", async (req, res) => {
  try {
    if (!req.session.userId) return res.status(200).json({ user: null });
    const user = await User.findById(req.session.userId).select("-password");
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// instructor login with fixed credentials
router.post("/instructor-login", async (req, res) => {
  try {
    const { loginId, password } = req.body;
    
    // Fixed instructor credentials
    const INSTRUCTOR_LOGIN_ID = process.env.INSTRUCTOR_LOGIN_ID || "instructor123";
    const INSTRUCTOR_PASSWORD = process.env.INSTRUCTOR_PASSWORD || "instructor@2024";
    
    if (!loginId || !password) {
      return res.status(400).json({ msg: "Login ID and password required" });
    }
    
    if (loginId !== INSTRUCTOR_LOGIN_ID || password !== INSTRUCTOR_PASSWORD) {
      return res.status(401).json({ msg: "Invalid instructor credentials" });
    }
    
    // Create instructor session
    req.session.instructorId = "instructor_" + Date.now();
    
    res.json({
      id: "instructor",
      name: "Instructor",
      email: "instructor@bmi-tracker.com",
      role: "instructor",
      loginId: loginId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
