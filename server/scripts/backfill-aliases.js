import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import Medicine from '../src/models/Medicine.js';
import { generateAliases } from '../src/services/alias.service.js';

async function run() {
  await connectDB();

  const meds = await Medicine.find({});
  console.log(`Found ${meds.length} medicine(s) to process.`);

  let updated = 0;
  for (const med of meds) {
    const generated = generateAliases({
      name: med.name,
      genericName: med.genericName,
      brandNames: med.brandNames || [],
    });

    const merged = Array.from(new Set([...(med.aliases || []), ...generated]));

    if (merged.length !== (med.aliases || []).length) {
      med.aliases = merged;
      await med.save();
      updated++;
      console.log(`  ${med.name}: ${med.aliases.length} aliases`);
    }
  }

  console.log(`\nUpdated ${updated} medicine(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
