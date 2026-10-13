import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';

async function run() {
  await connectDB();

  const med = await Medicine.create({
    name: 'Paracetamol 500mg Tablet',
    genericName: 'Paracetamol',
    brandNames: ['Panadol', 'Adol', 'Tylenol'],
    aliases: ['paracetmol', 'parasitamol', 'ፓራሲታሞል'],
    form: 'tablet',
    strength: '500mg',
    category: 'analgesic',
  });

  console.log('Inserted:', med._id.toString(), med.name);

  const found = await Medicine.findById(med._id);
  console.log('Read back:', found.name, '| brands:', found.brandNames.join(', '));

  await Medicine.deleteOne({ _id: med._id });
  console.log('Cleaned up.');

  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});