const mongoose = require('mongoose');
require('dotenv').config();

const dbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/sacco_loans';

mongoose.connect(dbUri).then(async () => {
  try {
    const result = await mongoose.connection.db.collection('users').deleteMany({ role: 'manager' });
    console.log(`Deleted ${result.deletedCount} manager(s) from the database.`);
  } catch (err) {
    console.error('Error deleting managers:', err);
  } finally {
    await mongoose.disconnect();
  }
});
