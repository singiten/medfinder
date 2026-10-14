import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';
import Pharmacy from '../src/models/Pharmacy.js';
import Stock from '../src/models/Stock.js';

async function run() {
  await connectDB();

  // Cleanup from any prior run
  await Stock.deleteMany({});
  await Pharmacy.deleteMany({ licenseNumber: { $regex: /^TEST-/ } });
  await Medicine.deleteMany({ name: { $regex: /^TEST-/ } });

  // 1. Create a pharmacy and a medicine to reference
  const pharmacy = await Pharmacy.create({
    name: 'TEST Pharmacy',
    licenseNumber: 'TEST-AA-0001',
    address: 'Bole, Addis Ababa',
    location: { type: 'Point', coordinates: [38.7869, 9.0101] },
    status: 'approved',
  });

  const medicine = await Medicine.create({
    name: 'TEST Paracetamol 500mg Tablet',
    genericName: 'Paracetamol',
    form: 'tablet',
    strength: '500mg',
  });

  console.log('Pharmacy:', pharmacy._id.toString());
  console.log('Medicine:', medicine._id.toString());

  // 2. Create one stock record linking them
  const stock = await Stock.create({
    pharmacyId: pharmacy._id,
    medicineId: medicine._id,
    quantity: 42,
    verificationMethod: 'photo',
    verifiedAt: new Date(),
  });

  console.log('\nStock created:', stock._id.toString());
  console.log('  quantity:', stock.quantity);
  console.log('  method:  ', stock.verificationMethod);
  console.log('  verifiedAt:', stock.verifiedAt.toISOString());

  // 3. Try to create a duplicate — this MUST fail
  console.log('\nAttempting duplicate {pharmacyId, medicineId}...');
  try {
    await Stock.create({
      pharmacyId: pharmacy._id,
      medicineId: medicine._id,
      quantity: 5,
      verificationMethod: 'manual',
    });
    console.log('  ❌ DUPLICATE WAS ALLOWED — index is broken!');
  } catch (err) {
    if (err.code === 11000) {
      console.log('  ✅ Duplicate rejected by MongoDB (code 11000)');
    } else {
      console.log('  ❌ Unexpected error:', err.message);
    }
  }

  // 4. Verify the index exists
  const indexes = await Stock.collection.indexes();
  console.log('\nIndexes on stocks collection:');
  for (const idx of indexes) {
    console.log('  -', idx.name, JSON.stringify(idx.key), idx.unique ? '(unique)' : '');
  }

  // 5. Cleanup
  await Stock.deleteMany({});
  await Pharmacy.deleteMany({ licenseNumber: { $regex: /^TEST-/ } });
  await Medicine.deleteMany({ name: { $regex: /^TEST-/ } });
  console.log('\nCleaned up.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});