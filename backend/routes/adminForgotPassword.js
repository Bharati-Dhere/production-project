const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { sendMail } = require('../controllers/mailer');
const crypto = require('crypto');

// POST /api/auth/admin-forgot-password
// Store verification codes in memory
const verificationCodes = {};

// Send verification code for forgot password
router.post('/send-code', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) {
    return res.json({ message: 'If your email is registered as admin, you will receive a reset code.' });
  }
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };
  await sendMail({
    to: email,
    subject: 'Your Password Reset Verification Code',
    text: `Your verification code is: ${code}`,
    html: `<p>Your verification code is: <b>${code}</b></p>`
  });
  res.json({ message: 'Verification code sent to email.' });
});

// Verify code and set new password
router.post('/verify', async (req, res) => {
  const { email, password, code } = req.body;
  if (!verificationCodes[email] || verificationCodes[email].code !== code || verificationCodes[email].expires < Date.now()) {
    return res.status(400).json({ message: 'Invalid or expired verification code.' });
  }
  delete verificationCodes[email];
  const user = await User.findOne({ email, role: 'admin' });
  if (!user) return res.status(400).json({ message: 'User not found.' });
  const bcrypt = require('bcryptjs');
  user.password = await bcrypt.hash(password, 10);
  await user.save();
  res.json({ message: 'Password reset successful.' });
});

module.exports = router;
