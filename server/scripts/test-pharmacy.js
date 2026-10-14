import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Pharmacy from '../src/models/Pharmacy.js';

async function run() {
  await connectDB();

  // Clean up any leftover test pharmacies from previous runs
  await Pharmacy.deleteMany({ licenseNumber: { $regex: /^TEST-/ } });

  // 1. Insert a pharmacy near Bole, Addis Ababa
  const pharmacy = await Pharmacy.create({
    name: 'Ras Pharmacy — Bole',
    licenseNumber: 'TEST-AA-0001',
    address: 'Bole Road, Addis Ababa',
    location: {
      type: 'Point',
      coordinates: [38.7869, 9.0101], // Bole area (lng, lat)
    },
    phone: '+251911000001',
    status: 'approved',
  });

  console.log('Inserted:', pharmacy._id.toString(), pharmacy.name);
  console.log('Location:', JSON.stringify(pharmacy.location));

  // 2. Query: find pharmacies within 2 km of the center of Addis
  const centerOfAddis = [38.7578, 9.0192]; // Meskel Square (lng, lat)

  const nearby = await Pharmacy.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: centerOfAddis },
        $maxDistance: 2000, // 2 km in meters
      },
    },
  });

  console.log(`\nNearby pharmacies within 2km of Meskel Square: ${nearby.length}`);
  for (const p of nearby) {
    console.log(`  - ${p.name} at [${p.location.coordinates.join(', ')}]`);
  }

  // 3. Cleanup
  await Pharmacy.deleteMany({ licenseNumber: { $regex: /^TEST-/ } });
  console.log('\nCleaned up test pharmacies.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});