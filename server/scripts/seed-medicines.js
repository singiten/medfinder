import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';

const MEDICINES = [
  {
    name: 'Paracetamol 500mg Tablet',
    genericName: 'Paracetamol',
    brandNames: ['Panadol', 'Adol', 'Tylenol'],
    aliases: ['paracetmol', 'parasitamol', 'ፓራሲታሞል'],
    form: 'tablet',
    strength: '500mg',
    category: 'analgesic',
  },
  {
    name: 'Ibuprofen 400mg Tablet',
    genericName: 'Ibuprofen',
    brandNames: ['Brufen', 'Advil'],
    aliases: ['ibuprofin'],
    form: 'tablet',
    strength: '400mg',
    category: 'nsaid',
  },
  {
    name: 'Amoxicillin 500mg Capsule',
    genericName: 'Amoxicillin',
    brandNames: ['Amoxil'],
    aliases: ['amoxycillin', 'አሞክሲሲሊን'],
    form: 'capsule',
    strength: '500mg',
    category: 'antibiotic',
  },
  {
    name: 'Cetirizine 10mg Tablet',
    genericName: 'Cetirizine',
    brandNames: ['Zyrtec'],
    aliases: ['cetrizine', 'zyrtec'],
    form: 'tablet',
    strength: '10mg',
    category: 'antihistamine',
  },
  {
    name: 'Omeprazole 20mg Capsule',
    genericName: 'Omeprazole',
    brandNames: ['Losec', 'Prilosec'],
    aliases: ['omeprazol'],
    form: 'capsule',
    strength: '20mg',
    category: 'ppi',
  },
];

async function run() {
  await connectDB();

  // Idempotent-ish: remove by name, then insert
  const names = MEDICINES.map((m) => m.name);
  await Medicine.deleteMany({ name: { $in: names } });

  const inserted = await Medicine.insertMany(MEDICINES);
  console.log(`Inserted ${inserted.length} medicines.`);

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});