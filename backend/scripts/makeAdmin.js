// Usage: node backend/scripts/makeAdmin.js <email> <password>
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const email = process.argv[2];
const password = process.argv[3];
if (!email || !password) {
  console.error('Usage: node makeAdmin.js <email> <password>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    let user = await User.findOne({ email });
    if (!user) {
      const hash = await bcrypt.hash(password, 10);
      user = await User.create({ email, password: hash, role: 'admin', hasPassword: true });
      console.log('Admin user created:', email);
    } else {
      user.role = 'admin';
      user.password = await bcrypt.hash(password, 10);
      user.hasPassword = true;
      await user.save();
      console.log('User updated to admin:', email);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
