// --- FORGOT PASSWORD FLOW FOR ANY USER (user or admin) ---
const forgotCodes = {};

// Send verification code for forgot password (any user)
router.post('/forgot-password/send-code', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    // Do not reveal if email exists
    return res.json({ message: 'If your email is registered, you will receive a reset code.' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  forgotCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
  await sendMail({
    to: email,
    subject: 'Your Password Reset Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <b>${code}</b></p>`
  });
  res.json({ message: 'Verification code sent to email.' });
});

// Verify code and set new password for any user
router.post('/forgot-password/verify', async (req, res) => {
  const { email, password, code } = req.body;
  if (!forgotCodes[email] || forgotCodes[email].code !== code || forgotCodes[email].expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }
  delete forgotCodes[email];
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'User not found.' });
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  res.json({ message: 'Password reset successful.' });
});

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();
const admin = require('firebase-admin');


// Firebase email verification code flow
const verificationCodes = {};
const { sendMail } = require('../controllers/mailer');
const crypto = require('crypto');

// Send verification code for signup
router.post('/signup/send-code', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
  await sendMail({
    to: email,
    subject: 'Your Signup Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <b>${code}</b></p>`
  });
  res.json({ message: 'Verification code sent to email.' });
});

// Verify code and set password for signup
router.post('/signup/verify', async (req, res) => {
  const { name, email, password, mobile, code } = req.body;
  if (!verificationCodes[email] || verificationCodes[email].code !== code || verificationCodes[email].expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }
  delete verificationCodes[email];
  const existingEmail = await User.findOne({ email });
  if (existingEmail) return res.status(400).json({ message: 'Email already exists' });
  const existingMobile = await User.findOne({ mobile });
  if (existingMobile) return res.status(400).json({ message: 'Mobile number already exists' });
  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hash, mobile });
  res.status(201).json({ user });
});

// ...existing code...

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email });
    console.log('Login attempt:', { email, role });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    if (role === 'admin') {
      if (user.role !== 'admin') {
        console.log('User is not admin:', user.role);
        return res.status(403).json({ message: 'Only admin can login here.' });
      }
    } else {
      if (user.role !== 'user') {
        console.log('User is not user:', user.role);
        return res.status(403).json({ message: 'Only user can login here.' });
      }
    }
    const match = await bcrypt.compare(password, user.password);
    console.log('Password match:', match);
    if (!match) {
      console.log('Password does not match');
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true });
    res.json({ user });
  } catch (err) {
    console.log('Login error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// Google Login
router.post('/google-login', async (req, res) => {
  try {
    const { token } = req.body;
    const decoded = await admin.auth().verifyIdToken(token);
    let user = await User.findOne({ email: decoded.email });
    if (!user) {
      user = await User.create({
        email: decoded.email,
        name: decoded.name || decoded.email,
      });
    }
    // Set JWT cookie for session, just like normal login
    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.cookie('token', jwtToken, { httpOnly: true, sameSite: 'lax' });
    res.json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
      }
    });
  } catch (err) {
    console.error('Google login backend error:', err);
    res.status(401).json({ message: 'Invalid Google token or server error' });
  }
});

module.exports = router;
