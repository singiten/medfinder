import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

async function run() {
  await connectDB();

  const keepAdmin = process.argv.includes('--keep-admin');

  const filter = keepAdmin ? { role: { $ne: 'admin' } } : {};
  const result = await User.deleteMany(filter);

  console.log(`Deleted ${result.deletedCount} user(s).`, keepAdmin ? '(admin kept)' : '');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});