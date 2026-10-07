import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';

const { MONGODB_URI, BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD } = process.env;
if (!MONGODB_URI) {
  console.error('MONGODB_URI is missing. Configure it in server/.env.');
  process.exit(1);
}
if (!BOOTSTRAP_ADMIN_EMAIL || !BOOTSTRAP_ADMIN_PASSWORD) {
  console.error('Set BOOTSTRAP_ADMIN_EMAIL and BOOTSTRAP_ADMIN_PASSWORD in server/.env or the current shell.');
  process.exit(1);
}
if (BOOTSTRAP_ADMIN_PASSWORD.length < 16) {
  console.error('Use a bootstrap password with at least 16 characters.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI);
  const email = BOOTSTRAP_ADMIN_EMAIL.trim().toLowerCase();
  if (await Admin.exists({ email })) {
    console.error('An administrator with that email already exists.');
    process.exitCode = 1;
  } else {
    const passwordHash = await bcrypt.hash(BOOTSTRAP_ADMIN_PASSWORD, 12);
    await Admin.create({ email, passwordHash, role: 'ADMIN' });
    console.log(`Administrator created for ${email}.`);
  }
} catch (error) {
  console.error(`Administrator bootstrap failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
