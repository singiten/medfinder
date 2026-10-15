import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Pharmacy from '../src/models/Pharmacy.js';
import Medicine from '../src/models/Medicine.js';
import Stock from '../src/models/Stock.js';

async function run() {
  await connectDB();

  const paracetamol = await Medicine.findOne({ genericName: 'Paracetamol' });
  if (!paracetamol) {
    console.error('Paracetamol medicine not found. Run seed-medicines.js first.');
    process.exit(1);
  }

  const bole = await Pharmacy.findOne({ licenseNumber: 'SEED-AA-0001' });
  const kazanchis = await Pharmacy.findOne({ licenseNumber: 'SEED-AA-0003' });

  if (!bole || !kazanchis) {
    console.error('Seed pharmacies not found. Run seed-pharmacies.js first.');
    process.exit(1);
  }

  await Stock.deleteMany({
    pharmacyId: { $in: [bole._id, kazanchis._id] },
    medicineId: paracetamol._id,
  });

  const now = Date.now();
  await Stock.insertMany([
    {
      pharmacyId: bole._id,
      medicineId: paracetamol._id,
      quantity: 42,
      verificationMethod: 'photo',
      verifiedAt: new Date(now - 2 * 60 * 60 * 1000), // 2 hours ago
    },
    {
      pharmacyId: kazanchis._id,
      medicineId: paracetamol._id,
      quantity: 5,
      verificationMethod: 'manual',
      verifiedAt: new Date(now - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    },
  ]);

  console.log('Seeded stock: Bole (42, photo, 2h ago), Kazanchis (5, manual, 3d ago)');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});