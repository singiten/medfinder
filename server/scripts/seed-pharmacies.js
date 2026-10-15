import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Pharmacy from '../src/models/Pharmacy.js';

const PHARMACIES = [
  {
    name: 'Ras Pharmacy — Bole',
    licenseNumber: 'SEED-AA-0001',
    address: 'Bole Road, Addis Ababa',
    location: { type: 'Point', coordinates: [38.7869, 9.0101] },
    phone: '+251911000001',
    status: 'approved',
  },
  {
    name: 'Merkato Pharmacy',
    licenseNumber: 'SEED-AA-0002',
    address: 'Merkato, Addis Ababa',
    location: { type: 'Point', coordinates: [38.7405, 9.0342] },
    phone: '+251911000002',
    status: 'approved',
  },
  {
    name: 'Kazanchis Health Pharmacy',
    licenseNumber: 'SEED-AA-0003',
    address: 'Kazanchis, Addis Ababa',
    location: { type: 'Point', coordinates: [38.7642, 9.0187] },
    phone: '+251911000003',
    status: 'approved',
  },
  {
    name: 'Piassa Central Pharmacy',
    licenseNumber: 'SEED-AA-0004',
    address: 'Piassa, Addis Ababa',
    location: { type: 'Point', coordinates: [38.7511, 9.0358] },
    phone: '+251911000004',
    status: 'approved',
  },
  {
    name: 'Pending Pharmacy (should not appear)',
    licenseNumber: 'SEED-AA-0005',
    address: 'Somewhere, Addis Ababa',
    location: { type: 'Point', coordinates: [38.7578, 9.0192] },
    phone: '+251911000005',
    status: 'pending',
  },
];

async function run() {
  await connectDB();

  const licenses = PHARMACIES.map((p) => p.licenseNumber);
  await Pharmacy.deleteMany({ licenseNumber: { $in: licenses } });

  const inserted = await Pharmacy.insertMany(PHARMACIES);
  console.log(`Inserted ${inserted.length} pharmacies.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});