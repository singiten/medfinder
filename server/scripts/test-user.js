import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import User from '../src/models/User.js';

async function run() {
  await connectDB();

  const email = 'test-user@medfinder.dev';
  await User.deleteOne({ email });

  // Hash the password BEFORE creating the user (the schema is dumb — it just stores)
  const plaintext = 'secret-password-123';
  const passwordHash = await bcrypt.hash(plaintext, 10);

  const user = await User.create({
    email: 'Test-User@MedFinder.DEV', // mixed case on purpose
    passwordHash,
    fullName: 'Test User',
    role: 'patient',
  });

  console.log('Inserted user:', user._id.toString(), user.email, user.role);
  console.log('Fresh doc from create() includes hash:', typeof user.passwordHash === 'string');
console.log('Fresh doc hash is bcrypt-shaped:', user.passwordHash.startsWith('$2'));
  // ↑ should be true because select:false hides it on the returned doc? 
  //   Actually — careful: on a freshly created doc, the field IS present.
  //   Let's verify separately, below.

  // Re-fetch to test select:false
  const fetched = await User.findOne({ email: 'test-user@medfinder.dev' });
  console.log('\nRe-fetched user (no select):');
  console.log('  email:', fetched.email);
  console.log('  passwordHash on doc:', fetched.passwordHash === undefined ? '(hidden)' : '(VISIBLE — BUG!)');

  // Explicitly select it back
  const withHash = await User.findOne({ email }).select('+passwordHash');
  console.log('\nRe-fetched with .select("+passwordHash"):');
  console.log('  passwordHash exists:', typeof withHash.passwordHash === 'string');

  // Verify password with the schema method
  const ok = await withHash.comparePassword(plaintext);
  const bad = await withHash.comparePassword('wrong-password');
  console.log('\ncomparePassword(correct):', ok);
  console.log('comparePassword(wrong):', bad);

  // Cleanup
  await User.deleteOne({ email });
  console.log('\nCleaned up.');

  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});