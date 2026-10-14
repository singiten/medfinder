import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';

async function run() {
  await connectDB();

  const result = await Medicine.deleteMany({});
  console.log(`Deleted ${result.deletedCount} medicine(s).`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});