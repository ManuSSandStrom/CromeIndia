import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();
router.post('/login', async (req, res, next) => {
  try {
    const email = String(req.body.username || req.body.email || '').toLowerCase().trim();
    const password = String(req.body.password || '');
    if (!email || email.length > 160 || password.length > 200) {
      return res.status(400).json({ success: false, message: 'Enter an admin username and password.' });
    }
    if (Admin.db.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Admin sign-in is unavailable because the database is not connected.' });
    }
    const admin = await Admin.findOne({ email, active: true });
    if (!admin || !await bcrypt.compare(password, admin.passwordHash)) {
      return res.status(401).json({ success: false, message: 'Admin email or password is incorrect.' });
    }
    const token = jwt.sign({ sub: admin.id, role: admin.role, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h', issuer: 'crome-india' });
    res.json({ success: true, data: { token, admin: { email: admin.email, role: admin.role } } });
  } catch (error) {
    next(error);
  }
});
router.get('/me', requireAdmin, (req, res) => res.json({ success: true, data: { admin: req.admin } }));
export default router;
