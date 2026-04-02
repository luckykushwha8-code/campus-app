import { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword, signToken, verifyToken, comparePassword } from '@/lib/auth';
import { UserModel } from '@/models/User';

export async function register(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password, name, collegeId, collegeName } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing email or password' });
    const existing = await UserModel.findOne({ email }).lean();
    if (existing) return res.status(400).json({ ok: false, error: 'User exists' });
    const hash = await hashPassword(password);
    const user = await UserModel.create({ email, passwordHash: hash, name, collegeId, collegeName, role: 'student', verified: false });
    const token = signToken({ userId: user._id });
    res.json({ ok: true, token, user: { id: user._id, email: user.email } });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}

export async function login(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ ok: false, error: 'Missing credentials' });
    const user = await UserModel.findOne({ email });
    if (!user || !user.passwordHash) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
    const ok = await comparePassword(password, user.passwordHash);
    if (!ok) return res.status(400).json({ ok: false, error: 'Invalid credentials' });
    const token = signToken({ userId: user._id });
    res.json({ ok: true, token, user: { id: user._id, email: user.email } });
  } catch (e) {
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // simple routing by path
    if (req.url?.includes('/register')) return register(req, res);
    if (req.url?.includes('/login')) return login(req, res);
  }
  res.status(404).json({ ok: false, error: 'Not found' });
}
