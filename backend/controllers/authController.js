const { validationResult, body } = require('express-validator');
const User = require('../models/User');

// Validation rules for registration
const registerValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

// POST /api/auth/register
const register = async (req, res) => {
  // Run validation
  await Promise.all(registerValidation.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({ name, email, password });
    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  await Promise.all(loginValidation.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { email, password } = req.body;

    // Explicitly select password field (it has select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = user.generateAuthToken();

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/auth/profile  (protected)
const getProfile = async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/auth/profile  (protected)
const updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    // Explicitly cast to string to prevent NoSQL operator injection
    if (name !== undefined) updates.name = String(name);
    if (avatar !== undefined) updates.avatar = String(avatar);

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { register, login, getProfile, updateProfile };
