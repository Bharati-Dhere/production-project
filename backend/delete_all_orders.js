// Script to delete all orders from the database
// Usage: node delete_all_orders.js

require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('./models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/production-project';

async function deleteAllOrders() {
  try {
    await mongoose.connect(MONGO_URI);
    const result = await Order.deleteMany({});
    console.log(`Deleted ${result.deletedCount} orders.`);
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error deleting orders:', err);
    process.exit(1);
  }
}

deleteAllOrders();
