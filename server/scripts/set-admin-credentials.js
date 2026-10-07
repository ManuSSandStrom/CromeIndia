import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Admin from '../src/models/Admin.js';

const { MONGODB_URI, ADMIN_LOGIN_NAME, ADMIN_LOGIN_PASSWORD } = process.env;
if (!MONGODB_URI || !ADMIN_LOGIN_NAME || !ADMIN_LOGIN_PASSWORD) {
  console.error('Set MONGODB_URI, ADMIN_LOGIN_NAME and ADMIN_LOGIN_PASSWORD for this command.');
  process.exit(1);
}

try {
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  const email = ADMIN_LOGIN_NAME.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(ADMIN_LOGIN_PASSWORD, 12);
  await Admin.findOneAndUpdate(
    { email },
    { $set: { email, passwordHash, role: 'ADMIN', active: true } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
  );
  console.log('Admin credentials saved.');
} catch (error) {
  console.error(`Admin credential update failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
