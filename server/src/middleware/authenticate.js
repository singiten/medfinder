import { verifyToken } from '../services/auth.service.js';

export function authenticate(req, res, next) {
  const header = req.header('authorization') || req.header('Authorization');

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { _id: payload.sub, role: payload.role };
    next();
  } catch (err) {
    const reason = err.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token';
    return res.status(401).json({ error: reason });
  }
}