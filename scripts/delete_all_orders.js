// Script to delete all orders from the database
// Usage: node scripts/delete_all_orders.js

const mongoose = require('mongoose');
const Order = require('../backend/models/Order');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/production-project';

async function deleteAllOrders() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
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
