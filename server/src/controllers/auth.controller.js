import { registerUser, loginUser } from '../services/auth.service.js';

export async function register(req, res, next) {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'email, password, and fullName are required' });
    }

    // Never allow self-registration as anything but patient
    const result = await registerUser({ email, password, fullName, phone, role: 'patient' });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}